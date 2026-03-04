import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const revalidate = 300; // 5 minutes

function timeAgo(date: string) {
  const seconds = Math.floor(
    (Date.now() - new Date(date).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  return `${days}d ago`;
}

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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Your Feed</h1>
          <p className="text-[var(--muted-foreground)] text-sm">
            Real products. Real decisions. Your turn to think.
          </p>
        </div>
      </div>

      {!user && (
        <div className="mb-6 rounded-lg border bg-[var(--secondary)] px-4 py-3 flex items-center justify-between">
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
        <div className="space-y-1">
          {items.map((item, index) => (
            <a
              key={item.id}
              href={`/item/${item.id}`}
              className="flex items-start gap-4 px-4 py-3 rounded-lg hover:bg-[var(--muted)] transition-colors group"
            >
              <span className="text-sm text-[var(--muted-foreground)] font-medium mt-0.5 w-6 shrink-0 text-right">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded ${
                      item.source === "product_hunt"
                        ? "bg-orange-100 text-orange-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
                    {item.source === "product_hunt" ? "PH" : "Lenny"}
                  </span>
                  <h2 className="font-semibold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors truncate">
                    {item.title}
                  </h2>
                </div>
                {(item.tagline || item.ai_summary) && (
                  <p className="text-sm text-[var(--muted-foreground)] line-clamp-1">
                    {item.tagline || item.ai_summary}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1 text-xs text-[var(--muted-foreground)]">
                  {item.author && !item.author.includes("[REDACTED]") && (
                    <>
                      <span>{item.author}</span>
                      <span>·</span>
                    </>
                  )}
                  <span>{timeAgo(item.published_at)}</span>
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
