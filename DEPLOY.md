# Deploy to Netlify

This project is a Vite React frontend + Express API + Postgres + a 25live
scraper. On Netlify:

- the frontend is built to `dist/` and served statically
- the Express API runs inside **one** Netlify Function (`netlify/functions/api.ts`)
  via `serverless-http`; `/api/*` is rewritten to it by `netlify.toml`
- the 25live sync runs as a **scheduled function** (`netlify/functions/sync-25live.ts`)
  every 6 hours — cron expression in `netlify.toml` under `[functions."sync-25live"]`

## 1. Create a Neon Postgres database (free)

1. Go to <https://neon.tech> → sign up → create project "biola-sports".
2. Copy the **connection string** — it looks like
   `postgresql://USER:PASS@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require`.
3. From your local machine, point `.env` at it temporarily and seed the DB:
   ```bash
   # edit .env → set DATABASE_URL to the Neon string
   npm run db:reset    # create schema
   npm run db:seed     # insert facilities / demo data
   npm run db:sync     # initial 25live import
   ```
   Then switch `.env` back to local if you want local dev to keep working.

## 2. Push the project to GitHub

Netlify deploys from git. If you haven't already:
```bash
git init
git add .
git commit -m "Netlify-ready"
# create a repo on github.com, then:
git remote add origin git@github.com:YOURNAME/biola-sports-reservations.git
git push -u origin main
```

## 3. Connect the repo to Netlify

1. <https://app.netlify.com> → **Add new site → Import an existing project** → GitHub → pick the repo.
2. Build command / publish dir are auto-read from `netlify.toml` (`npm run build`, `dist`). Don't change them.
3. Before the first deploy, go to **Site settings → Environment variables** and add:
   | Key | Value |
   |---|---|
   | `DATABASE_URL` | your Neon connection string from step 1 |
   | `TWENTYFIVE_LIVE_USERNAME` | `jack.ferrence@biola.edu` |
   | `TWENTYFIVE_LIVE_PASSWORD` | your Biola password |
   | `TZ` | `America/Los_Angeles` |
4. Click **Deploy site**.

## 4. Verify

After the build finishes:

- Visit `https://YOURSITE.netlify.app` — frontend loads.
- `https://YOURSITE.netlify.app/api/health` → `{"ok":true,"service":"biola-sports-api"}`.
- `https://YOURSITE.netlify.app/api/facilities` → your facilities.
- **Scheduled function**: Netlify dashboard → **Functions → sync-25live → Logs**.
  It'll fire on the next `0 */6 * * *` tick. You can also trigger it manually
  from that page with **Run** to confirm 25live import works without waiting.

## Changing sync frequency

Edit the cron in `netlify.toml`:
```toml
[functions."sync-25live"]
  schedule = "0 */6 * * *"   # every 6 hours
# schedule = "0 * * * *"     # every hour
# schedule = "0 3 * * *"     # daily at 3 AM UTC
```
Commit, push, Netlify redeploys automatically.

## Local development still works

`npm run dev` boots both the Vite frontend and the Express API on localhost
exactly like before. The Netlify-specific code only activates when the
`NETLIFY` env var is set (which Netlify sets automatically during builds/runs).
