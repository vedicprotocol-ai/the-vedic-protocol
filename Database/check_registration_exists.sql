-- ═══════════════════════════════════════════════════════════════
-- MIGRATION: check_registration_exists
-- Purpose : Allow the signup form to check whether an email or
--           phone number is already in use — before creating an
--           auth.users row — without exposing any customer data.
--
-- The function runs as SECURITY DEFINER (postgres role) so it can
-- bypass RLS on public.customers.  It returns ONLY boolean flags,
-- never actual row data, so there is no privacy risk.
--
-- Run this once in your Supabase SQL editor (Database → SQL editor).
-- ═══════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.check_registration_exists(
  p_email text,
  p_phone text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_email_taken boolean := false;
  v_phone_taken boolean := false;
BEGIN
  -- Email check (case-insensitive)
  IF p_email IS NOT NULL AND trim(p_email) <> '' THEN
    SELECT EXISTS(
      SELECT 1 FROM public.customers
      WHERE lower(email) = lower(trim(p_email))
    ) INTO v_email_taken;
  END IF;

  -- Phone check (only when a phone is supplied)
  IF p_phone IS NOT NULL AND trim(p_phone) <> '' THEN
    SELECT EXISTS(
      SELECT 1 FROM public.customers
      WHERE phone = trim(p_phone)
    ) INTO v_phone_taken;
  END IF;

  RETURN jsonb_build_object(
    'email_taken', v_email_taken,
    'phone_taken', v_phone_taken
  );
END;
$$;

-- Grant execute to anon (unauthenticated) and authenticated roles
-- so the signup form can call it before a session exists.
GRANT EXECUTE ON FUNCTION public.check_registration_exists(text, text) TO anon;
GRANT EXECUTE ON FUNCTION public.check_registration_exists(text, text) TO authenticated;
