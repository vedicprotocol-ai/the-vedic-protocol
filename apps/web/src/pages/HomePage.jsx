import React from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import NewsletterSignup from '@/components/NewsletterSignup.jsx';

/* ─── Static journal preview data (replace with real PocketBase fetch later) ─── */
const JOURNAL_PREVIEW = [
  {
    slug: 'what-is-ashwagandha',
    type: 'journal',
    title: 'What is Ashwagandha — and why does it belong in your skincare?',
    excerpt: 'The adaptogen your grandmother knew. The clinical evidence that explains why she was right.',
    readTime: 5,
    image: 'https://horizons-cdn.hostinger.com/bfed98a7-6f91-43f0-8610-351a61a344ed/dc36f7bdd881025ed358489b7e56e95f.png',
  },
  {
    slug: 'charaka-samhita-modern-skin',
    type: 'research',
    title: 'The Charaka Samhita on skin health — a clinical reading',
    excerpt: 'A PhD-level breakdown of what ancient Ayurvedic texts actually say about the skin barrier, and how it maps to modern dermatology.',
    readTime: 12,
    image: 'https://horizons-cdn.hostinger.com/bfed98a7-6f91-43f0-8610-351a61a344ed/dc36f7bdd881025ed358489b7e56e95f.png',
  },
  {
    slug: 'scalp-microbiome-ayurveda',
    type: 'journal',
    title: 'Your scalp microbiome: what Ayurveda got right 3,000 years ago',
    excerpt: 'Modern science is catching up to what Sushruta described as Shleshma in hair health. Here is how they connect.',
    readTime: 7,
    image: 'https://horizons-cdn.hostinger.com/bfed98a7-6f91-43f0-8610-351a61a344ed/dc36f7bdd881025ed358489b7e56e95f.png',
  },
];

/* ─── Small reusable CheckIcon ─── */
const CheckIcon = () => (
  <div className="hp-check-icon" aria-hidden="true">
    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
      <path d="M1.5 4l2 2 3-3" stroke="#C9A96E" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </div>
);

/* ═══════════════════════════════════════════════════════════════ */

const HomePage = () => (
  <>
    <Helmet>
      <title>The Vedic Protocol | Clinical Ayurvedic Skincare & Haircare</title>
      <meta name="description" content="PhD-formulated, 100% plant-based skincare and haircare rooted in the Charaka Samhita and validated by modern dermatological science." />
      <link rel="canonical" href="https://www.thevedicprotocol.com/" />
      <meta property="og:title" content="The Vedic Protocol | Clinical Ayurvedic Skincare & Haircare" />
      <meta property="og:description" content="Ancient Ayurvedic wisdom, clinically validated. PhD-formulated plant-based skincare and haircare." />
      <meta property="og:url" content="https://www.thevedicprotocol.com/" />
      <meta property="og:type" content="website" />
      <meta name="twitter:card" content="summary_large_image" />
      <script type="application/ld+json">{JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': 'https://www.thevedicprotocol.com/#org',
            name: 'The Vedic Protocol',
            url: 'https://www.thevedicprotocol.com',
            description: 'Clinical Ayurvedic skincare and haircare brand founded by a PhD scholar in Ayurvedic Kayachikitsa.',
            founders: [{ '@type': 'Person', name: 'Dr. Sonam', jobTitle: 'Founder & Chief Formulator' }],
            sameAs: ['https://www.instagram.com/thevedicprotocol', 'https://www.facebook.com/share/1LPdYQNbhb/'],
          },
          {
            '@type': 'FAQPage',
            mainEntity: [
              { '@type': 'Question', name: 'What is The Vedic Protocol?', acceptedAnswer: { '@type': 'Answer', text: 'The Vedic Protocol is a clinical Ayurvedic skincare and haircare brand combining ancient botanical wisdom with modern dermatological science. Every formulation is PhD-formulated and 100% plant-based.' } },
              { '@type': 'Question', name: 'Is The Vedic Protocol cruelty-free and vegan?', acceptedAnswer: { '@type': 'Answer', text: 'Yes. 100% cruelty-free, vegan, and free from synthetic additives.' } },
              { '@type': 'Question', name: 'Who founded The Vedic Protocol?', acceptedAnswer: { '@type': 'Answer', text: 'Dr. Sonam, a PhD scholar in Ayurvedic Kayachikitsa, founded The Vedic Protocol after a decade of clinical research.' } },
            ],
          },
        ],
      })}</script>
    </Helmet>

    <a className="skip" href="#main">Skip to content</a>
    <Header showDoctorsNav={true} />

    <main id="main">

      {/* ══════════════════════════════════════════
          HERO
      ══════════════════════════════════════════ */}
      <section className="hp-hero" aria-labelledby="hero-h1">
        <div className="hp-hero__inner">

          {/* Text column */}
          <div className="hp-hero__text reveal">
            <p className="section-label">Vedic Tradition · Clinical Science</p>
            <h1 id="hero-h1" className="hp-hero__h1">
              Ancient wisdom.<br />
              <em>Clinically precise.</em>
            </h1>
            <p className="hp-hero__body">
              Pure plant-based skincare and haircare drawn from the Charaka Samhita
              and validated by modern dermatological science. Formulations that have
              earned the right to exist.
            </p>
            <div className="hp-hero__actions">
              <Link to="/shop" className="btn btn-dark">Explore the Collection</Link>
              <Link to="/about" className="btn btn-light">Our Philosophy</Link>
            </div>

            {/* Key stats */}
            <div className="hp-hero__stats" aria-label="Key brand facts">
              {[
                ['100%', 'Plant Based'],
                ['PhD', 'Founded'],
                ['Zero', 'Synthetics'],
              ].map(([n, l]) => (
                <div key={l} className="hp-hero__stat">
                  <span className="hp-hero__stat-n">{n}</span>
                  <span className="hp-hero__stat-l">{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Image column */}
          <div className="hp-hero__img-wrap reveal">
            <img
              src="https://horizons-cdn.hostinger.com/bfed98a7-6f91-43f0-8610-351a61a344ed/dc36f7bdd881025ed358489b7e56e95f.png"
              alt="The Vedic Protocol — botanical Ayurvedic ingredients with the gold VP logo mark."
              className="hp-hero__img"
              fetchPriority="high"
            />
            <div className="hp-hero__img-badge">Under Formulation</div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOUR PILLARS
      ══════════════════════════════════════════ */}
      <div className="hp-pillars reveal-stagger" role="list" aria-label="Our four core principles">
        {[
          ['01', 'Your grandmother was right', 'The remedies passed down through generations had clinical reasons behind them. We spent a decade finding them.'],
          ['02', 'Slow is not a flaw', 'Real skin transformation takes weeks, not days. We formulate for the long game — not the before-and-after photo.'],
          ['03', 'Your skin is not a problem', 'It is a living system that responds to what you consistently give it. We make what it actually needs.'],
          ['04', 'Made in India. For everyone.', 'This knowledge was born here. We are just the first to bring it forward with the science to prove why it works.'],
        ].map(([n, t, d]) => (
          <div key={n} role="listitem" className="hp-pillar">
            <span className="hp-pillar__num">{n}</span>
            <strong className="hp-pillar__title">{t}</strong>
            <p className="hp-pillar__body">{d}</p>
          </div>
        ))}
      </div>

      {/* ══════════════════════════════════════════
          WHY WE EXIST
      ══════════════════════════════════════════ */}
      <section className="hp-why reveal" aria-labelledby="why-h2">
        <div className="hp-why__left">
          <p className="section-label">Why We Exist</p>
          <h2 id="why-h2" className="section-h2 hp-why__h2">
            Your skin deserves<br />better than <em>both.</em>
          </h2>
          <p className="hp-why__quote">
            Traditional remedies worked — but nobody knew exactly why. Modern skincare
            knows the science but forgot the whole person. We built the bridge.
          </p>
        </div>
        <div className="hp-why__right">
          <ul className="hp-promises" aria-label="Our three core promises">
            {[
              ['Real ingredients. Real amounts.', 'Every active is dosed to actually work — not listed on the label as a trace amount for marketing purposes.'],
              ['Plant-based, tested not just trusted.', 'We know exactly why each ingredient works. The research is there — we can show you all of it.'],
              ["Nothing your skin doesn't need.", 'No fillers. No synthetic fragrance. No shortcuts. Clean by design, not by marketing.'],
            ].map(([t, d], i) => (
              <li key={i} className="hp-promise">
                <CheckIcon />
                <div>
                  <strong className="hp-promise__title">{t}</strong>
                  <p className="hp-promise__body">{d}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          COLLECTION FEATURE
      ══════════════════════════════════════════ */}
      <section className="hp-collection" aria-labelledby="coll-h2">
        <div className="hp-collection__hero reveal">
          <img
            src="https://horizons-cdn.hostinger.com/bfed98a7-6f91-43f0-8610-351a61a344ed/dc36f7bdd881025ed358489b7e56e95f.png"
            alt="The Vedic Protocol collection — plant-based Ayurvedic ingredients."
            className="hp-collection__bg"
            loading="lazy"
          />
          <div className="hp-collection__overlay" aria-hidden="true" />
          <div className="hp-collection__content">
            <div>
              <p className="section-label hp-collection__label">The Formulations</p>
              <h2 id="coll-h2" className="hp-collection__h2">
                Rooted in ancient texts.<br />
                <em>Proven by science.</em>
              </h2>
            </div>
            <div className="hp-collection__cta-wrap">
              <p className="hp-collection__sub">
                Our debut collection spans clinical skincare and Ayurvedic haircare —
                refined until it meets our uncompromising standard.
              </p>
              <Link to="/shop" className="btn btn-gold">Explore the Collection</Link>
            </div>
          </div>
        </div>

        {/* Category cards */}
        <div className="hp-cats reveal-stagger">
          {[
            { n: '01', t: 'Clinical', em: 'Skincare', products: ['Serums & Actives', 'Barrier Moisturisers', 'Gentle Cleansers'], link: '/shop?category=skincare' },
            { n: '02', t: 'Ayurvedic', em: 'Haircare', products: ['Scalp Serums', 'Hair Oils & Elixirs', 'Botanical Shampoos'], link: '/shop?category=haircare' },
          ].map((c) => (
            <article key={c.n} className="hp-cat" aria-label={`${c.t} ${c.em}`}>
              <span className="hp-cat__bg-num" aria-hidden="true">{c.n}</span>
              <h3 className="hp-cat__title">
                {c.t}<br /><em>{c.em}</em>
              </h3>
              <ul className="hp-cat__list">
                {c.products.map((p) => (
                  <li key={p} className="hp-cat__item">
                    <span className="hp-cat__dot" aria-hidden="true" />
                    {p}
                  </li>
                ))}
              </ul>
              <Link to={c.link} className="btn btn-dark btn-sm">Shop {c.em}</Link>
            </article>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          DAILY RITUAL
      ══════════════════════════════════════════ */}
      <section className="hp-ritual" aria-labelledby="ritual-h2">
        <div className="hp-ritual__inner">

          {/* Sticky left column */}
          <div className="hp-ritual__sticky reveal">
            <p className="section-label">The honest truth</p>
            <h2 id="ritual-h2" className="section-h2 hp-ritual__h2">
              You already knew<br /><em>what worked.</em>
            </h2>
            <p className="hp-ritual__body">
              Your grandmother did not have a 12-step routine. She had two or three things
              she used consistently, for years, that she trusted completely. Her skin was
              fine. We stopped trusting what we grew up with — and spent a fortune
              replacing it with things that mostly did not work either.
              The protocol is not complicated. It never was.
            </p>
            <Link to="/about" className="btn btn-dark">Our Philosophy</Link>
          </div>

          {/* Steps */}
          <ol className="hp-ritual__steps reveal" aria-label="The Vedic Protocol approach">
            {[
              ['Less', 'Three things done well beat ten things done poorly', "Most skincare routines fail not because the products are wrong — but because there are too many of them. Consistency with the right three formulations outperforms any ten-step routine."],
              ['Consistent', 'Your skin responds to what you repeat, not what you try once', 'Real results take six to eight weeks of daily use. Anyone telling you otherwise is selling you something.'],
              ['Honest', 'If it is not working, we want to know', 'Different skin types respond differently. We would rather you find what works for you than stay loyal to something that does not.'],
              ['Simple', 'Cleanse. Treat. Leave it alone', 'The elaborate ritual is the marketing. The result comes from two or three formulations, used every day, that your skin actually recognises.'],
            ].map(([n, t, d]) => (
              <li key={n} className="hp-step">
                <span className="hp-step__num">{n}</span>
                <div>
                  <strong className="hp-step__title">{t}</strong>
                  <p className="hp-step__body">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FOUNDER
      ══════════════════════════════════════════ */}
      <section className="hp-founder reveal" aria-labelledby="founder-h2">
        {/* Portrait side */}
        <div className="hp-founder__portrait">
          <div className="hp-founder__monogram" aria-hidden="true">
            <span>S</span>
          </div>
          <p className="hp-founder__name-tag">Dr. Sonam · Founder</p>
        </div>

        {/* Text side */}
        <div className="hp-founder__text">
          <p className="section-label">A note from the founder</p>
          <h2 id="founder-h2" className="section-h2 hp-founder__h2">
            I grew up with Ayurveda.<br />
            Then I spent a decade<br />
            <em>proving it worked.</em>
          </h2>
          <p className="hp-founder__para">
            My grandmother had a remedy for everything. Oils, pastes, rituals — all passed
            down through generations without a single clinical study. It worked. But I could
            never explain why, and I could never convince anyone who needed convincing.
          </p>
          <p className="hp-founder__para">
            So I spent ten years getting a PhD in Ayurvedic Kayachikitsa. Not to replace
            what she knew — but to understand it well enough to defend it, and to translate
            it into something that works for anyone.
          </p>
          <div className="hp-founder__sig">
            <em className="hp-founder__sig-name">Dr. Sonam</em>
            <span className="hp-founder__sig-title">PhD · Ayurvedic Kayachikitsa · Founder</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          FROM OUR JOURNAL (new section)
      ══════════════════════════════════════════ */}
      <section className="hp-journal" aria-labelledby="journal-h2">
        <div className="hp-journal__head reveal">
          <div>
            <p className="section-label">From Our Journal</p>
            <h2 id="journal-h2" className="section-h2">
              Ancient wisdom.<br /><em>Explained clearly.</em>
            </h2>
          </div>
          <Link to="/blog" className="btn btn-light hp-journal__all">
            View All Articles
          </Link>
        </div>

        <div className="hp-journal__grid reveal-stagger">
          {JOURNAL_PREVIEW.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="blog-card">
              <div
                className="blog-card__img"
                style={{ backgroundImage: `url(${post.image})` }}
                role="img"
                aria-label={post.title}
              >
                <span className={`badge badge-${post.type}`}>
                  {post.type === 'research' ? 'Research' : 'Journal'}
                </span>
              </div>
              <div className="blog-card__body">
                <h3 className="blog-card__title">{post.title}</h3>
                <p className="blog-card__excerpt">{post.excerpt}</p>
                <div className="blog-card__meta">
                  <span>{post.readTime} min read</span>
                  <span>Dr. Sonam</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          NEWSLETTER / WAITLIST
      ══════════════════════════════════════════ */}
      <div className="reveal">
        <NewsletterSignup />
      </div>

    </main>

    <Footer />
  </>
);

export default HomePage;