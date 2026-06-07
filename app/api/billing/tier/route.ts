import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { PLANS, normalizeTier } from "@/lib/stripe";
import { ApiError, errorResponse } from "@/lib/api-error";

export async function PUT(request: NextRequest) {
  try {
    const admin = createAdminClient();

    // Authenticate via the standard user client first
    const { createServerSupabaseClient } = await import("@/lib/supabase/server");
    const supabase = await createServerSupabaseClient(request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Unauthorized");

    const body = await request.json();
    const tier = body.tier as string;

    if (!tier || !(tier in PLANS)) {
      throw new ApiError(400, "Invalid plan tier");
    }

    const { error } = await admin
      .from("profiles")
      .update({
        plan_tier: tier,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) throw new ApiError(400, error.message);

    const plan = PLANS[tier as keyof typeof PLANS];
    return NextResponse.json({
      tier,
      name: plan.name,
    });
  } catch (error) {
    return errorResponse(error);
  }
}
