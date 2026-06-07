-- QuoteCraft Auth Fix
-- Migration 012: Fix plan_tier default for new signups

ALTER TABLE public.profiles ALTER COLUMN plan_tier SET DEFAULT 'solo';
