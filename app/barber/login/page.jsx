import AuthForm from "@/components/AuthForm";
import Link from "next/link";

export default function BarberLogin() {
  return (
    <div className="grid gap-4">
      <div className="mx-auto max-w-md">
        <div className="card bg-brand-gradient text-white">
          <p className="pill bg-white/15 text-white border-white/30 w-fit">💈 Barber</p>
          <h1 className="mt-3 text-2xl font-extrabold">Your chair, on demand.</h1>
          <p className="mt-1 text-sm text-white/85">
            See today's bookings, customer names and your seat number — all in one place.
          </p>
        </div>
      </div>
      <AuthForm mode="login" title="Barber sign in" redirectTo="/barber" />
      <p className="text-center text-xs text-ink-400">
        No login yet? Ask your shop owner to invite you from their dashboard.
      </p>
    </div>
  );
}
