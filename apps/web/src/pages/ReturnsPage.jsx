/* ═══════════════════════════════════════════════
   RETURNS & REFUNDS PAGE
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

const ReturnsPage = () => (
  <>
    <Helmet>
      <title>Returns &amp; Refunds | The Vedic Protocol</title>
      <meta name="description" content="Returns and refund policy for The Vedic Protocol — how to initiate a return and what to expect." />
      <link rel="canonical" href="https://www.thevedicprotocol.com/returns" />
    </Helmet>
    <Header />
    <main id="main">
      <div className="page-hero">
        <p className="page-hero-label">Legal</p>
        <h1>Returns &amp;<br /><em>Refunds.</em></h1>
        <p className="page-hero-sub">Our commitment to your satisfaction — simple, fair, and transparent.</p>
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '80px 40px 100px' }}>
        <p style={{ fontSize: '12px', color: 'var(--ink-4)', marginBottom: '48px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Last updated: April 2026
        </p>

        <Section title="1. Our Return Philosophy">
          <p>Every formulation we create is held to the highest standard of purity and efficacy. If something isn't right, we want to make it right. This policy sets out exactly how we handle returns, exchanges, and refunds.</p>
        </Section>

        <Section title="2. Eligibility">
          <p>We accept returns under the following conditions:</p>
          <ul style={{ paddingLeft: '20px', marginTop: '8px' }}>
            <li style={{ marginBottom: '6px' }}>The item is <strong style={{ color: 'var(--ink)' }}>unopened and unused</strong> in its original packaging</li>
            <li style={{ marginBottom: '6px' }}>The return request is raised within <strong style={{ color: 'var(--ink)' }}>7 days of delivery</strong></li>
            <li style={{ marginBottom: '6px' }}>Proof of purchase (order number or confirmation email) is provided</li>
          </ul>
          <p style={{ marginTop: '12px' }}>We are unable to accept returns of opened or used products, gift cards, or items marked as non-returnable at the time of purchase.</p>
        </Section>

        <Section title="3. Damaged or Incorrect Items">
          <p>If your order arrives damaged, defective, or incorrect, please contact us within <strong style={{ color: 'var(--ink)' }}>48 hours of delivery</strong> with photographs of the item and packaging. We will arrange a replacement or full refund at no cost to you — no need to return the item.</p>
        </Section>

        <Section title="4. How to Initiate a Return">
          <ol style={{ paddingLeft: '20px' }}>
            <li style={{ marginBottom: '10px' }}>Email us at <a href="mailto:support@thevedicprotocol.com" style={{ color: 'var(--gold)' }}>support@thevedicprotocol.com</a> with your order number and reason for return.</li>
            <li style={{ marginBottom: '10px' }}>Our team will respond within 2 business days with a Return Authorisation (RA) number and return instructions.</li>
            <li style={{ marginBottom: '10px' }}>Pack the item securely in its original packaging and ship it to the address provided. Please write the RA number clearly on the outside of the parcel.</li>
            <li style={{ marginBottom: '10px' }}>Once we receive and inspect the item, we will process your refund within 5 business days.</li>
          </ol>
        </Section>

        <Section title="5. Refunds">
          <p>Approved refunds are issued to the <strong style={{ color: 'var(--ink)' }}>original payment method</strong> within 10 business days of us receiving the returned item. Processing times may vary depending on your bank or payment provider.</p>
          <p style={{ marginTop: '12px' }}>Shipping charges are <strong style={{ color: 'var(--ink)' }}>non-refundable</strong> unless the return is due to an error on our part or a defective product.</p>
        </Section>

        <Section title="6. Return Shipping Costs">
          <p>Customers are responsible for return shipping costs unless the return is due to a damaged, defective, or incorrectly fulfilled order. We recommend using a tracked shipping service — we cannot be held responsible for parcels lost in transit.</p>
        </Section>

        <Section title="7. Exchanges">
          <p>We do not offer direct exchanges at this time. If you would like a different product, please return the eligible item for a refund and place a new order.</p>
        </Section>

        <Section title="8. Vedic Points on Returned Orders">
          <p>Vedic Points earned on a returned order will be deducted from your account once the refund is processed. If you used Vedic Points to discount your order, only the amount actually charged will be refunded.</p>
        </Section>

        <Section title="9. Contact">
          <p>For any questions about your return or refund, please contact us at <a href="mailto:support@thevedicprotocol.com" style={{ color: 'var(--gold)' }}>support@thevedicprotocol.com</a>. We aim to respond within 2 business days.</p>
        </Section>
      </div>
    </main>
    <Footer />
  </>
);

export default ReturnsPage;