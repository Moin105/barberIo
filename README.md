# Clipper — Barber Shop CMS

A four-sided platform for barber businesses:

- **Super admin** — sees every business, every subscription, MRR, and platform-wide activity.
- **Owner CMS** — registers a business, adds shops, seats, services, and barbers (each with their own login). Sees daily totals per barber, per shop.
- **Barber app** — each barber logs in to see today's schedule with customer names, services and their seat number.
- **Customer app** — browse shops, see barbers with ratings, book a slot, rate the visit.

## Stack (all free tiers)

| Layer | Tech | Hosting |
|---|---|---|
| Frontend | Next.js 14 (App Router) + Tailwind | Vercel |
| Backend | Node.js + Express | Render |
| Database | Postgres | Neon |
| Auth | bcrypt + JWT in httpOnly cookies | — |

The Next.js app proxies `/api/*` to Express so cookies stay same-origin in the browser. No CORS pain.

## Project layout

```
barber/
├── app/                 Next.js pages (App Router)
│   ├── page.jsx         Landing page
│   ├── admin/           Super admin (subscriptions, businesses, activity)
│   ├── owner/           Owner dashboard (shops, services, daily totals)
│   ├── barber/          Barber dashboard (today's schedule + seat info)
│   ├── shops/           Customer shop browse
│   ├── barbers/[id]/    Customer booking page
│   └── my-bookings/     Customer booking history + ratings
├── components/          Client components
├── lib/api.js           Server-side fetch helper (cookie forwarding)
├── server/              Express API
│   ├── schema.sql       Postgres schema (users, businesses, shops, barbers,
│   │                    services, bookings, ratings, subscriptions)
│   └── src/
│       ├── bootstrap.js Creates super admin from env vars on first boot
│       └── routes/
│           ├── auth.js  signup/login/logout/me
│           ├── owner.js shops, barbers (creates user accounts), services, reports
│           ├── public.js shop/barber browse + availability slots
│           ├── bookings.js customer book/cancel/rate
│           ├── barber.js barber's own schedule + stats
│           └── admin.js super admin: stats, businesses, subscriptions
└── package.json         Next.js deps only
```

## Local setup

### 1) Get a free Postgres on Neon
1. Sign up at https://neon.tech (free tier — no card).
2. Create a project, copy the **pooled connection string**.

### 2) Run the backend

```bash
cd server
cp .env.example .env
# Edit .env:
#   DATABASE_URL=<your neon url>
#   JWT_SECRET=<openssl rand -hex 32>
#   SUPER_ADMIN_EMAIL=you@example.com
#   SUPER_ADMIN_PASSWORD=<a strong password>
npm install
npm run dev                # http://localhost:4000
```

The first boot creates a super admin user from your env vars and seeds the schema.

### 3) Run the frontend

```bash
cp .env.example .env.local
npm install
npm run dev                # http://localhost:3000
```

Open http://localhost:3000.

## Try every role

1. **Super admin** → sign in at `/admin/login` with the email/password you put in `server/.env`. Land on the platform overview (owners, customers, barbers, MRR). Visit `/admin/businesses` to change any owner's plan (`free` / `starter` / `pro` / `enterprise`) or status.

2. **Owner** → click "Open your shop on Clipper" on the landing page → create an account. Auto-lands on `/owner` with a free subscription. Add a shop → add services → add barbers (give each one an email + initial password so they can log in). Assign each barber a seat.

3. **Barber** → open a private window → `/barber/login` → sign in with the email/password the owner set. Land on `/barber` with today's schedule, seat number, and customer names. Mark bookings done as the day goes.

4. **Customer** → open another private window → `/signup` → browse shops → pick a barber → book a slot. Visit completes → leave a rating from `/my-bookings`.

## Deploying free

### Database — Neon (free forever)
Same `DATABASE_URL` you used locally works in production.

### Backend — Render (free web service)
1. Push the repo to GitHub.
2. https://render.com → New → Web Service → connect repo.
3. **Root directory:** `server`
4. **Build:** `npm install`
5. **Start:** `npm start`
6. Environment variables:
   - `DATABASE_URL` — your Neon string
   - `JWT_SECRET` — long random string
   - `CLIENT_ORIGIN` — your Vercel URL (e.g. `https://clipper.vercel.app`)
   - `SUPER_ADMIN_EMAIL`, `SUPER_ADMIN_PASSWORD`, `SUPER_ADMIN_NAME`
   - `NODE_ENV=production`

Render's free tier sleeps after 15 min idle; the first request wakes it in a few seconds.

### Frontend — Vercel (free)
1. https://vercel.com → New Project → import the repo.
2. **Root directory:** the repo root.
3. Environment variable:
   - `API_URL` — your Render URL (e.g. `https://clipper-api.onrender.com`)
4. Deploy.

## Subscription plans

Default prices (defined in `server/src/routes/admin.js`):

| Plan | $/mo |
|---|---|
| free | 0 |
| starter | 19 |
| pro | 49 |
| enterprise | 199 |

Super admin can change a business's plan or status (`active` / `past_due` / `cancelled`) from `/admin/businesses`.

## Cost summary

| Service | Cost | Notes |
|---|---|---|
| Vercel (frontend) | $0 | Hobby tier |
| Render (backend) | $0 | Spins down after 15 min idle |
| Neon (Postgres) | $0 | 500 MB storage |

Free for any hobby project. If you outgrow the free tiers, each service has a $5–$10/mo paid tier.
