import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sanitizeString, sanitizeOptionalString } from "@/lib/validation";
import { ApiError, errorResponse } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Unauthorized");

    const body = await request.json();
    const expense_date = sanitizeString(body.expense_date ?? new Date().toISOString().slice(0, 10));
    const amount = parseFloat(body.amount);
    const category = sanitizeString(body.category ?? "Other");
    const description = sanitizeOptionalString(body.description) ?? "";
    const receipt_url = sanitizeOptionalString(body.receipt_url);

    if (isNaN(amount) || amount <= 0) throw new ApiError(400, "Valid expense amount required");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(expense_date)) throw new ApiError(400, "Date must be YYYY-MM-DD");

    const { data, error } = await supabase.from("expenses").insert({
      user_id: user.id,
      expense_date,
      amount: Math.round(amount * 100) / 100,
      category,
      description,
      receipt_url,
    }).select().single();

    if (error) throw new ApiError(400, error.message);
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
