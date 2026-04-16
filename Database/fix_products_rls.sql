-- ─────────────────────────────────────────────────────────────────────────────
-- Fix: products table RLS — ensure admin-write policy is scoped to
-- authenticated users only so it never interferes with the public SELECT.
--
-- Problem:
--   The live `products_admin_write` policy had no TO clause, meaning it ran
--   for ALL roles (including anon).  Because the policy is FOR ALL, its USING
--   clause acts as a row-visibility filter for SELECT.  When `is_admin()`
--   returns false (anon / non-admin users), the policy hides every row.
--   PostgreSQL OR-s permissive policies, so `products_public_read` *should*
--   still let them through — but scoping the write policy to `authenticated`
--   only is cleaner and removes any ambiguity.
--
-- Apply in: Supabase Dashboard → SQL Editor → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Drop the old policy that applies to all roles.
DROP POLICY IF EXISTS products_admin_write ON public.products;

-- 2. Re-create it scoped to authenticated users only.
--    FOR ALL covers SELECT / INSERT / UPDATE / DELETE for admins.
CREATE POLICY products_admin_all
  ON public.products
  FOR ALL
  TO authenticated
  USING     (public.is_admin())
  WITH CHECK (public.is_admin());

-- 3. Ensure the public read policy exists and is correct.
--    (Idempotent — safe to re-run.)
DROP POLICY IF EXISTS products_public_read ON public.products;

CREATE POLICY products_public_read
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (true);
