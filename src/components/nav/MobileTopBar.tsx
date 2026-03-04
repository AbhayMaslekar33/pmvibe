"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Target, User, LogIn } from "lucide-react";

interface ChallengeItem {
  id: string;
  title: string;
  tagline: string | null;
  ai_summary: string | null;
}

export function MobileTopBar() {
  const [user, setUser] = useState<unknown>(undefined);
  const [challenge, setChallenge] = useState<ChallengeItem | null>(null);

  useEffect(() => {
    const supabase = createClient();

    Promise.all([
      supabase.auth.getUser(),
      supabase
        .from("content_items")
        .select("id, title, tagline, ai_summary")
        .neq("title", "")
        .order("published_at", { ascending: false })
        .limit(1)
        .single(),
    ]).then(([authRes, itemRes]) => {
      setUser(authRes.data.user);
      if (itemRes.data) setChallenge(itemRes.data);
    });
  }, []);

  return (
    <div className="md:hidden">
      {/* Top row: logo + auth */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
        <Link href="/feed" className="text-xl font-bold tracking-tight">
          <span className="text-[var(--primary)]">PM</span>VIBE
        </Link>
        {user ? (
          <Link
            href="/settings"
            className="p-2 rounded-full hover:bg-[var(--muted)] transition-colors"
          >
            <User className="h-5 w-5 text-[var(--muted-foreground)]" />
          </Link>
        ) : (
          <Link
            href="/login"
            className="flex items-center gap-1 text-sm font-medium text-[var(--primary)]"
          >
            <LogIn className="h-4 w-4" />
            Log In
          </Link>
        )}
      </div>

      {/* Daily challenge */}
      {challenge && (
        <div className="mx-4 mt-3">
          <Link
            href={`/item/${challenge.id}`}
            className="flex items-center gap-3 rounded-lg border bg-[var(--secondary)] px-4 py-3"
          >
            <Target className="h-5 w-5 shrink-0 text-[var(--primary)]" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                Today: {challenge.title}
              </p>
              {(challenge.tagline || challenge.ai_summary) && (
                <p className="text-xs text-[var(--muted-foreground)] truncate">
                  {challenge.tagline || challenge.ai_summary}
                </p>
              )}
            </div>
            <span className="shrink-0 text-xs font-medium text-[var(--primary)]">
              Start &gt;
            </span>
          </Link>
        </div>
      )}
    </div>
  );
}
