# LEAD Futures Foundation — Website

Static pages plus a small set of Vercel serverless functions backed by
Supabase. No build step: the HTML is hand-authored and served as-is.

## Pages
- `index.html` — Homepage
- `programs.html` — Programs
- `events.html` — Events calendar (month grid, reads from the database)
- `event.html` — Single event detail, opened as `event.html?e=some-slug`
- `admin.html` — Admin panel (login required)

## Server functions (`api/`)
| Route | Purpose |
|---|---|
| `GET  /api/events` | Published events for the public calendar |
| `POST /api/subscribe` | Newsletter signups |
| `/api/admin/events` | Event create / edit / delete — auth required |
| `/api/admin/subscribers` | Newsletter list — auth required |
| `/api/admin/upload` | Event image upload to Supabase Storage — auth required |

`api/_supabase.js` is shared code, not a route. The leading underscore
tells Vercel not to expose it as an endpoint.

## Configuration

**Vercel → Settings → Environment Variables** (server-side, never in the repo):

```
SUPABASE_URL               https://xxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY  sb_secret_...
```

**`admin-config.js`** (committed, safe to be public): the project URL and
the *publishable* key. Every table has row level security enabled with no
policies, so this key can read nothing on its own.

The secret key must never appear in any file the browser downloads.

## Database
Run `supabase-setup.sql` in the Supabase SQL Editor. It creates
`subscribers`, `events` and `admin_users`, and seals all three with RLS.

Event images live in a public Storage bucket named `event-images`.
Uploads go through the server, which checks the admin session first.

## Admin access
Two locks: a valid Supabase session, *and* the user id must appear in
`admin_users`. Accounts are created by hand in the Supabase dashboard —
there is no public signup.

## Local preview
```
npx serve .
```
Note the `/api` routes will not run this way. For those, use `vercel dev`.

## Deploy
Push to `main`. Vercel builds and deploys automatically.

## Housekeeping
Supabase pauses free projects after 7 days with no activity, which would
take the calendar offline. Keep a scheduled request hitting the database
at least weekly.
