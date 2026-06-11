import AuthForm from "@/components/AuthForm";
import Link from "next/link";

export default function CustomerLogin() {
  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <AuthForm mode="login" title="Welcome back" subtitle="Sign in to continue." />
      <p className="text-center text-sm text-ink-400">
        New here?{" "}
        <Link href="/signup" className="font-semibold text-brand-500 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
