/* ═══════════════════════════════════════════════
   COOKIE POLICY PAGE
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

const CookieTable = ({ rows }) => (
  <div style={{ overflowX: 'auto', marginTop: '12px' }}>
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
      <thead>
        <tr>
          {['Cookie Name', 'Provider', 'Purpose', 'Duration'].map((h) => (
            <th key={h} style={{ textAlign: 'left', padding: '8px 12px', borderBottom: '1px solid var(--hr)', color: 'var(--ink)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(([name, provider, purpose, duration], i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? 'transparent' : 'rgba(0,0,0,0.02)' }}>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--hr)', fontFamily: 'monospace', color: 'var(--ink-2)' }}>{name}</td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--hr)', color: 'var(--ink-3)' }}>{provider}</td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--hr)', color: 'var(--ink-3)' }}>{purpose}</td>
            <td style={{ padding: '8px 12px', borderBottom: '1px solid var(--hr)', color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>{duration}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const CookiePolicyPage = () => (
  <>
    <Helmet>
      <title>Cookie Policy | The Vedic Protocol</title>
      <meta name="description" content="Cookie Policy for The Vedic Protocol — what cookies we use, why, and how to control them." />
      <link rel="canonical" href="https://www.thevedicprotocol.com/cookies" />
    </Helmet>
    <Header />
    <main id="main">
      <div className="page-hero">
        <p className="page-hero-label">Legal</p>
        <h1>Cookie<br /><em>Policy.</em></h1>
        <p className="page-hero-sub">What cookies we use, why we use them, and how you can control them.</p>
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '80px 40px 100px' }}>
        <p style={{ fontSize: '12px', color: 'var(--ink-4)', marginBottom: '48px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Last updated: April 2026
        </p>

        <Section title="1. What Are Cookies?">
          <p>Cookies are small text files placed on your device when you visit a website. They allow the site to remember your actions and preferences over a period of time, so you don't have to re-enter them whenever you come back or browse between pages.</p>
        </Section>

        <Section title="2. How We Use Cookies">
          <p>The Vedic Protocol uses cookies to:</p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
            <li style={{ marginBottom: '6px' }}>Keep you signed in to your account</li>
            <li style={{ marginBottom: '6px' }}>Remember the contents of your shopping cart</li>
            <li style={{ marginBottom: '6px' }}>Understand how visitors interact with our site so we can improve it</li>
            <li style={{ marginBottom: '6px' }}>Ensure the security of your session</li>
          </ul>
        </Section>

        <Section title="3. Types of Cookies We Use">
          <p><strong style={{ color: 'var(--ink)' }}>Strictly Necessary Cookies</strong><br />
          These cookies are essential for the website to function. They cannot be switched off. They are usually set in response to actions you take, such as logging in or adding items to your cart.</p>

          <CookieTable rows={[
            ['sb-access-token', 'Supabase', 'Authenticates your session', 'Session'],
            ['sb-refresh-token', 'Supabase', 'Refreshes your authentication token', '1 year'],
            ['cart', 'The Vedic Protocol', 'Stores cart contents across pages', 'Session'],
          ]} />

          <p style={{ marginTop: '24px' }}><strong style={{ color: 'var(--ink)' }}>Functional Cookies</strong><br />
          These cookies enable enhanced functionality and personalisation, such as remembering your preferences. They may be set by us or by third-party providers.</p>

          <CookieTable rows={[
            ['theme-pref', 'The Vedic Protocol', 'Remembers display preferences', '1 year'],
          ]} />

          <p style={{ marginTop: '24px' }}><strong style={{ color: 'var(--ink)' }}>Analytics Cookies</strong><br />
          These cookies help us understand how visitors use our site — which pages are most popular, where users drop off, and how they navigate. All data is aggregated and anonymised.</p>

          <CookieTable rows={[
            ['_ga', 'Google Analytics', 'Distinguishes unique visitors', '2 years'],
            ['_ga_*', 'Google Analytics', 'Persists session state', '2 years'],
            ['_gid', 'Google Analytics', 'Distinguishes users (24 h window)', '24 hours'],
          ]} />
        </Section>

        <Section title="4. Third-Party Cookies">
          <p>Some pages on our site may embed content from or link to third-party services (such as payment gateways or social media platforms). These third parties may set their own cookies subject to their own privacy and cookie policies. We do not control these cookies.</p>
        </Section>

        <Section title="5. How to Manage Cookies">
          <p>You can control and delete cookies through your browser settings. Below are links to instructions for the most common browsers:</p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
            <li style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--ink)' }}>Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
            <li style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--ink)' }}>Safari:</strong> Preferences → Privacy → Manage Website Data</li>
            <li style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--ink)' }}>Firefox:</strong> Options → Privacy &amp; Security → Cookies and Site Data</li>
            <li style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--ink)' }}>Edge:</strong> Settings → Cookies and site permissions</li>
          </ul>
          <p style={{ marginTop: '12px' }}>Please note that disabling strictly necessary cookies will affect the functionality of our site — for example, you may not be able to stay logged in or complete a purchase.</p>
        </Section>

        <Section title="6. Cookie Consent">
          <p>When you first visit our site, you will be asked to consent to non-essential cookies. You may withdraw or adjust your consent at any time by clearing your cookies and revisiting the site, or by contacting us directly.</p>
        </Section>

        <Section title="7. Changes to This Policy">
          <p>We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our data practices. We will post any changes on this page with a revised "Last updated" date.</p>
        </Section>

        <Section title="8. Contact">
          <p>Questions about how we use cookies? Contact us at <a href="mailto:support@thevedicprotocol.com" style={{ color: 'var(--gold)' }}>support@thevedicprotocol.com</a>.</p>
        </Section>
      </div>
    </main>
    <Footer />
  </>
);

export default CookiePolicyPage;