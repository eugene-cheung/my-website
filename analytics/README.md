# Visitor analytics

A Cloudflare Worker + D1 database that logs one row per visit to cheunge.dev.
Everything here runs inside Cloudflare's free tier (100k Worker requests/day,
5 GB of D1 storage) — at portfolio traffic there is no path to a bill.

## What gets recorded

Per visit: timestamp, IP, country / region / city / timezone, ASN and network
organization, referrer, UTM query, path, user-agent, device class, screen size,
language, which sections were actually scrolled into view, time on page, and
whether the résumé was opened. Obvious bots are flagged and excluded from the
dashboard.

Geo and network fields come from `request.cf`, which Cloudflare attaches to
every request for free — no third-party lookup service.

## Setup

```bash
cd analytics
npx wrangler login
npx wrangler d1 create cheunge-analytics
```

`d1 create` prints a `database_id`. Put it in `wrangler.toml` **before running
anything else** — the remaining commands fail against a placeholder id. Ignore
the `binding` it suggests; the Worker reads `env.DB`, so `binding = "DB"` stays.

```bash
npx wrangler d1 execute cheunge-analytics --remote --file=./schema.sql
npx wrangler secret put DASH_KEY                # long random string; your dashboard password
npx wrangler secret put HASH_SALT               # any random string
npx wrangler deploy
```

Then point the site at the deployed Worker. GitHub Pages builds from your
machine via `npm run deploy`, so set it in a local `.env` (git-ignored):

```
VITE_ANALYTICS_URL=https://cheunge-analytics.<your-subdomain>.workers.dev
```

and redeploy the site with `npm run deploy`.

## Reading the data

- `https://<worker>/dashboard?key=<DASH_KEY>` — HTML summary
- `https://<worker>/stats?key=<DASH_KEY>` — the same data as JSON
- `npx wrangler d1 execute cheunge-analytics --remote --command "SELECT ..."` — raw SQL

## Notes

- The `visitor` column is a daily-rotating hash of IP + user-agent, so repeat
  views collapse into one visitor without setting a cookie — which is also why
  the site currently needs no cookie banner.
- Raw IPs are personal data under GDPR. Storing them for a personal portfolio is
  low-risk, but if you would rather not, drop the `ip` column and rely on
  `visitor` plus city — the dashboard reads the same either way.
- `Do-Not-Track` browsers are skipped client-side.
