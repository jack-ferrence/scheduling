import { pool } from './db';
import { mockFacilities } from '../app/data/mockData';

const COORDS: Record<string, [number, number]> = {
  'fac-1': [33.9003, -117.8876], // Chase Gymnasium — Biola campus
  'fac-2': [33.9012, -117.8882], // Al Barbour Field — Biola campus
  'fac-3': [33.9000, -117.8860], // Hope Outdoor Basketball Court — Biola campus
  'fac-4': [33.9028, -117.9048], // Neff Park — La Mirada
  'fac-5': [33.9096, -117.9122], // Gardenhill Park — La Mirada
};

export async function seed() {
  const demoUsers = [
    { name: 'Alice Demo', email: 'alice.demo@local.test' },
    { name: 'Bob Demo', email: 'bob.demo@local.test' },
    { name: 'Charlie Demo', email: 'charlie.demo@local.test' },
  ];

  const userIds: string[] = [];
  for (const u of demoUsers) {
    const r = await pool.query<{ user_id: string }>(
      `INSERT INTO users (name, email) VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
       RETURNING user_id`,
      [u.name, u.email]
    );
    userIds.push(r.rows[0].user_id);
  }

  for (const f of mockFacilities) {
    const [lat, lng] = COORDS[f.id] ?? [33.9002, -117.8871];
    await pool.query(
      `INSERT INTO facilities (
        facility_id, name, facility_type, location_text, sports, image_url, description,
        opening_time, closing_time, amenities, parking_available, accessibility, latitude, longitude
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
      ON CONFLICT (facility_id) DO UPDATE SET
        name = EXCLUDED.name,
        location_text = EXCLUDED.location_text,
        sports = EXCLUDED.sports,
        image_url = EXCLUDED.image_url,
        description = EXCLUDED.description,
        opening_time = EXCLUDED.opening_time,
        closing_time = EXCLUDED.closing_time,
        amenities = EXCLUDED.amenities,
        parking_available = EXCLUDED.parking_available,
        accessibility = EXCLUDED.accessibility,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude`,
      [
        f.id,
        f.name,
        f.type,
        f.location,
        f.sports,
        f.image,
        f.description,
        f.openingTime,
        f.closingTime,
        f.amenities,
        f.parkingAvailable,
        f.accessibility,
        lat,
        lng,
      ]
    );
  }

  console.log(`[seed] facilities=${mockFacilities.length}`);
}
