"use client";

import { useState } from "react";

interface FeedItem {
  id: string;
  source: string;
  title: string;
  tagline: string | null;
  author: string | null;
  published_at: string;
  ai_summary: string | null;
}

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

const TABS = [
  { key: "all", label: "All" },
  { key: "product_hunt", label: "Product Hunt" },
  { key: "lenny", label: "Lenny" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function FeedTabs({ items }: { items: FeedItem[] }) {
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const filtered =
    activeTab === "all"
      ? items
      : items.filter((item) => item.source === activeTab);

  const counts = {
    all: items.length,
    product_hunt: items.filter((i) => i.source === "product_hunt").length,
    lenny: items.filter((i) => i.source === "lenny").length,
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-6 border-b border-[var(--border)] mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-2 text-sm font-medium cursor-pointer transition-colors ${
              activeTab === tab.key
                ? "text-[var(--primary)] border-b-2 border-[var(--primary)]"
                : "text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            }`}
          >
            {tab.label} ({counts[tab.key]})
          </button>
        ))}
      </div>

      {/* Item List */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 text-[var(--muted-foreground)]">
          <p className="text-sm">No items in this category.</p>
        </div>
      ) : (
        <div className="divide-y divide-[var(--border)]">
          {filtered.map((item, index) => (
            <a
              key={item.id}
              href={`/item/${item.id}`}
              className="flex items-start gap-3 px-3 py-3 border-l-2 border-l-transparent hover:border-l-[var(--primary)] hover:bg-[var(--muted)] transition-all duration-150 group"
            >
              <span className="text-sm text-[var(--muted-foreground)] font-medium mt-0.5 w-6 shrink-0 text-right">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded border ${
                      item.source === "product_hunt"
                        ? "bg-orange-50 text-orange-600 border-orange-200"
                        : "bg-teal-50 text-teal-600 border-teal-200"
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
