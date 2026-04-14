import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from './db';
import { seed } from './seed';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const schemaPath = path.join(__dirname, '..', 'Database', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(sql);
  await seed();
  await pool.end();
  console.log('Database reset and seeded.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
