import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sanitizeArray, sanitizeString, sanitizeOptionalString } from "@/lib/validation";
import { ApiError, errorResponse } from "@/lib/api-error";

const VALID_ACTIONS = ["archive", "unarchive", "set_status"] as const;
const VALID_STATUSES = ["draft", "sent", "accepted", "rejected", "expired"];

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Unauthorized");

    const body = await request.json();
    const action = sanitizeString(body.action);
    const ids = sanitizeArray(body.ids ?? [], (v: unknown) => sanitizeString(v), 1, 100);

    if (!VALID_ACTIONS.includes(action as typeof VALID_ACTIONS[number])) {
      throw new ApiError(400, `Invalid action. Use: ${VALID_ACTIONS.join(", ")}`);
    }

    let update: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (action === "archive") {
      update.archived = true;
    } else if (action === "unarchive") {
      update.archived = false;
    } else if (action === "set_status") {
      const newStatus = sanitizeOptionalString(body.status);
      if (!newStatus || !VALID_STATUSES.includes(newStatus)) {
        throw new ApiError(400, `Invalid status. Use: ${VALID_STATUSES.join(", ")}`);
      }
      update.status = newStatus;
      if (newStatus === "accepted") update.archived = false;
    }

    const results: Array<{ id: string; ok: boolean; error?: string }> = [];

    for (const id of ids) {
      const { error } = await supabase
        .from("quotes")
        .update(update)
        .eq("id", id)
        .eq("user_id", user.id);

      results.push({ id, ok: !error, error: error?.message });
    }

    return NextResponse.json({
      processed: results.length,
      succeeded: results.filter(r => r.ok).length,
      failed: results.filter(r => !r.ok).length,
      results,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
