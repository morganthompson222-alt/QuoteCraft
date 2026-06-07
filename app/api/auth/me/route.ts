import { NextResponse } from "next/server"
import type { NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ApiError, errorResponse } from "@/lib/api-error";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(request);

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      throw new ApiError(401, "Unauthorized");
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return NextResponse.json({
      userId: user.id,
      email: user.email,
      name: user.user_metadata?.name ?? profile?.company_name ?? null,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
