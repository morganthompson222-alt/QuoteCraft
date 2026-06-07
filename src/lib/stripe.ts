import Stripe from "stripe";
import { requireEnv } from "./validation";

export const stripe = new Stripe(requireEnv("STRIPE_SECRET_KEY"), {
  apiVersion: "2026-05-27.dahlia" as const,
});

export function getStripePublishableKey(): string {
  return requireEnv("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY");
}

export const PLANS = {
  solo: {
    name: "Solo",
    priceId: null,
    displayPrice: "Free",
    maxCustomers: 30,
    maxActiveQuotes: 5,
    aiGenerationsPerMonth: 20,
    scheduleJobs: false,
    calendarExport: false,
    maxTeamMembers: 0,
  },
  solo_pro: {
    name: "Solo Pro",
    priceId: process.env.STRIPE_SOLO_PRO_PRICE_ID ?? "price_solo_pro",
    displayPrice: "£9.99/mo",
    maxCustomers: 100,
    maxActiveQuotes: 15,
    aiGenerationsPerMonth: 60,
    scheduleJobs: true,
    calendarExport: true,
    maxTeamMembers: 0,
  },
  business: {
    name: "Business",
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID ?? "price_business",
    displayPrice: "£29.99/mo",
    maxCustomers: 500,
    maxActiveQuotes: 50,
    aiGenerationsPerMonth: 150,
    scheduleJobs: true,
    calendarExport: true,
    maxTeamMembers: 3,
  },
  growth: {
    name: "Growth",
    priceId: process.env.STRIPE_GROWTH_PRICE_ID ?? "price_growth",
    displayPrice: "£69.99/mo",
    maxCustomers: 2000,
    maxActiveQuotes: 150,
    aiGenerationsPerMonth: 400,
    scheduleJobs: true,
    calendarExport: true,
    maxTeamMembers: 10,
  },
  enterprise: {
    name: "Enterprise",
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? "price_enterprise",
    displayPrice: "£150+/mo",
    maxCustomers: -1,
    maxActiveQuotes: -1,
    aiGenerationsPerMonth: -1,
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
