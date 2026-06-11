# Clipper — Barber Shop CMS

A four-sided platform for barber businesses:

- **Super admin** — sees every business, every subscription, MRR, and platform-wide activity.
- **Owner CMS** — registers a business, adds shops, seats, services, and barbers (each with their own login). Sees daily totals per barber, per shop.
- **Barber app** — each barber logs in to see today's schedule with customer names, services and their seat number.
- **Customer app** — browse shops, see barbers with ratings, book a slot, rate the visit.

## Stack — one app, free everywhere

| Layer | Tech | Hosting |
|---|---|---|
| UI + Backend | **Next.js 14 (App Router)** | **Vercel** (Hobby tier — free) |
| Database | **Postgres** | **Neon** (Free tier — 500 MB) |
| Auth | bcrypt + JWT in httpOnly cookies | — |

Everything lives inside the Next.js app. API endpoints are Next.js Route Handlers, so there's **no separate server**, no CORS, and a single Vercel deploy hosts the whole thing.

## Project layout

```
barber/
├── app/                       Next.js App Router
│   ├── page.jsx               Themed landing page
│   ├── api/                   Server-side route handlers (the "backend")
│   │   ├── auth/              signup, login, logout, me
│   │   ├── owner/             shops, barbers, services, daily report
│   │   ├── admin/             stats, businesses, subscriptions, activity
│   │   ├── barber/            schedule, stats, mark booking done
│   │   ├── public/            shop & barber browse, availability slots
│   │   └── bookings/          customer book, cancel, rate
│   ├── admin/                 Super admin dashboard pages
│   ├── owner/                 Owner dashboard pages
│   ├── barber/                Barber dashboard pages
│   ├── shops/                 Customer shop browse
│   ├── barbers/[id]/          Customer barber detail + booking
│   └── my-bookings/           Customer booking history + ratings
├── components/                Client components
├── lib/
│   ├── db.js                  Postgres pool + first-boot migrations + super-admin bootstrap
│   ├── auth.js                bcrypt + JWT + cookie helpers (server-side)
│   ├── route.js               withAuth() / json() / err() wrappers for route handlers
│   ├── schema.sql             Database schema (idempotent — runs on every cold start)
│   └── services/              All business logic (called by route handlers AND server components)
│       ├── auth.js
│       ├── owner.js
│       ├── admin.js
│       ├── barber.js
│       ├── public.js
│       └── bookings.js
└── package.json
```

Server components import services directly (no HTTP hop). Client components fetch from `/api/*` over same-origin.

## Local setup

### 1) Get a free Postgres on Neon
1. Sign up at https://neon.tech (free tier — no card).
2. Create a project. Copy the **pooled connection string** (host ends with `-pooler`).

### 2) Run the app

```bash
cp .env.example .env.local
# Edit .env.local:
#   DATABASE_URL=<your neon pooled url>
#   JWT_SECRET=<openssl rand -hex 32>
#   SUPER_ADMIN_EMAIL=you@example.com
#   SUPER_ADMIN_PASSWORD=<strong password>

npm install
npm run dev                   # http://localhost:3000
```

On first request the app auto-creates the schema and your super-admin account. That's it — no separate backend to run.

## Deploy to Vercel (free, ~3 min)

1. https://vercel.com → New Project → import `Moin105/barberIo`.
2. Framework Preset: **Next.js** (auto-detected).
3. Root Directory: leave as `./`.
4. **Environment Variables** — add:

   | Key | Value |
   |---|---|
   | `DATABASE_URL` | Neon pooled URL |
   | `JWT_SECRET` | long random string |
   | `SUPER_ADMIN_EMAIL` | your email |
   | `SUPER_ADMIN_PASSWORD` | strong password |
   | `SUPER_ADMIN_NAME` | (optional) your name |

5. **Deploy**.

That's it. No second service. No Render. Free forever for hobby use.

## Try every role after deploy

1. **Super admin** → `/admin/login` with the email/password you put in env vars. See platform stats and manage every business's subscription.
2. **Owner** → click "Open your shop" on the landing → create account → add shop → add services → add barbers (assign each one an email + initial password so they can log in) → assign each barber a seat.
3. **Barber** → open a private window → `/barber/login` → use the email/password the owner set. See today's schedule with customer names + your seat.
4. **Customer** → another window → `/signup` → browse shops → pick a barber → book → after the appointment, rate it from `/my-bookings`.

## Subscription plans

Defined in [lib/services/admin.js](lib/services/admin.js):

| Plan | $/mo |
|---|---|
| free | 0 |
| starter | 19 |
| pro | 49 |
| enterprise | 199 |

Super admin can change a business's plan or status from `/admin/businesses`.

## Cost summary

| Service | Cost |
|---|---|
| Vercel (everything) | $0 |
| Neon (Postgres) | $0 |

Free for any hobby project. If you outgrow the free tiers, both have $5–$10/mo paid tiers.
