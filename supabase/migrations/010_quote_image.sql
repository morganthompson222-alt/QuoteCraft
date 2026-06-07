-- QuoteCraft Media
-- Migration 010: Add image to quotes

ALTER TABLE public.quotes ADD COLUMN IF NOT EXISTS image_url TEXT;
