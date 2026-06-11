import AuthForm from "@/components/AuthForm";
import Link from "next/link";

export default function CustomerSignup() {
  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <AuthForm
        mode="signup"
        role="customer"
        title="Create your account"
        subtitle="Book haircuts with the best barbers in town."
      />
      <p className="max-w-md text-center text-sm text-ink-400">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-500 hover:underline">
          Sign in
        </Link>
        . Running a shop?{" "}
        <Link href="/owner/signup" className="font-semibold text-brand-500 hover:underline">
          Open your shop on Clipper
        </Link>
        .
      </p>
    </div>
  );
}
