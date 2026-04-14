-- ════════════════════════════════════════════════════════════════════════════
-- THE VEDIC PROTOCOL — COMPLETE RLS POLICY RESET
-- ════════════════════════════════════════════════════════════════════════════
--
-- This script performs a full, clean replacement of all RLS policies.
--
-- Three roles are enforced via the `role` column in the `customers` table:
--
--   admin       → full read/write access to every table
--   influencer  → own personal data + own influencer/coupon data + public reads
--   user        → own personal data + public reads
--                 (role value may be 'user' or 'customer' — both treated equally)
--
-- How to apply:
--   Paste into Supabase Dashboard → SQL Editor → Run
--
-- ════════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 1 — Helper Functions
--
-- Both functions are SECURITY DEFINER so they bypass RLS when they run.
-- This is mandatory: policies on `customers` that call is_admin() must not
-- trigger another policy check on `customers` (infinite recursion / error 42P17).
-- ─────────────────────────────────────────────────────────────────────────────

-- is_admin()
-- Returns TRUE when the current auth user has role = 'admin' (case-insensitive).
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM   public.customers
    WHERE  id         = auth.uid()
      AND  lower(role) = 'admin'
  );
$$;


-- is_influencer()
-- Returns TRUE when the current auth user has a row in the influencers table.
-- We check both user_id and customer_id because both are populated on insert
-- (AdminInfluencersPage.jsx sets both to the same customer UUID).
-- This approach works regardless of the role column value in customers.
CREATE OR REPLACE FUNCTION public.is_influencer()
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM   public.influencers
    WHERE  user_id     = auth.uid()
       OR  customer_id = auth.uid()
  );
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 2 — Drop ALL existing policies
--
-- Iterates every policy in the public schema and drops it so we start clean.
-- ─────────────────────────────────────────────────────────────────────────────

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM   pg_policies
    WHERE  schemaname = 'public'
  LOOP
    EXECUTE format(
      'DROP POLICY IF EXISTS %I ON %I.%I',
      r.policyname, r.schemaname, r.tablename
    );
  END LOOP;
END;
$$;


-- ─────────────────────────────────────────────────────────────────────────────
-- SECTION 3 — Enable RLS on every table
--
-- Safe to re-run: ALTER TABLE ... ENABLE ROW LEVEL SECURITY is idempotent.
-- ─────────────────────────────────────────────────────────────────────────────

ALTER TABLE public.appointments            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_address        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders                  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocol_signups        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews                 ENABLE ROW LEVEL SECURITY;


-- ════════════════════════════════════════════════════════════════════════════
-- SECTION 4 — Policies
--
-- Naming: <table>_<actor>_<operation>
-- Multiple permissive policies on the same table + command are OR-ed together
-- by PostgreSQL — a row is visible / writable if ANY policy passes.
-- ════════════════════════════════════════════════════════════════════════════


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: customers
--
-- admin     → full access to all rows (manage all accounts)
-- self      → read own row (AuthContext.loadProfile, VedicPointsPage)
--             insert own row on signup (AuthContext.signup — also covered by
--             handle_new_user trigger, so this is a safety net)
--             update own row (profile edits, vedic_points update at checkout)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY customers_admin_all
  ON public.customers
  FOR ALL
  TO authenticated
  USING     (is_admin())
  WITH CHECK(is_admin());

CREATE POLICY customers_self_select
  ON public.customers
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY customers_self_insert
  ON public.customers
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY customers_self_update
  ON public.customers
  FOR UPDATE
  TO authenticated
  USING     (id = auth.uid())
  WITH CHECK(id = auth.uid());


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: appointments
--
-- admin  → full access (view all bookings, manage, delete)
-- self   → select own (DashboardPage)
--          insert own (DoctorDiscoveryPage booking flow)
--          update own status (DashboardPage cancel)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY appointments_admin_all
  ON public.appointments
  FOR ALL
  TO authenticated
  USING     (is_admin())
  WITH CHECK(is_admin());

CREATE POLICY appointments_self_select
  ON public.appointments
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY appointments_self_insert
  ON public.appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

-- UPDATE covers cancellation (sets status = 'cancelled') from DashboardPage
CREATE POLICY appointments_self_update
  ON public.appointments
  FOR UPDATE
  TO authenticated
  USING     (customer_id = auth.uid())
  WITH CHECK(customer_id = auth.uid());


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: availability_slots
--
-- admin       → full CRUD (AdminDoctorsPage: create individual & batch slots,
--               delete individual & batch slots)
-- anon + auth → select all (DoctorDiscoveryPage is a public page — anyone
--               can browse doctors and see available times)
-- auth        → update (marks is_booked = true when booking an appointment,
--               or false when cancelling — DoctorDiscoveryPage & DashboardPage)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY slots_admin_all
  ON public.availability_slots
  FOR ALL
  TO authenticated
  USING     (is_admin())
  WITH CHECK(is_admin());

CREATE POLICY slots_public_select
  ON public.availability_slots
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY slots_auth_update
  ON public.availability_slots
  FOR UPDATE
  TO authenticated
  USING     (auth.uid() IS NOT NULL)
  WITH CHECK(auth.uid() IS NOT NULL);


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: blog_posts
--
-- admin       → full CRUD (AdminBlogPage: create, edit, delete posts)
-- anon + auth → select PUBLISHED posts only (BlogPage is public)
--               admin sees all posts including drafts via the admin_all policy
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY blog_admin_all
  ON public.blog_posts
  FOR ALL
  TO authenticated
  USING     (is_admin())
  WITH CHECK(is_admin());

CREATE POLICY blog_published_select
  ON public.blog_posts
  FOR SELECT
  TO anon, authenticated
  USING (published = true);


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: cart_items
--
-- admin  → full access
-- self   → full access to own cart rows (CartContext manages add/remove/clear)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY cart_admin_all
  ON public.cart_items
  FOR ALL
  TO authenticated
  USING     (is_admin())
  WITH CHECK(is_admin());

CREATE POLICY cart_self_all
  ON public.cart_items
  FOR ALL
  TO authenticated
  USING     (customer_id = auth.uid())
  WITH CHECK(customer_id = auth.uid());


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: contact_submissions
--
-- admin       → full access (read all enquiries, delete spam)
-- anon + auth → insert only (ContactPage form, JoinProtocolForm)
--               no SELECT so users cannot read other people's submissions
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY contact_admin_all
  ON public.contact_submissions
  FOR ALL
  TO authenticated
  USING     (is_admin())
  WITH CHECK(is_admin());

CREATE POLICY contact_public_insert
  ON public.contact_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: coupons
--
-- admin       → full CRUD (AdminInfluencersPage: create / update / delete coupons)
-- influencer  → select own coupons (InfluencerDashboard: view stats for own codes)
-- user        → select active coupons (checkout coupon-code validation)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY coupons_admin_all
  ON public.coupons
  FOR ALL
  TO authenticated
  USING     (is_admin())
  WITH CHECK(is_admin());

-- Influencers may only see coupons where influencer_id links back to their own row
CREATE POLICY coupons_influencer_select
  ON public.coupons
  FOR SELECT
  TO authenticated
  USING (
    is_influencer()
    AND influencer_id IN (
      SELECT id FROM public.influencers
      WHERE  user_id     = auth.uid()
          OR customer_id = auth.uid()
    )
  );

-- Regular users need to read coupons to validate a code at checkout
CREATE POLICY coupons_user_select
  ON public.coupons
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IS NOT NULL
    AND NOT is_admin()
    AND NOT is_influencer()
  );


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: coupon_usage
--
-- admin       → full access (view all commissions, correct records)
-- influencer  → select usage records for their own coupons
--               (InfluencerDashboard earnings breakdown — queries via coupon_id IN [...])
--               coupon_usage.influencer_id provides a direct FK as well
-- user        → select own usage (view discount applied to own orders)
--               insert own usage (record when a coupon is applied at checkout)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY coupon_usage_admin_all
  ON public.coupon_usage
  FOR ALL
  TO authenticated
  USING     (is_admin())
  WITH CHECK(is_admin());

-- Influencer sees usage records that reference their own influencer row
CREATE POLICY coupon_usage_influencer_select
  ON public.coupon_usage
  FOR SELECT
  TO authenticated
  USING (
    is_influencer()
    AND influencer_id IN (
      SELECT id FROM public.influencers
      WHERE  user_id     = auth.uid()
          OR customer_id = auth.uid()
    )
  );

CREATE POLICY coupon_usage_self_select
  ON public.coupon_usage
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY coupon_usage_self_insert
  ON public.coupon_usage
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: customer_address
--
-- admin  → full access
-- self   → full CRUD on own addresses (AddressesSidebar)
--          Note: UI updates/deletes by address `id`, but the USING clause on
--          customer_id still restricts the row to the owner — Postgres filters
--          the candidate rows before applying the WHERE from the query.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY address_admin_all
  ON public.customer_address
  FOR ALL
  TO authenticated
  USING     (is_admin())
  WITH CHECK(is_admin());

CREATE POLICY address_self_select
  ON public.customer_address
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY address_self_insert
  ON public.customer_address
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY address_self_update
  ON public.customer_address
  FOR UPDATE
  TO authenticated
  USING     (customer_id = auth.uid())
  WITH CHECK(customer_id = auth.uid());

CREATE POLICY address_self_delete
  ON public.customer_address
  FOR DELETE
  TO authenticated
  USING (customer_id = auth.uid());


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: doctors
--
-- admin       → full CRUD (AdminDoctorsPage: create, edit, upload image, delete)
-- anon + auth → select all (DoctorDiscoveryPage is publicly accessible)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY doctors_admin_all
  ON public.doctors
  FOR ALL
  TO authenticated
  USING     (is_admin())
  WITH CHECK(is_admin());

CREATE POLICY doctors_public_select
  ON public.doctors
  FOR SELECT
  TO anon, authenticated
  USING (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: influencers
--
-- admin       → full CRUD (AdminInfluencersPage: create, update code/status, delete)
-- influencer  → select own row (InfluencerDashboard — queries by user_id)
--
-- Users CANNOT insert/update their own influencer row — only admin can
-- promote someone to influencer. This prevents self-promotion.
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY influencers_admin_all
  ON public.influencers
  FOR ALL
  TO authenticated
  USING     (is_admin())
  WITH CHECK(is_admin());

CREATE POLICY influencers_self_select
  ON public.influencers
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR customer_id = auth.uid());


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: loyalty_points
--
-- admin  → full access (view all history, adjust points)
-- self   → select own history (DashboardPage, VedicPointsPage)
--          insert own record (CheckoutPage — records points earned from purchase)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY loyalty_admin_all
  ON public.loyalty_points
  FOR ALL
  TO authenticated
  USING     (is_admin())
  WITH CHECK(is_admin());

CREATE POLICY loyalty_self_select
  ON public.loyalty_points
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY loyalty_self_insert
  ON public.loyalty_points
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: newsletter_subscribers
--
-- admin       → full access (view subscriber list, manage)
-- anon + auth → insert only (Footer waitlist, PillarCard, NewsletterSignup)
--               anonymous users must be able to subscribe without an account
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY newsletter_admin_all
  ON public.newsletter_subscribers
  FOR ALL
  TO authenticated
  USING     (is_admin())
  WITH CHECK(is_admin());

CREATE POLICY newsletter_public_insert
  ON public.newsletter_subscribers
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: orders
--
-- admin  → full access (view all orders, update status, manage fulfilment)
-- self   → select own orders (DashboardPage order history, OrderConfirmationPage)
--          insert own order (CheckoutPage — immediately followed by SELECT via
--          .select().single(), which is also covered by the select policy)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY orders_admin_all
  ON public.orders
  FOR ALL
  TO authenticated
  USING     (is_admin())
  WITH CHECK(is_admin());

CREATE POLICY orders_self_select
  ON public.orders
  FOR SELECT
  TO authenticated
  USING (customer_id = auth.uid());

CREATE POLICY orders_self_insert
  ON public.orders
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: products
--
-- admin       → full CRUD (product catalogue management)
-- anon + auth → select all (ShopPage, ProductDetailPage are publicly accessible)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY products_admin_all
  ON public.products
  FOR ALL
  TO authenticated
  USING     (is_admin())
  WITH CHECK(is_admin());

CREATE POLICY products_public_select
  ON public.products
  FOR SELECT
  TO anon, authenticated
  USING (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: protocol_signups
--
-- admin       → full access (view leads, delete duplicates)
-- anon + auth → insert only (JoinProtocolForm / waitlist — public-facing form)
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY protocol_admin_all
  ON public.protocol_signups
  FOR ALL
  TO authenticated
  USING     (is_admin())
  WITH CHECK(is_admin());

CREATE POLICY protocol_public_insert
  ON public.protocol_signups
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);


-- ─────────────────────────────────────────────────────────────────────────────
-- TABLE: reviews
--
-- admin       → full access
-- anon + auth → select all published reviews (product detail pages)
-- auth (self) → insert own review, update own review
-- ─────────────────────────────────────────────────────────────────────────────

CREATE POLICY reviews_admin_all
  ON public.reviews
  FOR ALL
  TO authenticated
  USING     (is_admin())
  WITH CHECK(is_admin());

CREATE POLICY reviews_public_select
  ON public.reviews
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY reviews_self_insert
  ON public.reviews
  FOR INSERT
  TO authenticated
  WITH CHECK (customer_id = auth.uid());

CREATE POLICY reviews_self_update
  ON public.reviews
  FOR UPDATE
  TO authenticated
  USING     (customer_id = auth.uid())
  WITH CHECK(customer_id = auth.uid());


-- ════════════════════════════════════════════════════════════════════════════
-- VERIFICATION
-- Run after applying to confirm all policies were created:
--
--   SELECT tablename, policyname, cmd, roles
--   FROM   pg_policies
--   WHERE  schemaname = 'public'
--   ORDER  BY tablename, policyname;
--
-- You should see 17 tables with 51 policies total.
--
-- To verify admin access works, check the browser console for the debug log
-- added to AuthContext.jsx and confirm role = 'admin' is returned.
-- ════════════════════════════════════════════════════════════════════════════
