/**
 * Clears all seeded/scraped data WITHOUT dropping the schema.
 * Run with: npm run db:clear
 */

import 'dotenv/config';
import { pool } from './db.js';

async function main() {
  console.log('[clear] Deleting all data (keeping schema)…');
  await pool.query(`
    TRUNCATE signups, time_slots, facility_bookings, facilities, users
    RESTART IDENTITY CASCADE
  `);
  await pool.end();
  console.log('[clear] Done.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
