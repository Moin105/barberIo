import AuthForm from "@/components/AuthForm";
import Link from "next/link";

export default function OwnerSignup() {
  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <AuthForm
        mode="signup"
        role="owner"
        title="Open your shop on Clipper"
        subtitle="Add your barbers, set prices, start booking customers."
        redirectTo="/owner"
      />
      <p className="text-center text-sm text-ink-400">
        Already a shop owner?{" "}
        <Link href="/owner/login" className="font-semibold text-brand-500 hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
