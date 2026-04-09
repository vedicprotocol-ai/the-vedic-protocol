/* ═══════════════════════════════════════════════
   CONTACT PAGE
   ═══════════════════════════════════════════════ */
import React, { useState, useRef } from 'react';
import { Helmet } from 'react-helmet';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

export const ContactPage = () => {
  const [form, setForm] = useState({ name:'', email:'', inquiry_type:'product_question', message:'' });
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [errorMsg, setErrorMsg] = useState('');
  const lastSubmitTime = useRef(0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.name || !form.email || !form.message) { 
      setErrorMsg('Please complete all required fields.'); 
      setStatus('error');
      return; 
    }
    
    const now = Date.now();
    // Dedup check & submission lock: prevent resubmission within 5 seconds or while loading
    if (status === 'loading' || now - lastSubmitTime.current < 5000) return;
    
    setStatus('loading');
    setErrorMsg('');
    lastSubmitTime.current = now;

    try {
      const BREVO_KEY = import.meta.env.VITE_BREVO_KEY;
      if (!BREVO_KEY) {
        throw new Error('Email service is not configured. Please contact us directly at support@thevedicprotocol.com');
      }

      const inquiryLabel = {
        product_question: 'Formulation Inquiry',
        order_status: 'Order Status',
        partnership: 'Partnership',
        other: 'Other',
      }[form.inquiry_type] || form.inquiry_type;

      // Send notification to the support team
      const teamRes = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': BREVO_KEY,
        },
        body: JSON.stringify({
          sender: { email: 'drsonam@thevedicprotocol.com', name: 'The Vedic Protocol' },
          to: [{ email: 'support@thevedicprotocol.com', name: 'The Vedic Protocol Support' }],
          replyTo: { email: form.email, name: form.name },
          subject: `New Inquiry [${inquiryLabel}] from ${form.name}`,
          htmlContent: `
            <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;">
              <h2 style="color:#1a1814;">New Contact Inquiry</h2>
              <table style="width:100%;border-collapse:collapse;font-size:14px;">
                <tr><td style="padding:8px 0;color:#666;width:30%;">Name</td><td style="padding:8px 0;color:#1a1814;">${form.name}</td></tr>
                <tr><td style="padding:8px 0;color:#666;">Email</td><td style="padding:8px 0;color:#1a1814;">${form.email}</td></tr>
                <tr><td style="padding:8px 0;color:#666;">Type</td><td style="padding:8px 0;color:#1a1814;">${inquiryLabel}</td></tr>
              </table>
              <hr style="border:none;border-top:1px solid #e8e6e1;margin:16px 0;">
              <p style="font-size:14px;color:#1a1814;line-height:1.8;white-space:pre-wrap;">${form.message}</p>
            </div>
          `,
        }),
      });

      if (!teamRes.ok) {
        const data = await teamRes.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to send message.');
      }

      // Send acknowledgement to the user
      try {
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'accept': 'application/json',
            'content-type': 'application/json',
            'api-key': BREVO_KEY,
          },
          body: JSON.stringify({
            sender: { email: 'drsonam@thevedicprotocol.com', name: 'The Vedic Protocol' },
            to: [{ email: form.email, name: form.name }],
            subject: 'We received your inquiry — The Vedic Protocol',
            htmlContent: `
              <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;border:1px solid #e8e6e1;">
                <div style="background:#1a1814;padding:32px;text-align:center;">
                  <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#C9A96E;">The Vedic Protocol</p>
                </div>
                <div style="padding:48px;">
                  <p style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#C9A96E;margin:0 0 8px;">Message Received</p>
                  <h1 style="font-size:24px;font-weight:400;color:#1a1814;margin:0 0 20px;">Thank you, ${form.name}.</h1>
                  <p style="font-size:14px;color:#6b6660;line-height:1.9;margin:0 0 16px;">
                    We've received your ${inquiryLabel.toLowerCase()} and our clinical team will respond within 24–48 business hours.
                  </p>
                  <p style="font-size:14px;color:#6b6660;line-height:1.9;margin:0 0 32px;">
                    For urgent matters you can reach us directly at
                    <a href="mailto:support@thevedicprotocol.com" style="color:#C9A96E;">support@thevedicprotocol.com</a>.
                  </p>
                  <hr style="border:none;border-top:1px solid #e8e6e1;margin:32px 0;">
                  <p style="font-size:18px;font-style:italic;color:#1a1814;margin:0 0 4px;">Dr. Sonam</p>
                  <p style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#9a9690;margin:0;">PhD · Ayurvedic Pharmacology · Founder</p>
                </div>
              </div>
            `,
          }),
        });
      } catch (ackErr) {
        // Acknowledgement failure does not block success — team notification already sent
        console.warn('Acknowledgement email failed:', ackErr);
      }
      
      setStatus('done');
      setForm({ name:'', email:'', inquiry_type:'product_question', message:'' });
      
      // Show success message for 4 seconds before allowing new submission
      setTimeout(() => {
        setStatus('idle');
      }, 4000);
      
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Failed to send. Please try again or email us directly.');
    }
  };

  return (
    <>
      <Helmet>
        <title>Contact | The Vedic Protocol</title>
        <meta name="description" content="Contact The Vedic Protocol — direct inquiries to our clinical team. We respond within 24–48 hours." />
        <link rel="canonical" href="https://www.thevedicprotocol.com/contact" />
      </Helmet>
      <Header />
      <main id="main">
        <div className="page-hero">
          <p className="page-hero-label">Get in Touch</p>
          <h1>Contact<br /><em>the team.</em></h1>
          <p className="page-hero-sub">Direct inquiries to our clinical team. We respond within 24–48 hours.</p>
        </div>

        <div style={{ maxWidth: 'var(--max)', margin: '0 auto', padding: '80px 40px', display: 'grid', gridTemplateColumns: '3fr 2fr', gap: '80px', borderBottom: '1px solid var(--line)' }}>

          {/* Form */}
          <div>
            <h2 style={{ fontFamily: 'var(--serif)', fontSize: '28px', fontWeight: 400, color: 'var(--ink)', marginBottom: '32px' }}>Submit an Inquiry</h2>
            
            {status === 'done' ? (
              <div style={{ padding: '48px', background: 'var(--off)', border: '1px solid var(--line)', textAlign: 'center' }}>
                <p style={{ fontFamily: 'var(--serif)', fontSize: '20px', color: 'var(--ink)', marginBottom: '8px' }}>Inquiry received.</p>
                <p style={{ fontSize: '13px', color: 'var(--ink-3)' }}>Our clinical team will respond within 24–48 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} noValidate>
                {status === 'error' && (
                  <p style={{ fontSize: '12px', color: '#c0392b', padding: '12px 16px', background: '#fff5f5', border: '1px solid #fecdd3' }}>
                    {errorMsg}
                  </p>
                )}
                
                <div className="field">
                  <label className="field-label" htmlFor="c-name">Name *</label>
                  <input 
                    className="field-input" 
                    id="c-name" 
                    name="name" 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                    required 
                    disabled={status === 'loading'}
                  />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="c-email">Email *</label>
                  <input 
                    className="field-input" 
                    id="c-email" 
                    type="email" 
                    name="email" 
                    value={form.email} 
                    onChange={e => setForm({...form, email: e.target.value})} 
                    required 
                    disabled={status === 'loading'}
                  />
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="c-type">Subject</label>
                  <select 
                    className="field-select" 
                    id="c-type" 
                    name="inquiry_type" 
                    value={form.inquiry_type} 
                    onChange={e => setForm({...form, inquiry_type: e.target.value})}
                    disabled={status === 'loading'}
                  >
                    <option value="product_question">Formulation Inquiry</option>
                    <option value="order_status">Order Status</option>
                    <option value="partnership">Partnership</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="field">
                  <label className="field-label" htmlFor="c-msg">Message *</label>
                  <textarea 
                    className="field-textarea" 
                    id="c-msg" 
                    name="message" 
                    rows={6} 
                    value={form.message} 
                    onChange={e => setForm({...form, message: e.target.value})} 
                    required 
                    style={{ minHeight: '160px' }} 
                    disabled={status === 'loading'}
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-dark btn-full btn-lg" 
                  disabled={status === 'loading'}
                  style={{ opacity: status === 'loading' ? 0.7 : 1, cursor: status === 'loading' ? 'not-allowed' : 'pointer' }}
                >
                  {status === 'loading' ? 'Sending…' : 'Submit Inquiry'}
                </button>
              </form>
            )}
          </div>

          {/* Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '48px', paddingTop: '8px' }}>
            <div>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '22px', fontWeight: 400, color: 'var(--ink)', marginBottom: '12px' }}>Direct Contact</h3>
              <p style={{ fontSize: '13px', color: 'var(--ink-3)', lineHeight: 1.8, marginBottom: '12px' }}>For immediate assistance regarding orders or formulations, reach our support team directly.</p>
              <a href="mailto:support@thevedicprotocol.com" style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--gold)', fontStyle: 'italic' }}>
                support@thevedicprotocol.com
              </a>
            </div>
            <div style={{ paddingTop: '32px', borderTop: '1px solid var(--line)' }}>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '22px', fontWeight: 400, color: 'var(--ink)', marginBottom: '16px' }}>Social</h3>
              {[
                ['Instagram','https://www.instagram.com/thevedicprotocol'],
                ['Facebook','https://www.facebook.com/share/1LPdYQNbhb/'],
              ].map(([n,h]) => (
                <a key={n} href={h} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', color: 'var(--ink-3)', padding: '10px 0', borderBottom: '1px solid var(--line)', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-3)'}
                >
                  <span style={{ width: '20px', height: '1px', background: 'var(--gold)' }}></span>{n}
                </a>
              ))}
            </div>
            <div style={{ paddingTop: '32px', borderTop: '1px solid var(--line)' }}>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '22px', fontWeight: 400, color: 'var(--ink)', marginBottom: '12px' }}>Response Time</h3>
              <p style={{ fontSize: '13px', color: 'var(--ink-3)', lineHeight: 1.8 }}>Our clinical team responds to all inquiries within 24–48 business hours. For urgent matters, email us directly.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ContactPage;