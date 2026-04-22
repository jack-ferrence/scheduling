// Netlify Scheduled Function — runs the 25live sync on a cron.
// Configured via netlify.toml ([functions."sync-25live"] schedule).
//
// Credentials come from Netlify env vars:
//   TWENTYFIVE_LIVE_USERNAME
//   TWENTYFIVE_LIVE_PASSWORD
//   DATABASE_URL

import type { Handler } from '@netlify/functions';

process.env.NETLIFY = process.env.NETLIFY ?? 'true';

import { runSync } from '../../server/sync-25live';
import { pool } from '../../server/db';

export const handler: Handler = async () => {
  try {
    const result = await runSync();
    // Close the pool so the function's Node process can shut down cleanly.
    await pool.end().catch(() => {});
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, ...result }),
    };
  } catch (err) {
    console.error('[sync-25live] failed:', err);
    await pool.end().catch(() => {});
    return {
      statusCode: 500,
      body: JSON.stringify({ ok: false, error: (err as Error).message }),
    };
  }
};
