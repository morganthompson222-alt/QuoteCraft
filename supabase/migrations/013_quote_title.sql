-- Add title field to quotes for naming by item
ALTER TABLE public.quotes
  ADD COLUMN IF NOT EXISTS title TEXT;

-- Backfill title from first line item description
UPDATE public.quotes q
SET title = (
  SELECT qi.description
  FROM public.quote_items qi
  WHERE qi.quote_id = q.id
  ORDER BY qi.sort_order ASC
  LIMIT 1
)
WHERE q.title IS NULL;
