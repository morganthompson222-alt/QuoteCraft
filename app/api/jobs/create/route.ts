import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sanitizeString, sanitizeOptionalString } from "@/lib/validation";
import { ApiError, errorResponse } from "@/lib/api-error";
import { enforcePlanLimit } from "@/lib/plan-enforcement";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Unauthorized");

    await enforcePlanLimit(user.id, "schedule_job");

    const body = await request.json();
    const quote_id = sanitizeOptionalString(body.quote_id);
    const customer_id = sanitizeOptionalString(body.customer_id);
    const customer_name = sanitizeOptionalString(body.customer_name) ?? "";
    const job_title = sanitizeString(body.job_title);
    const job_date = sanitizeString(body.job_date);
    const start_time = sanitizeString(body.start_time);
    const end_time = sanitizeOptionalString(body.end_time);
    const location = sanitizeOptionalString(body.location);
    const notes = sanitizeOptionalString(body.notes);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(job_date)) {
      throw new ApiError(400, "Date must be YYYY-MM-DD format", "VALIDATION_ERROR");
    }
    if (!/^\d{2}:\d{2}$/.test(start_time)) {
      throw new ApiError(400, "Start time must be HH:MM format", "VALIDATION_ERROR");
    }

    const { data, error } = await supabase
      .from("jobs")
      .insert({
        user_id: user.id,
        quote_id,
        customer_id,
        customer_name,
        job_title,
        job_date,
        start_time,
        end_time,
        location,
        notes,
      })
      .select()
      .single();

    if (error) throw new ApiError(400, error.message);

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
