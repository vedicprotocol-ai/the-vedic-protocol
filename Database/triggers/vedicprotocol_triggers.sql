--
-- VedicProtocol Triggers (Schema: public)
-- All triggers on public schema tables
--
-- Note: These triggers depend on public.touch_updated() and public.handle_new_user()
-- defined in functions/vedicprotocol_functions.sql
--

--
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: -
-- Description: Fires when a new Supabase auth user is created; calls handle_new_user()
--              to create the corresponding customers row.
--

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
-- Name: appointments trg_touch_appointments; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_touch_appointments
    BEFORE UPDATE ON public.appointments
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated();


--
-- Name: availability_slots trg_touch_availability_slots; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_touch_availability_slots
    BEFORE UPDATE ON public.availability_slots
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated();


--
-- Name: blog_posts trg_touch_blog_posts; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_touch_blog_posts
    BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated();


--
-- Name: cart_items trg_touch_cart_items; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_touch_cart_items
    BEFORE UPDATE ON public.cart_items
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated();


--
-- Name: contact_submissions trg_touch_contact_submissions; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_touch_contact_submissions
    BEFORE UPDATE ON public.contact_submissions
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated();


--
-- Name: coupon_usage trg_touch_coupon_usage; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_touch_coupon_usage
    BEFORE UPDATE ON public.coupon_usage
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated();


--
-- Name: coupons trg_touch_coupons; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_touch_coupons
    BEFORE UPDATE ON public.coupons
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated();


--
-- Name: customers trg_touch_customers; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_touch_customers
    BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated();


--
-- Name: doctors trg_touch_doctors; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_touch_doctors
    BEFORE UPDATE ON public.doctors
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated();


--
-- Name: influencers trg_touch_influencers; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_touch_influencers
    BEFORE UPDATE ON public.influencers
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated();


--
-- Name: loyalty_points trg_touch_loyalty_points; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_touch_loyalty_points
    BEFORE UPDATE ON public.loyalty_points
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated();


--
-- Name: newsletter_subscribers trg_touch_newsletter_subscribers; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_touch_newsletter_subscribers
    BEFORE UPDATE ON public.newsletter_subscribers
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated();


--
-- Name: orders trg_touch_orders; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_touch_orders
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated();


--
-- Name: products trg_touch_products; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_touch_products
    BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated();


--
-- Name: protocol_signups trg_touch_protocol_signups; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_touch_protocol_signups
    BEFORE UPDATE ON public.protocol_signups
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated();


--
-- Name: reviews trg_touch_reviews; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_touch_reviews
    BEFORE UPDATE ON public.reviews
    FOR EACH ROW EXECUTE FUNCTION public.touch_updated();
