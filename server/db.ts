import pg from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.warn(
    '[db] DATABASE_URL is not set. Set it in .env (see .env.example) before running the API or db:reset.'
  );
}

// Neon / most hosted Postgres require SSL. Enable whenever the URL looks remote
// or NODE_ENV=production. Local dev against localhost stays plain.
const needsSsl =
  !!connectionString &&
  !/localhost|127\.0\.0\.1/.test(connectionString) &&
  !/sslmode=disable/.test(connectionString);

export const pool = new pg.Pool({
  connectionString,
  max: 10,
  ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
});
