import AuthForm from "@/components/AuthForm";
import Link from "next/link";

export default function OwnerLogin() {
  return (
    <div className="grid gap-4">
      <AuthForm
        mode="login"
        title="Owner sign in"
        subtitle="Pick up where you left off."
        redirectTo="/owner"
      />
      <p className="text-center text-sm text-slate-600">
        No account yet?{" "}
        <Link href="/owner/signup" className="text-brand-500 font-semibold">
          Register your business
        </Link>
      </p>
    </div>
  );
}
