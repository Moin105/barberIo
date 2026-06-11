import AuthForm from "@/components/AuthForm";
import Link from "next/link";

export default function OwnerLogin() {
  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <AuthForm
        mode="login"
        title="Owner sign in"
        subtitle="Pick up where you left off."
        redirectTo="/owner"
      />
      <p className="text-center text-sm text-ink-400">
        No account yet?{" "}
        <Link href="/owner/signup" className="font-semibold text-brand-500 hover:underline">
          Register your business
        </Link>
      </p>
    </div>
  );
}
