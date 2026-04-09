import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const ingredients = [];

const SciencePage = () => {
  const [open, setOpen] = useState(null);

  return (
    <>
      <Helmet>
        <title>The Science | The Vedic Protocol</title>
        <meta name="description" content="Explore the clinical methodology behind The Vedic Protocol's formulations. Supercritical CO₂ extraction, in-vivo testing, and classical Ayurvedic pharmacopeia — every active at its proven dose." />
        <link rel="canonical" href="https://www.thevedicprotocol.com/science" />
        <script type="application/ld+json">{JSON.stringify({
          "@context":"https://schema.org","@type":"WebPage",
          "name":"The Science — The Vedic Protocol",
          "description":"Clinical methodology, formulation principles, and ingredient monographs for The Vedic Protocol skincare and haircare.",
          "url":"https://www.thevedicprotocol.com/science",
          "speakable":{ "@type":"SpeakableSpecification","cssSelector":[".science-intro","h1",".science-method"] }
        })}</script>
      </Helmet>
      <Header />
      <main id="main">

        {/* Page Hero */}
        <div className="page-hero">
          <p className="page-hero-label">Methodology</p>
          <h1>Formulation<br /><em>as method.</em></h1>
          <p className="page-hero-sub science-intro">Our approach is systematic, transparent, and rooted in clinical pharmacology. We do not use 'fairy dusting' — every active is included at its clinically proven effective percentage.</p>
        </div>

        {/* Process Steps */}
        <section style={{ borderBottom: '1px solid var(--line)', padding: '80px 40px' }} aria-labelledby="process-h2" className="science-method">
          <div style={{ maxWidth: 'var(--max)', margin: '0 auto' }}>
            <p className="section-label">Our Process</p>
            <h2 id="process-h2" className="section-h2" style={{ marginBottom: '56px' }}>The clinical<br /><em>protocol.</em></h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '0' }}>
              {[
                ['01','Ingredient Selection','Identification of botanicals with documented phytochemical profiles and peer-reviewed efficacy data.'],
                ['02','Classical Reference','Cross-referencing with the Charaka Samhita and Ayurvedic pharmacopeia for synergistic pairings.'],
                ['03','Extraction Method','Supercritical CO₂ extraction to isolate specific active compounds without solvent degradation.'],
                ['04','Modern Validation','In-vitro and in-vivo clinical testing for stability, safety, and efficacy before formulation.'],
              ].map(([n,t,d], i) => (
                <div key={n} style={{ padding: '40px 32px', borderRight: i < 3 ? '1px solid var(--line)' : 'none', borderTop: '2px solid var(--gold)' }}>
                  <div style={{ fontFamily: 'var(--serif)', fontSize: '32px', color: 'var(--line-dk)', marginBottom: '20px', lineHeight: 1 }}>{n}</div>
                  <h3 style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--ink)', marginBottom: '12px' }}>{t}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--ink-3)', lineHeight: 1.75 }}>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Principles */}
        <section style={{ background: 'var(--off)', borderBottom: '1px solid var(--line)', padding: '80px 40px' }} aria-labelledby="principles-h2">
          <div style={{ maxWidth: 'var(--max)', margin: '0 auto' }}>
            <p className="section-label">Formulation Science</p>
            <h2 id="principles-h2" className="section-h2" style={{ marginBottom: '56px' }}>Three<br /><em>non-negotiables.</em></h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '0' }}>
              {[
                ['Stability','Botanical extracts are inherently volatile. We utilize advanced encapsulation technologies and precise pH balancing to ensure active compounds remain stable and potent from the first use to the last drop.'],
                ['Bioavailability','An ingredient is only effective if it can penetrate the stratum corneum. Our formulations employ liposomes and biomimetic lipids to transport actives to their target cellular sites.'],
                ['Synergy','Following the Ayurvedic principle of Samyoga, we formulate with ingredient complexes where the combined effect exceeds the sum of individual parts, maximising efficacy while minimising irritation potential.'],
              ].map(([t,d], i) => (
                <div key={t} style={{ padding: '40px 40px 40px 0', borderLeft: i > 0 ? '1px solid var(--line)' : 'none', paddingLeft: i > 0 ? '40px' : '0' }}>
                  <h3 style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 400, color: 'var(--ink)', marginBottom: '16px', paddingBottom: '16px', borderBottom: '2px solid var(--gold)' }}>{t}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--ink-3)', lineHeight: 1.85 }}>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Ingredient Philosophy */}
        <section style={{ padding: '80px 40px', borderBottom: '1px solid var(--line)' }} aria-labelledby="ingredients-h2">
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <p className="section-label">Our Ingredient Philosophy</p>
            <h2 id="ingredients-h2" className="section-h2" style={{ marginBottom: '20px' }}>
              Every ingredient<br /><em>earns its place.</em>
            </h2>
            <p style={{ fontSize: '15px', color: 'var(--ink-3)', lineHeight: 1.9, fontFamily: 'var(--serif)', fontStyle: 'italic', marginBottom: '56px' }}>
              Our formulations are still in their final stages. What we can tell you is the standard every ingredient must meet before it makes the cut.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {[
                ['Documented phytochemistry', 'Every botanical we consider must have a published phytochemical profile. We need to know exactly which compounds are responsible for the effect — not just that "it works traditionally."'],
                ['Peer-reviewed efficacy', 'We require at least one peer-reviewed in-vitro or in-vivo study demonstrating the specific mechanism of action relevant to our formulation goals. Traditional use is the hypothesis. Clinical evidence is the proof.'],
                ['Extraction integrity', 'The active compounds in a botanical are only as good as the extraction method used to isolate them. We specify extraction method, solvent, and concentration for every ingredient — not just the raw material.'],
                ['Stability validation', 'An ingredient that degrades in the formula before it reaches your skin is useless regardless of its clinical profile. Every active must demonstrate stability within our specific formulation matrix.'],
                ['Dose honesty', 'We formulate at the dose shown to produce an effect in clinical literature. If the effective dose is not commercially viable, we don\'t use the ingredient — we don\'t fairy-dust it for label appeal.'],
              ].map(([t, d], i, arr) => (
                <div key={t} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '40px', padding: '32px 0', borderTop: '1px solid var(--line)', borderBottom: i === arr.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <h3 style={{ fontFamily: 'var(--serif)', fontSize: '17px', fontWeight: 400, color: 'var(--ink)', lineHeight: 1.4 }}>{t}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--ink-3)', lineHeight: 1.85 }}>{d}</p>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '56px', padding: '40px', background: 'var(--off)', border: '1px solid var(--line)' }}>
              <p style={{ fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '12px' }}>Coming Soon</p>
              <p style={{ fontFamily: 'var(--serif)', fontSize: '20px', fontWeight: 400, color: 'var(--ink)', lineHeight: 1.4, marginBottom: '8px' }}>
                Full ingredient monographs will be published at launch.
              </p>
              <p style={{ fontSize: '13px', color: 'var(--ink-3)', lineHeight: 1.8 }}>
                Every formulation will ship with complete transparency — active names, concentrations, extraction methods, and the clinical references behind each inclusion decision.
              </p>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
};

export default SciencePage;