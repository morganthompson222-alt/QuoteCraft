-- QuoteCraft Regional Settings
-- Migration 005: Country, currency, and locale support

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS region_code TEXT DEFAULT 'UK',
  ADD COLUMN IF NOT EXISTS currency_code TEXT DEFAULT 'GBP',
  ADD COLUMN IF NOT EXISTS locale TEXT DEFAULT 'en-GB';

ALTER TABLE public.profiles
  ADD CONSTRAINT check_region_code CHECK (
    region_code IN ('UK', 'US', 'CA', 'AU', 'EU')
  );

ALTER TABLE public.profiles
  ADD CONSTRAINT check_currency_code CHECK (
    currency_code IN ('GBP', 'USD', 'CAD', 'AUD', 'EUR')
  );

ALTER TABLE public.profiles
  ADD CONSTRAINT check_locale CHECK (
    locale IN ('en-GB', 'en-US', 'en-CA', 'en-AU', 'en-IE')
  );
