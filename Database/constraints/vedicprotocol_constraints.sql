--
-- VedicProtocol Constraints (Schema: public)
-- Primary key, unique, and foreign key constraints on public schema tables
--

-- ─── Primary Key & Unique Constraints ─────────────────────────────────────────

--
-- Name: customer_address address_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.customer_address
    ADD CONSTRAINT address_pkey PRIMARY KEY (id);


--
-- Name: appointments appointments_legacy_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_legacy_id_key UNIQUE (legacy_id);

--
-- Name: appointments appointments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_pkey PRIMARY KEY (id);


--
-- Name: availability_slots availability_slots_legacy_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.availability_slots
    ADD CONSTRAINT availability_slots_legacy_id_key UNIQUE (legacy_id);

--
-- Name: availability_slots availability_slots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.availability_slots
    ADD CONSTRAINT availability_slots_pkey PRIMARY KEY (id);


--
-- Name: blog_posts blog_posts_legacy_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_legacy_id_key UNIQUE (legacy_id);

--
-- Name: blog_posts blog_posts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_pkey PRIMARY KEY (id);

--
-- Name: blog_posts blog_posts_slug_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.blog_posts
    ADD CONSTRAINT blog_posts_slug_key UNIQUE (slug);


--
-- Name: cart_items cart_items_legacy_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_legacy_id_key UNIQUE (legacy_id);

--
-- Name: cart_items cart_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_pkey PRIMARY KEY (id);


--
-- Name: contact_submissions contact_submissions_legacy_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.contact_submissions
    ADD CONSTRAINT contact_submissions_legacy_id_key UNIQUE (legacy_id);

--
-- Name: contact_submissions contact_submissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.contact_submissions
    ADD CONSTRAINT contact_submissions_pkey PRIMARY KEY (id);


--
-- Name: coupon_usage coupon_usage_legacy_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT coupon_usage_legacy_id_key UNIQUE (legacy_id);

--
-- Name: coupon_usage coupon_usage_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT coupon_usage_pkey PRIMARY KEY (id);


--
-- Name: coupons coupons_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_code_key UNIQUE (code);

--
-- Name: coupons coupons_legacy_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_legacy_id_key UNIQUE (legacy_id);

--
-- Name: coupons coupons_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_pkey PRIMARY KEY (id);


--
-- Name: customers customers_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_email_key UNIQUE (email);

--
-- Name: customers customers_legacy_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_legacy_id_key UNIQUE (legacy_id);

--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: doctors doctors_legacy_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_legacy_id_key UNIQUE (legacy_id);

--
-- Name: doctors doctors_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.doctors
    ADD CONSTRAINT doctors_pkey PRIMARY KEY (id);


--
-- Name: influencers influencers_influencer_code_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.influencers
    ADD CONSTRAINT influencers_influencer_code_key UNIQUE (influencer_code);

--
-- Name: influencers influencers_legacy_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.influencers
    ADD CONSTRAINT influencers_legacy_id_key UNIQUE (legacy_id);

--
-- Name: influencers influencers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.influencers
    ADD CONSTRAINT influencers_pkey PRIMARY KEY (id);


--
-- Name: loyalty_points loyalty_points_legacy_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.loyalty_points
    ADD CONSTRAINT loyalty_points_legacy_id_key UNIQUE (legacy_id);

--
-- Name: loyalty_points loyalty_points_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.loyalty_points
    ADD CONSTRAINT loyalty_points_pkey PRIMARY KEY (id);


--
-- Name: newsletter_subscribers newsletter_subscribers_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_email_key UNIQUE (email);

--
-- Name: newsletter_subscribers newsletter_subscribers_legacy_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_legacy_id_key UNIQUE (legacy_id);

--
-- Name: newsletter_subscribers newsletter_subscribers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.newsletter_subscribers
    ADD CONSTRAINT newsletter_subscribers_pkey PRIMARY KEY (id);


--
-- Name: orders orders_legacy_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_legacy_id_key UNIQUE (legacy_id);

--
-- Name: orders orders_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);


--
-- Name: products products_legacy_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_legacy_id_key UNIQUE (legacy_id);

--
-- Name: products products_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);


--
-- Name: protocol_signups protocol_signups_legacy_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.protocol_signups
    ADD CONSTRAINT protocol_signups_legacy_id_key UNIQUE (legacy_id);

--
-- Name: protocol_signups protocol_signups_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.protocol_signups
    ADD CONSTRAINT protocol_signups_pkey PRIMARY KEY (id);


--
-- Name: reviews reviews_legacy_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_legacy_id_key UNIQUE (legacy_id);

--
-- Name: reviews reviews_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_pkey PRIMARY KEY (id);


-- ─── Foreign Key Constraints ───────────────────────────────────────────────────

--
-- Name: appointments appointments_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;

--
-- Name: appointments appointments_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE SET NULL;

--
-- Name: appointments appointments_slot_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.appointments
    ADD CONSTRAINT appointments_slot_id_fkey FOREIGN KEY (slot_id) REFERENCES public.availability_slots(id) ON DELETE SET NULL;


--
-- Name: availability_slots availability_slots_doctor_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.availability_slots
    ADD CONSTRAINT availability_slots_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.doctors(id) ON DELETE CASCADE;


--
-- Name: cart_items cart_items_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;

--
-- Name: cart_items cart_items_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.cart_items
    ADD CONSTRAINT cart_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;


--
-- Name: coupon_usage coupon_usage_coupon_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT coupon_usage_coupon_id_fkey FOREIGN KEY (coupon_id) REFERENCES public.coupons(id) ON DELETE CASCADE;

--
-- Name: coupon_usage coupon_usage_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT coupon_usage_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;

--
-- Name: coupon_usage coupon_usage_influencer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT coupon_usage_influencer_id_fkey FOREIGN KEY (influencer_id) REFERENCES public.influencers(id) ON DELETE SET NULL;

--
-- Name: coupon_usage coupon_usage_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.coupon_usage
    ADD CONSTRAINT coupon_usage_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: coupons coupons_influencer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.coupons
    ADD CONSTRAINT coupons_influencer_id_fkey FOREIGN KEY (influencer_id) REFERENCES public.influencers(id) ON DELETE SET NULL;


--
-- Name: customer_address customers_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.customer_address
    ADD CONSTRAINT customers_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;

--
-- Name: customers customers_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
-- Note: Links customers to auth.users — cascades delete when auth user is removed.
--
ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: influencers influencers_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.influencers
    ADD CONSTRAINT influencers_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;

--
-- Name: influencers influencers_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.influencers
    ADD CONSTRAINT influencers_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: loyalty_points loyalty_points_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.loyalty_points
    ADD CONSTRAINT loyalty_points_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;

--
-- Name: loyalty_points loyalty_points_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.loyalty_points
    ADD CONSTRAINT loyalty_points_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;


--
-- Name: orders orders_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;


--
-- Name: reviews reviews_customer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE SET NULL;

--
-- Name: reviews reviews_product_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--
ALTER TABLE ONLY public.reviews
    ADD CONSTRAINT reviews_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
