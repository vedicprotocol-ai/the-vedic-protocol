import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

/* ─── Animated counter hook ────────────────────────────────── */
const useCountUp = (target, duration = 1800, startCounting = false) => {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!startCounting) return;
    let start = null;
    const step = (timestamp) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [startCounting, target, duration]);

  return value;
};

/* ─── Individual animated stat ─────────────────────────────── */
const AnimatedStat = ({ value, suffix = '', label, delay = 0, isActive }) => {
  const [started, setStarted] = useState(false);
  const count = useCountUp(value, 1800, started);

  useEffect(() => {
    if (!isActive || started) return;
    const t = setTimeout(() => setStarted(true), delay);
    return () => clearTimeout(t);
  }, [isActive]);

  return (
    <div className="impact-stat">
      <span className="impact-stat__n">
        {count.toLocaleString('en-IN')}{suffix}
      </span>
      <span className="impact-stat__l">{label}</span>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════ */
const SocialImpactPage = () => {
  /* Trigger counter animation when stats section enters viewport */
  const statsRef = useRef(null);
  const [statsVisible, setStatsVisible] = useState(false);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStatsVisible(true); observer.disconnect(); } },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Helmet>
        <title>Social Impact | The Vedic Protocol</title>
        <meta
          name="description"
          content="₹10 from every product sold goes to women's education and underprivileged children. Because everyone deserves a chance — and one educated woman feeds a whole family."
        />
        <link rel="canonical" href="https://www.thevedicprotocol.com/social-impact" />
      </Helmet>

      <Header />

      <main id="main">

        {/* ══════════════════════════════════════════
            HERO — full bleed dark image
        ══════════════════════════════════════════ */}
        <section className="si-hero reveal" aria-labelledby="si-hero-h1">
          <img
            src="https://horizons-cdn.hostinger.com/bfed98a7-6f91-43f0-8610-351a61a344ed/dc36f7bdd881025ed358489b7e56e95f.png"
            alt="Botanical Ayurvedic ingredients — roots of The Vedic Protocol's social commitment."
            className="si-hero__img"
            fetchPriority="high"
          />
          <div className="si-hero__overlay" aria-hidden="true" />
          <div className="si-hero__content">
            <p className="si-hero__label">Our Commitment</p>
            <h1 id="si-hero-h1" className="si-hero__h1">
              Giving back to<br /><em>where we come from.</em>
            </h1>
            <p className="si-hero__sub">
              ₹10 from every product sold goes to women's education and underprivileged children across India. Not a percentage. Not a pledge. A fixed promise — every single product, every single time.
            </p>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            MISSION STATEMENT
        ══════════════════════════════════════════ */}
        <section className="si-mission reveal" aria-labelledby="si-mission-h2">
          <div className="si-mission__inner">
            <div className="si-mission__left">
              <p className="section-label">The Philosophy</p>
              <h2 id="si-mission-h2" className="section-h2">
                One woman educated<br /><em>feeds the whole family.</em>
              </h2>
            </div>
            <div className="si-mission__right">
              <p className="si-mission__body">
                The Vedic Protocol was built on ancient Indian knowledge — and the women in our
                families who carried that knowledge forward quietly, without recognition, without
                resources. This brand exists because of them. It only makes sense that part of
                what it earns goes back to communities like theirs.
              </p>
              <p className="si-mission__body">
                An educated woman does not just change her own life. She changes her children's lives, her household's trajectory, her community's future. And every child — regardless of where they were born or what their parents earn — deserves a chance at that future.
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            COMMITMENT — what % and what it funds
        ══════════════════════════════════════════ */}
        <section className="si-commitment reveal" aria-labelledby="si-commit-h2">
          <div className="si-commitment__inner">
            <p className="section-label">What We Commit</p>
            <h2 id="si-commit-h2" className="section-h2">
              ₹10 per product.<br /><em>Every time.</em>
            </h2>
            <div className="si-pillars reveal-stagger">
              {[
                {
                  pct: '₹10',
                  title: 'Per product sold',
                  body: 'Not a percentage of revenue. Not rounded up at checkout. ₹10 from every product we sell goes directly to education — fixed, automatic, and non-negotiable. The more we sell, the more we give.',
                },
                {
                  pct: 'She',
                  title: "Women's Education",
                  body: 'Literacy, vocational skills, and access to higher education for women in rural and underserved India. One woman educated changes the trajectory of her entire family — that is not sentiment, it is documented fact.',
                },
                {
                  pct: 'All',
                  title: 'Every Child Deserves a Chance',
                  body: 'School infrastructure, learning materials, and scholarships for children from families below the poverty line. Where you are born should not determine how far you can go.',
                },
              ].map((p) => (
                <div key={p.title} className="si-pillar">
                  <span className="si-pillar__pct">{p.pct}</span>
                  <h3 className="si-pillar__title">{p.title}</h3>
                  <p className="si-pillar__body">{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            IMPACT NUMBERS — animated counters
        ══════════════════════════════════════════ */}
        <section className="si-stats" aria-labelledby="si-stats-h2" ref={statsRef}>
          <div className="si-stats__inner">
            <div className="si-stats__head reveal">
              <p className="section-label">The Count Starts Now</p>
              <h2 id="si-stats-h2" className="section-h2">
                Day one.<br /><em>Sky is the limit.</em>
              </h2>
              <p className="si-stats__sub">
                We are just getting started. Every product sold adds ₹10 to the
                count — and we will publish the real number here, honestly, as it grows.
                No invented figures. No vanity metrics. Just the truth.
              </p>
            </div>
            <div className="si-stats__grid si-stats__grid--aspirational reveal-stagger">
              <div className="impact-stat">
                <span className="impact-stat__n">₹10</span>
                <span className="impact-stat__l">Per product sold</span>
              </div>
              <div className="impact-stat">
                <span className="impact-stat__n">∞</span>
                <span className="impact-stat__l">Girls we intend to reach</span>
              </div>
              <div className="impact-stat">
                <span className="impact-stat__n">0 → ∞</span>
                <span className="impact-stat__l">Children supported so far — growing with every order</span>
              </div>
              <div className="impact-stat">
                <span className="impact-stat__n">Now</span>
                <span className="impact-stat__l">When the counting begins</span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            DR. SONAM'S NOTE
        ══════════════════════════════════════════ */}
        <section className="si-note reveal" aria-labelledby="si-note-h2">
          <div className="si-note__inner">
            <p className="section-label">From the Founder</p>
            <blockquote className="si-note__quote">
              <p className="si-note__text">
                "I grew up in a family where the women worked twice as hard and were given half the
                credit. Education was the thing that changed that — slowly, imperfectly, but
                permanently. The Vedic Protocol gives ₹10 from every product we sell to women
                and children who deserve the same chance. That is not charity. That is
                giving back to where all of this came from."
              </p>
              <footer className="si-note__attr">
                <div className="si-note__monogram" aria-hidden="true"><span>S</span></div>
                <div>
                  <strong className="si-note__name">Dr. Sonam</strong>
                  <span className="si-note__role">PhD · Ayurvedic Kayachikitsa · Founder</span>
                </div>
              </footer>
            </blockquote>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            HOW IT WORKS — simple 3-step
        ══════════════════════════════════════════ */}
        <section className="si-how reveal" aria-labelledby="si-how-h2">
          <div className="si-how__inner">
            <p className="section-label">How It Works</p>
            <h2 id="si-how-h2" className="section-h2">
              Simple.<br /><em>Automatic.</em>
            </h2>
            <ol className="si-steps">
              {[
                ['01', 'You buy a product', '₹10 from that product goes to education. Not from your pocket on top of the price — from what we earn. Built in, not bolted on.'],
                ['02', 'We distribute the funds', 'Funds go to women\'s education and underprivileged children\'s schooling — no split, no hierarchy. Both matter equally. Partner NGOs are vetted personally by Dr. Sonam.'],
                ['03', 'We report here', 'Impact figures are updated on this page every quarter — girls enrolled, schools supported, districts reached. Exact numbers. No rounding up.'],
              ].map(([n, t, d]) => (
                <li key={n} className="si-step">
                  <span className="si-step__num">{n}</span>
                  <div>
                    <strong className="si-step__title">{t}</strong>
                    <p className="si-step__body">{d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* ══════════════════════════════════════════
            CTA — shop and contribute
        ══════════════════════════════════════════ */}
        <section className="si-cta reveal" aria-labelledby="si-cta-h2">
          <div className="si-cta__inner">
            <p className="section-label">Start Your Ritual</p>
            <h2 id="si-cta-h2" className="section-h2 si-cta__h2">
              Buy a formulation.<br /><em>Fund a future.</em>
            </h2>
            <p className="si-cta__sub">
              ₹10 from every product you buy goes to a woman's education or a child's schooling. Your ritual, their future.
            </p>
            <div className="si-cta__actions">
              <Link to="/shop" className="btn btn-dark">Explore the Collection</Link>
              <Link to="/about" className="btn btn-light">Our Philosophy</Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
};

export default SocialImpactPage;