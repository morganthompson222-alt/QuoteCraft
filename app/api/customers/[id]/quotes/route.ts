import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ApiError, errorResponse } from "@/lib/api-error";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createServerSupabaseClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new ApiError(401, "Unauthorized");

    const { id } = await params;

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "10")));
    const status = searchParams.get("status");

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("quotes")
      .select("id, quote_number, status, total, created_at", { count: "exact" })
      .eq("customer_id", id)
      .eq("user_id", user.id);

    if (status) {
      query = query.eq("status", status);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw new ApiError(400, error.message);

    const quotes = (data ?? []).map((q: Record<string, unknown>) => ({
      id: q.id as string,
      quoteNumber: q.quote_number as string,
      status: q.status as string,
      total: Number(q.total),
      createdAt: q.created_at as string,
    }));

    return NextResponse.json({
      quotes,
      total: count ?? 0,
      page,
      limit,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
