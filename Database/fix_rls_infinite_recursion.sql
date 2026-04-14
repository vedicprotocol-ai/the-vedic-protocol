-- ═══════════════════════════════════════════════════════════════════════
-- FIX: Infinite recursion in customers RLS (PostgreSQL error 42P17)
--
-- Root cause: duplicate legacy policies exist alongside the current ones.
-- "Admins can read all profiles" queries public.customers from within a
-- policy ON public.customers → infinite recursion.
-- "Admin full access" on doctors queries customers directly (no SECURITY
-- DEFINER), cascading into the recursive customers policy.
--
-- The replacement policies already exist:
--   customers_self_read    → covers "Users can read own profile"
--   customers_self_insert  → covers "Users can insert own profile"
--   customers_self_update  → covers "Users can update own profile"
--   customers_admin_all    → covers "Admins can read all profiles"
--   doctors_admin_write    → covers "Admin full access" on doctors
--   (all use is_admin() which is SECURITY DEFINER and bypasses RLS)
--
-- Run this once in Supabase → SQL Editor.
-- ═══════════════════════════════════════════════════════════════════════

-- 1. Drop the self-referential policy that causes the recursion
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.customers;

-- 2. Drop the three redundant legacy policies on customers
--    (already covered by customers_self_read / insert / update)
DROP POLICY IF EXISTS "Users can read own profile"   ON public.customers;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.customers;
DROP POLICY IF EXISTS "Users can update own profile" ON public.customers;

-- 3. Drop the legacy doctors policy that queries customers directly
--    (already covered by doctors_admin_write which uses is_admin())
DROP POLICY IF EXISTS "Admin full access" ON public.doctors;

-- ── Verify: no recursion-prone policies remain ───────────────────────
-- After running, execute the following to confirm the fix:
--
-- SET ROLE authenticated;
-- SELECT * FROM public.doctors  LIMIT 5;
-- SELECT * FROM public.customers LIMIT 5;
-- RESET ROLE;
--
-- Both should return rows (or empty set) without 42P17 errors.
-- ═══════════════════════════════════════════════════════════════════════
