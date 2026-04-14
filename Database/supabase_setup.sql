-- =================================================================
-- THE VEDIC PROTOCOL — Supabase Setup SQL
-- Run this in the Supabase SQL Editor:
-- https://supabase.com/dashboard → your project → SQL Editor
-- =================================================================

-- -----------------------------------------------------------------
-- 1. TRIGGER FUNCTION
--    Automatically creates a customers row whenever a user signs up.
--    Runs as SECURITY DEFINER (database superuser) so it bypasses
--    all RLS policies — this is why it always works.
-- -----------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.customers (id, email, name, phone, vedic_points, tier, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    0,
    'Bronze',
    'user'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name  = CASE WHEN EXCLUDED.name <> '' THEN EXCLUDED.name ELSE customers.name END,
    phone = COALESCE(EXCLUDED.phone, customers.phone);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------
-- 2. TRIGGER
--    Fires after every INSERT into auth.users (i.e. every sign-up).
-- -----------------------------------------------------------------
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------
-- 3. ROW LEVEL SECURITY POLICIES for public.customers
--    These allow logged-in users to read and update their own row.
--    Inserts are handled by the trigger above (no client INSERT needed).
-- -----------------------------------------------------------------
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid duplicates
DROP POLICY IF EXISTS "Users can read own profile"   ON public.customers;
DROP POLICY IF EXISTS "Users can update own profile" ON public.customers;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.customers;
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.customers;

-- Users can always read their own row
CREATE POLICY "Users can read own profile"
  ON public.customers FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own row (name, phone, etc.)
CREATE POLICY "Users can update own profile"
  ON public.customers FOR UPDATE
  USING (auth.uid() = id);

-- Allow client-side upsert at signup (fallback for when trigger can't run)
CREATE POLICY "Users can insert own profile"
  ON public.customers FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admins can read all profiles (needed for admin dashboard)
CREATE POLICY "Admins can read all profiles"
  ON public.customers FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.customers c
      WHERE c.id = auth.uid() AND c.role = 'admin'
    )
  );
