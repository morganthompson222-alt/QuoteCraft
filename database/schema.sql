-- QuoteCraft Database Schema
-- Agent B — 2026-06-05

-- ============================================================
-- EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- TABLES
-- ============================================================

-- Users (managed by Supabase Auth, extended here)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_sign_in TIMESTAMPTZ
);

-- User profiles (company info, settings)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  company_name TEXT,
  logo_url TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  default_tax_rate NUMERIC(5,2) DEFAULT 0,
  quote_prefix TEXT DEFAULT 'Q-',
  next_quote_number INT DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Customers
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  address TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  country TEXT DEFAULT 'US',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, email)
);

-- Quotes
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  quote_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
  subtotal NUMERIC(12,2) NOT NULL DEFAULT 0,
  tax_rate NUMERIC(5,2) DEFAULT 0,
  tax_amount NUMERIC(12,2) DEFAULT 0,
  total NUMERIC(12,2) NOT NULL DEFAULT 0,
  notes TEXT,
  valid_until DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, quote_number)
);

-- Quote line items
CREATE TABLE IF NOT EXISTS public.quote_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id UUID NOT NULL REFERENCES public.quotes(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC(10,2) NOT NULL DEFAULT 1,
  unit_price NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX idx_customers_user_id ON public.customers(user_id);
CREATE INDEX idx_customers_email ON public.customers(email);
CREATE INDEX idx_quotes_user_id ON public.quotes(user_id);
CREATE INDEX idx_quotes_customer_id ON public.quotes(customer_id);
CREATE INDEX idx_quotes_status ON public.quotes(status);
CREATE INDEX idx_quote_items_quote_id ON public.quote_items(quote_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

-- Users: can only see own record
CREATE POLICY users_self ON public.users
  FOR ALL USING (id = auth.uid());

-- Profiles: user owns their profile
CREATE POLICY profiles_self ON public.profiles
  FOR ALL USING (id = auth.uid());

-- Customers: user owns their customers
CREATE POLICY customers_self ON public.customers
  FOR ALL USING (user_id = auth.uid());

-- Quotes: user owns their quotes
CREATE POLICY quotes_self ON public.quotes
  FOR ALL USING (user_id = auth.uid());

-- Quote items: cascade from quotes
CREATE POLICY quote_items_self ON public.quote_items
  FOR ALL USING (
    quote_id IN (SELECT id FROM public.quotes WHERE user_id = auth.uid())
  );

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Generate next quote number for a user
CREATE OR REPLACE FUNCTION public.generate_quote_number(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_prefix TEXT;
  v_next_num INT;
  v_quote_number TEXT;
BEGIN
  SELECT quote_prefix, next_quote_number INTO v_prefix, v_next_num
  FROM public.profiles
  WHERE id = p_user_id;

  v_quote_number := v_prefix || LPAD(v_next_num::TEXT, 4, '0');

  UPDATE public.profiles
  SET next_quote_number = next_quote_number + 1
  WHERE id = p_user_id;

  RETURN v_quote_number;
END;
$$;

-- Calculate quote totals
CREATE OR REPLACE FUNCTION public.calculate_quote_totals(p_quote_id UUID)
RETURNS TABLE(subtotal NUMERIC, tax_amount NUMERIC, total NUMERIC)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_tax_rate NUMERIC;
BEGIN
  SELECT q.tax_rate INTO v_tax_rate
  FROM public.quotes q
  WHERE q.id = p_quote_id;

  RETURN QUERY
  SELECT
    COALESCE(SUM(qi.amount), 0) AS subtotal,
    COALESCE(SUM(qi.amount) * (v_tax_rate / 100), 0) AS tax_amount,
    COALESCE(SUM(qi.amount) * (1 + v_tax_rate / 100), 0) AS total
  FROM public.quote_items qi
  WHERE qi.quote_id = p_quote_id;
END;
$$;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-calculate item amount
CREATE OR REPLACE FUNCTION public.calc_item_amount()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.amount := NEW.quantity * NEW.unit_price;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_quote_items_calc_amount
  BEFORE INSERT OR UPDATE ON public.quote_items
  FOR EACH ROW
  EXECUTE FUNCTION public.calc_item_amount();

-- Update quote totals when items change
CREATE OR REPLACE FUNCTION public.update_quote_totals()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_rec RECORD;
BEGIN
  FOR v_rec IN SELECT * FROM public.calculate_quote_totals(
    COALESCE(NEW.quote_id, OLD.quote_id)
  ) LOOP
    UPDATE public.quotes
    SET
      subtotal = v_rec.subtotal,
      tax_amount = v_rec.tax_amount,
      total = v_rec.total,
      updated_at = NOW()
    WHERE id = COALESCE(NEW.quote_id, OLD.quote_id);
  END LOOP;
  RETURN NULL;
END;
$$;

CREATE TRIGGER trg_quote_items_update_totals
  AFTER INSERT OR UPDATE OR DELETE ON public.quote_items
  FOR EACH ROW
  EXECUTE FUNCTION public.update_quote_totals();
