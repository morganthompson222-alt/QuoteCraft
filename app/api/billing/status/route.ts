import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ApiError, errorResponse } from "@/lib/api-error";
import { PLANS, normalizeTier } from "@/lib/stripe";

export async function GET(_request: NextRequest) {
  try {
    const supabase = await createServerSupabaseClient(_request);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new ApiError(401, "Unauthorized");

    const { data: profile } = await supabase
      .from("profiles")
      .select("plan_tier, subscription_status, subscription_period_start, subscription_period_end, stripe_customer_id")
      .eq("id", user.id)
      .single();

    const tier = normalizeTier((profile?.plan_tier as string) ?? "solo");
    const plan = PLANS[tier];

    return NextResponse.json({
      tier,
      name: plan.name,
      displayPrice: plan.displayPrice,
      subscriptionStatus: profile?.subscription_status ?? null,
      periodStart: profile?.subscription_period_start ?? null,
      periodEnd: profile?.subscription_period_end ?? null,
      stripeCustomerId: profile?.stripe_customer_id ?? null,
      limits: {
        maxActiveQuotes: plan.maxActiveQuotes,
        maxCustomers: plan.maxCustomers,
        aiGenerationsPerMonth: plan.aiGenerationsPerMonth,
        scheduleJobs: plan.scheduleJobs,
        calendarExport: plan.calendarExport,
        maxTeamMembers: plan.maxTeamMembers,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}
