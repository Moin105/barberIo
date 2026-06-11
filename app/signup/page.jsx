import AuthForm from "@/components/AuthForm";
import Link from "next/link";

export default function CustomerSignup() {
  return (
    <div className="grid gap-4">
      <AuthForm
        mode="signup"
        role="customer"
        title="Create your account"
        subtitle="Book haircuts with the best barbers near you."
      />
      <p className="text-center text-sm text-slate-600">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-500 font-semibold">
          Sign in
        </Link>
        . Are you a shop owner?{" "}
        <Link href="/owner/signup" className="text-brand-500 font-semibold">
          Sign up here
        </Link>
        .
      </p>
    </div>
  );
}
