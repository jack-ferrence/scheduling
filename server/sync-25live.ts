// runs when do npm run db:sync to sync 25live events into our database.

/**
 * Sync 25live EVENTS only into facility_bookings.
 * Does NOT import new facilities — our 5 facilities are managed via db:reset.
 *
 * For the 3 campus facilities it looks up their 25live space IDs by name,
 * then fetches reservations and stores them linked to our fac-1/fac-2/fac-3 IDs.
 *
 * Run with:  npm run db:sync
 */

import 'dotenv/config';
import { format, addDays } from 'date-fns';
import { pool } from './db.js';
import {
  createAuthenticatedClient,
  fetchSpaces,
  fetchReservationsForSpace,
  mapEventType,
} from './scraper/twentyfive-live.js';

const SCRAPE_DAYS_AHEAD = 30;

/** Map our facility IDs → the 25live space name fragments to match against */
const FACILITY_NAME_MAP: Record<string, string[]> = {
  'fac-1': ['chase gymnasium (d)', 'chase gymnasium'],
  'fac-2': ['barbour soccer field', 'barbour field'],
  'fac-3': ['hope hall basketball court', 'hope basketball'],
};

export async function runSync(options: { closePool?: boolean } = {}): Promise<{ upserted: number; skipped: number }> {
  const username = process.env.TWENTYFIVE_LIVE_USERNAME;
  const password = process.env.TWENTYFIVE_LIVE_PASSWORD;

  if (!username || !password) {
    throw new Error('Missing TWENTYFIVE_LIVE_USERNAME or TWENTYFIVE_LIVE_PASSWORD env vars');
  }

  console.log('[sync] Authenticating with 25live…');
  const client = await createAuthenticatedClient(username, password);
  console.log('[sync] Authenticated.');

  console.log('[sync] Fetching all spaces to find matches…');
  const spaces = await fetchSpaces(client);
  console.log(`[sync] Got ${spaces.length} total spaces.`);

  // Match 25live spaces to our facility IDs by name
  const matches: Array<{ facilityId: string; spaceId: number; spaceName: string }> = [];

  for (const [facilityId, nameFragments] of Object.entries(FACILITY_NAME_MAP)) {
    const match = spaces.find((s) => {
      const name = (s.formal_name ?? s.space_name).toLowerCase();
      return nameFragments.some((fragment) => name.includes(fragment));
    });
    if (match) {
      matches.push({
        facilityId,
        spaceId: match.space_id,
        spaceName: match.formal_name ?? match.space_name,
      });
      console.log(`[sync] Matched ${facilityId} → "${match.formal_name ?? match.space_name}" (id=${match.space_id})`);
    } else {
      console.log(`[sync] No 25live match found for ${facilityId} (searched: ${nameFragments.join(', ')})`);
    }
  }

  if (matches.length === 0) {
    console.log('[sync] No facility matches found. Check FACILITY_NAME_MAP in sync-25live.ts.');
    if (options.closePool) await pool.end();
    return { upserted: 0, skipped: 0 };
  }

  // Fetch and upsert reservations for matched facilities
  const today = new Date();
  const startDate = format(today, 'yyyy-MM-dd');
  const endDate = format(addDays(today, SCRAPE_DAYS_AHEAD), 'yyyy-MM-dd');

  let bookingsUpserted = 0;
  let bookingsSkipped = 0;

  for (const { facilityId, spaceId, spaceName } of matches) {
    console.log(`[sync] Fetching reservations for "${spaceName}"…`);
    const reservations = await fetchReservationsForSpace(client, spaceId, startDate, endDate);
    console.log(`[sync]   → ${reservations.length} reservations`);

    for (const rsrv of reservations) {
      const startStr = rsrv.pre_event_dt ?? rsrv.start_dt;
      const endStr = rsrv.post_event_dt ?? rsrv.end_dt;
      if (!startStr || !endStr) continue;

      const startTs = new Date(startStr);
      const endTs = new Date(endStr);
      if (isNaN(startTs.getTime()) || isNaN(endTs.getTime()) || endTs <= startTs) continue;

      const setupMins = rsrv.pre_event_dt
        ? Math.round((new Date(rsrv.start_dt).getTime() - startTs.getTime()) / 60000)
        : 0;
      const teardownMins = rsrv.post_event_dt
        ? Math.round((endTs.getTime() - new Date(rsrv.end_dt).getTime()) / 60000)
        : 0;

      const externalId = `${rsrv.event_id}_${rsrv.rsrv_id}`;

      try {
        await pool.query(
          `INSERT INTO facility_bookings (
            facility_id, external_id, event_name, organization,
            start_time, end_time,
            setup_minutes, teardown_minutes,
            event_type, is_public, scraped_at
          ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,now())
          ON CONFLICT (facility_id, external_id) DO UPDATE SET
            event_name       = EXCLUDED.event_name,
            organization     = EXCLUDED.organization,
            start_time       = EXCLUDED.start_time,
            end_time         = EXCLUDED.end_time,
            setup_minutes    = EXCLUDED.setup_minutes,
            teardown_minutes = EXCLUDED.teardown_minutes,
            event_type       = EXCLUDED.event_type,
            scraped_at       = now()`,
          [
            facilityId,
            externalId,
            rsrv.event_name,
            rsrv.organization_name ?? null,
            startTs.toISOString(),
            endTs.toISOString(),
            setupMins,
            teardownMins,
            mapEventType(rsrv.event_type_name),
            true,
          ]
        );
        bookingsUpserted++;
      } catch {
        bookingsSkipped++;
      }
    }
  }

  console.log(`[sync] Reservations: ${bookingsUpserted} upserted, ${bookingsSkipped} skipped.`);
  if (options.closePool) await pool.end();
  console.log('[sync] Done.');
  return { upserted: bookingsUpserted, skipped: bookingsSkipped };
}

// Only run as a CLI when invoked directly (npm run db:sync).
// Under Netlify / when imported by the scheduled function, the consumer calls
// runSync() explicitly and NETLIFY=true is set in the environment.
if (!process.env.NETLIFY) {
  runSync({ closePool: true }).catch((err) => {
    console.error('[sync] Fatal error:', err);
    process.exit(1);
  });
}
