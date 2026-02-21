import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="max-w-2xl text-center space-y-6">
        <h1 className="text-5xl font-bold tracking-tight">
          <span className="text-[var(--primary)]">PM</span>VIBE
        </h1>
        <p className="text-xl text-[var(--muted-foreground)]">
          Build real product intuition — not just frameworks.
        </p>
        <p className="text-[var(--muted-foreground)]">
          Daily product launches. Expert insights. Structured reflection prompts.
          Track your streak and develop the thinking muscle that sets great PMs apart.
        </p>
        <div className="flex gap-4 justify-center pt-4">
          <Link
            href="/signup"
            className="px-6 py-3 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] font-medium hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="px-6 py-3 rounded-lg border font-medium hover:bg-[var(--muted)] transition-colors"
          >
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}
