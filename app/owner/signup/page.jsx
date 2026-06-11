import AuthForm from "@/components/AuthForm";
import Link from "next/link";

export default function OwnerSignup() {
  return (
    <div className="grid gap-4">
      <AuthForm
        mode="signup"
        role="owner"
        title="Open your shop on Clipper"
        subtitle="Add your barbers, set prices, and start booking customers."
        redirectTo="/owner"
      />
      <p className="text-center text-sm text-slate-600">
        Already have a shop account?{" "}
        <Link href="/owner/login" className="text-brand-500 font-semibold">
          Sign in
        </Link>
      </p>
    </div>
  );
}
