-- QuoteCraft AI Pricing
-- Migration 013: Custom AI instructions for quote generation

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS custom_ai_instructions TEXT;
