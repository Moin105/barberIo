const PATHS = {
  scissors: (
    <>
      <circle cx="6" cy="6" r="3" />
      <path d="M8.12 8.12 12 12" />
      <path d="M20 4 8.12 15.88" />
      <circle cx="6" cy="18" r="3" />
      <path d="M14.8 14.8 20 20" />
    </>
  ),
  chair: (
    <>
      <path d="M6 3h12a1 1 0 0 1 1 1v8H5V4a1 1 0 0 1 1-1Z" />
      <path d="M4 12h16v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z" />
      <path d="M7 16v5M17 16v5" />
    </>
  ),
  pole: (
    <>
      <rect x="9" y="3" width="6" height="18" rx="3" />
      <path d="M9 7h6M9 11h6M9 15h6" />
    </>
  ),
  store: (
    <>
      <path d="m3 8 2.5-4h13L21 8" />
      <path d="M3 8h18" />
      <path d="M5 8v12h14V8" />
      <path d="M9 20v-6h6v6" />
    </>
  ),
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M8 2v4M16 2v4M3 10h18" />
    </>
  ),
  wallet: (
    <>
      <path d="M3 7v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2H5a2 2 0 0 1 0-4h13" />
      <path d="M17 13h2" />
    </>
  ),
  lock: (
    <>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  star: (
    <path d="M12 2.5l2.9 6 6.6.95-4.78 4.66 1.13 6.57L12 17.6 6.15 20.68l1.13-6.57L2.5 9.45 9.1 8.5z" />
  ),
  shield: (
    <path d="M12 2 4 5v7c0 5 3.5 8 8 10 4.5-2 8-5 8-10V5z" />
  ),
  bolt: (
    <path d="M13 2 4 14h6l-1 8 9-12h-6z" />
  ),
  home: (
    <>
      <path d="M3 11 12 3l9 8" />
      <path d="M5 10v10h14V10" />
      <path d="M10 20v-6h4v6" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c1.5-4.5 5-6 8-6s6.5 1.5 8 6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2 21c1.2-3.5 4-5 7-5s5.8 1.5 7 5" />
      <path d="M16 11a3 3 0 1 0 0-6" />
      <path d="M22 21c-.6-2.6-2.3-4.2-4.6-4.8" />
    </>
  ),
  check: <path d="m5 12 5 5 9-12" />,
  x: <path d="m6 6 12 12M6 18 18 6" />,
  plus: <path d="M12 5v14M5 12h14" />,
  arrow: <path d="M5 12h14M13 5l7 7-7 7" />,
  spark: (
    <path d="M12 3v5M12 16v5M3 12h5M16 12h5M5 5l3.5 3.5M15.5 15.5 19 19M19 5l-3.5 3.5M8.5 15.5 5 19" />
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  phone: (
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.86 19.86 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.86 19.86 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.79a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.89.34 1.83.57 2.79.7A2 2 0 0 1 22 16.92Z" />
  ),
  trash: (
    <>
      <path d="M3 6h18" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </>
  ),
  edit: (
    <>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4z" />
    </>
  ),
  bookmark: <path d="M19 21 12 16l-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />,
  trend: (
    <>
      <path d="M3 17 9 11l4 4 8-8" />
      <path d="M14 7h7v7" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  comb: (
    <>
      <rect x="3" y="4" width="18" height="4" rx="1" />
      <path d="M6 8v6M9 8v8M12 8v6M15 8v8M18 8v6" />
    </>
  ),
  razor: (
    <>
      <path d="M3 10h12l2 4H5z" />
      <path d="M15 10V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
    </>
  ),
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  external: (
    <>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
    </>
  ),
};

export default function Icon({
  name,
  className = "h-5 w-5",
  strokeWidth = 1.6,
  filled = false,
}) {
  const path = PATHS[name];
  if (!path) return null;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {path}
    </svg>
  );
}
