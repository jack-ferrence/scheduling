//the sample data that gets inserted when run npm run db:seed. 
// This is useful for development and testing, 
// so you have some data to work with right away. 
// You can modify this file to change the sample data as needed.

import { pool } from './db';
import { mockFacilities } from '../app/data/mockData';


const COORDS: Record<string, [number, number] | null> = {
  'fac-1': [33.9065, -118.01383],    // Chase Gym
  'fac-2': [33.906085, -118.012803],                    // Al Barbour Field
  'fac-3': [33.904503, -118.015142],                    // Hope Outdoor Basketball Court
  'fac-4': [33.89851, -118.02529],                      // Neff Park
  'fac-5': [33.910801, -118.0238],                     // Gardenhill Park
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
    const coords = COORDS[f.id];
    const lat: number | null = coords ? coords[0] : null;
    const lng: number | null = coords ? coords[1] : null;
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

  // --- Seed sample pickup games ---
  // [facilityId, creatorIdx, sport, daysFromNow, startHour, endHour, capacity, extraJoinerIdxs]
  type SeedSlot = [string, number, string, number, number, number, number, number[]];
  const SAMPLE_SLOTS: SeedSlot[] = [
    ['fac-1', 0, 'Basketball',     1, 18, 20, 10, [1, 2]], // Alice, + Bob & Charlie joined
    ['fac-1', 1, 'Volleyball',     2, 17, 19,  8, [0]],     // Bob,   + Alice
    ['fac-1', 2, 'Table Tennis',   3, 15, 16,  4, []],      // Charlie, solo so far
    ['fac-2', 0, 'Soccer',         1, 16, 18, 12, [2]],     // Alice, + Charlie
    ['fac-2', 2, 'Flag Football',  4, 19, 21, 14, [0, 1]],  // Charlie, + Alice & Bob
    ['fac-3', 1, 'Basketball',     2, 20, 21,  6, [0]],     // Bob, + Alice
  ];

  // Clear any previous seeded slots so re-running is idempotent
  await pool.query(`DELETE FROM time_slots WHERE created_by_user_id = ANY($1::uuid[])`, [userIds]);

  for (const [facilityId, creatorIdx, sport, daysFromNow, startHour, endHour, capacity, joiners] of SAMPLE_SLOTS) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + daysFromNow);
    startDate.setHours(startHour, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setHours(endHour, 0, 0, 0);

    const creatorId = userIds[creatorIdx];

    const slotRes = await pool.query<{ slot_id: string }>(
      `INSERT INTO time_slots (facility_id, sport, start_time, end_time, capacity, created_by_user_id)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING slot_id`,
      [facilityId, sport, startDate.toISOString(), endDate.toISOString(), capacity, creatorId]
    );
    const slotId = slotRes.rows[0].slot_id;

    // Creator is always the first signup
    await pool.query(
      `INSERT INTO signups (slot_id, user_id) VALUES ($1, $2)
       ON CONFLICT (slot_id, user_id) DO NOTHING`,
      [slotId, creatorId]
    );

    // Extra joiners
    for (const joinerIdx of joiners) {
      await pool.query(
        `INSERT INTO signups (slot_id, user_id) VALUES ($1, $2)
         ON CONFLICT (slot_id, user_id) DO NOTHING`,
        [slotId, userIds[joinerIdx]]
      );
    }
  }

  console.log(`[seed] facilities=${mockFacilities.length}`);
}


// At the very bottom of server/seed.ts
seed()
  .then(() => pool.end())
  .then(() => {
    console.log('Seed complete.');
    process.exit(0);
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });