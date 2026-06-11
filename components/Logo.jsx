import Link from "next/link";

export default function Logo({ light = false }) {
  return (
    <Link href="/" className="group flex items-center gap-2">
      <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl shadow-soft">
        <span className="absolute inset-0 barber-pole opacity-80 group-hover:opacity-100 transition" />
        <span className="relative text-lg">✂️</span>
      </span>
      <span className={`text-lg font-extrabold tracking-tight ${light ? "text-white" : "text-ink-900"}`}>
        Clipper<span className="text-brand-500">.</span>
      </span>
    </Link>
  );
}
