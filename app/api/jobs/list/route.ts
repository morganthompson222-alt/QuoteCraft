import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ApiError, errorResponse } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Unauthorized");

    const { searchParams } = request.nextUrl;
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");
    const statusFilter = searchParams.get("status");

    let query = supabase
      .from("jobs")
      .select("*")
      .eq("user_id", user.id)
      .order("job_date", { ascending: true })
      .order("start_time", { ascending: true });

    if (fromDate) query = query.gte("job_date", fromDate);
    if (toDate) query = query.lte("job_date", toDate);
    if (statusFilter) query = query.eq("status", statusFilter);

    const { data, error } = await query;

    if (error) throw new ApiError(400, error.message);

    const now = new Date();
    const upcoming = (data ?? []).filter(
      (j: { job_date: string; status: string }) =>
        new Date(j.job_date) >= now && j.status === "scheduled",
    );
    const past = (data ?? []).filter(
      (j: { job_date: string; status: string }) =>
        new Date(j.job_date) < now || j.status !== "scheduled",
    );

    return NextResponse.json({ jobs: data ?? [], upcoming, past });
  } catch (error) {
    return errorResponse(error);
  }
}
