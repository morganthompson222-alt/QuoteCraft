import { createAdminClient } from "./supabase/admin";
import { PLANS, type PlanTier, normalizeTier } from "./stripe";
import { ApiError } from "./api-error";

export async function enforcePlanLimit(
  userId: string,
  action: "create_customer" | "create_quote" | "ai_generate" | "schedule_job",
) {
  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("plan_tier, subscription_status")
    .eq("id", userId)
    .single();

  const rawTier = (profile?.plan_tier as string) ?? "solo";
  const tier = normalizeTier(rawTier);
  const plan = PLANS[tier];

  if (tier !== "solo" && profile?.subscription_status !== "active" && profile?.subscription_status !== "trialing") {
    // Past-due subscriptions fall back to solo limits
  }

  switch (action) {
    case "create_customer": {
      if (plan.maxCustomers === -1) return;
      const { count } = await admin
        .from("customers")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId);

      if (count != null && count >= plan.maxCustomers) {
        throw new ApiError(
          403,
          `${plan.name} plan limit reached. Maximum ${plan.maxCustomers} customers. Upgrade to add more.`,
          "PLAN_LIMIT_REACHED",
        );
      }
      break;
    }

    case "create_quote": {
      if (plan.maxActiveQuotes === -1) return;

      // Count active quotes (not expired or rejected)
      const { count } = await admin
        .from("quotes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .not("status", "in", '("rejected","expired")');

      if (count != null && count >= plan.maxActiveQuotes) {
        throw new ApiError(
          403,
          `${plan.name} plan limit reached. Maximum ${plan.maxActiveQuotes} active quotes. Upgrade to add more.`,
          "PLAN_LIMIT_REACHED",
        );
      }
      break;
    }

    case "ai_generate": {
      if (plan.aiGenerationsPerMonth === -1) return;

      // Count AI generations this month
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { count } = await admin
        .from("quotes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", userId)
        .gte("created_at", monthStart);

      if (count != null && count >= plan.aiGenerationsPerMonth) {
        throw new ApiError(
          403,
          `${plan.name} monthly AI limit reached (${plan.aiGenerationsPerMonth} generations). Upgrade or wait until next month.`,
          "PLAN_LIMIT_REACHED",
        );
      }
      break;
    }

    case "schedule_job": {
      if (!plan.scheduleJobs) {
        throw new ApiError(
          403,
          "Job scheduling is available on all plans. Your current plan does not support this feature.",
          "PLAN_LIMIT_REACHED",
        );
      }
      break;
    }
  }
}
