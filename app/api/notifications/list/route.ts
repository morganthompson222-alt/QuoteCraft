import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: { message: "Unauthorized", statusCode: 401 } }, { status: 401 });

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (error) {
      return NextResponse.json({ error: { message: error.message, statusCode: 400 } }, { status: 400 });
    }

    return NextResponse.json({
      notifications: data,
      unreadCount: data.filter((n: { read: boolean }) => !n.read).length,
    });
  } catch {
    return NextResponse.json({ notifications: [], unreadCount: 0 });
  }
}
