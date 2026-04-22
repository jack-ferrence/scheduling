// Wraps the existing Express app as a Netlify Function.
// The redirect in netlify.toml sends /api/* → /.netlify/functions/api/:splat
// and preserves the original /api/... path so Express routes match as-is.

// NOTE: ES module imports are hoisted, so setting process.env.NETLIFY in the
// module body would happen AFTER server/index is imported. We set it here
// before any import so the guard in server/index.ts fires correctly.
process.env.NETLIFY = process.env.NETLIFY ?? 'true';

import serverless from 'serverless-http';
import { app } from '../../server/index';

// serverless-http returns a function compatible with AWS Lambda / Netlify Functions.
// We export it directly and bypass Netlify's strict Handler type (which doesn't
// perfectly line up with serverless-http's generic output).
export const handler = serverless(app) as unknown as (
  event: unknown,
  context: unknown
) => Promise<{ statusCode: number; body: string; headers?: Record<string, string> }>;
