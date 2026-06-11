import AuthForm from "@/components/AuthForm";
import Icon from "@/components/Icon";

export default function BarberLogin() {
  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="card bg-brand-gradient text-paper-50">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-paper-50/30 bg-paper-50/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-widest">
            <Icon name="chair" className="h-3.5 w-3.5" /> Barber
          </span>
          <h1 className="display mt-3 text-3xl">Your chair, on demand.</h1>
          <p className="mt-1 text-sm text-paper-50/85">
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
