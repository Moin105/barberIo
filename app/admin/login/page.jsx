import AuthForm from "@/components/AuthForm";
import Link from "next/link";
import Icon from "@/components/Icon";

export default function AdminLogin() {
  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <div className="mx-auto w-full max-w-md">
        <div className="card bg-ink-gradient text-paper-50">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/40 bg-brand-500/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-widest text-brand-200">
            <Icon name="shield" className="h-3.5 w-3.5" /> Super admin
          </span>
          <h1 className="display mt-3 text-3xl">Admin console</h1>
          <p className="mt-1 text-sm text-paper-50/70">
            Manage subscriptions and businesses across the platform.
          </p>
        </div>
      </div>
      <AuthForm mode="login" title="Sign in to admin" redirectTo="/admin" />
      <p className="text-center text-xs text-ink-400">
        Not an admin?{" "}
        <Link href="/login" className="font-semibold text-brand-500 hover:underline">
          Customer sign in
        </Link>{" "}
        ·{" "}
        <Link href="/owner/login" className="font-semibold text-brand-500 hover:underline">
          Owner sign in
        </Link>
      </p>
    </div>
  );
}
