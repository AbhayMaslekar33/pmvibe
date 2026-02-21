"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface ReflectionEditorProps {
  contentItemId: string;
  userId?: string;
}

export function ReflectionEditor({
  contentItemId,
  userId,
}: ReflectionEditorProps) {
  const [body, setBody] = useState("");
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!userId) return;

    async function loadExisting() {
      const supabase = createClient();
      const { data } = await supabase
        .from("reflections")
        .select("body")
        .eq("content_item_id", contentItemId)
        .eq("user_id", userId!)
        .single();

      if (data) {
        setBody(data.body);
        setSaved(true);
      }
    }

    loadExisting();
  }, [contentItemId, userId]);

  const save = useCallback(
    async (text: string) => {
      if (!userId || !text.trim()) return;
      setSaving(true);

      const res = await fetch("/api/reflections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content_item_id: contentItemId,
          body: text.trim(),
        }),
      });

      if (res.ok) {
        setSaved(true);
      }
      setSaving(false);
    },
    [contentItemId, userId]
  );

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value;
    setBody(value);
    setSaved(false);

    // Debounce autosave: 3 seconds
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      save(value);
    }, 3000);
  }

  function handleBlur() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (body.trim() && !saved) {
      save(body);
    }
  }

  if (!userId) {
    return (
      <p className="text-sm text-[var(--muted-foreground)]">
        Log in to write reflections.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <textarea
        value={body}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="What stands out about this product/article? What would you do differently as the PM? What trade-offs do you see?"
        rows={6}
        className="w-full px-3 py-2 rounded-lg border bg-[var(--background)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
      />
      <div className="flex justify-end">
        <span className="text-xs text-[var(--muted-foreground)]">
          {saving ? "Saving..." : saved ? "Saved" : "Autosaves after 3s"}
        </span>
      </div>
    </div>
  );
}
