import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { FeedTabs } from "@/components/feed/FeedTabs";

export const revalidate = 300; // 5 minutes

export default async function FeedPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: items } = await supabase
    .from("content_items")
    .select(
      "id, source, title, tagline, author, published_at, ai_summary"
    )
    .neq("title", "")
    .order("published_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">Your Feed</h1>
          <p className="text-[var(--muted-foreground)] text-sm">
            Real products. Real decisions. Your turn to think.
          </p>
        </div>
      </div>

      {!user && (
        <div className="mb-6 rounded-lg border shadow-sm bg-[var(--secondary)] px-4 py-3 flex items-center justify-between">
          <p className="text-sm text-[var(--secondary-foreground)]">
            Sign up to save reflections, answer opinion prompts, and track your streak.
          </p>
          <Link
            href="/signup"
            className="ml-4 shrink-0 px-4 py-1.5 text-sm rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity"
          >
            Sign Up
          </Link>
        </div>
      )}

      {!items || items.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <p className="text-lg mb-2">No items yet today</p>
          <p className="text-sm">
            Content gets ingested daily via n8n. Check back after the next
            scheduled run.
          </p>
        </div>
      ) : (
        <FeedTabs items={items} />
      )}
    </div>
  );
}
