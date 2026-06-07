import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ApiError, errorResponse } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new ApiError(401, "Unauthorized");

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") ?? "10")));
    const search = searchParams.get("search") ?? "";

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from("customers")
      .select("id, email, name, phone, company, created_at", { count: "exact" })
      .eq("user_id", user.id);

    if (search) {
      query = query.or(
        `name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`,
      );
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw new ApiError(400, error.message);

    const customers = data.map((c) => ({
      id: c.id,
      email: c.email,
      name: c.name,
      phone: c.phone,
      company: c.company,
      totalQuotes: 0,
      createdAt: c.created_at,
    }));

    return NextResponse.json({
      customers,
      total: count ?? 0,
      page,
      limit,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
