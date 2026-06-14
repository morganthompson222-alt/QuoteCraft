import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ApiError, errorResponse } from "@/lib/api-error";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createServerSupabaseClient(_request);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) throw new ApiError(401, "Unauthorized");

    const { id } = await params;

    const { data: customer, error } = await supabase
      .from("customers")
      .select("*")
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (error) throw new ApiError(404, "Customer not found");

    // Fetch quote history for this customer
    const { data: quotes } = await supabase
      .from("quotes")
      .select("id, quote_number, status, total, created_at")
      .eq("customer_id", id)
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    // Fetch jobs for this customer
    const { data: jobs } = await supabase
      .from("jobs")
      .select("id, job_title, status, job_date, start_time, end_time, location, quote_id")
      .eq("customer_id", id)
      .eq("user_id", user.id)
      .order("job_date", { ascending: false });

    return NextResponse.json({
      id: customer.id,
      email: customer.email,
      name: customer.name,
      phone: customer.phone,
      company: customer.company,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      zip: customer.zip,
      notes: customer.notes,
      createdAt: customer.created_at,
      quotes: (quotes ?? []).map((q: Record<string, unknown>) => ({
        id: q.id as string,
        quoteNumber: q.quote_number as string,
        status: q.status as string,
        total: Number(q.total),
        createdAt: q.created_at as string,
      })),
      jobs: (jobs ?? []).map((j: Record<string, unknown>) => ({
        id: j.id as string,
        jobTitle: j.job_title as string,
        status: j.status as string,
        jobDate: j.job_date as string,
        startTime: j.start_time as string,
        endTime: j.end_time as string,
        location: j.location as string | null,
        quoteId: j.quote_id as string | null,
      })),
    });
  } catch (error) {
    return errorResponse(error);
  }
}
