import Link from "next/link";

// Tailwind helpers reused across the page.
const THREE_COL = "w-full sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]";
const FOUR_COL = "w-full sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]";

export default function Home() {
  return (
    <div className="flex w-full max-w-full flex-col gap-20">
      <Hero />
      <SocialProof />
      <Features />
      <RoleGrid />
      <HowItWorks />
      <Pricing />
      <Testimonials />
      <CTA />
    </div>
  );
}

function Hero() {
  return (
    <section className="relative -mt-2 isolate w-full max-w-full overflow-hidden rounded-3xl bg-ink-gradient text-white">
      <div className="pointer-events-none absolute inset-0 bg-grid bg-[length:36px_36px] opacity-30" />
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(closest-side,#ef2b2b,transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full opacity-20 blur-3xl"
        style={{ background: "radial-gradient(closest-side,#f5c662,transparent 70%)" }}
      />
      <div className="pointer-events-none absolute right-10 top-10 hidden h-40 w-3 rotate-12 rounded-full barber-pole shadow-glow lg:block" />

      <div className="relative flex w-full flex-col gap-10 px-6 py-14 sm:px-8 lg:flex-row lg:items-center lg:gap-8 lg:px-14 lg:py-20">
        <div className="flex w-full flex-col justify-center gap-6 animate-fade-up lg:flex-1 lg:basis-0">
          <span className="pill-brand w-fit border-brand-500/30 bg-brand-500/10 text-brand-100">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400" /> New · multi-shop CMS
          </span>
          <h1 className="text-4xl font-extrabold leading-[1.05] tracking-tight break-words sm:text-5xl xl:text-6xl">
            Run your barber empire <br />
            <span className="bg-gradient-to-r from-brand-400 via-brand-300 to-gold-400 bg-clip-text text-transparent">
              from a single chair.
            </span>
          </h1>
          <p className="max-w-xl text-lg text-ink-100/85">
            Clipper is the all-in-one CMS for barber shop owners. Manage shops, seats,
            barbers and bookings — and give every barber their own login to see who's
            sitting in their chair today.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/owner/signup" className="btn-primary text-base px-5 py-3">
              🪑 Open your shop on Clipper
            </Link>
            <Link href="/shops" className="btn-outline text-base px-5 py-3">
              ✂️ I just want a haircut
            </Link>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-6 text-xs text-ink-100/70">
            <span className="flex items-center gap-2">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" /> Free forever for small shops
            </span>
            <span>No card required</span>
          </div>
        </div>

        <div className="relative flex w-full items-center justify-center lg:flex-1 lg:basis-0">
          <FloatingDashboard />
        </div>
      </div>
    </section>
  );
}

function FloatingDashboard() {
  return (
    <div className="relative mx-auto w-full max-w-md px-4 sm:px-0">
      <div className="card-dark animate-fade-up p-5">
        <div className="flex items-center justify-between text-xs text-white/70">
          <span>Today · Downtown Cuts</span>
          <span className="pill-brand border-brand-500/30 bg-brand-500/10 text-brand-100">
            LIVE
          </span>
        </div>
        <p className="mt-3 text-3xl font-extrabold">
          $1,284<span className="text-base font-medium text-white/60"> earned today</span>
        </p>
        <div className="mt-4 flex gap-2 text-center text-xs">
          {[
            { label: "Marco · Seat 1", v: "$412", c: "bg-emerald-400/20" },
            { label: "Luca · Seat 2", v: "$398", c: "bg-amber-400/20" },
            { label: "Dre · Seat 3", v: "$474", c: "bg-brand-500/20" },
          ].map((s) => (
            <div key={s.label} className={`${s.c} flex-1 rounded-lg p-2.5`}>
              <p className="truncate text-white/80">{s.label}</p>
              <p className="text-base font-bold">{s.v}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {[
            { t: "10:30", c: "Jordan A.", s: "Skin fade", b: "Marco" },
            { t: "11:00", c: "Sam P.", s: "Beard line-up", b: "Luca" },
            { t: "11:30", c: "Riley T.", s: "Kid's cut", b: "Dre" },
          ].map((b) => (
            <div
              key={b.t}
              className="flex items-center gap-3 rounded-lg bg-white/5 px-3 py-2 text-xs"
            >
              <span className="font-bold text-white">{b.t}</span>
              <span className="flex-1 truncate text-white/85">
                {b.c} <span className="text-white/50">·</span> {b.s}
              </span>
              <span className="text-white/60">{b.b}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="absolute right-2 -top-3 hidden rotate-6 sm:block">
        <div className="card w-40 p-3 text-xs">
          <p className="font-bold text-ink-900">⭐ 4.9</p>
          <p className="text-ink-400">"Best fade in town." — 312 reviews</p>
        </div>
      </div>
      <div className="absolute -left-2 bottom-6 hidden -rotate-6 sm:block">
        <div className="card w-40 p-3 text-xs">
          <p className="font-bold text-emerald-600">+ $48.00</p>
          <p className="text-ink-400">Beard trim · Marco</p>
        </div>
      </div>
    </div>
  );
}

function SocialProof() {
  const logos = ["Barber Co.", "Sharp Cuts", "Fade Lab", "The Pole", "Knight Shave", "Goldline"];
  return (
    <section className="-mt-8">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-ink-400">
        Trusted by shops across the country
      </p>
      <div className="marquee mt-4 overflow-hidden">
        <div className="flex items-center justify-center gap-10 text-lg font-bold text-ink-200">
          {logos.concat(logos).map((l, i) => (
            <span key={i} className="whitespace-nowrap">
              💈 {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { e: "🏪", t: "Multi-shop CMS", d: "Every shop has its own barbers, seats, hours and services. One owner, many locations." },
    { e: "🪑", t: "Seat-level scheduling", d: "Each barber sits at their chair. Bookings auto-route by seat — no double-booking, ever." },
    { e: "💰", t: "End-of-day totals", d: "Per-barber, per-shop revenue updates the moment the last appointment closes." },
    { e: "💈", t: "Per-barber pricing", d: "Senior barbers charge senior rates. Override the base price for any service." },
    { e: "🔐", t: "Barber logins", d: "Every barber gets their own profile. They see who's in their chair next, all day." },
    { e: "⭐", t: "Customer ratings", d: "Verified reviews unlock only after a real visit. Build a reputation that compounds." },
  ];
  return (
    <section className="flex flex-col gap-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">
          Built for the chair, the till and the front desk
        </p>
        <h2 className="mt-2 text-4xl font-extrabold tracking-tight text-ink-900">
          Everything a shop owner actually needs.
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-ink-400">
          Forget five different apps. Clipper handles bookings, payments, staff and reporting — and
          looks good doing it.
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        {items.map((it) => (
          <div key={it.t} className={`card card-hover group ${THREE_COL}`}>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-2xl transition group-hover:scale-110">
              {it.e}
            </div>
            <h3 className="mt-3 font-bold text-ink-900">{it.t}</h3>
            <p className="mt-1 text-sm text-ink-400">{it.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function RoleGrid() {
  const roles = [
    {
      href: "/owner/signup",
      bg: "bg-brand-gradient text-white",
      tag: "OWNER",
      title: "Run your business",
      body: "Add shops, seats and barbers. Set fees. See today's earnings, every day.",
      cta: "Open my shop →",
    },
    {
      href: "/shops",
      bg: "bg-white border border-ink-100",
      tag: "CUSTOMER",
      title: "Book a chair",
      body: "Find the best barber near you. Pick a slot. Walk in, walk out fresh.",
      cta: "Browse shops →",
      dark: true,
    },
    {
      href: "/barber/login",
      bg: "bg-ink-gradient text-white",
      tag: "BARBER",
      title: "Own your chair",
      body: "See every appointment in your day. Know the customer name before they sit down.",
      cta: "Barber sign in →",
    },
  ];
  return (
    <section className="flex flex-wrap gap-4">
      {roles.map((r) => (
        <Link
          key={r.href}
          href={r.href}
          className={`group block rounded-2xl ${r.bg} p-7 shadow-soft transition hover:-translate-y-1 ${THREE_COL}`}
        >
          <p className={`text-xs font-bold tracking-widest ${r.dark ? "text-brand-500" : "text-white/70"}`}>
            {r.tag}
          </p>
          <h3 className={`mt-2 text-2xl font-extrabold ${r.dark ? "text-ink-900" : ""}`}>
            {r.title}
          </h3>
          <p className={`mt-2 text-sm ${r.dark ? "text-ink-400" : "text-white/80"}`}>{r.body}</p>
          <p className={`mt-6 font-semibold ${r.dark ? "text-brand-500" : "text-white"}`}>
            {r.cta}
          </p>
        </Link>
      ))}
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Sign up your business", d: "Create your owner account. We set up your business profile and free plan instantly." },
    { n: "02", t: "Add shops & barbers", d: "List your locations, mark seat numbers and invite each barber with their own login." },
    { n: "03", t: "Set services & prices", d: "Define your service menu once. Each barber can override the price on their profile." },
    { n: "04", t: "Customers book online", d: "Your shops show up on Clipper's marketplace. Booked slots flow straight to barbers." },
  ];
  return (
    <section className="flex flex-col gap-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">How it works</p>
        <h2 className="mt-2 text-4xl font-extrabold tracking-tight">Open shop in under 10 minutes.</h2>
      </div>
      <div className="relative flex flex-wrap gap-4">
        <div className="absolute left-0 right-0 top-9 hidden h-px bg-gradient-to-r from-transparent via-ink-100 to-transparent lg:block" />
        {steps.map((s) => (
          <div key={s.n} className={`relative card card-hover ${FOUR_COL}`}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-ink-gradient text-xs font-bold text-white">
              {s.n}
            </div>
            <h3 className="mt-3 font-bold">{s.t}</h3>
            <p className="mt-1 text-sm text-ink-400">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function Pricing() {
  const tiers = [
    {
      name: "Free",
      price: 0,
      tagline: "For one chair, just getting started.",
      perks: ["1 shop", "Up to 2 barbers", "Unlimited bookings", "Customer ratings"],
      cta: "Start free",
      href: "/owner/signup",
    },
    {
      name: "Pro",
      price: 49,
      tagline: "For real shops with real chairs.",
      perks: ["Unlimited shops & barbers", "Seat-level scheduling", "Per-barber pricing", "Daily revenue reports"],
      cta: "Go Pro",
      href: "/owner/signup",
      featured: true,
    },
    {
      name: "Enterprise",
      price: 199,
      tagline: "Franchises, chains, multi-city.",
      perks: ["Everything in Pro", "Custom branding", "API access", "Priority support"],
      cta: "Talk to sales",
      href: "/owner/signup",
    },
  ];
  return (
    <section className="flex flex-col gap-8">
      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-500">Pricing</p>
        <h2 className="mt-2 text-4xl font-extrabold tracking-tight">Pay only when you grow.</h2>
        <p className="mt-2 text-ink-400">Start on Free. Upgrade the day you book your 100th customer.</p>
      </div>
      <div className="flex flex-wrap gap-4">
        {tiers.map((t) => (
          <div
            key={t.name}
            className={`relative flex flex-col gap-4 rounded-2xl p-7 shadow-soft transition hover:-translate-y-1 ${THREE_COL}
              ${t.featured ? "bg-ink-gradient text-white" : "card"}`}
          >
            {t.featured && (
              <span className="absolute right-5 top-5 pill bg-brand-500 text-white border-brand-600">
                ⭐ Most popular
              </span>
            )}
            <div>
              <p className={`text-xs font-bold uppercase tracking-widest ${t.featured ? "text-brand-400" : "text-ink-400"}`}>
                {t.name}
              </p>
              <p className={`mt-1 ${t.featured ? "text-white/80" : "text-ink-400"} text-sm`}>{t.tagline}</p>
            </div>
            <div className="flex items-end gap-1">
              <span className="text-5xl font-extrabold">${t.price}</span>
              <span className={`${t.featured ? "text-white/70" : "text-ink-400"} mb-1.5 text-sm`}>/ month</span>
            </div>
            <ul className="flex flex-col gap-2 text-sm">
              {t.perks.map((p) => (
                <li key={p} className="flex items-start gap-2">
                  <span className={t.featured ? "text-brand-400" : "text-brand-500"}>✓</span>
                  {p}
                </li>
              ))}
            </ul>
            <Link
              href={t.href}
              className={t.featured ? "btn-primary justify-center" : "btn-dark justify-center"}
            >
              {t.cta}
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}

function Testimonials() {
  const quotes = [
    { q: "Set up two locations in one afternoon. My barbers love seeing their day-by-day take.", a: "Marco Rossi", r: "Owner · Downtown Cuts (3 shops)" },
    { q: "First app that actually gets how seat assignments work. Customers walk in and I already know.", a: "Dre Walker", r: "Master barber · Seat 3" },
    { q: "Booked solid for two weeks the day after we listed. The ratings page does real marketing.", a: "Sam Patel", r: "Owner · Sharp Cuts" },
  ];
  return (
    <section className="flex flex-col gap-6">
      <h2 className="text-center text-3xl font-extrabold tracking-tight">
        From shops that swapped 5 apps for one.
      </h2>
      <div className="flex flex-wrap gap-4">
        {quotes.map((c) => (
          <div key={c.a} className={`card card-hover ${THREE_COL}`}>
            <p className="text-amber-400 text-sm">★★★★★</p>
            <p className="mt-2 text-sm text-ink-700">"{c.q}"</p>
            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-base">
                💈
              </div>
              <div className="text-xs">
                <p className="font-bold">{c.a}</p>
                <p className="text-ink-400">{c.r}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-brand-gradient px-8 py-16 text-center text-white">
      <div className="pointer-events-none absolute inset-0 bg-grid bg-[length:32px_32px] opacity-20" />
      <div className="relative flex flex-col items-center gap-5">
        <h2 className="text-4xl font-extrabold tracking-tight md:text-5xl">
          Your chair. Your shop. Your software.
        </h2>
        <p className="mx-auto max-w-xl text-white/80">
          Spin up your shop on Clipper in minutes. Free for one location, forever.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/owner/signup" className="btn-dark text-base px-5 py-3">
            Start your free shop
          </Link>
          <Link href="/shops" className="btn-outline text-base px-5 py-3">
            See live shops
          </Link>
        </div>
      </div>
    </section>
  );
}
