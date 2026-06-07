ALTER TABLE profiles DROP COLUMN IF EXISTS stripe_customer_id;
ALTER TABLE profiles DROP COLUMN IF EXISTS stripe_subscription_id;
ALTER TABLE profiles DROP COLUMN IF EXISTS subscription_status;
ALTER TABLE profiles DROP COLUMN IF EXISTS subscription_period_start;
ALTER TABLE profiles DROP COLUMN IF EXISTS subscription_period_end;
ALTER TABLE profiles DROP COLUMN IF EXISTS plan_tier;
