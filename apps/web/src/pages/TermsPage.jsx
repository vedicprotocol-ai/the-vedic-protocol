/* ═══════════════════════════════════════════════
   TERMS OF SERVICE PAGE
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

const TermsPage = () => (
  <>
    <Helmet>
      <title>Terms of Service | The Vedic Protocol</title>
      <meta name="description" content="Terms of Service for The Vedic Protocol — please read before using our website or purchasing our products." />
      <link rel="canonical" href="https://www.thevedicprotocol.com/terms" />
    </Helmet>
    <Header />
    <main id="main">
      <div className="page-hero">
        <p className="page-hero-label">Legal</p>
        <h1>Terms of<br /><em>Service.</em></h1>
        <p className="page-hero-sub">Please read these terms carefully before using our website or placing an order.</p>
      </div>

      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '80px 40px 100px' }}>
        <p style={{ fontSize: '12px', color: 'var(--ink-4)', marginBottom: '48px', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          Last updated: April 2026
        </p>

        <Section title="1. Acceptance of Terms">
          <p>By accessing or using the website at thevedicprotocol.com ("Site") or purchasing any products from The Vedic Protocol ("we", "our", "us"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Site.</p>
        </Section>

        <Section title="2. Products and Orders">
          <p>All products are subject to availability. We reserve the right to discontinue any product at any time. Prices are listed in INR and are subject to change without notice. We reserve the right to refuse or cancel any order at our discretion.</p>
        </Section>

        <Section title="3. Account Registration">
          <p>To place an order you must create an account and provide accurate, current information. You are responsible for maintaining the confidentiality of your account credentials. You must be at least 18 years of age to register and purchase from the Site.</p>
        </Section>

        <Section title="4. Payment">
          <p>We accept the payment methods displayed at checkout. All transactions are processed securely. By submitting an order, you authorise us to charge the total amount to your selected payment method.</p>
        </Section>

        <Section title="5. Shipping and Delivery">
          <p>We ship within India. Estimated delivery times are provided at checkout and are not guaranteed. Risk of loss and title for products pass to you upon delivery to the carrier. We are not responsible for delays caused by the carrier or customs.</p>
        </Section>

        <Section title="6. Returns and Refunds">
          <p>We accept returns of unopened, unused products within 7 days of delivery. To initiate a return, contact us at <a href="mailto:support@thevedicprotocol.com" style={{ color: 'var(--gold)' }}>support@thevedicprotocol.com</a>. Refunds are issued to the original payment method within 10 business days of receiving the returned item. Shipping costs are non-refundable.</p>
        </Section>

        <Section title="7. Vedic Points (Loyalty Programme)">
          <p>Vedic Points are earned on qualifying purchases and may be redeemed for discounts on future orders. Points have no cash value, are non-transferable, and expire after 12 months of account inactivity. We reserve the right to modify or discontinue the loyalty programme at any time.</p>
        </Section>

        <Section title="8. Intellectual Property">
          <p>All content on the Site — including text, images, formulations, branding, and design — is the exclusive property of The Vedic Protocol and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our express written consent.</p>
        </Section>

        <Section title="9. Disclaimer of Warranties">
          <p>Our products are not intended to diagnose, treat, cure, or prevent any disease. The information on the Site is provided for educational purposes only and is not a substitute for professional medical advice. Always consult a qualified healthcare provider before beginning any new wellness regimen.</p>
          <p style={{ marginTop: '12px' }}>The Site and products are provided "as is" without warranties of any kind, express or implied.</p>
        </Section>

        <Section title="10. Limitation of Liability">
          <p>To the maximum extent permitted by law, The Vedic Protocol shall not be liable for any indirect, incidental, special, or consequential damages arising out of your use of the Site or products, even if we have been advised of the possibility of such damages.</p>
        </Section>

        <Section title="11. Governing Law">
          <p>These Terms are governed by the laws of India. Any disputes arising from these Terms or your use of the Site shall be subject to the exclusive jurisdiction of the courts located in India.</p>
        </Section>

        <Section title="12. Changes to These Terms">
          <p>We may update these Terms at any time. Continued use of the Site after changes are posted constitutes your acceptance of the revised Terms. We encourage you to review this page periodically.</p>
        </Section>

        <Section title="13. Contact">
          <p>Questions about these Terms? Contact us at <a href="mailto:support@thevedicprotocol.com" style={{ color: 'var(--gold)' }}>support@thevedicprotocol.com</a>.</p>
        </Section>
      </div>
    </main>
    <Footer />
  </>
);

export default TermsPage;
