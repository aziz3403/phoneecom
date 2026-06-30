# reMint — Accounts & Auth setup

reMint uses **Auth.js v5 (NextAuth)** with a **Postgres** database (via Drizzle ORM)
for real sign-in: email + password, Google OAuth, password reset, and per-user
order history.

> The site runs fine **without** any of this configured — auth pages show a
> friendly "not set up yet" notice and checkout works as a guest. Add the env
> vars below to switch on real accounts.

## 1. Create a Postgres database

Any Postgres works. Easiest serverless options:

- **Neon** — https://neon.tech (free tier). Create a project, copy the connection string.
- **Vercel Postgres** — Vercel dashboard → Storage → Postgres.
- **Supabase** — project → Settings → Database → connection string.

Copy the connection string, e.g.
`postgres://user:password@host/dbname?sslmode=require`

## 2. Set environment variables

Copy `.env.example` → `.env.local` (local dev) or add these in your host
(Vercel → Settings → Environment Variables):

| Variable | Required | What |
| --- | --- | --- |
| `AUTH_SECRET` | ✅ | Session secret. Generate: `npx auth secret` or `openssl rand -base64 33` |
| `DATABASE_URL` | ✅ | Postgres connection string from step 1 |
| `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` | optional | Enables "Continue with Google" |
| `AUTH_URL` | optional | Canonical URL behind proxies / custom domains, e.g. `https://remint.com` |
| `RESEND_API_KEY` / `AUTH_EMAIL_FROM` | optional | Sends real password-reset emails (Resend). Without it, the reset link is shown on screen in demo mode. |

## 3. Create the database tables

Point `DATABASE_URL` at your database and push the schema:

```bash
DATABASE_URL="postgres://…" npm run db:push
```

(or `npm run db:migrate` to apply the committed migration in `./drizzle`).

## 4. (Optional) Google sign-in

1. Google Cloud Console → **APIs & Services → Credentials → Create OAuth client ID → Web application**.
2. Authorized redirect URIs:
   - `https://YOUR_DOMAIN/api/auth/callback/google`
   - `http://localhost:3000/api/auth/callback/google` (local dev)
3. Put the client ID/secret in `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET`.

The Google button appears automatically once those are set.

## 5. Deploy

On Vercel, set the env vars (step 2) **before** building, then deploy. Run the
migration (step 3) against the production database once.

---

### What's wired up

- **Sign up / sign in** — `/login` (email + password, bcrypt-hashed; Google when configured).
- **Password reset** — "Forgot password?" → emailed (or demo) link → `/reset?token=…`.
- **Account** — `/account` is protected (redirects to `/login`) and shows DB-backed order history.
- **Checkout** — prefilled from your profile; orders placed while signed in are saved to your account.
- **Wholesale** — the trade-account application is tied to your signed-in account; approval is stored on your user record.

### Where it lives

- `src/lib/auth.ts` — Auth.js config (providers, Drizzle adapter, JWT session, callbacks)
- `src/lib/auth-actions.ts` — sign-up / sign-in / reset server actions
- `src/lib/db/schema.ts` — Drizzle schema · `src/lib/db/index.ts` — lazy DB client
- `src/app/api/auth/[...nextauth]/route.ts` — Auth.js route handler
- `src/app/login`, `src/app/reset`, `src/app/account` — auth pages
