export interface UserRow {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  last_sign_in: string | null;
}

export interface ProfileRow {
  id: string;
  company_name: string | null;
  logo_url: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  default_tax_rate: number;
  quote_prefix: string;
  next_quote_number: number;
  plan_tier: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  subscription_status: string | null;
  subscription_period_start: string | null;
  subscription_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerRow {
  id: string;
  user_id: string;
  email: string;
  name: string;
  phone: string | null;
  company: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  country: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteRow {
  id: string;
  user_id: string;
  customer_id: string;
  quote_number: string;
  status: "draft" | "sent" | "accepted" | "rejected" | "expired";
  subtotal: number;
  tax_rate: number;
  tax_amount: number;
  total: number;
  notes: string | null;
  valid_until: string | null;
  created_at: string;
  updated_at: string;
}

export interface QuoteItemRow {
  id: string;
  quote_id: string;
  description: string;
  quantity: number;
  unit_price: number;
  amount: number;
  sort_order: number;
  created_at: string;
}
