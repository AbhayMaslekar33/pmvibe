"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const [displayName, setDisplayName] = useState("");
  const [pmLevel, setPmLevel] = useState("aspiring");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("user_profiles")
        .select("display_name, pm_experience_level")
        .eq("user_id", user.id)
        .single();

      if (data) {
        setDisplayName(data.display_name ?? "");
        setPmLevel(data.pm_experience_level ?? "aspiring");
      }
    }
    load();
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from("user_profiles")
      .update({
        display_name: displayName.trim() || null,
        pm_experience_level: pmLevel,
      })
      .eq("user_id", user.id);

    setSaving(false);
    setSaved(true);
  }

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Display Name
          </label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            PM Experience Level
          </label>
          <select
            value={pmLevel}
            onChange={(e) => setPmLevel(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          >
            <option value="aspiring">Aspiring PM</option>
            <option value="junior">Junior PM (0-2 yrs)</option>
            <option value="mid">Mid-level PM (2-5 yrs)</option>
            <option value="senior">Senior PM (5+ yrs)</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save"}
          </button>
          {saved && (
            <span className="text-sm text-[var(--primary)]">Saved</span>
          )}
        </div>
      </form>

      <hr className="my-8" />

      <button
        onClick={handleLogout}
        className="px-6 py-2 rounded-lg border text-[var(--destructive)] hover:bg-red-50/50 transition-colors font-medium"
      >
        Log Out
      </button>
    </div>
  );
}
