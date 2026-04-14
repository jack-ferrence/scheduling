import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { z } from 'zod';
import 'dotenv/config';
import { pool } from './db';
import { facilityRowToApi, timeSlotFromRow } from './mappers';
import type { Participant } from '../app/types/index';

// Resolve __dirname in a way that survives both ESM (tsx local dev) and
// bundled CJS (Netlify Functions via esbuild, where import.meta.url is undefined).
const __dirname = (() => {
  try {
    // @ts-expect-error — import.meta.url is undefined when bundled to CJS
    const url = import.meta.url;
    if (typeof url === 'string') return path.dirname(fileURLToPath(url));
  } catch {
    // fall through
  }
  return process.cwd();
})();

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

function requireUserId(req: express.Request): string | null {
  const raw = req.header('X-User-Id');
  return raw && /^[0-9a-f-]{36}$/i.test(raw) ? raw : null;
}

function parseParticipants(raw: unknown): Participant[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw as Participant[];
  if (typeof raw === 'string') {
    try {
      const j = JSON.parse(raw) as unknown;
      return Array.isArray(j) ? (j as Participant[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'biola-sports-api' });
});

app.post('/api/users/register', async (req, res) => {
  const body = z.object({ name: z.string().min(1).max(120) }).safeParse(req.body);
  if (!body.success) {
    return res.status(400).json({ message: 'Invalid body', issues: body.error.flatten() });
  }
  const email = `anon_${randomUUID()}@local.test`;
  const r = await pool.query<{ user_id: string; name: string }>(
    `INSERT INTO users (name, email) VALUES ($1, $2) RETURNING user_id, name`,
    [body.data.name, email]
  );
  const row = r.rows[0];
  return res.status(201).json({ id: row.user_id, name: row.name });
});

app.get('/api/users/me', async (req, res) => {
  const userId = requireUserId(req);
  if (!userId) return res.status(401).json({ message: 'Missing X-User-Id' });
  const r = await pool.query<{ user_id: string; name: string }>(
    `SELECT user_id, name FROM users WHERE user_id = $1`,
    [userId]
  );
  if (!r.rows[0]) return res.status(404).json({ message: 'User not found' });
  return res.json({ id: r.rows[0].user_id, name: r.rows[0].name });
});

app.get('/api/stats', async (_req, res) => {
  const [facilities, slots] = await Promise.all([
    pool.query<{ c: string }>(`SELECT COUNT(*)::text AS c FROM facilities WHERE is_active = true`),
    pool.query<{ c: string }>(
      `SELECT COUNT(*)::text AS c FROM time_slots WHERE end_time > now()`
    ),
  ]);
  res.json({
    facilityCount: Number(facilities.rows[0]?.c ?? 0),
    activeSlotCount: Number(slots.rows[0]?.c ?? 0),
  });
});

app.get('/api/facilities', async (req, res) => {
  const q = z
    .object({
      search: z.string().optional(),
      type: z.enum(['campus', 'park']).optional(),
      sport: z.string().optional(),
    })
    .safeParse(req.query);

  if (!q.success) {
    return res.status(400).json({ message: 'Invalid query' });
  }

  const { search: searchRaw, type, sport } = q.data;
  const search = searchRaw?.trim().toLowerCase();

  const rows = await pool.query<Record<string, unknown>>(
    `SELECT * FROM facilities
     WHERE is_active = true
       AND ($1::text IS NULL OR facility_type = $1)
       AND ($2::text IS NULL OR $2 = ANY(sports))
       AND ($3::text IS NULL OR LOWER(name) LIKE '%' || $3 || '%' OR LOWER(location_text) LIKE '%' || $3 || '%')
     ORDER BY name`,
    [type ?? null, sport ?? null, search ?? null]
  );

  res.json(rows.rows.map((r) => facilityRowToApi(r as any)));
});

app.get('/api/facilities/:id', async (req, res) => {
  const r = await pool.query(`SELECT * FROM facilities WHERE facility_id = $1 AND is_active = true`, [
    req.params.id,
  ]);
  if (!r.rows[0]) return res.status(404).json({ message: 'Facility not found' });
  res.json(facilityRowToApi(r.rows[0] as any));
});

/**
 * GET /api/facilities/:id/blocked-times?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Returns 25live bookings (blocked windows) for a facility so the frontend
 * can compute and display available time slots.
 */
app.get('/api/facilities/:id/blocked-times', async (req, res) => {
  const q = z
    .object({ from: z.string().optional(), to: z.string().optional() })
    .safeParse(req.query);
  if (!q.success) return res.status(400).json({ message: 'Invalid query' });

  const { from, to } = q.data;
  const fromTs = from ? new Date(from) : new Date();
  const toTs = to ? new Date(to) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const rows = await pool.query(
    `SELECT
       booking_id,
       event_name,
       organization,
       to_char(start_time AT TIME ZONE 'America/Los_Angeles', 'YYYY-MM-DD') AS date,
       to_char(start_time AT TIME ZONE 'America/Los_Angeles', 'HH24:MI') AS start_local,
       to_char(end_time AT TIME ZONE 'America/Los_Angeles', 'HH24:MI') AS end_local,
       setup_minutes,
       teardown_minutes,
       event_type,
       is_public
     FROM facility_bookings
     WHERE facility_id = $1
       AND end_time >= $2
       AND start_time < $3
     ORDER BY start_time ASC`,
    [req.params.id, fromTs.toISOString(), toTs.toISOString()]
  );

  res.json(rows.rows);
});

/**
 * GET /api/events?from=YYYY-MM-DD&to=YYYY-MM-DD
 * Returns all 25live facility bookings across all facilities for the calendar view.
 */
app.get('/api/events', async (req, res) => {
  const q = z
    .object({ from: z.string().optional(), to: z.string().optional() })
    .safeParse(req.query);
  if (!q.success) return res.status(400).json({ message: 'Invalid query' });

  const { from, to } = q.data;
  const fromTs = from ? new Date(from) : new Date();
  const toTs = to ? new Date(to) : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

  const rows = await pool.query(
    `SELECT
       fb.booking_id,
       fb.facility_id,
       f.name AS facility_name,
       fb.event_name,
       fb.organization,
       fb.start_time AT TIME ZONE 'America/Los_Angeles' AS start_local,
       fb.end_time AT TIME ZONE 'America/Los_Angeles' AS end_local,
       fb.event_type,
       fb.is_public
     FROM facility_bookings fb
     JOIN facilities f ON f.facility_id = fb.facility_id
     WHERE fb.start_time >= $1
       AND fb.start_time < $2
     ORDER BY fb.start_time ASC`,
    [fromTs.toISOString(), toTs.toISOString()]
  );

  res.json(
    rows.rows.map((r) => ({
      id: r.booking_id,
      title: r.event_name,
      facilityId: r.facility_id,
      facilityName: r.facility_name,
      startTime: new Date(r.start_local).toISOString(),
      endTime: new Date(r.end_local).toISOString(),
      eventType: r.event_type as string,
      organization: r.organization ?? 'Biola University',
      status: 'confirmed',
      affectsRecreational: true,
    }))
  );
});

const slotSelectColumns = `
  SELECT
    ts.slot_id,
    ts.facility_id,
    ts.sport,
    to_char(ts.start_time AT TIME ZONE 'America/Los_Angeles', 'YYYY-MM-DD') AS slot_date,
    to_char(ts.start_time AT TIME ZONE 'America/Los_Angeles', 'HH24:MI') AS start_local,
    to_char(ts.end_time AT TIME ZONE 'America/Los_Angeles', 'HH24:MI') AS end_local,
    ts.capacity,
    ts.created_by_user_id,
    cb.name AS created_by_name,
    COALESCE(
      json_agg(
        json_build_object(
          'id', u.user_id::text,
          'name', u.name,
          'joinedAt', to_char(s.joined_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
        ) ORDER BY s.joined_at
      ) FILTER (WHERE u.user_id IS NOT NULL),
      '[]'::json
    ) AS participants
`;

const slotJoinsList = `
  FROM time_slots ts
  LEFT JOIN users cb ON cb.user_id = ts.created_by_user_id
  LEFT JOIN signups s ON s.slot_id = ts.slot_id
  LEFT JOIN users u ON u.user_id = s.user_id
`;

const slotJoinsMine = `
  FROM time_slots ts
  INNER JOIN signups my ON my.slot_id = ts.slot_id AND my.user_id = $1::uuid
  LEFT JOIN users cb ON cb.user_id = ts.created_by_user_id
  LEFT JOIN signups s ON s.slot_id = ts.slot_id
  LEFT JOIN users u ON u.user_id = s.user_id
`;

app.get('/api/time-slots', async (req, res) => {
  const q = z
    .object({
      facilityId: z.string().optional(),
      sport: z.string().optional(),
      from: z.string().optional(),
      to: z.string().optional(),
    })
    .safeParse(req.query);

  if (!q.success) return res.status(400).json({ message: 'Invalid query' });

  const { facilityId, sport, from, to } = q.data;

  const sql = `
    ${slotSelectColumns}
    ${slotJoinsList}
    WHERE ($1::text IS NULL OR ts.facility_id = $1)
      AND ($2::text IS NULL OR ts.sport = $2)
      AND ($3::timestamptz IS NULL OR ts.end_time >= $3)
      AND ($4::timestamptz IS NULL OR ts.start_time < $4)
    GROUP BY ts.slot_id, ts.facility_id, ts.sport, ts.start_time, ts.end_time, ts.capacity, ts.created_by_user_id, cb.name
    ORDER BY ts.start_time ASC
  `;

  const fromTs = from ? new Date(from) : null;
  const toTs = to ? new Date(to) : null;

  const rows = await pool.query(sql, [facilityId ?? null, sport ?? null, fromTs, toTs]);
  const out = rows.rows.map((row) =>
    timeSlotFromRow({
      ...row,
      participants: parseParticipants(row.participants),
    } as any)
  );
  res.json(out);
});

app.get('/api/my/reservations', async (req, res) => {
  const userId = requireUserId(req);
  if (!userId) return res.status(401).json({ message: 'Missing X-User-Id' });

  const sql = `
    ${slotSelectColumns}
    ${slotJoinsMine}
    GROUP BY ts.slot_id, ts.facility_id, ts.sport, ts.start_time, ts.end_time, ts.capacity, ts.created_by_user_id, cb.name
    ORDER BY ts.start_time ASC
  `;

  const rows = await pool.query(sql, [userId]);
  const out = rows.rows.map((row) =>
    timeSlotFromRow({
      ...row,
      participants: parseParticipants(row.participants),
    } as any)
  );
  res.json(out);
});

app.post('/api/facilities/:facilityId/time-slots', async (req, res) => {
  const userId = requireUserId(req);
  if (!userId) return res.status(401).json({ message: 'Missing X-User-Id' });

  const body = z
    .object({
      sport: z.string().min(1),
      date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      startTime: z.string().regex(/^\d{2}:\d{2}$/),
      endTime: z.string().regex(/^\d{2}:\d{2}$/),
      capacity: z.number().int().min(1).max(200),
    })
    .safeParse(req.body);

  if (!body.success) {
    return res.status(400).json({ message: 'Invalid body', issues: body.error.flatten() });
  }

  const { facilityId } = req.params;
  const { sport, date, startTime, endTime, capacity } = body.data;

  const f = await pool.query(`SELECT 1 FROM facilities WHERE facility_id = $1 AND is_active = true`, [
    facilityId,
  ]);
  if (!f.rows[0]) return res.status(404).json({ message: 'Facility not found' });

  const startH = `${startTime}:00`;
  const endH = `${endTime}:00`;

  const overlap = await pool.query(
    `SELECT 1 FROM time_slots
     WHERE facility_id = $1
       AND start_time < ($2::date + $3::time) AT TIME ZONE 'America/Los_Angeles'
       AND end_time > ($2::date + $4::time) AT TIME ZONE 'America/Los_Angeles'`,
    [facilityId, date, endH, startH]
  );

  if (overlap.rows.length > 0) {
    return res.status(409).json({ message: 'That time overlaps an existing slot at this facility.' });
  }

  const ins = await pool.query<{ slot_id: string }>(
    `INSERT INTO time_slots (facility_id, sport, start_time, end_time, capacity, created_by_user_id)
     VALUES (
       $1, $2,
       ($3::date + $4::time) AT TIME ZONE 'America/Los_Angeles',
       ($3::date + $5::time) AT TIME ZONE 'America/Los_Angeles',
       $6, $7::uuid
     )
     RETURNING slot_id`,
    [facilityId, sport, date, startH, endH, capacity, userId]
  );

  const slotId = ins.rows[0].slot_id;

  await pool.query(
    `INSERT INTO signups (slot_id, user_id) VALUES ($1::uuid, $2::uuid) ON CONFLICT DO NOTHING`,
    [slotId, userId]
  );

  const full = await pool.query(
    `${slotSelectColumns}
     ${slotJoinsList}
     WHERE ts.slot_id = $1::uuid
     GROUP BY ts.slot_id, ts.facility_id, ts.sport, ts.start_time, ts.end_time, ts.capacity, ts.created_by_user_id, cb.name`,
    [slotId]
  );

  const row = full.rows[0];
  if (!row) return res.status(500).json({ message: 'Failed to load slot' });

  res.status(201).json(
    timeSlotFromRow({
      ...row,
      participants: parseParticipants(row.participants),
    } as any)
  );
});

app.post('/api/time-slots/:slotId/join', async (req, res) => {
  const userId = requireUserId(req);
  if (!userId) return res.status(401).json({ message: 'Missing X-User-Id' });

  const body = z.object({ fromSlotId: z.string().uuid().optional() }).safeParse(req.body ?? {});
  if (!body.success) return res.status(400).json({ message: 'Invalid body' });

  const { slotId } = req.params;
  const { fromSlotId } = body.data;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    if (fromSlotId) {
      await client.query(`DELETE FROM signups WHERE slot_id = $1::uuid AND user_id = $2::uuid`, [
        fromSlotId,
        userId,
      ]);
    }

    const lock = await client.query(
      `SELECT slot_id, capacity FROM time_slots WHERE slot_id = $1::uuid FOR UPDATE`,
      [slotId]
    );
    if (!lock.rows[0]) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: 'Time slot not found' });
    }

    const cap = rowCapacity(lock.rows[0]);
    const cnt = await client.query(`SELECT COUNT(*)::int AS c FROM signups WHERE slot_id = $1::uuid`, [
      slotId,
    ]);
    const current = cnt.rows[0]?.c ?? 0;
    if (current >= cap) {
      await client.query('ROLLBACK');
      return res.status(409).json({ message: 'This session is full.' });
    }

    await client.query(`INSERT INTO signups (slot_id, user_id) VALUES ($1::uuid, $2::uuid)`, [
      slotId,
      userId,
    ]);

    await client.query('COMMIT');
  } catch (e: unknown) {
    await client.query('ROLLBACK');
    const err = e as { code?: string };
    if (err.code === '23505') {
      return res.status(409).json({ message: 'You already joined this session.' });
    }
    throw e;
  } finally {
    client.release();
  }

  const full = await pool.query(
    `${slotSelectColumns}
     ${slotJoinsList}
     WHERE ts.slot_id = $1::uuid
     GROUP BY ts.slot_id, ts.facility_id, ts.sport, ts.start_time, ts.end_time, ts.capacity, ts.created_by_user_id, cb.name`,
    [slotId]
  );
  const row = full.rows[0];
  if (!row) return res.status(500).json({ message: 'Failed to load slot' });
  res.json(
    timeSlotFromRow({
      ...row,
      participants: parseParticipants(row.participants),
    } as any)
  );
});

function rowCapacity(row: { capacity?: number | string }): number {
  const c = row.capacity;
  if (typeof c === 'number') return c;
  return parseInt(String(c), 10);
}

app.delete('/api/time-slots/:slotId/join', async (req, res) => {
  const userId = requireUserId(req);
  if (!userId) return res.status(401).json({ message: 'Missing X-User-Id' });

  const { slotId } = req.params;
  const r = await pool.query(`DELETE FROM signups WHERE slot_id = $1::uuid AND user_id = $2::uuid`, [
    slotId,
    userId,
  ]);
  if (r.rowCount === 0) {
    return res.status(404).json({ message: 'No reservation found for this user and slot.' });
  }
  res.status(204).send();
});

if (process.env.NODE_ENV === 'production' && !process.env.NETLIFY) {
  const dist = path.join(__dirname, '..', 'dist');
  app.use(express.static(dist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(dist, 'index.html'));
  });
}

app.use((err: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal server error' });
});

// Only start a listener when run directly (local dev / `npm start`).
// When imported by a Netlify Function we just export the app.
if (!process.env.NETLIFY) {
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

export { app };
