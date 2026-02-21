import Link from "next/link";

export default function ConfirmPage() {
  return (
    <div className="bg-[var(--card)] rounded-xl p-8 shadow-sm border text-center">
      <h1 className="text-2xl font-bold mb-2">Email Confirmed</h1>
      <p className="text-[var(--muted-foreground)] mb-6">
        Your account is active. You can now log in.
      </p>
      <Link
        href="/login"
        className="px-6 py-2.5 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] font-medium hover:opacity-90 transition-opacity"
      >
        Go to Login
      </Link>
    </div>
  );
}
