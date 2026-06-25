-- Multi-day jobs support
-- Migration 014: Add end_date to jobs

ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS end_date DATE;
