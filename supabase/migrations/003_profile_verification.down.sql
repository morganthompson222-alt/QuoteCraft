-- This migration was additive-only (ALTER COLUMN SET DEFAULT, CREATE INDEX).
-- No destructive changes to revert.
-- If reverting fully, drop the added index:
DROP INDEX IF EXISTS idx_profiles_updated_at;
