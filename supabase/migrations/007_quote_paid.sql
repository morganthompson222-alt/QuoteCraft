-- QuoteCraft Paid Status
-- Migration 007: Track payment status on quotes

ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS paid BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_quotes_paid ON public.quotes(paid);
