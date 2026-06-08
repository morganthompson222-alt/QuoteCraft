import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ApiError, errorResponse } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Unauthorized");

    const { searchParams } = request.nextUrl;
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const category = searchParams.get("category");

    let query = supabase.from("expenses").select("*").eq("user_id", user.id).order("expense_date", { ascending: false });

    if (from) query = query.gte("expense_date", from);
    if (to) query = query.lte("expense_date", to);
    if (category) query = query.eq("category", category);

    const { data, error } = await query;
    if (error) throw new ApiError(400, error.message);

    return NextResponse.json({ expenses: data ?? [], total: data?.reduce((s: number, d: any) => s + (d.amount ?? 0), 0) ?? 0 });
  } catch (error) {
    return errorResponse(error);
  }
}
