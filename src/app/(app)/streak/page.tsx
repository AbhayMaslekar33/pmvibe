"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Flame, Calendar, TrendingUp } from "lucide-react";

interface StreakData {
  current_streak: number;
  longest_streak: number;
  last_active_date: string | null;
  total_days_active: number;
}

interface DayActivity {
  activity_date: string;
  reflections_written: number;
  opinions_answered: number;
}

export default function StreakPage() {
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [activity, setActivity] = useState<DayActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [streakRes, activityRes] = await Promise.all([
        supabase
          .from("user_streaks")
          .select("*")
          .eq("user_id", user.id)
          .single(),
        supabase
          .from("daily_activity")
          .select("activity_date, reflections_written, opinions_answered")
          .eq("user_id", user.id)
          .order("activity_date", { ascending: false })
          .limit(84),
      ]);

      if (streakRes.data) setStreak(streakRes.data);
      if (activityRes.data) setActivity(activityRes.data);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-40 rounded-xl bg-[var(--muted)] animate-pulse" />
        <div className="h-64 rounded-xl bg-[var(--muted)] animate-pulse" />
      </div>
    );
  }

  const activityMap = new Map(
    activity.map((d) => [d.activity_date, d])
  );

  // Build 84-day (12 weeks) calendar grid
  const days: { date: string; engaged: boolean; count: number }[] = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const act = activityMap.get(dateStr);
    const count = act
      ? act.reflections_written + act.opinions_answered
      : 0;
    days.push({ date: dateStr, engaged: count > 0, count });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Your Streak</h1>
        <p className="text-[var(--muted-foreground)] text-sm">
          Consistency is the compounding interest of PM skill.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border bg-[var(--card)] p-4 text-center">
          <Flame className="h-6 w-6 mx-auto mb-2 text-[var(--accent)]" />
          <p className="text-3xl font-bold">
            {streak?.current_streak ?? 0}
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">Current</p>
        </div>
        <div className="rounded-xl border bg-[var(--card)] p-4 text-center">
          <TrendingUp className="h-6 w-6 mx-auto mb-2 text-[var(--primary)]" />
          <p className="text-3xl font-bold">
            {streak?.longest_streak ?? 0}
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">Longest</p>
        </div>
        <div className="rounded-xl border bg-[var(--card)] p-4 text-center">
          <Calendar className="h-6 w-6 mx-auto mb-2 text-green-500" />
          <p className="text-3xl font-bold">
            {streak?.total_days_active ?? 0}
          </p>
          <p className="text-xs text-[var(--muted-foreground)]">Total Days</p>
        </div>
      </div>

      {/* Heatmap */}
      <div className="rounded-xl border bg-[var(--card)] p-6">
        <h2 className="font-semibold mb-4">Last 12 Weeks</h2>
        <div className="grid grid-cols-12 gap-1">
          {days.map((day) => (
            <div
              key={day.date}
              title={`${day.date}: ${day.count} actions`}
              className={`aspect-square rounded-sm ${
                day.count === 0
                  ? "bg-[var(--muted)]"
                  : day.count <= 2
                  ? "bg-[var(--primary)]/30"
                  : day.count <= 5
                  ? "bg-[var(--primary)]/60"
                  : "bg-[var(--primary)]"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center justify-end gap-1 mt-3 text-xs text-[var(--muted-foreground)]">
          <span>Less</span>
          <div className="w-3 h-3 rounded-sm bg-[var(--muted)]" />
          <div className="w-3 h-3 rounded-sm bg-[var(--primary)]/30" />
          <div className="w-3 h-3 rounded-sm bg-[var(--primary)]/60" />
          <div className="w-3 h-3 rounded-sm bg-[var(--primary)]" />
          <span>More</span>
        </div>
      </div>
    </div>
  );
}
