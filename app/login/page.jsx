import AuthForm from "@/components/AuthForm";
import Link from "next/link";

export default function CustomerLogin() {
  return (
    <div className="grid gap-4">
      <AuthForm mode="login" title="Welcome back" subtitle="Sign in to continue." />
      <p className="text-center text-sm text-slate-600">
        New here?{" "}
        <Link href="/signup" className="text-brand-500 font-semibold">
          Create an account
        </Link>
      </p>
    </div>
  );
}
