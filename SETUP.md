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
4. **Publish the consent screen** so any customer (not just test users) can sign in:
   Google Cloud → **Google Auth Platform → Audience → Publish app**. With only the
   basic `openid / email / profile` scopes, no verification review is required.

The Google button appears automatically once the keys are set.

## 4b. (Optional) Saved addresses / profile editor

The account "Details" tab lets users save a shipping address (and prefills
checkout from it). It uses a `userProfile` table — create it once:

```bash
DATABASE_URL="postgres://…" npm run db:push
```

…or paste `drizzle/0001_chubby_spiral.sql` into your DB's SQL editor. Until this
runs, the rest of the account works fine — saving an address just shows a
"not set up yet" message.

## 4c. (Optional) Real payments with Stripe

Checkout runs in **demo mode** (no charge) until Stripe is configured. To take
real card payments — Apple Pay and Google Pay included automatically:

1. Create a Stripe account → **Developers → API keys** → copy the **Secret key**.
2. Add env vars (locally in `.env.local`, and on Vercel):

   | Variable | What |
   | --- | --- |
   | `STRIPE_SECRET_KEY` | `sk_live_…` (or `sk_test_…` while testing) |
   | `STRIPE_WEBHOOK_SECRET` | `whsec_…` from step 3 |

3. **Add the webhook** so paid orders are confirmed: Stripe → **Developers →
   Webhooks → Add endpoint** → URL `https://YOUR_DOMAIN/api/stripe/webhook`,
   event **`checkout.session.completed`**. Copy the signing secret into
   `STRIPE_WEBHOOK_SECRET`.
4. Redeploy. Checkout now redirects to Stripe's hosted page; on success the
   buyer returns to the order-confirmed page and the order flips to **Confirmed**
   (via the webhook, re-verified on return).

> With only `STRIPE_SECRET_KEY` set, payments work but order confirmation relies
> on the success-page check; add the webhook for production-grade fulfilment.

**Apple Pay / Google Pay** appear automatically on Stripe's hosted checkout.
To offer **Klarna / Affirm / Afterpay** monthly payments (the storefront already
advertises them), switch them on once in Stripe → **Settings → Payment methods** —
no code change needed; Stripe shows them to eligible customers automatically.

## 4d. (Optional) Owner notifications & the back office

- Set `OWNER_NOTIFY_EMAIL` to get an email for every paid order, trade-in
  submission, bulk-quote request and wholesale application (falls back to
  `AUTH_EMAIL_FROM`).
- Set `ADMIN_EMAILS` (comma-separated) to grant those accounts the **/admin**
  back office: mark orders shipped (emails the buyer the real tracking number),
  advance trade-ins (Received → Inspected → Requoted → Paid, each emailing the
  seller), approve/reject wholesale applications, and triage bulk quotes.
  You can also flip `isAdmin` directly on a user row.

## 5. Deploy

On Vercel, set the env vars (step 2) **before** building, then deploy. Run the
migration (step 3) against the production database once.

---

### What's wired up

- **Sign up / sign in** — `/login` (email + password, bcrypt-hashed; Google when configured).
- **Email verification** — sign-up fires a confirmation link (Resend, or shown on-screen in demo mode). The account page nudges unconfirmed users with a "Resend" button; the link lands on `/verify?token=…`. Non-blocking — sign-in works either way, and Google accounts are pre-verified. Reuses the Auth.js `verificationToken` table (no extra migration).
- **Password reset** — "Forgot password?" → emailed (or demo) link → `/reset?token=…`.
- **Account** — `/account` (protected) shows DB-backed order history with status, a saved-address editor, and per-order **shipment tracking** at `/account/orders/[id]` (timeline + carrier/tracking #). Orders placed as a guest are claimed onto the account on sign-in (matched by email). Sessions last 30 days.
- **Checkout** — prefilled from your saved address; orders placed while signed in are saved to your account. **Payments** go through Stripe Checkout when configured (card + Apple/Google Pay), falling back to a demo checkout otherwise — see §4c.
- **Wholesale** — the trade-account application is tied to your signed-in account; approval is stored on your user record.

### Where it lives

- `src/lib/auth.ts` — Auth.js config (providers, Drizzle adapter, JWT session, callbacks)
- `src/lib/auth-actions.ts` — sign-up / sign-in / reset server actions
- `src/lib/db/schema.ts` — Drizzle schema · `src/lib/db/index.ts` — lazy DB client
- `src/app/api/auth/[...nextauth]/route.ts` — Auth.js route handler
- `src/app/login`, `src/app/reset`, `src/app/account` — auth pages
