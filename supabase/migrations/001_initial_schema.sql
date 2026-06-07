-- QuoteCraft Initial Schema
-- Migration 001: Core tables, RLS, triggers

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users (extends Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_sign_in TIMESTAMPTZ
);

-- User profiles
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

-- Quote items
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_quotes_user_id ON public.quotes(user_id);
CREATE INDEX IF NOT EXISTS idx_quotes_customer_id ON public.quotes(customer_id);
CREATE INDEX IF NOT EXISTS idx_quotes_status ON public.quotes(status);
CREATE INDEX IF NOT EXISTS idx_quote_items_quote_id ON public.quote_items(quote_id);

-- RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quote_items ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY users_self ON public.users FOR ALL USING (id = auth.uid());
CREATE POLICY profiles_self ON public.profiles FOR ALL USING (id = auth.uid());
CREATE POLICY customers_self ON public.customers FOR ALL USING (user_id = auth.uid());
CREATE POLICY quotes_self ON public.quotes FOR ALL USING (user_id = auth.uid());
CREATE POLICY quote_items_self ON public.quote_items
  FOR ALL USING (
    quote_id IN (SELECT id FROM public.quotes WHERE user_id = auth.uid())
  );

-- Auto-calculate item amount
CREATE OR REPLACE FUNCTION public.calc_item_amount()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.amount := NEW.quantity * NEW.unit_price;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_quote_items_calc_amount
  BEFORE INSERT OR UPDATE ON public.quote_items
  FOR EACH ROW EXECUTE FUNCTION public.calc_item_amount();

-- Auto-update quote totals
CREATE OR REPLACE FUNCTION public.calculate_quote_totals(p_quote_id UUID)
RETURNS TABLE(subtotal NUMERIC, tax_amount NUMERIC, total NUMERIC)
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_tax_rate NUMERIC;
BEGIN
  SELECT q.tax_rate INTO v_tax_rate FROM public.quotes q WHERE q.id = p_quote_id;
  RETURN QUERY
  SELECT
    COALESCE(SUM(qi.amount), 0) AS subtotal,
    COALESCE(SUM(qi.amount) * (v_tax_rate / 100), 0) AS tax_amount,
    COALESCE(SUM(qi.amount) * (1 + v_tax_rate / 100), 0) AS total
  FROM public.quote_items qi WHERE qi.quote_id = p_quote_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.update_quote_totals()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE v_rec RECORD;
BEGIN
  FOR v_rec IN SELECT * FROM public.calculate_quote_totals(
    COALESCE(NEW.quote_id, OLD.quote_id)
  ) LOOP
    UPDATE public.quotes SET
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
  FOR EACH ROW EXECUTE FUNCTION public.update_quote_totals();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'name');
  INSERT INTO public.profiles (id)
  VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
