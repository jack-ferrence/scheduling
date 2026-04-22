import { pool } from './db';

async function main() {
  await pool.query('ALTER TABLE facilities ALTER COLUMN latitude DROP NOT NULL');
  await pool.query('ALTER TABLE facilities ALTER COLUMN longitude DROP NOT NULL');
  console.log('latitude/longitude are now nullable.');
  await pool.end();
}

main().catch((err) => { console.error(err); process.exit(1); });