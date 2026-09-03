# Migrating the backend to your own Supabase project

The backend currently runs on Lovable Cloud. It uses Supabase infrastructure, but the
project lives in Lovable's account — there is no dashboard login, project-ref transfer
or database password for it. The way to own it is to recreate it in **your** Supabase
project, which is what this guide does.

Everything you need is already in this repo, so it survives even if the Lovable project
goes away:

| File | What it is |
| --- | --- |
| `supabase/migrations/0001_initial_schema.sql` | The complete backend as one runnable file |
| `.env.example` | Every environment variable, browser-safe vs server-only |
| `src/lib/auth-google.ts` | Google sign-in that works inside Lovable **and** standalone |
| `src/lib/ai-provider.server.ts` | Goldie's AI provider with a direct-key fallback |

**There is no data to move.** Every table was empty at export time except
`engagement_rules`, whose six configuration rows are seeded by the SQL file.
No storage buckets exist either.

---

## 1. Create your Supabase project

1. Sign up at [supabase.com](https://supabase.com) — the free tier is enough.
2. **New project** → pick a name, a strong database password (save it), and a region
   close to your users (`eu-west` or `us-east` both work fine for Nigeria).
3. Wait ~2 minutes for provisioning.

## 2. Run the schema

1. In your project, open **SQL Editor** → **New query**.
2. Open `supabase/migrations/0001_initial_schema.sql`, copy the whole file, paste it in.
3. Before running, scroll to the bottom and change the email in the
   `INSERT INTO public.admin_allowlist` line to the address you will sign in with.
   That row is what unlocks `/admin`.
4. Click **Run**. It is safe to re-run if anything fails partway.

This creates: the `app_role` enum, 15 tables, all grants, RLS on every table with each
policy, 14 functions (`is_admin`, `has_role`, `submit_plan`, `get_shared_plan`,
`mark_plan_shared`, `log_error_event`, `record_project_interaction`, `score_lead`,
`create_draft_proposal`, and the rest) and 5 triggers.

## 3. Enable authentication

**Email/password** — *Authentication → Sign In / Providers → Email*: enable it. Turn
"Confirm email" on or off to taste.

**Google** —

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials) →
   **Create credentials → OAuth client ID → Web application**.
2. Under **Authorised redirect URIs** add the callback URL shown in Supabase at
   *Authentication → Sign In / Providers → Google*. It looks like:
   `https://YOUR-PROJECT-REF.supabase.co/auth/v1/callback`
3. Under **Authorised JavaScript origins** add your site origin
   (e.g. `http://localhost:8080` for local dev and your production domain).
4. Copy the **Client ID** and **Client secret** into the Google provider in Supabase and
   save.
5. In Supabase *Authentication → URL Configuration*, set **Site URL** to your domain and
   add `http://localhost:8080/**` plus your production URLs to **Redirect URLs**.

## 4. Wire up the app

```bash
cp .env.example .env
```

Fill in, from *Project Settings → API*:

- `VITE_SUPABASE_URL` / `SUPABASE_URL` — the project URL
- `VITE_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_PUBLISHABLE_KEY` — the publishable (anon) key
- `VITE_SUPABASE_PROJECT_ID` / `SUPABASE_PROJECT_ID` — the project ref
- `SUPABASE_SERVICE_ROLE_KEY` — the service_role key (**server-only, never commit it**)

Set `VITE_AUTH_MODE=supabase`. That switches Google sign-in from the Lovable OAuth
broker to standard `supabase.auth.signInWithOAuth` — the broker only works inside
Lovable. Leave it unset (or `lovable`) while you keep working in the Lovable editor.

**Goldie's AI key.** Inside Lovable, `LOVABLE_API_KEY` is injected automatically. Outside
it, that key stops working, so create a free key at
[aistudio.google.com/apikey](https://aistudio.google.com/apikey) and set
`GOOGLE_AI_API_KEY`. If neither key is present Goldie returns a clear "not connected"
message instead of a 500 — the rest of the site is unaffected.

Then:

```bash
bun install
bun run dev
```

## 5. Verify

1. Open `/auth` and sign in with Google. You should land back signed in.
2. Open `/admin` — it should let you in if your email is in `admin_allowlist`.
   (Not in? Run `INSERT INTO public.admin_allowlist (email) VALUES ('you@example.com');`)
3. Go to `/pricing-guide`, complete the estimator and submit the plan.
4. In Supabase *Table Editor*, confirm a row in `pricing_plans`, a row in `goldie_leads`,
   and a matching entry in `contact_events`.
5. Back in `/admin` → **Inbox**, the submission should appear with its lead score.
6. Open a portfolio project and appreciate it — `project_interactions` should gain a row.

## 6. Hosting the frontend

This is a standard TanStack Start app and deploys anywhere (Vercel, Netlify, Cloudflare
Workers). Copy the same environment variables into your host's dashboard — the `VITE_*`
ones are public, the rest must be set as secrets.

---

### Keeping the export current

If you change the schema later while still on Lovable Cloud, regenerate the file so your
backup does not drift:

```bash
pg_dump --schema-only --no-owner --schema=public "$SUPABASE_DB_URL" > supabase/migrations/0001_initial_schema.sql
```

(then re-apply the `IF NOT EXISTS` / `DROP POLICY IF EXISTS` guards, or just run it
against a fresh project.)
