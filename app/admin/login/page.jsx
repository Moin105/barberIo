import AuthForm from "@/components/AuthForm";
import Link from "next/link";

export default function AdminLogin() {
  return (
    <div className="grid gap-4">
      <div className="mx-auto max-w-md">
        <div className="card bg-ink-gradient text-white">
          <p className="pill-brand bg-brand-500/15 text-brand-100 border-brand-500/30 w-fit">
            🛡️ Super admin
          </p>
          <h1 className="mt-3 text-2xl font-extrabold">Admin console</h1>
          <p className="mt-1 text-sm text-white/70">
            Manage subscriptions and businesses across the platform.
          </p>
        </div>
      </div>
      <AuthForm mode="login" title="Sign in to admin" redirectTo="/admin" />
      <p className="text-center text-xs text-ink-400">
        Not an admin?{" "}
        <Link href="/login" className="text-brand-500 font-semibold">
          Customer sign in
        </Link>{" "}
        ·{" "}
        <Link href="/owner/login" className="text-brand-500 font-semibold">
          Owner sign in
        </Link>
      </p>
    </div>
  );
}
