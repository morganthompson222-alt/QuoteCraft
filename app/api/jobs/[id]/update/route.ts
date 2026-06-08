import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sanitizeString, sanitizeOptionalString } from "@/lib/validation";
import { ApiError, errorResponse } from "@/lib/api-error";

export async function PATCH(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const supabase = await createServerSupabaseClient(_request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Unauthorized");

    const { id } = await params;
    const body = await _request.json();

    const update: Record<string, unknown> = {};

    if (body.job_title !== undefined) update.job_title = sanitizeString(body.job_title);
    if (body.customer_name !== undefined) update.customer_name = sanitizeOptionalString(body.customer_name);
    if (body.customer_id !== undefined) update.customer_id = sanitizeOptionalString(body.customer_id);
    if (body.quote_id !== undefined) update.quote_id = sanitizeOptionalString(body.quote_id);
    if (body.location !== undefined) update.location = sanitizeOptionalString(body.location);
    if (body.notes !== undefined) update.notes = sanitizeOptionalString(body.notes);
    if (body.end_time !== undefined) update.end_time = sanitizeOptionalString(body.end_time);

    if (body.job_date !== undefined) {
      const d = sanitizeString(body.job_date);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) {
        throw new ApiError(400, "Date must be YYYY-MM-DD", "VALIDATION_ERROR");
      }
      update.job_date = d;
    }

    if (body.start_time !== undefined) {
      const t = sanitizeString(body.start_time);
      if (!/^\d{2}:\d{2}$/.test(t)) {
        throw new ApiError(400, "Start time must be HH:MM", "VALIDATION_ERROR");
      }
      update.start_time = t;
    }

    let statusChanged = false;
    if (body.status !== undefined) {
      const s = sanitizeString(body.status);
      if (!["scheduled", "in_progress", "completed", "cancelled"].includes(s)) {
        throw new ApiError(400, "Invalid status. Allowed: scheduled, in_progress, completed, cancelled", "VALIDATION_ERROR");
      }
      update.status = s;
      statusChanged = true;
      if (s === "completed") {
        update.completed_at = new Date().toISOString();
      }
    }

    if (Object.keys(update).length === 0) {
      throw new ApiError(400, "No fields to update", "VALIDATION_ERROR");
    }

    update.updated_at = new Date().toISOString();

    // Get current job before update (for sync logic)
    if (body.status === "completed" || body.quote_id !== undefined) {
      const { data: existing } = await supabase
        .from("jobs")
        .select("quote_id, status")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (existing) {
        const quoteId = body.quote_id ?? existing.quote_id;

        // Sync: when job marked completed, update linked quote to accepted
        if (body.status === "completed" && existing.status !== "completed" && quoteId) {
          await supabase
            .from("quotes")
            .update({ status: "accepted", updated_at: new Date().toISOString() })
            .eq("id", quoteId)
            .eq("user_id", user.id);
        }

        // Store quote_id in update if not already set
        if (body.quote_id !== undefined && !body.quote_id) {
          update.quote_id = null;
        }
      }
    }

    const { data, error } = await supabase
      .from("jobs")
      .update(update)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) throw new ApiError(400, error.message);
    return NextResponse.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}
