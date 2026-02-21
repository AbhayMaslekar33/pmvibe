import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("reflections")
    .select("*, content_items(id, title, source, source_url)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content_item_id, body } = await request.json();
  if (!content_item_id || !body?.trim()) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("reflections")
    .upsert(
      { user_id: user.id, content_item_id, body: body.trim() },
      { onConflict: "user_id,content_item_id" }
    )
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Update daily activity and streak
  const todayUTC = new Date().toISOString().split("T")[0];
  await supabase.rpc("upsert_daily_activity", {
    p_user_id: user.id,
    p_date: todayUTC,
    p_reflection_delta: 1,
    p_opinion_delta: 0,
    p_read_delta: 0,
  });
  await supabase.rpc("recalculate_streak", { p_user_id: user.id });

  return NextResponse.json(data);
}
