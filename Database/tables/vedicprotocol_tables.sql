--
-- VedicProtocol Tables (Schema: public)
-- All application tables for The Vedic Protocol
--

--
-- Name: appointments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.appointments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    legacy_id text,
    customer_id uuid,
    doctor_id uuid,
    slot_id uuid,
    name text,
    email text,
    phone text,
    date timestamp with time zone,
    "time" text,
    concerns text,
    status text DEFAULT 'confirmed'::text,
    notes text,
    created timestamp with time zone DEFAULT now(),
    updated timestamp with time zone DEFAULT now()
);


--
-- Name: availability_slots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.availability_slots (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    legacy_id text,
    doctor_id uuid,
    date timestamp with time zone,
    "time" text,
    is_booked boolean DEFAULT false,
    created timestamp with time zone DEFAULT now(),
    updated timestamp with time zone DEFAULT now()
);


--
-- Name: blog_posts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.blog_posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    legacy_id text,
    title text NOT NULL,
    slug text,
    excerpt text,
    content text,
    author text,
    category text,
    type text,
    read_time text,
    image_url text,
    related_category text,
    published boolean DEFAULT false,
    published_at timestamp with time zone,
    created timestamp with time zone DEFAULT now(),
    updated timestamp with time zone DEFAULT now()
);


--
-- Name: cart_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.cart_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    legacy_id text,
    customer_id uuid,
    product_id uuid,
    quantity integer DEFAULT 1,
    created timestamp with time zone DEFAULT now(),
    updated timestamp with time zone DEFAULT now()
);


--
-- Name: contact_submissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.contact_submissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    legacy_id text,
    name text,
    email text,
    subject text,
    message text,
    created timestamp with time zone DEFAULT now(),
    updated timestamp with time zone DEFAULT now()
);


--
-- Name: coupon_usage; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupon_usage (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    legacy_id text,
    coupon_id uuid,
    influencer_id uuid,
    customer_id uuid,
    order_id uuid,
    discount_amount numeric DEFAULT 0,
    commission_amount numeric DEFAULT 0,
    created timestamp with time zone DEFAULT now(),
    updated timestamp with time zone DEFAULT now()
);


--
-- Name: coupons; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.coupons (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    legacy_id text,
    code text NOT NULL,
    influencer_id uuid,
    discount_type text DEFAULT 'percent'::text,
    discount_value numeric DEFAULT 0,
    usage_limit integer,
    usage_count integer DEFAULT 0,
    valid_from timestamp with time zone,
    valid_until timestamp with time zone,
    status text DEFAULT 'active'::text,
    created timestamp with time zone DEFAULT now(),
    updated timestamp with time zone DEFAULT now()
);


--
-- Name: customer_address; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customer_address (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    customer_id uuid,
    address text NOT NULL,
    city text NOT NULL,
    state text NOT NULL,
    zip text NOT NULL,
    country text NOT NULL,
    created timestamp with time zone DEFAULT now(),
    updated timestamp with time zone DEFAULT now()
);


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id uuid NOT NULL,
    legacy_id text,
    email text NOT NULL,
    name text,
    phone text,
    vedic_points integer DEFAULT 0,
    tier text DEFAULT 'Bronze'::text,
    role text DEFAULT 'customer'::text,
    created timestamp with time zone DEFAULT now(),
    updated timestamp with time zone DEFAULT now()
);


--
-- Name: doctors; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.doctors (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    legacy_id text,
    name text NOT NULL,
    title text,
    specialization text,
    bio text,
    image_url text,
    experience text,
    languages text,
    created timestamp with time zone DEFAULT now(),
    updated timestamp with time zone DEFAULT now()
);


--
-- Name: influencers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.influencers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    legacy_id text,
    user_id uuid,
    customer_id uuid,
    influencer_code text,
    total_earnings numeric DEFAULT 0,
    vedic_points integer DEFAULT 0,
    status text DEFAULT 'active'::text,
    created timestamp with time zone DEFAULT now(),
    updated timestamp with time zone DEFAULT now()
);


--
-- Name: loyalty_points; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.loyalty_points (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    legacy_id text,
    customer_id uuid,
    points_earned integer DEFAULT 0,
    transaction_type text,
    order_id uuid,
    created timestamp with time zone DEFAULT now(),
    updated timestamp with time zone DEFAULT now()
);


--
-- Name: newsletter_subscribers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.newsletter_subscribers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    legacy_id text,
    email text NOT NULL,
    name text,
    source text,
    created timestamp with time zone DEFAULT now(),
    updated timestamp with time zone DEFAULT now()
);


--
-- Name: orders; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    legacy_id text,
    customer_id uuid,
    items jsonb,
    subtotal numeric,
    shipping numeric,
    tax numeric,
    total numeric,
    status text DEFAULT 'pending'::text,
    shipping_address jsonb,
    payment_method text,
    payment_status text DEFAULT 'pending'::text,
    coupon_code text,
    discount numeric DEFAULT 0,
    notes text,
    created timestamp with time zone DEFAULT now(),
    updated timestamp with time zone DEFAULT now()
);


--
-- Name: products; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    legacy_id text,
    name text NOT NULL,
    description text,
    detailed_description text,
    price numeric NOT NULL,
    category text,
    image_url text,
    stock integer DEFAULT 0,
    ingredients text,
    benefits text,
    how_to_use text,
    featured boolean DEFAULT false,
    created timestamp with time zone DEFAULT now(),
    updated timestamp with time zone DEFAULT now(),
    missing_field text
);


--
-- Name: protocol_signups; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.protocol_signups (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    legacy_id text,
    name text,
    email text,
    phone text,
    message text,
    created timestamp with time zone DEFAULT now(),
    updated timestamp with time zone DEFAULT now()
);


--
-- Name: reviews; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.reviews (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    legacy_id text,
    product_id uuid,
    customer_id uuid,
    rating integer,
    title text,
    comment text,
    created timestamp with time zone DEFAULT now(),
    updated timestamp with time zone DEFAULT now()
);
