-- QuoteCraft Scheduling
-- Migration 008: Add job scheduling fields to quotes

ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS job_date DATE,
  ADD COLUMN IF NOT EXISTS start_time TEXT,
  ADD COLUMN IF NOT EXISTS end_time TEXT;

CREATE INDEX IF NOT EXISTS idx_quotes_job_date ON public.quotes(job_date);

-- Allow in_progress status on jobs
ALTER TABLE public.jobs DROP CONSTRAINT IF EXISTS jobs_status_check;
ALTER TABLE public.jobs ADD CONSTRAINT jobs_status_check
  CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled'));
