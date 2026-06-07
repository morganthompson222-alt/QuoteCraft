-- QuoteCraft Tier Update
-- Migration 009: Update tier names to new 5-tier system

-- Drop old constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plan_tier_check;

-- Migrate existing users
UPDATE public.profiles SET plan_tier = 'solo' WHERE plan_tier = 'free';
UPDATE public.profiles SET plan_tier = 'solo_pro' WHERE plan_tier = 'pro';
UPDATE public.profiles SET plan_tier = 'enterprise' WHERE plan_tier = 'unlimited';

-- Add new constraint with updated tier list
ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_tier_check
  CHECK (plan_tier IN ('solo', 'solo_pro', 'business', 'growth', 'enterprise'));
