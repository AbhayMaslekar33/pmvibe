import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { type } = await request.json();
  const todayUTC = new Date().toISOString().split("T")[0];

  await supabase.rpc("upsert_daily_activity", {
    p_user_id: user.id,
    p_date: todayUTC,
    p_reflection_delta: 0,
    p_opinion_delta: 0,
    p_read_delta: type === "read" ? 1 : 0,
  });

  return NextResponse.json({ ok: true });
}
