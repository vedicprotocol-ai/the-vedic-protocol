import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import useScrollReveal from '@/hooks/useScrollReveal';

// ─── Data ─────────────────────────────────────────────────────────────────────

const CREDENTIALS = [
  { abbr: 'BAMS', full: 'Bachelor of Ayurvedic Medicine & Surgery' },
  { abbr: 'MD', full: 'Post-Graduate, Ayurvedic Medicine' },
  { abbr: 'PhD', full: 'Ayurvedic Kayachikitsa — Clinical Therapeutics' },
];

const STANDARDS = [
  {
    number: '01',
    title: 'Food-grade. No exceptions.',
    body: 'Every active in our formulations — Bhringraj, Amalaki, Wrightia tinctoria, Ashwagandha — is a food. Consumed in Ayurvedic medicine for centuries. Safe enough to ingest. The question we ask before adding anything is simple: would I be comfortable if a patient swallowed this? If the answer is no, it does not go in.',
  },
  {
    number: '02',
    title: 'Patent-protected science.',
    body: 'Dr. Sonam has filed 10+ patents across Ayurvedic formulation and therapeutics, including patents in metabolic disease management. Several are already granted. This is not a cosmetics company that added a scientist to its advisory board. The scientist built the company.',
  },
  {
    number: '03',
    title: 'Built from clinical observation.',
    body: 'Our formulations are not assembled from published research papers. They are built from what Dr. Sonam observed working — across years of clinical practice, treating patients presenting with the exact conditions our formulations address: hair fall, dandruff, scalp inflammation. We are currently conducting structured observations across 100+ patients to validate performance across different skin and scalp types.',
  },
  {
    number: '04',
    title: 'Zero synthetics.',
    body: 'No sulphates. No synthetic preservatives. No petrochemical derivatives. Not because they are trending out of favour — because they have never met our standard. Every formulation decision is governed by the same rule it started with.',
  },
];

const DIFFERENTIATORS = [
  { stat: '10+', label: 'Patents filed' },
  { stat: 'PhD', label: 'Founded and formulated' },
  { stat: '100+', label: 'Patients under clinical observation' },
  { stat: '5000', label: 'Years of Ayurvedic pharmacology' },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function AboutPage() {
  useScrollReveal();

  return (
    <>
      <Helmet>
        <title>About — The Vedic Protocol</title>
        <meta
          name="description"
          content="The Vedic Protocol is an engineering brand founded by Dr. Sonam — PhD in Ayurvedic Kayachikitsa, patent holder, and clinical formulator. Food-grade. Zero synthetics. Rooted in the Charaka Samhita."
        />
        <link rel="canonical" href="https://thevedicprotocol.com/about" />
      </Helmet>

      <Header />

      <main>

        {/* ── HERO ──────────────────────────────────────────────────────────── */}
        <section className="about-hero reveal">
          <div className="container about-hero__inner">
            <p className="section-label">Our foundation</p>
            <h1 className="about-hero__h1">
              Most beauty brands start<br />
              with a mood board.<br />
              <em>We started with a laboratory.</em>
            </h1>
            <p className="about-hero__sub">
              The Vedic Protocol is a formulation-first, engineering-led
              brand. Every product begins with a clinical question.
              The answer has to work before it reaches you.
            </p>
          </div>
          <div className="about-hero__divider" aria-hidden="true" />
        </section>

        {/* ── ENGINEERING BRAND STATEMENT ───────────────────────────────────── */}
        <section className="about-engineering reveal">
          <div className="container about-engineering__inner">
            <div className="about-engineering__left">
              <p className="section-label">Who we are</p>
              <h2 className="section-h2">
                An engineering brand.<br />
                <em>Not a marketing one.</em>
              </h2>
            </div>
            <div className="about-engineering__right">
              <p>
                The Vedic Protocol was not built around a gap in the market.
                It was built around a gap in the science — the space between
                what classical Ayurvedic pharmacology actually prescribes and
                what the cosmetics industry claims to deliver.
              </p>
              <p>
                We do not run ads to make our products shine. We run clinical
                observations to make sure they work. We do not have a marketing
                brief. We have a formulation standard. The difference is everything.
              </p>
              <p>
                Every decision — every active, every ratio, every extraction
                method — is governed by one question: does it work, and is it
                safe enough to eat?
              </p>
            </div>
          </div>
        </section>

        {/* ── STATS STRIP ───────────────────────────────────────────────────── */}
        <section className="about-stats reveal">
          <div className="container about-stats__grid">
            {DIFFERENTIATORS.map((d) => (
              <div key={d.stat} className="about-stats__item">
                <span className="about-stats__number">{d.stat}</span>
                <span className="about-stats__label">{d.label}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ── DR. SONAM ─────────────────────────────────────────────────────── */}
        <section className="about-founder reveal">
          <div className="container about-founder__inner">

            <div className="about-founder__portrait">
              <div className="about-founder__monogram" aria-hidden="true">
                <span>S</span>
              </div>
              <div className="about-founder__creds">
                {CREDENTIALS.map((c) => (
                  <div key={c.abbr} className="about-founder__cred">
                    <span className="about-founder__cred-abbr">{c.abbr}</span>
                    <span className="about-founder__cred-full">{c.full}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="about-founder__copy">
              <p className="section-label">The founder</p>
              <h2 className="section-h2">
                Dr. Sonam.<br />
                <em>Physician. Formulator. Patent holder.</em>
              </h2>
              <p>
                Dr. Sonam holds a BAMS, MD, and PhD in Ayurvedic
                Kayachikitsa — the classical branch of Ayurveda concerned
                with internal medicine and clinical therapeutics. She has
                spent her career treating patients, not building a brand.
              </p>
              <p>
                That changed when she kept observing the same thing: the
                formulations described in the Charaka Samhita and Ashtanga
                Hridayam produced measurable clinical outcomes — but only
                when made to the correct standard. What the market offered
                was not that standard.
              </p>
              <p>
                So she built it herself. To date, Dr. Sonam has filed 10+
                patents across Ayurvedic formulation and therapeutics,
                including patents in metabolic disease management. Several
                are already granted. This is not a cosmetics company that
                added a scientist to its advisory board.
              </p>
              <p className="about-founder__emphasis">
                The scientist built the company.
              </p>
            </div>

          </div>
        </section>

        {/* ── FOUR STANDARDS ────────────────────────────────────────────────── */}
        <section className="about-standards reveal">
          <div className="container">
            <div className="about-standards__header">
              <p className="section-label">The standard</p>
              <h2 className="section-h2">
                Every formulation is held<br />
                <em>to the same four rules.</em>
              </h2>
            </div>
            <div className="about-standards__grid">
              {STANDARDS.map((s) => (
                <article key={s.number} className="about-standard-card">
                  <span className="about-standard-card__number">{s.number}</span>
                  <h3 className="about-standard-card__title">{s.title}</h3>
                  <p className="about-standard-card__body">{s.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* ── FOOD GRADE CALLOUT ────────────────────────────────────────────── */}
        <section className="about-foodgrade reveal">
          <div className="container about-foodgrade__inner">
            <p className="section-label">The formulation rule</p>
            <h2 className="section-h2">
              If you cannot eat it,<br />
              <em>it is not in our formulations.</em>
            </h2>
            <p className="about-foodgrade__body">
              This is not a marketing claim. It is the actual standard every
              TVP product is held to before it is made. Bhringraj,
              Amalaki, Ashwagandha, Wrightia tinctoria — these are foods.
              They have been consumed in Ayurvedic medicine for centuries.
              No sulphates. No synthetic preservatives. No petrochemical
              derivatives. Not because they are trending out of favour.
              Because they have never met this standard.
            </p>
          </div>
        </section>

        {/* ── RESEARCH ──────────────────────────────────────────────────────── */}
        <section className="about-research reveal">
          <div className="container about-research__inner">
            <div className="about-research__copy">
              <p className="section-label">The research</p>
              <h2 className="section-h2">
                Built from what<br />
                <em>actually works.</em>
              </h2>
              <p>
                Our formulations are not assembled from published papers.
                They are built from what Dr. Sonam observed working —
                across years of clinical practice, treating patients
                presenting with the exact conditions our formulations
                address: hair fall, dandruff, scalp inflammation,
                seborrhoeic patterns.
              </p>
              <p>
                We are currently conducting structured clinical observations
                across 100+ patients to validate formulation performance
                across different skin and scalp types. The products you
                receive are the outcome of that process — not the beginning
                of it.
              </p>
              <Link to="/science" className="btn btn-outline about-research__cta">
                Explore the Science
              </Link>
            </div>
            <div className="about-research__aside">
              <blockquote className="about-research__quote">
                <p>
                  "The Charaka Samhita prescribed these formulations
                  for a reason. We spent years finding that reason in
                  the data."
                </p>
                <cite>— Dr. Sonam, Founder & Chief Formulator</cite>
              </blockquote>
            </div>
          </div>
        </section>

        {/* ── SOCIAL IMPACT ─────────────────────────────────────────────────── */}
        <section className="about-impact reveal">
          <div className="container about-impact__inner">
            <p className="section-label">Our commitment</p>
            <h2 className="section-h2">
              ₹10 from every product.<br />
              <em>Invested in the next generation.</em>
            </h2>
            <p>
              For every formulation sold, ₹10 goes directly to women's
              education and underprivileged children. Not a percentage.
              A fixed, unconditional amount per product — because the
              number should not depend on how well we are doing
              commercially. This commitment begins with the first product sold.
            </p>
            <Link to="/social-impact" className="btn btn-outline">
              Learn More
            </Link>
          </div>
        </section>

        {/* ── CLOSING CTA ───────────────────────────────────────────────────── */}
        <section className="about-closing reveal">
          <div className="container about-closing__inner">
            <p className="section-label">The protocol</p>
            <h2 className="section-h2">
              Rooted in 5,000 years.<br />
              <em>Held to a food-grade standard.</em>
            </h2>
            <p className="about-closing__body">
              Patent-protected. Clinically formulated. Founded by a
              practising physician who treated patients before she
              launched a brand. That is the only brief we have ever
              worked from.
            </p>
            <div className="about-closing__actions">
              <Link to="/shop" className="btn btn-dark">
                Explore the Collection
              </Link>
              <Link to="/science" className="btn btn-outline">
                Explore the Science
              </Link>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}