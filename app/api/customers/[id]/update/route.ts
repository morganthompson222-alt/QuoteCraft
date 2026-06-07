import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { sanitizeOptionalString } from "@/lib/validation";
import { ApiError, errorResponse } from "@/lib/api-error";

export async function PUT(
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
    const body = await request.json();

    const update: Record<string, unknown> = {};

    if (body.email !== undefined) update.email = sanitizeOptionalString(body.email);
    if (body.name !== undefined) update.name = sanitizeOptionalString(body.name);
    if (body.phone !== undefined) update.phone = sanitizeOptionalString(body.phone);
    if (body.company !== undefined) update.company = sanitizeOptionalString(body.company);
    if (body.address !== undefined) update.address = sanitizeOptionalString(body.address);
    if (body.city !== undefined) update.city = sanitizeOptionalString(body.city);
    if (body.state !== undefined) update.state = sanitizeOptionalString(body.state);
    if (body.zip !== undefined) update.zip = sanitizeOptionalString(body.zip);
    if (body.notes !== undefined) update.notes = sanitizeOptionalString(body.notes);

    if (Object.keys(update).length === 0) {
      throw new ApiError(400, "No fields to update");
    }

    update.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from("customers")
      .update(update)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new ApiError(409, "A customer with this email already exists");
      }
      if (error.code === "PGRST116") {
        throw new ApiError(404, "Customer not found");
      }
      throw new ApiError(400, error.message);
    }

    return NextResponse.json(data);
  } catch (error) {
    return errorResponse(error);
  }
}
