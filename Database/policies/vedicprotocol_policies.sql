--
-- VedicProtocol Row Level Security & Policies (Schema: public)
-- All RLS enable statements and policies for public schema tables
--

-- ─── Enable RLS ────────────────────────────────────────────────────────────────

ALTER TABLE public.appointments          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.availability_slots    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_usage          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.influencers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loyalty_points        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders                ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.protocol_signups      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews               ENABLE ROW LEVEL SECURITY;


-- ─── appointments ──────────────────────────────────────────────────────────────

--
-- Name: appointments appts_self_rw; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY appts_self_rw ON public.appointments
    USING (((customer_id = auth.uid()) OR public.is_admin()))
    WITH CHECK (((customer_id = auth.uid()) OR public.is_admin()));


-- ─── availability_slots ────────────────────────────────────────────────────────

--
-- Name: availability_slots slots_admin_write; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY slots_admin_write ON public.availability_slots
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

--
-- Name: availability_slots slots_auth_update; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY slots_auth_update ON public.availability_slots
    FOR UPDATE
    USING ((auth.uid() IS NOT NULL))
    WITH CHECK ((auth.uid() IS NOT NULL));

--
-- Name: availability_slots slots_public_read; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY slots_public_read ON public.availability_slots
    FOR SELECT USING (true);


-- ─── blog_posts ────────────────────────────────────────────────────────────────

--
-- Name: blog_posts blog_admin_write; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY blog_admin_write ON public.blog_posts
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

--
-- Name: blog_posts blog_public_read; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY blog_public_read ON public.blog_posts
    FOR SELECT USING (((published = true) OR public.is_admin()));


-- ─── cart_items ────────────────────────────────────────────────────────────────

--
-- Name: cart_items cart_self_rw; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY cart_self_rw ON public.cart_items
    USING (((customer_id = auth.uid()) OR public.is_admin()))
    WITH CHECK (((customer_id = auth.uid()) OR public.is_admin()));


-- ─── contact_submissions ───────────────────────────────────────────────────────

--
-- Name: contact_submissions contact_admin; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY contact_admin ON public.contact_submissions
    FOR SELECT USING (public.is_admin());

--
-- Name: contact_submissions contact_insert; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY contact_insert ON public.contact_submissions
    FOR INSERT WITH CHECK (true);


-- ─── coupon_usage ──────────────────────────────────────────────────────────────

--
-- Name: coupon_usage coupon_usage_read; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY coupon_usage_read ON public.coupon_usage
    FOR SELECT USING (((customer_id = auth.uid()) OR public.is_admin()));

--
-- Name: coupon_usage coupon_usage_write; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY coupon_usage_write ON public.coupon_usage
    FOR INSERT WITH CHECK (true);


-- ─── coupons ───────────────────────────────────────────────────────────────────

--
-- Name: coupons coupons_admin; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY coupons_admin ON public.coupons
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

--
-- Name: coupons coupons_public_read; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY coupons_public_read ON public.coupons
    FOR SELECT USING (true);


-- ─── customers ─────────────────────────────────────────────────────────────────

--
-- Name: customers Admins can read all profiles; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY "Admins can read all profiles" ON public.customers
    FOR SELECT USING ((EXISTS (
        SELECT 1 FROM public.customers c
        WHERE ((c.id = auth.uid()) AND (lower(c.role) = 'admin'::text))
    )));

--
-- Name: customers Users can insert own profile; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY "Users can insert own profile" ON public.customers
    FOR INSERT WITH CHECK ((auth.uid() = id));

--
-- Name: customers Users can read own profile; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY "Users can read own profile" ON public.customers
    FOR SELECT USING ((auth.uid() = id));

--
-- Name: customers Users can update own profile; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY "Users can update own profile" ON public.customers
    FOR UPDATE USING ((auth.uid() = id));

--
-- Name: customers customers_admin_all; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY customers_admin_all ON public.customers
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

--
-- Name: customers customers_self_insert; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY customers_self_insert ON public.customers
    FOR INSERT WITH CHECK ((id = auth.uid()));

--
-- Name: customers customers_self_read; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY customers_self_read ON public.customers
    FOR SELECT USING (((id = auth.uid()) OR public.is_admin()));

--
-- Name: customers customers_self_update; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY customers_self_update ON public.customers
    FOR UPDATE USING (((id = auth.uid()) OR public.is_admin()));


-- ─── doctors ───────────────────────────────────────────────────────────────────

--
-- Name: doctors Admin full access; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY "Admin full access" ON public.doctors
    USING ((lower(( SELECT customers.role
       FROM public.customers
      WHERE (customers.id = auth.uid()))) = 'admin'::text));

--
-- Name: doctors doctors_admin_write; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY doctors_admin_write ON public.doctors
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

--
-- Name: doctors doctors_public_read; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY doctors_public_read ON public.doctors
    FOR SELECT USING (true);


-- ─── influencers ───────────────────────────────────────────────────────────────

--
-- Name: influencers influencers_admin; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY influencers_admin ON public.influencers
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

--
-- Name: influencers influencers_self_read; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY influencers_self_read ON public.influencers
    FOR SELECT USING (((customer_id = auth.uid()) OR (user_id = auth.uid()) OR public.is_admin()));


-- ─── loyalty_points ────────────────────────────────────────────────────────────

--
-- Name: loyalty_points loyalty_admin_all; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY loyalty_admin_all ON public.loyalty_points
    FOR UPDATE USING (public.is_admin());

--
-- Name: loyalty_points loyalty_self_ins; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY loyalty_self_ins ON public.loyalty_points
    FOR INSERT WITH CHECK (((customer_id = auth.uid()) OR public.is_admin()));

--
-- Name: loyalty_points loyalty_self_read; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY loyalty_self_read ON public.loyalty_points
    FOR SELECT USING (((customer_id = auth.uid()) OR public.is_admin()));


-- ─── newsletter_subscribers ────────────────────────────────────────────────────

--
-- Name: newsletter_subscribers newsletter_admin; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY newsletter_admin ON public.newsletter_subscribers
    FOR SELECT USING (public.is_admin());

--
-- Name: newsletter_subscribers newsletter_insert; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY newsletter_insert ON public.newsletter_subscribers
    FOR INSERT WITH CHECK (true);


-- ─── orders ────────────────────────────────────────────────────────────────────

--
-- Name: orders orders_self_rw; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY orders_self_rw ON public.orders
    USING (((customer_id = auth.uid()) OR public.is_admin()))
    WITH CHECK (((customer_id = auth.uid()) OR public.is_admin()));


-- ─── products ──────────────────────────────────────────────────────────────────

--
-- Name: products products_admin_write; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY products_admin_write ON public.products
    USING (public.is_admin())
    WITH CHECK (public.is_admin());

--
-- Name: products products_public_read; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY products_public_read ON public.products
    FOR SELECT USING (true);


-- ─── protocol_signups ──────────────────────────────────────────────────────────

--
-- Name: protocol_signups signup_admin; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY signup_admin ON public.protocol_signups
    FOR SELECT USING (public.is_admin());

--
-- Name: protocol_signups signup_insert; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY signup_insert ON public.protocol_signups
    FOR INSERT WITH CHECK (true);


-- ─── reviews ───────────────────────────────────────────────────────────────────

--
-- Name: reviews reviews_public_read; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY reviews_public_read ON public.reviews
    FOR SELECT USING (true);

--
-- Name: reviews reviews_self_write; Type: POLICY; Schema: public; Owner: -
--
CREATE POLICY reviews_self_write ON public.reviews
    USING (((customer_id = auth.uid()) OR public.is_admin()))
    WITH CHECK (((customer_id = auth.uid()) OR public.is_admin()));
