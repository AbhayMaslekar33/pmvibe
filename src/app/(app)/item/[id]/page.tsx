import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { OpinionPrompts } from "@/components/item/OpinionPrompts";
import { ReflectionEditor } from "@/components/item/ReflectionEditor";

const FALLBACK_PROMPTS: Record<string, string[]> = {
  product_hunt: [
    "What problem is this product solving, and is it a real pain point or a nice-to-have?",
    "Who is the primary user persona, and how well does this product serve them?",
    "What would prevent a larger company from shipping this feature and killing this product?",
    "If you were the PM, what would your north star metric be on day 1?",
    "What concerns you most about this launch?",
  ],
  lenny: [
    "Do you agree with the author's main argument? What evidence supports or challenges it?",
    "How does this advice apply to a product you use or a company you admire?",
    "What's the strongest counter-argument to the article's main point?",
    "What stage of company is this advice for? How would you adapt it for a different stage?",
    "What one takeaway would you remember for a future PM interview?",
  ],
};

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: item } = await supabase
    .from("content_items")
    .select("*")
    .eq("id", id)
    .single();

  if (!item) {
    notFound();
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const prompts: string[] =
    (item.ai_opinion_prompts as string[] | null) ??
    FALLBACK_PROMPTS[item.source] ??
    FALLBACK_PROMPTS.product_hunt;

  const insights: string[] =
    (item.ai_key_insights as string[] | null) ?? [];

  return (
    <div className="max-w-3xl space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-3">
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
            <span className="text-sm text-[var(--muted-foreground)]">
              by {item.author}
            </span>
          )}
        </div>
        <h1 className="text-3xl font-bold mb-2">{item.title}</h1>
        {item.tagline && (
          <p className="text-lg text-[var(--muted-foreground)]">
            {item.tagline}
          </p>
        )}
        <a
          href={item.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm text-[var(--primary)] hover:underline mt-2"
        >
          View original <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* AI Summary */}
      {item.ai_summary && (
        <section className="rounded-xl border bg-[var(--card)] p-6">
          <h2 className="font-semibold mb-3">AI Summary</h2>
          <p className="text-[var(--muted-foreground)] leading-relaxed">
            {item.ai_summary}
          </p>
          {insights.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-medium">Key Insights</h3>
              <ul className="space-y-1">
                {insights.map((insight, i) => (
                  <li
                    key={i}
                    className="text-sm text-[var(--muted-foreground)] flex gap-2"
                  >
                    <span className="text-[var(--primary)] mt-0.5">-</span>
                    {insight}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {/* Opinion Prompts */}
      <section className="rounded-xl border bg-[var(--card)] p-6">
        <h2 className="font-semibold mb-1">Think Like a PM</h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          Answer these prompts to build your product judgment.
        </p>
        <OpinionPrompts
          contentItemId={item.id}
          prompts={prompts}
          userId={user?.id}
        />
      </section>

      {/* Reflection Journal */}
      <section className="rounded-xl border bg-[var(--card)] p-6">
        <h2 className="font-semibold mb-1">Your Reflection</h2>
        <p className="text-sm text-[var(--muted-foreground)] mb-4">
          What would you have done differently? What stands out?
        </p>
        <ReflectionEditor contentItemId={item.id} userId={user?.id} />
      </section>
    </div>
  );
}
