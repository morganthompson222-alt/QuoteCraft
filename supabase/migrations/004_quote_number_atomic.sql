-- QuoteCraft Atomic Quote Number Generation
-- Migration 004: Prevents race conditions on quote number assignment

CREATE OR REPLACE FUNCTION public.atomic_next_quote_number(p_user_id UUID)
RETURNS TABLE(quote_number TEXT, prefix TEXT, num INT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_prefix TEXT;
  v_next_num INT;
BEGIN
  UPDATE public.profiles
  SET next_quote_number = next_quote_number + 1
  WHERE id = p_user_id
  RETURNING quote_prefix, next_quote_number - 1 INTO v_prefix, v_next_num;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found for user %', p_user_id;
  END IF;

  RETURN QUERY SELECT
    v_prefix || LPAD(v_next_num::TEXT, 4, '0'),
    v_prefix,
    v_next_num;
END;
$$;

COMMENT ON FUNCTION public.atomic_next_quote_number IS
  'Atomically generates the next quote number for a user. Safe for concurrent calls.';
