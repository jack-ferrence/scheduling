// actual to login 25 live and fetch space and reservation data. 
// This is used by the sync-25live script to get the latest events and update our database.

/**
 * 25live (CollegeNET Series25) scraper for Biola University
 *
 * API base: https://25live.collegenet.com/25live/data/biola/run/
 * Auth:     POST /pro/biola/j_security_check  (sets Blaze session cookie)
 */

import axios, { type AxiosInstance } from 'axios';
import { wrapper } from 'axios-cookiejar-support';
import { CookieJar } from 'tough-cookie';
import { XMLParser } from 'fast-xml-parser';

const BASE_URL = 'https://25live.collegenet.com';
const WS_BASE = '/25live/data/biola/run';

// ── XML parser (strips r25: namespace prefixes) ────────────────────────────
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: '@_',
  // Map "r25:foo" → "foo" so we can access fields without namespace prefix
  transformTagName: (tag: string) => tag.replace(/^r25:/, '').replace(/^xl:/, ''),
});

// ── Types ──────────────────────────────────────────────────────────────────

export interface TwentyFiveLiveSpace {
  space_id: number;
  space_name: string;
  formal_name: string | null;
  max_capacity: number | null;
  default_capacity: number | null;
  categories: string[];
  features: string[];
  organization: string | null;
  latitude: number | null;
  longitude: number | null;
}

export interface TwentyFiveLiveReservation {
  rsrv_id: number;
  event_id: number;
  event_name: string;
  organization_name: string | null;
  event_type_name: string | null;
  start_dt: string;   // ISO-8601 with offset
  end_dt: string;
  pre_event_dt: string | null;   // setup start
  post_event_dt: string | null;  // teardown end
  state: number;
}

// ── Auth ───────────────────────────────────────────────────────────────────

export async function createAuthenticatedClient(
  username: string,
  password: string
): Promise<AxiosInstance> {
  const jar = new CookieJar();
  const client = wrapper(
    axios.create({
      baseURL: BASE_URL,
      jar,
      withCredentials: true,
      maxRedirects: 10,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; BiolaSportsApp/1.0)',
        Accept: 'application/xml, text/xml, */*',
      },
    })
  );

  // Load the landing page to get initial cookies
  await client.get('/pro/biola/').catch(() => {});

  // POST credentials
  const params = new URLSearchParams();
  params.append('j_username', username);
  params.append('j_password', password);

  const loginRes = await client.post('/pro/biola/j_security_check', params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    validateStatus: (s) => s < 500,
  });

  const body = typeof loginRes.data === 'string' ? loginRes.data : '';
  if (body.includes('j_security_check') || body.toLowerCase().includes('invalid username')) {
    throw new Error('25live authentication failed — check credentials in .env');
  }

  return client;
}

// ── Fetch spaces ───────────────────────────────────────────────────────────

export async function fetchSpaces(client: AxiosInstance): Promise<TwentyFiveLiveSpace[]> {
  const res = await client.get<string>(`${WS_BASE}/spaces.xml`, {
    params: { include: 'categories,features', page_size: 500 },
    responseType: 'text',
  });

  const parsed = parser.parse(res.data);
  // Structure: parsed.spaces.space (array or single object)
  const root = parsed?.spaces ?? parsed?.['r25:spaces'] ?? {};
  const rawSpaces = root?.space ?? root?.['r25:space'] ?? [];
  const arr = Array.isArray(rawSpaces) ? rawSpaces : [rawSpaces];

  return arr
    .filter((s: Record<string, unknown>) => s && s.space_id)
    .map((s: Record<string, unknown>) => {
      const cats = normalizeToArray(s.categories?.category ?? s.category ?? []);
      const feats = normalizeToArray(s.features?.feature ?? s.feature ?? []);
      return {
        space_id: Number(s.space_id),
        space_name: String(s.space_name ?? ''),
        formal_name: s.formal_name ? String(s.formal_name) : null,
        max_capacity: s.max_capacity != null ? Number(s.max_capacity) : null,
        default_capacity: s.default_capacity != null ? Number(s.default_capacity) : null,
        categories: cats.map((c: Record<string, unknown>) => String(c.category_name ?? c)),
        features: feats.map((f: Record<string, unknown>) => String(f.feature_name ?? f)),
        organization: s.organization_name ? String(s.organization_name) : null,
        latitude: s.latitude != null ? Number(s.latitude) : null,
        longitude: s.longitude != null ? Number(s.longitude) : null,
      } satisfies TwentyFiveLiveSpace;
    });
}

// ── Fetch reservations for a space ────────────────────────────────────────

export async function fetchReservationsForSpace(
  client: AxiosInstance,
  spaceId: number,
  startDate: string, // YYYY-MM-DD
  endDate: string    // YYYY-MM-DD
): Promise<TwentyFiveLiveReservation[]> {
  const res = await client.get<string>(`${WS_BASE}/rm_reservations.xml`, {
    params: {
      space_id: spaceId,
      start_dt: startDate.replace(/-/g, ''),
      end_dt: endDate.replace(/-/g, ''),
      include: 'event_details',
    },
    responseType: 'text',
    validateStatus: (s) => s < 500,
  });

  if (typeof res.data !== 'string' || res.status === 404) return [];

  const parsed = parser.parse(res.data);
  // Response root is space_reservations, items are space_reservation
  const root = parsed?.space_reservations ?? parsed?.rm_reservations ?? parsed?.reservations ?? {};
  const rawRsrv = root?.space_reservation ?? root?.reservation ?? root?.rsrv ?? [];
  const arr = Array.isArray(rawRsrv) ? rawRsrv : rawRsrv ? [rawRsrv] : [];

  return arr
    .filter((r: Record<string, unknown>) => r && r.reservation_start_dt)
    .map((r: Record<string, unknown>) => {
      const ev = (r.event ?? {}) as Record<string, unknown>;
      return {
        rsrv_id: Number(r.reservation_id ?? 0),
        event_id: Number(ev.event_id ?? 0),
        event_name: String(ev.event_name ?? 'Unnamed Event'),
        organization_name: ev.organization_name ? String(ev.organization_name) : null,
        event_type_name: ev.event_type_name ? String(ev.event_type_name) : null,
        start_dt: String(r.reservation_start_dt),
        end_dt: String(r.reservation_end_dt ?? r.reservation_start_dt),
        pre_event_dt: ev.pre_event_dt ? String(ev.pre_event_dt) : null,
        post_event_dt: ev.post_event_dt ? String(ev.post_event_dt) : null,
        state: Number(r.reservation_state ?? ev.state ?? 2),
      } satisfies TwentyFiveLiveReservation;
    });
}

// ── Helpers ────────────────────────────────────────────────────────────────

function normalizeToArray(val: unknown): unknown[] {
  if (!val) return [];
  return Array.isArray(val) ? val : [val];
}

export function mapEventType(
  typeName: string | null
): 'game' | 'practice' | 'tournament' | 'maintenance' | 'other' {
  const t = (typeName ?? '').toLowerCase();
  if (t.includes('game') || t.includes('match') || t.includes('competition') || t.includes('contest')) return 'game';
  if (t.includes('tournament') || t.includes('championship') || t.includes('invitational') || t.includes('meet')) return 'tournament';
  if (t.includes('practice') || t.includes('training') || t.includes('workout') || t.includes('scrimmage')) return 'practice';
  if (t.includes('maintenance') || t.includes('repair') || t.includes('cleaning') || t.includes('resurfac')) return 'maintenance';
  if (t.includes('athlet') || t.includes('sport') || t.includes('recreation')) return 'practice';
  return 'other';
}

export function deriveSports(spaceName: string, formalName: string | null, categories: string[], features: string[]): string[] {
  const terms = [spaceName, formalName ?? '', ...categories, ...features].join(' ').toLowerCase();
  const sports: string[] = [];
  if (terms.includes('basketball')) sports.push('Basketball');
  if (terms.includes('volleyball')) sports.push('Volleyball');
  if (terms.includes('tennis')) sports.push('Tennis');
  if (terms.includes('soccer') || terms.includes('football')) sports.push('Soccer');
  if (terms.includes('swimming') || terms.includes('pool') || terms.includes('aquatic')) sports.push('Swimming');
  if (terms.includes('badminton')) sports.push('Badminton');
  if (terms.includes('pickleball')) sports.push('Pickleball');
  if (terms.includes('racquet')) sports.push('Racquetball');
  if (terms.includes('track') || terms.includes('field')) sports.push('Track & Field');
  if (terms.includes('baseball') || terms.includes('softball')) sports.push('Baseball');
  if (terms.includes('weight') || terms.includes('fitness') || terms.includes('training')) sports.push('Fitness');
  if (sports.length === 0 && (terms.includes('gym') || terms.includes('court') || terms.includes('field') || terms.includes('arena'))) {
    sports.push('General Recreation');
  }
  return sports;
}
