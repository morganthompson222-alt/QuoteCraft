import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ApiError, errorResponse } from "@/lib/api-error";

export async function DELETE(
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

    // Guard: prevent deletion if customer has accepted quotes
    const { count: acceptedCount } = await supabase
      .from("quotes")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", id)
      .eq("user_id", user.id)
      .eq("status", "accepted");

    if (acceptedCount && acceptedCount > 0) {
      throw new ApiError(
        409,
        "Cannot delete customer with accepted quotes. Archive the quotes first.",
      );
    }

    const { error } = await supabase
      .from("customers")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      if (error.code === "PGRST116") {
        throw new ApiError(404, "Customer not found");
      }
      throw new ApiError(400, error.message);
    }

    return NextResponse.json({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
