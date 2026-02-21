"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface OpinionPromptsProps {
  contentItemId: string;
  prompts: string[];
  userId?: string;
}

interface SavedResponse {
  prompt_index: number;
  response_body: string;
}

export function OpinionPrompts({
  contentItemId,
  prompts,
  userId,
}: OpinionPromptsProps) {
  const [responses, setResponses] = useState<Record<number, string>>({});
  const [savedPrompts, setSavedPrompts] = useState<Set<number>>(new Set());
  const [savingIndex, setSavingIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!userId) return;

    async function loadExisting() {
      const supabase = createClient();
      const { data } = await supabase
        .from("opinion_responses")
        .select("prompt_index, response_body")
        .eq("content_item_id", contentItemId)
        .eq("user_id", userId!);

      if (data) {
        const loaded: Record<number, string> = {};
        const saved = new Set<number>();
        (data as SavedResponse[]).forEach((r) => {
          loaded[r.prompt_index] = r.response_body;
          saved.add(r.prompt_index);
        });
        setResponses(loaded);
        setSavedPrompts(saved);
      }
    }

    loadExisting();
  }, [contentItemId, userId]);

  async function handleSave(promptIndex: number, promptText: string) {
    if (!userId) return;
    const body = responses[promptIndex]?.trim();
    if (!body) return;

    setSavingIndex(promptIndex);

    const res = await fetch("/api/opinions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content_item_id: contentItemId,
        prompt_index: promptIndex,
        prompt_text: promptText,
        response_body: body,
      }),
    });

    if (res.ok) {
      setSavedPrompts((prev) => new Set([...prev, promptIndex]));
    }
    setSavingIndex(null);
  }

  const answeredCount = savedPrompts.size;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 rounded-full bg-[var(--muted)] overflow-hidden">
          <div
            className="h-full bg-[var(--primary)] rounded-full transition-all"
            style={{
              width: `${(answeredCount / prompts.length) * 100}%`,
            }}
          />
        </div>
        <span className="text-sm text-[var(--muted-foreground)] whitespace-nowrap">
          {answeredCount}/{prompts.length}
        </span>
      </div>

      {prompts.map((prompt, index) => (
        <div key={index} className="space-y-2">
          <p className="text-sm font-medium">{prompt}</p>
          <textarea
            value={responses[index] ?? ""}
            onChange={(e) =>
              setResponses((prev) => ({ ...prev, [index]: e.target.value }))
            }
            placeholder="Write your answer..."
            rows={3}
            className="w-full px-3 py-2 rounded-lg border bg-[var(--background)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          <div className="flex justify-end">
            <button
              onClick={() => handleSave(index, prompt)}
              disabled={
                savingIndex === index ||
                !responses[index]?.trim()
              }
              className="px-4 py-1.5 text-sm rounded-lg bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {savingIndex === index
                ? "Saving..."
                : savedPrompts.has(index)
                ? "Update"
                : "Save"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
