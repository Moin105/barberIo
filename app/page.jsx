import Link from "next/link";
import Icon from "@/components/Icon";
import { listActivePromotions } from "@/lib/services/promotions";

export const dynamic = "force-dynamic";

const THREE_COL = "w-full sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]";
const FOUR_COL = "w-full sm:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-3rem)/4)]";

export default async function Home() {
  const deals = await listActivePromotions(6);
  return (
    <div className="flex w-full flex-col gap-24">
      <Hero />
      <SocialProof />
      <Deals deals={deals} />
      <Features />
      <RoleGrid />
      <HowItWorks />
      <Testimonials />
      <CTA />
    </div>
  );
}

function Deals({ deals }) {
  if (!deals || deals.length === 0) return null;
  return (
    <section className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="eyebrow inline-flex items-center gap-2">
            <Icon name="megaphone" className="h-3.5 w-3.5" />
            Now on
          </span>
          <h2 className="display mt-2 text-4xl text-ink-900 sm:text-5xl">Today's deals.</h2>
          <p className="text-sm text-ink-400">
            Promotions running right now at shops on Clipper.
          </p>
        </div>
        <Link href="/shops" className="btn-ghost">
          Browse all shops <Icon name="arrow" className="h-4 w-4" />
        </Link>
      </div>
      <div className="flex flex-wrap gap-4">
        {deals.map((d) => (
          <DealCard key={d.id} d={d} />
        ))}
      </div>
    </section>
  );
}

function DealCard({ d }) {
  const cta = d.cta_href ? (
    <Link
      href={d.cta_href}
      className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 hover:underline"
    >
      {d.cta_label || "See offer"} <Icon name="arrow" className="h-4 w-4" />
    </Link>
  ) : null;
  return (
    <article className="card card-hover relative flex w-full flex-col gap-3 overflow-hidden md:w-[calc((100%-1rem)/2)] lg:w-[calc((100%-2rem)/3)]">
      <span className="pointer-events-none absolute inset-y-0 left-0 w-1 barber-pole" />
      <div className="flex items-start gap-3 pl-3">
        {d.image_url ? (
          <img
            src={d.image_url}
            alt=""
            className="h-14 w-14 shrink-0 rounded-md object-cover"
          />
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md bg-brand-50 text-brand-700">
            <Icon name="tag" className="h-6 w-6" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="display text-lg leading-snug text-ink-900">{d.title}</p>
          <p className="mt-0.5 text-[11px] uppercase tracking-widest text-brand-600">
            {d.business_name}
          </p>
        </div>
      </div>
      <p className="pl-3 text-sm text-ink-700">{d.body}</p>
      {(cta || d.ends_at) && (
        <div className="flex items-center justify-between pl-3 pt-1">
          {cta}
          {d.ends_at && (
            <span className="text-[11px] uppercase tracking-widest text-ink-400">
              Ends {new Date(d.ends_at).toLocaleDateString()}
            </span>
          )}
        </div>
      )}
    </article>
  );
}

function Hero() {
  return (
    <section className="relative -mt-2 isolate overflow-hidden rounded-2xl bg-ink-gradient text-paper-50 shadow-soft">
      <div className="pointer-events-none absolute inset-0 bg-damask-gold opacity-25" />
      <div className="pointer-events-none absolute inset-0 bg-grid bg-[length:42px_42px] opacity-10" />
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full opacity-25 blur-3xl"
        style={{ background: "radial-gradient(closest-side,#cea24a,transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -left-32 -bottom-32 h-[24rem] w-[24rem] rounded-full opacity-15 blur-3xl"
        style={{ background: "radial-gradient(closest-side,#ff6a00,transparent 70%)" }}
      />
      <div className="pointer-events-none absolute right-10 top-10 hidden h-44 w-2 rotate-12 rounded-full barber-pole shadow-soft lg:block" />

      <div className="relative px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
        <div className="rule-gold rule-dark">
          <Crest />
        </div>

        <div className="mt-10 flex w-full flex-col gap-12 lg:flex-row lg:items-center lg:gap-14">
          <div className="flex w-full flex-col gap-6 animate-fade-up lg:flex-1 lg:basis-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.42em] text-brass-400 sm:text-[11px]">
              By Appointment <span className="mx-2 text-brass-400/50">·</span> Est. 2026
            </p>
            <h1 className="display text-5xl leading-[0.98] text-paper-50 sm:text-6xl xl:text-7xl">
              The Chair. <br />
              The Till. <br />
              <span className="display-italic text-shimmer-gold">The Whole Shop.</span>
            </h1>
            <div className="rule-gold rule-dark max-w-sm">
              <Icon name="scissors" className="h-4 w-4 text-brass-400" />
            </div>
            <p className="max-w-xl text-base text-paper-100/85 sm:text-lg">
              Clipper is the all-in-one cabinet for barber shop owners — manage shops, seats,
              barbers and bookings in one place. Every barber gets their own login to see who's
              sitting in their chair today.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/owner/signup" className="btn-primary px-5 py-3 text-base">
                <Icon name="store" className="h-4 w-4" /> Open your shop
              </Link>
              <Link href="/shops" className="btn-outline px-5 py-3 text-base">
                <Icon name="scissors" className="h-4 w-4" /> Find a barber
              </Link>
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-paper-100/70">
              <span className="inline-flex items-center gap-2">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                Free forever for small shops
              </span>
              <span className="text-paper-100/40">·</span>
              <span>No card required</span>
            </div>
          </div>

          <div className="relative flex w-full items-center justify-center lg:flex-1 lg:basis-0">
            <FloatingDashboard />
          </div>
        </div>

        <div className="rule-gold rule-dark mt-12">
          <Crest />
        </div>
      </div>
    </section>
  );
}

function Crest() {
  return (
    <span className="inline-flex items-center gap-1.5 text-brass-400">
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="12" r="2" />
      </svg>
      <svg viewBox="0 0 36 36" className="h-5 w-5" fill="currentColor" aria-hidden="true">
        <path d="M18 3 L20.2 14.4 L31 16 L20.2 17.6 L18 29 L15.8 17.6 L5 16 L15.8 14.4 Z" />
      </svg>
      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor" aria-hidden="true">
        <circle cx="12" cy="12" r="2" />
      </svg>
    </span>
  );
}

function FloatingDashboard() {
  return (
    <div className="relative mx-auto w-full max-w-md px-4 sm:px-0">
      <figure className="relative animate-fade-up overflow-hidden rounded-xl border border-paper-50/15 shadow-soft">
        {/* Replace with /public/hero.jpg or your own URL when ready. */}
        <img
          src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=900&q=80"
          alt="A master barber at work in a classic shop"
          className="h-80 w-full object-cover sm:h-96"
          loading="eager"
        />
        {/* Brass gradient + grain so the image fuses into the ink hero */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-900/55 via-ink-900/10 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
          <div className="rule-gold rule-dark">
            <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-brass-400">
              Downtown Cuts · Est. 2026
            </span>
          </div>
        </div>
      </figure>

      <div className="absolute right-2 -top-3 hidden rotate-6 sm:block">
        <div className="card w-40 p-3 text-xs">
          <p className="flex items-center gap-1 font-bold text-ink-900">
            <Icon name="star" className="h-3.5 w-3.5 text-brass-500" filled /> 4.9
          </p>
          <p className="text-ink-400">"Best fade in town." — 312 reviews</p>
        </div>
      </div>
      <div className="absolute -left-2 bottom-6 hidden -rotate-6 sm:block">
        <div className="card w-44 p-3 text-xs">
          <p className="flex items-center gap-1 font-bold text-emerald-700">
            <Icon name="plus" className="h-3.5 w-3.5" /> $48.00
          </p>
          <p className="text-ink-400">Beard trim · Marco</p>
        </div>
      </div>
    </div>
  );
}

function SocialProof() {
  const logos = ["Barber Co.", "Sharp Cuts", "Fade Lab", "The Pole", "Knight Shave", "Goldline"];
  return (
    <section className="-mt-12">
      <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-ink-400">
        Trusted by shops across the country
      </p>
      <div className="marquee mt-4 overflow-hidden">
        <div className="flex items-center justify-center gap-10 text-lg text-ink-200">
          {logos.concat(logos).map((l, i) => (
            <span key={i} className="display whitespace-nowrap tracking-tight">
              {l}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features() {
  const items = [
    { icon: "store", t: "Multi-shop CMS", d: "Every shop has its own barbers, seats, hours and services. One owner, many locations." },
    { icon: "chair", t: "Seat-level scheduling", d: "Each barber sits at their chair. Bookings auto-route by seat — no double-booking, ever." },
    { icon: "wallet", t: "End-of-day totals", d: "Per-barber, per-shop revenue updates the moment the last appointment closes." },
    { icon: "scissors", t: "Per-barber pricing", d: "Senior barbers charge senior rates. Override the base price for any service." },
    { icon: "lock", t: "Barber logins", d: "Every barber gets their own profile. They see who's in their chair next, all day." },
    { icon: "star", t: "Customer ratings", d: "Verified reviews unlock only after a real visit. Build a reputation that compounds." },
  ];
  return (
    <section className="flex flex-col gap-10">
      <div className="text-center">
        <span className="eyebrow mx-auto">Built for the chair, the till and the front desk</span>
        <h2 className="display mt-3 text-4xl text-ink-900 sm:text-5xl">
          Everything a shop owner actually needs.
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-ink-400">
          Forget five different apps. Clipper handles bookings, payments, staff and reporting —
          and looks good doing it.
        </p>
      </div>
      <div className="flex flex-wrap gap-4">
        {items.map((it) => (
          <div key={it.t} className={`card card-hover group ${THREE_COL}`}>
            <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700 transition group-hover:scale-105">
              <Icon name={it.icon} className="h-5 w-5" />
            </div>
            <h3 className="mt-4 display text-xl text-ink-900">{it.t}</h3>
            <p className="mt-1.5 text-sm text-ink-400">{it.d}</p>
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
      bg: "bg-brand-gradient text-paper-50",
      tag: "OWNER",
      icon: "store",
      title: "Run your business",
      body: "Add shops, seats and barbers. Set fees. See today's earnings, every day.",
      cta: "Open my shop",
    },
    {
      href: "/shops",
      bg: "bg-paper-50 border border-ink-100",
      tag: "CUSTOMER",
      icon: "scissors",
      title: "Book a chair",
      body: "Find the best barber near you. Pick a slot. Walk in, walk out fresh.",
      cta: "Browse shops",
      dark: true,
    },
    {
      href: "/barber/login",
      bg: "bg-ink-gradient text-paper-50",
      tag: "BARBER",
      icon: "chair",
      title: "Own your chair",
      body: "See every appointment in your day. Know the customer name before they sit down.",
      cta: "Barber sign in",
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
          <div className="flex items-center gap-3">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-md ${
                r.dark ? "bg-brand-50 text-brand-700" : "bg-paper-50/15 text-paper-50"
              }`}
            >
              <Icon name={r.icon} className="h-5 w-5" />
            </span>
            <p className={`text-[11px] font-bold tracking-widest ${r.dark ? "text-brand-500" : "text-paper-50/70"}`}>
              {r.tag}
            </p>
          </div>
          <h3 className={`mt-4 display text-2xl ${r.dark ? "text-ink-900" : ""}`}>
            {r.title}
          </h3>
          <p className={`mt-2 text-sm ${r.dark ? "text-ink-400" : "text-paper-50/80"}`}>{r.body}</p>
          <p className={`mt-6 inline-flex items-center gap-1 text-sm font-semibold ${r.dark ? "text-brand-500" : "text-paper-50"}`}>
            {r.cta} <Icon name="arrow" className="h-4 w-4" />
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
    <section className="flex flex-col gap-10">
      <div className="text-center">
        <span className="eyebrow mx-auto">How it works</span>
        <h2 className="display mt-3 text-4xl text-ink-900 sm:text-5xl">
          Open shop in under ten minutes.
        </h2>
      </div>
      <div className="relative flex flex-wrap gap-4">
        <div className="pointer-events-none absolute left-0 right-0 top-10 hidden h-px bg-gradient-to-r from-transparent via-ink-100 to-transparent lg:block" />
        {steps.map((s) => (
          <div key={s.n} className={`relative card card-hover ${FOUR_COL}`}>
            <div className="display flex h-10 w-10 items-center justify-center rounded-md bg-ink-gradient text-sm text-paper-50">
              {s.n}
            </div>
            <h3 className="mt-3 display text-lg text-ink-900">{s.t}</h3>
            <p className="mt-1.5 text-sm text-ink-400">{s.d}</p>
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
    <section className="flex flex-col gap-8">
      <h2 className="display mx-auto max-w-2xl text-center text-3xl text-ink-900 sm:text-4xl">
        From shops that swapped five apps for one.
      </h2>
      <div className="flex flex-wrap gap-4">
        {quotes.map((c) => (
          <div key={c.a} className={`card card-hover ${THREE_COL}`}>
            <div className="flex gap-0.5 text-brass-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Icon key={i} name="star" className="h-4 w-4" filled />
              ))}
            </div>
            <p className="mt-3 text-sm text-ink-700">"{c.q}"</p>
            <div className="mt-4 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-700">
                <Icon name="user" className="h-4 w-4" />
              </span>
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
    <section className="relative overflow-hidden rounded-2xl bg-brand-gradient px-8 py-16 text-center text-paper-50">
      <div className="pointer-events-none absolute inset-0 bg-grid bg-[length:32px_32px] opacity-15" />
      <div className="pointer-events-none absolute -left-12 -top-12 h-44 w-2.5 rotate-12 rounded-full barber-pole opacity-90" />
      <div className="pointer-events-none absolute -right-12 -bottom-12 h-44 w-2.5 -rotate-12 rounded-full barber-pole opacity-90" />
      <div className="relative flex flex-col items-center gap-6">
        <h2 className="display text-4xl sm:text-5xl">
          Your chair. Your shop. <br /> Your software.
        </h2>
        <p className="mx-auto max-w-xl text-paper-50/85">
          Spin up your shop on Clipper in minutes. Free for one location, forever.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/owner/signup" className="btn-dark px-5 py-3 text-base">
            Start your free shop
          </Link>
          <Link href="/shops" className="btn-outline px-5 py-3 text-base">
            See live shops
          </Link>
        </div>
      </div>
    </section>
  );
}
