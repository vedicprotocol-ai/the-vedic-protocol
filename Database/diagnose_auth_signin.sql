-- ════════════════════════════════════════════════════════════════════════════
-- DIAGNOSE & FIX: Sign-In Failure for Registered Users
-- The Vedic Protocol — Run in Supabase Dashboard → SQL Editor
--
-- Root cause: Supabase GoTrue returns HTTP 400 "invalid_credentials" when
-- `auth.users.confirmed_at` is NULL, even if `email_confirmed_at` is set.
-- This can happen when:
--   • A user was created via the Supabase dashboard without "Auto Confirm"
--   • The user was created programmatically and confirmation_token was not
--     properly cleared after email verification
--   • A manual DB migration left confirmed_at unpopulated
--
-- Run the STEP 1 query first to inspect state, then apply whichever FIX
-- steps are needed.
-- ════════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 1: INSPECT AUTH USER STATE
-- Check every field that GoTrue validates before allowing password login.
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
  id,
  email,
  role,
  -- Confirmed state — BOTH must be non-null for password login to work
  email_confirmed_at,
  confirmed_at,
  -- A non-null banned_until (in the future) blocks all logins
  banned_until,
  -- Non-null confirmation_token means email confirmation is still pending
  confirmation_token,
  -- Password hash — should start with '$2a$' or '$2b$' (bcrypt)
  LEFT(encrypted_password, 10) AS pw_prefix,
  CHAR_LENGTH(encrypted_password)  AS pw_length,
  -- Timestamps
  created_at,
  last_sign_in_at,
  updated_at
FROM auth.users
WHERE email IN ('vedicprotocol@gmail.com', 'vijyt007@gmail.com')
ORDER BY email;


-- ─────────────────────────────────────────────────────────────────────────────
-- STEP 2: INSPECT CORRESPONDING CUSTOMERS ROWS
-- A missing customers row does NOT block login, but it can cause profile-load
-- errors that make the dashboard look broken after a successful auth.
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
  c.id,
  c.email,
  c.name,
  c.phone,
  c.role,
  c.vedic_points,
  c.tier
FROM public.customers c
WHERE c.email IN ('vedicprotocol@gmail.com', 'vijyt007@gmail.com')
ORDER BY c.email;


-- ─────────────────────────────────────────────────────────────────────────────
-- FIX A: Populate confirmed_at where it is NULL but email_confirmed_at is set
--
-- This is the most common cause of "invalid_credentials" for users who were
-- admin-created or whose email was confirmed via a non-standard path.
--
-- Safe to run: only updates rows that actually need it.
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE auth.users
SET confirmed_at = email_confirmed_at
WHERE email IN ('vedicprotocol@gmail.com', 'vijyt007@gmail.com')
  AND email_confirmed_at IS NOT NULL
  AND confirmed_at IS NULL;

-- Verify the fix:
SELECT email, email_confirmed_at, confirmed_at
FROM auth.users
WHERE email IN ('vedicprotocol@gmail.com', 'vijyt007@gmail.com');


-- ─────────────────────────────────────────────────────────────────────────────
-- FIX B: Clear any stale confirmation_token that blocks login
--
-- If confirmation_token is not null, GoTrue may treat the account as
-- unconfirmed even if email_confirmed_at is set.
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE auth.users
SET
  confirmation_token  = NULL,
  recovery_token      = NULL,
  email_change_token_new = NULL
WHERE email IN ('vedicprotocol@gmail.com', 'vijyt007@gmail.com')
  AND (confirmation_token IS NOT NULL OR confirmation_token <> '');


-- ─────────────────────────────────────────────────────────────────────────────
-- FIX C: Un-ban a user if banned_until is blocking login
-- ─────────────────────────────────────────────────────────────────────────────
UPDATE auth.users
SET banned_until = NULL
WHERE email IN ('vedicprotocol@gmail.com', 'vijyt007@gmail.com')
  AND banned_until IS NOT NULL
  AND banned_until > now();


-- ─────────────────────────────────────────────────────────────────────────────
-- FIX D: Ensure missing customers rows are inserted for both users
--
-- If the customers row doesn't exist, the user can log in but will see
-- no profile data on the dashboard. This ensures the row is present.
-- ─────────────────────────────────────────────────────────────────────────────
INSERT INTO public.customers (id, email, name, phone, vedic_points, tier, role)
SELECT
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'name', ''),
  NULLIF(u.raw_user_meta_data->>'phone', ''),
  0,
  'Bronze',
  'customer'
FROM auth.users u
WHERE u.email IN ('vedicprotocol@gmail.com', 'vijyt007@gmail.com')
ON CONFLICT (id) DO NOTHING;


-- ─────────────────────────────────────────────────────────────────────────────
-- CHECK: Rate limit state
-- If the user made many failed attempts, check Supabase Auth → Rate Limits
-- in the dashboard to see if the IP or email is throttled.
-- There is no SQL query for this — use:
--   Supabase Dashboard → Authentication → Rate Limits
-- ─────────────────────────────────────────────────────────────────────────────


-- ─────────────────────────────────────────────────────────────────────────────
-- FINAL VERIFY: After running the FIX steps, run this to confirm state
-- ─────────────────────────────────────────────────────────────────────────────
SELECT
  u.email,
  u.confirmed_at IS NOT NULL     AS is_confirmed,
  u.email_confirmed_at IS NOT NULL AS email_verified,
  u.banned_until IS NULL         AS not_banned,
  u.confirmation_token IS NULL   AS token_cleared,
  c.id IS NOT NULL               AS has_customers_row,
  c.role                         AS customer_role
FROM auth.users u
LEFT JOIN public.customers c ON c.id = u.id
WHERE u.email IN ('vedicprotocol@gmail.com', 'vijyt007@gmail.com')
ORDER BY u.email;
-- Expected output: every boolean column should be TRUE / TRUE / TRUE / TRUE / TRUE
-- and customer_role should be 'customer' or 'admin'.
