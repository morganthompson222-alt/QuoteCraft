import Stripe from "stripe";

function getStripeInstance(): Stripe | null {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  return new Stripe(key, { apiVersion: "2026-05-27.dahlia" as const });
}

let _stripe: Stripe | null = null;

export function stripe(): Stripe | null {
  if (!_stripe) _stripe = getStripeInstance();
  return _stripe;
}

export function getStripePublishableKey(): string | null {
  return process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? null;
}

export const PLANS = {
  solo: {
    name: "Solo",
    priceId: null,
    displayPrice: "Free",
    maxCustomers: 30,
    maxActiveQuotes: 5,
    aiGenerationsPerMonth: 20,
    deepSeekGenerations: 2,
    deepSeekFinanceQueries: 1,
    scheduleJobs: true,
    calendarExport: false,
    maxTeamMembers: 0,
  },
  solo_pro: {
    name: "Solo Pro",
    priceId: null,
    displayPrice: "Free until Sep 2026",
    maxCustomers: -1,
    maxActiveQuotes: -1,
    aiGenerationsPerMonth: -1,
    deepSeekGenerations: 5,
    deepSeekFinanceQueries: 3,
    scheduleJobs: true,
    calendarExport: true,
    maxTeamMembers: 0,
  },
  business: {
    name: "Business",
    priceId: null,
    displayPrice: "Contact for info",
    maxCustomers: -1,
    maxActiveQuotes: -1,
    aiGenerationsPerMonth: -1,
    deepSeekGenerations: 10,
    deepSeekFinanceQueries: 5,
    scheduleJobs: true,
    calendarExport: true,
    maxTeamMembers: 3,
  },
  growth: {
    name: "Growth",
    priceId: null,
    displayPrice: "Contact for info",
    maxCustomers: -1,
    maxActiveQuotes: -1,
    aiGenerationsPerMonth: -1,
    deepSeekGenerations: 20,
    deepSeekFinanceQueries: 10,
    scheduleJobs: true,
    calendarExport: true,
    maxTeamMembers: 10,
  },
  enterprise: {
    name: "Enterprise",
    priceId: null,
    displayPrice: "Contact for info",
    maxCustomers: -1,
    maxActiveQuotes: -1,
    aiGenerationsPerMonth: -1,
    deepSeekGenerations: -1,
    deepSeekFinanceQueries: -1,
    scheduleJobs: true,
    calendarExport: true,
    maxTeamMembers: -1,
  },
} as const;

export type PlanTier = keyof typeof PLANS;

// Backward-compatible mapping from old tier names
const TIER_ALIASES: Record<string, PlanTier> = {
  free: "solo",
  pro: "solo_pro",
  unlimited: "enterprise",
};

export function normalizeTier(tier: string): PlanTier {
  if (tier in PLANS) return tier as PlanTier;
  return TIER_ALIASES[tier] ?? "solo";
}
