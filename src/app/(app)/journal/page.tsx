"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Search } from "lucide-react";

interface JournalEntry {
  id: string;
  body: string;
  created_at: string;
  updated_at: string;
  content_items: {
    id: string;
    title: string;
    source: string;
    source_url: string;
  };
}

export default function JournalPage() {
  const [reflections, setReflections] = useState<JournalEntry[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("reflections")
        .select("*, content_items(id, title, source, source_url)")
        .order("created_at", { ascending: false });

      if (data) setReflections(data as unknown as JournalEntry[]);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = reflections.filter(
    (r) =>
      r.body.toLowerCase().includes(search.toLowerCase()) ||
      r.content_items.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Your Journal</h1>
        <p className="text-[var(--muted-foreground)] text-sm">
          All your reflections in one place.
        </p>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search reflections..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-32 rounded-xl bg-[var(--muted)] animate-pulse"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--muted-foreground)]">
          <p className="text-lg mb-2">
            {search ? "No reflections match your search" : "No reflections yet"}
          </p>
          <p className="text-sm">
            {search
              ? "Try a different search term."
              : "Go to the feed and start reflecting on products and articles."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((entry) => (
            <a
              key={entry.id}
              href={`/item/${entry.content_items.id}`}
              className="block rounded-xl border bg-[var(--card)] p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    entry.content_items.source === "product_hunt"
                      ? "bg-orange-100 text-orange-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {entry.content_items.source === "product_hunt"
                    ? "Product Hunt"
                    : "Lenny"}
                </span>
                <span className="text-xs text-[var(--muted-foreground)]">
                  {new Date(entry.created_at).toLocaleDateString()}
                </span>
              </div>
              <h3 className="font-medium mb-1">
                {entry.content_items.title}
              </h3>
              <p className="text-sm text-[var(--muted-foreground)] line-clamp-3">
                {entry.body}
              </p>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
