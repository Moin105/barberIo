import Link from "next/link";

export default function Logo({ light = false }) {
  return (
    <Link href="/" className="group flex items-center gap-2.5">
      <span className="relative grid h-9 w-9 place-items-center overflow-hidden rounded-md border border-ink-100 bg-paper-50 shadow-soft">
        <span className="absolute inset-y-0 left-0 w-1.5 barber-pole" />
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-ink-900" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="6" cy="6" r="3" />
          <circle cx="6" cy="18" r="3" />
          <path d="M8.12 8.12 12 12M20 4 8.12 15.88M14.8 14.8 20 20" />
        </svg>
      </span>
      <span className={`flex flex-col leading-tight ${light ? "text-paper-50" : "text-ink-900"}`}>
        <span className="display text-xl tracking-tight">Clipper</span>
        <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-brand-500">
          Est. 2026
        </span>
      </span>
    </Link>
  );
}
