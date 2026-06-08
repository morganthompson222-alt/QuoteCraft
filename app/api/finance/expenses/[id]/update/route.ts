import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sanitizeString, sanitizeOptionalString } from "@/lib/validation";
import { ApiError, errorResponse } from "@/lib/api-error";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createServerSupabaseClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Unauthorized");

    const { id } = await params;
    const body = await request.json();
    const update: Record<string, unknown> = {};

    if (body.expense_date !== undefined) update.expense_date = sanitizeString(body.expense_date);
    if (body.amount !== undefined) {
      const v = parseFloat(body.amount);
      if (isNaN(v) || v <= 0) throw new ApiError(400, "Valid amount required");
      update.amount = Math.round(v * 100) / 100;
    }
    if (body.category !== undefined) update.category = sanitizeString(body.category);
    if (body.description !== undefined) update.description = sanitizeOptionalString(body.description);
    if (body.receipt_url !== undefined) update.receipt_url = sanitizeOptionalString(body.receipt_url);

    if (Object.keys(update).length === 0) throw new ApiError(400, "No fields to update");

    const { data, error } = await supabase.from("expenses").update(update).eq("id", id).eq("user_id", user.id).select().single();
    if (error) throw new ApiError(400, error.message);
    return NextResponse.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}
