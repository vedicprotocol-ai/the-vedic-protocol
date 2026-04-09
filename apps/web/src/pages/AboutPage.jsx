/* ═══════════════════════════════════════════════
   ABOUT PAGE
   ═══════════════════════════════════════════════ */
import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

export const AboutPage = () => (
  <>
    <Helmet>
      <title>Our Philosophy | The Vedic Protocol</title>
      <meta name="description" content="The academic and clinical philosophy behind The Vedic Protocol — bridging ancient Ayurvedic wisdom with modern dermatological science. Founded by Dr. Sonam, PhD." />
      <link rel="canonical" href="https://www.thevedicprotocol.com/about" />
      <script type="application/ld+json">{JSON.stringify({
        "@context":"https://schema.org","@type":"AboutPage",
        "name":"Our Philosophy — The Vedic Protocol",
        "description":"Clinical Ayurvedic philosophy built on Dravya (substance), Pramana (evidence), and Anukta (adaptation).",
        "url":"https://www.thevedicprotocol.com/about",
        "mainEntity":{
          "@type":"Person","name":"Dr. Sonam",
          "jobTitle":"Founder & Chief Formulator",
          "knowsAbout":["Ayurvedic Kayachikitsa","Clinical Skincare","Botanical Extracts","Dermatological Science"]
        }
      })}</script>
    </Helmet>
    <Header />
    <main id="main">

      {/* Page Hero */}
      <div className="page-hero">
        <p className="page-hero-label">Philosophy</p>
        <h1>We are not a beauty brand.<br /><em>We are a clinical protocol.</em></h1>
        <p className="page-hero-sub">Bridging ancient botanical wisdom with modern dermatological science through rigorous academic research.</p>
      </div>

      {/* Founder section */}
      <section style={{ maxWidth: 'var(--max)', margin: '0 auto', padding: '80px 40px', display: 'grid', gridTemplateColumns: '2fr 3fr', gap: '80px', alignItems: 'center', borderBottom: '1px solid var(--line)' }} aria-labelledby="founder-about-h2">
        <div style={{ aspectRatio: '4/5', background: 'var(--stone)', overflow: 'hidden', position: 'relative' }}>
          <img
            src="https://horizons-cdn.hostinger.com/bfed98a7-6f91-43f0-8610-351a61a344ed/sonam_photo-oY5Rb.jpeg"
            alt="Dr. Sonam, Founder and Chief Formulator of The Vedic Protocol"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            loading="lazy"
          />
        </div>
        <div>
          <p className="section-label">The Founder</p>
          <h2 id="founder-about-h2" className="section-h2" style={{ marginBottom: '24px' }}>Research-driven<br /><em>formulation.</em></h2>
          <p style={{ fontSize: '14px', color: 'var(--ink-3)', lineHeight: 1.9, marginBottom: '16px' }}>
            The Vedic Protocol was established by a PhD scholar in Ayurvedic Kayachikitsa. Our foundation is built not on trends, but on peer-reviewed research, classical text translation, and clinical trials.
          </p>
          <p style={{ fontSize: '14px', color: 'var(--ink-3)', lineHeight: 1.9, marginBottom: '16px' }}>
            We approach skincare as a science of barrier optimization. Every ingredient is selected based on its documented phytochemical profile and its proven interaction with human skin physiology.
          </p>
          <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--line)' }}>
            <span style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--ink)', fontStyle: 'italic', display: 'block', marginBottom: '4px' }}>Dr. Sonam</span>
            <span style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>PhD · Ayurvedic Kayachikitsa · Founder & Chief Formulator</span>
          </div>
        </div>
      </section>

      {/* Three Principles */}
      <section style={{ background: 'var(--off)', borderBottom: '1px solid var(--line)', padding: '80px 40px' }} aria-labelledby="principles-h2">
        <div style={{ maxWidth: 'var(--max)', margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '80px', alignItems: 'start' }}>
            <div style={{ position: 'sticky', top: '88px' }}>
              <p className="section-label">Clinical Method</p>
              <h2 id="principles-h2" className="section-h2">The three<br /><em>principles.</em></h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
              {[
                { label: 'Dravya', title: 'Substance first.', body: 'A botanical is only as effective as the integrity of its active compounds. We choose the right cultivar, the right harvest season, and the right extraction method for each ingredient — independently verified before it enters a formulation. We utilize advanced extraction technologies like supercritical CO₂ to ensure maximum potency without solvent degradation.' },
                { label: 'Pramana', title: 'Evidence always.', body: 'Classical texts provide the hypothesis. Clinical trials provide the proof. We do not rely on centuries of use alone — every formulation undergoes rigorous stability testing, microbiological screening, and clinical efficacy trials before launch. Every active is included at its clinically proven effective percentage.' },
                { label: 'Anukta', title: 'Adapted for now.', body: 'Modern stressors — pollution, blue light, chronic stress — require adapted solutions. We combine traditional Ayurvedic complexes with contemporary clinical actives like ceramides and peptides to create comprehensive barrier support systems for skin as it actually exists today.' },
              ].map((p, i) => (
                <div key={p.label} style={{ padding: '48px 0', borderBottom: i < 2 ? '1px solid var(--line)' : 'none' }}>
                  <p style={{ fontSize: '10px', fontWeight: 500, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'block', width: '14px', height: '1px', background: 'var(--gold)' }}></span>{p.label}
                  </p>
                  <h3 style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 400, color: 'var(--ink)', marginBottom: '12px' }}>{p.title}</h3>
                  <p style={{ fontSize: '13px', color: 'var(--ink-3)', lineHeight: 1.9 }}>{p.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Closing statement */}
      <section style={{ padding: '100px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: '760px', margin: '0 auto' }}>
          <blockquote style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(22px,3.5vw,38px)', fontWeight: 400, color: 'var(--ink)', lineHeight: 1.3, letterSpacing: '-0.01em', fontStyle: 'italic', marginBottom: '32px' }}>
            "We are not a beauty brand. We are a clinical research protocol dedicated to the optimisation of skin health."
          </blockquote>
          <div style={{ width: '40px', height: '1px', background: 'var(--gold)', margin: '0 auto' }}></div>
        </div>
      </section>

    </main>
    <Footer />
  </>
);

export default AboutPage;