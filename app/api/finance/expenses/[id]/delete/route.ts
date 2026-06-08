import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ApiError, errorResponse } from "@/lib/api-error";

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createServerSupabaseClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Unauthorized");

    const { id } = await params;
    const { error } = await supabase.from("expenses").delete().eq("id", id).eq("user_id", user.id);
    if (error) throw new ApiError(400, error.message);
    return NextResponse.json({ deleted: true });
  } catch (error) {
    return errorResponse(error);
  }
}
