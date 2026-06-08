import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sanitizeString, sanitizeOptionalString } from "@/lib/validation";
import { ApiError, errorResponse } from "@/lib/api-error";

const validTransitions: Record<string, string[]> = {
  draft: ["sent", "expired"],
  sent: ["accepted", "rejected", "expired"],
  accepted: [],
  rejected: [],
  expired: [],
};

const validStatuses = ["draft", "sent", "accepted", "rejected", "expired"];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createServerSupabaseClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Unauthorized");

    const { id } = await params;
    const body = await request.json();

    const update: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.status !== undefined) {
      const newStatus = sanitizeString(body.status);
      if (!validStatuses.includes(newStatus)) {
        throw new ApiError(400, `Invalid status. Must be one of: ${validStatuses.join(", ")}`);
      }

      const { data: quote, error: fetchError } = await supabase
        .from("quotes")
        .select("status, customer_id, quote_number")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (fetchError) throw new ApiError(404, "Quote not found");

      const allowed = validTransitions[quote.status];
      if (!allowed.includes(newStatus)) {
        throw new ApiError(
          400,
          `Cannot transition from "${quote.status}" to "${newStatus}". Allowed: ${allowed.join(", ") || "none"}`,
        );
      }

      update.status = newStatus;

      // Auto-create job when quote is accepted and job_date is set
      if (newStatus === "accepted" && body.job_date) {
        const jobDate = sanitizeString(body.job_date);
        if (!/^\d{4}-\d{2}-\d{2}$/.test(jobDate)) {
          throw new ApiError(400, "Date must be YYYY-MM-DD format", "VALIDATION_ERROR");
        }

        const startTime = body.start_time ? sanitizeString(body.start_time) : "09:00";
        if (!/^\d{2}:\d{2}$/.test(startTime)) {
          throw new ApiError(400, "Start time must be HH:MM format", "VALIDATION_ERROR");
        }

        const endTime = body.end_time ? sanitizeOptionalString(body.end_time) : null;

        const { data: customer } = await supabase
          .from("customers")
          .select("name")
          .eq("id", quote.customer_id)
          .single();

        const { error: jobError } = await supabase
          .from("jobs")
          .insert({
            user_id: user.id,
            quote_id: id,
            customer_id: quote.customer_id,
            customer_name: customer?.name ?? "",
            job_title: `Quote #${quote.quote_number}`,
            job_date: jobDate,
            start_time: startTime,
            end_time: endTime,
          })
          .select()
          .single();

        if (jobError && !jobError.message.includes("does not exist")) {
          throw new ApiError(400, jobError.message);
        }

        // Store date/time on quote for reference
        update.job_date = jobDate;
        update.start_time = startTime;
        if (endTime) update.end_time = endTime;
      }
    }

    if (body.paid !== undefined) {
      update.paid = Boolean(body.paid);
      update.paid_at = Boolean(body.paid) ? new Date().toISOString() : null;
    }

    if (body.archived !== undefined) {
      update.archived = Boolean(body.archived);
    }

    // Allow updating job_date/start_time/end_time directly
    if (body.job_date !== undefined && body.status !== "accepted") {
      const d = sanitizeString(body.job_date);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
        throw new ApiError(400, "Date must be YYYY-MM-DD", "VALIDATION_ERROR");
      }
      update.job_date = d;
    }
    if (body.start_time !== undefined && body.status !== "accepted") {
      const t = sanitizeString(body.start_time);
      if (!/^\d{2}:\d{2}$/.test(t)) {
        throw new ApiError(400, "Start time must be HH:MM", "VALIDATION_ERROR");
      }
      update.start_time = t;
    }
    if (body.end_time !== undefined && body.status !== "accepted") {
      update.end_time = sanitizeOptionalString(body.end_time);
    }

    if (Object.keys(update).length <= 1) {
      throw new ApiError(400, "No fields to update", "VALIDATION_ERROR");
    }

    const { data, error } = await supabase
      .from("quotes")
      .update(update)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw new ApiError(400, error.message);

    return NextResponse.json({
      id: data.id,
      status: data.status,
      paid: data.paid,
      paidAt: data.paid_at,
      quoteNumber: data.quote_number,
      jobDate: data.job_date ?? null,
      startTime: data.start_time ?? null,
      endTime: data.end_time ?? null,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
