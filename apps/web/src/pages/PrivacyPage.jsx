/* ═══════════════════════════════════════════════
   PRIVACY POLICY PAGE
   ═══════════════════════════════════════════════ */
import React from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const Section = ({ title, children }) => (
  <div style={{ marginBottom: '40px' }}>
    <h2 style={{ fontFamily: 'var(--serif)', fontSize: '20px', fontWeight: 400, color: 'var(--ink)', marginBottom: '12px' }}>
      {title}
    </h2>
    <div style={{ fontSize: '14px', color: 'var(--ink-3)', lineHeight: 1.9 }}>
      {children}
    </div>
  </div>
);

const PrivacyPage = () => (
  <>
    <Helmet>
      <title>Privacy Policy | The Vedic Protocol</title>
      <meta name="description" content="Privacy Policy for The Vedic Protocol — how we collect, use, and protect your personal data." />
      <link rel="canonical" href="https://www.thevedicprotocol.com/privacy" />
    </Helmet>
    <Header />
    <main id="main">
      <div className="page-hero">
        <p className="page-hero-label">Legal</p>
        <h1>Privacy<br /><em>Policy.</em></h1>
        <p className="page-hero-sub">How we collect, use, and protect your personal information.</p>
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '80px 40px 100px' }}>
        <p style={{ fontSize: '12px', color: 'var(--ink-4)', marginBottom: '48px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Last updated: April 2026
        </p>

        <Section title="1. Who We Are">
          <p>The Vedic Protocol ("we", "our", "us") operates thevedicprotocol.com. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website or make a purchase. Please read it carefully.</p>
        </Section>

        <Section title="2. Information We Collect">
          <p><strong style={{ color: 'var(--ink)' }}>Information you provide directly:</strong></p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
            <li style={{ marginBottom: '6px' }}>Account registration: name, email address, phone number, password</li>
            <li style={{ marginBottom: '6px' }}>Orders: shipping address, payment details (processed securely; we do not store card numbers)</li>
            <li style={{ marginBottom: '6px' }}>Contact forms: name, email, and message content</li>
            <li style={{ marginBottom: '6px' }}>Newsletter sign-ups: email address</li>
          </ul>
          <p style={{ marginTop: '12px' }}><strong style={{ color: 'var(--ink)' }}>Information collected automatically:</strong></p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
            <li style={{ marginBottom: '6px' }}>Browser type, operating system, and device information</li>
            <li style={{ marginBottom: '6px' }}>Pages visited, time spent on pages, and referring URLs</li>
            <li style={{ marginBottom: '6px' }}>IP address and approximate geographic location</li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <ul style={{ paddingLeft: '20px' }}>
            <li style={{ marginBottom: '6px' }}>To process and fulfil your orders and send order-related communications</li>
            <li style={{ marginBottom: '6px' }}>To create and manage your account</li>
            <li style={{ marginBottom: '6px' }}>To administer the Vedic Points loyalty programme</li>
            <li style={{ marginBottom: '6px' }}>To send marketing emails when you have opted in (you may unsubscribe at any time)</li>
            <li style={{ marginBottom: '6px' }}>To respond to customer service enquiries</li>
            <li style={{ marginBottom: '6px' }}>To improve and personalise the Site experience</li>
            <li style={{ marginBottom: '6px' }}>To comply with legal obligations</li>
          </ul>
        </Section>

        <Section title="4. Sharing Your Information">
          <p>We do not sell your personal data. We may share information with:</p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
            <li style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--ink)' }}>Service providers</strong> — payment processors, shipping carriers, email platforms (e.g. Brevo), and hosting providers (Supabase, Vercel) who process data on our behalf under data processing agreements</li>
            <li style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--ink)' }}>Legal authorities</strong> — when required by applicable law or to protect our legal rights</li>
            <li style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--ink)' }}>Business transfers</strong> — in the event of a merger, acquisition, or sale of assets</li>
          </ul>
        </Section>

        <Section title="5. Cookies and Tracking">
          <p>We use cookies and similar technologies to keep you logged in, remember your cart, and analyse Site usage. You may disable cookies in your browser settings, but some features of the Site may not function correctly as a result.</p>
        </Section>

        <Section title="6. Data Retention">
          <p>We retain your personal data for as long as your account is active or as needed to provide services and comply with legal obligations. You may request deletion of your account and associated data by contacting us at <a href="mailto:support@thevedicprotocol.com" style={{ color: 'var(--gold)' }}>support@thevedicprotocol.com</a>.</p>
        </Section>

        <Section title="7. Security">
          <p>We implement industry-standard technical and organisational measures to protect your data, including encrypted data transmission (TLS), secure authentication via Supabase, and restricted access controls. No method of transmission over the internet is 100% secure; we cannot guarantee absolute security.</p>
        </Section>

        <Section title="8. Your Rights">
          <p>Depending on your location, you may have the right to:</p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
            <li style={{ marginBottom: '6px' }}>Access the personal data we hold about you</li>
            <li style={{ marginBottom: '6px' }}>Correct inaccurate data</li>
            <li style={{ marginBottom: '6px' }}>Request deletion of your data</li>
            <li style={{ marginBottom: '6px' }}>Withdraw consent for marketing communications at any time</li>
          </ul>
          <p style={{ marginTop: '12px' }}>To exercise any of these rights, contact us at <a href="mailto:support@thevedicprotocol.com" style={{ color: 'var(--gold)' }}>support@thevedicprotocol.com</a>.</p>
        </Section>

        <Section title="9. Children's Privacy">
          <p>Our Site is not directed at children under the age of 18. We do not knowingly collect personal data from minors. If you believe a child has provided us with personal information, please contact us and we will delete it.</p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page with a revised "Last updated" date. Continued use of the Site after changes constitutes acceptance of the updated policy.</p>
        </Section>

        <Section title="11. Contact">
          <p>Questions or concerns about this Privacy Policy? Contact us at <a href="mailto:support@thevedicprotocol.com" style={{ color: 'var(--gold)' }}>support@thevedicprotocol.com</a>.</p>
        </Section>
      </div>
    </main>
    <Footer />
  </>
);

export default PrivacyPage;
