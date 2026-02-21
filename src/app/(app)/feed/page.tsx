import { createClient } from "@/lib/supabase/server";

export default async function FeedPage() {
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("content_items")
    .select(
      "id, source, title, tagline, thumbnail_url, author, published_at, ai_summary"
    )
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

      {!items || items.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <p className="text-lg mb-2">No items yet today</p>
          <p className="text-sm">
            Content gets ingested daily via n8n. Check back after the next
            scheduled run.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <a
              key={item.id}
              href={`/item/${item.id}`}
              className="block rounded-xl border bg-[var(--card)] p-4 hover:shadow-md transition-shadow"
            >
              {item.thumbnail_url && (
                <div className="aspect-video rounded-lg overflow-hidden mb-3 bg-[var(--muted)]">
                  <img
                    src={item.thumbnail_url}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    item.source === "product_hunt"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {item.source === "product_hunt" ? "Product Hunt" : "Lenny"}
                </span>
                {item.author && (
                  <span className="text-xs text-[var(--muted-foreground)]">
                    {item.author}
                  </span>
                )}
              </div>
              <h2 className="font-semibold mb-1 line-clamp-2">{item.title}</h2>
              {item.tagline && (
                <p className="text-sm text-[var(--muted-foreground)] line-clamp-2">
                  {item.tagline}
                </p>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
