import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import supabase from '@/lib/supabaseClient.js';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | loading | done | error
  const [errorMsg, setErrorMsg] = useState('');
  const lastSubmitTime = useRef(0);

  const handleWaitlist = async (e) => {
    e.preventDefault();
    const now = Date.now();
    if (status === 'loading' || now - lastSubmitTime.current < 5000) return;
    setStatus('loading');
    setErrorMsg('');
    lastSubmitTime.current = now;

    const BREVO_KEY = import.meta.env.VITE_BREVO_KEY;

    if (!BREVO_KEY) {
      setStatus('error');
      setErrorMsg('Email service is not configured. Please contact support.');
      console.error('VITE_BREVO_KEY is not set in environment variables.');
      return;
    }

    try {
      // 1. Add contact to Brevo list
      const res = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'content-type': 'application/json',
          'api-key': BREVO_KEY,
        },
        body: JSON.stringify({ email, listIds: [2], updateEnabled: true }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to join waitlist.');
      }

      // 2. Save to Supabase newsletter_subscribers table
      try {
        await supabase.from('newsletter_subscribers').insert({ email, source: 'waitlist' });
      } catch (dbErr) {
        // Silently ignore — duplicate or non-critical
        console.warn('newsletter_subscribers save failed:', dbErr);
      }

      // 3. Send welcome email via Brevo transactional API
      try {
        await fetch('https://api.brevo.com/v3/smtp/email', {
          method: 'POST',
          headers: {
            'api-key': BREVO_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sender: { name: 'The Vedic Protocol', email: 'drsonam@thevedicprotocol.com' },
            to: [{ email }],
            subject: 'You\'re on the list — The Vedic Protocol',
            htmlContent: `
              <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;border:1px solid #e8e6e1;">
                <div style="background:#1a1814;padding:32px;text-align:center;">
                  <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#C9A96E;">The Vedic Protocol</p>
                </div>
                <div style="padding:48px;">
                  <p style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#C9A96E;margin:0 0 8px;">You're in.</p>
                  <h1 style="font-size:26px;font-weight:400;color:#1a1814;margin:0 0 20px;line-height:1.3;">
                    Welcome to the Protocol.
                  </h1>
                  <p style="font-size:14px;color:#6b6660;line-height:1.9;margin:0 0 24px;">
                    You're now on our early access list. When we launch, you'll be among the first to know — with founder pricing, exclusive formulations, and updates straight from our lab.
                  </p>
                  <p style="font-size:14px;color:#6b6660;line-height:1.9;margin:0 0 32px;">
                    We formulate slowly and intentionally. No shortcuts, no synthetics — only what the classical texts and modern science both agree on.
                  </p>
                  <hr style="border:none;border-top:1px solid #e8e6e1;margin:32px 0;">
                  <p style="font-size:18px;font-style:italic;color:#1a1814;margin:0 0 4px;">Dr. Sonam</p>
                  <p style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#9a9690;margin:0;">PhD · Ayurvedic Pharmacology · Founder</p>
                </div>
              </div>
            `,
          }),
        });
      } catch (emailErr) {
        // Email failure does not block the success state
        console.warn('Welcome email send failed:', emailErr);
      }

      setStatus('done');
      setEmail('');
      setTimeout(() => setStatus('idle'), 4000);
    } catch (err) {
      setStatus('error');
      setErrorMsg(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <>
      {/* ── Waitlist Strip ── */}
      <section className="waitlist" aria-labelledby="wl-heading" id="waitlist">
        <div className="wl-inner">
          <div>
            <h2 className="wl-h2" id="wl-heading">
              Be first to the protocol.
            </h2>
            <p className="wl-sub">
              Early access, founder pricing, and updates straight from our lab.
            </p>
            <ul className="wl-perks" aria-label="Waitlist benefits">
              <li className="wl-perk">Early access</li>
              <li className="wl-perk">Founder pricing</li>
              <li className="wl-perk">Lab updates</li>
              <li className="wl-perk">No spam, ever</li>
            </ul>
          </div>

          <div className="wl-form-wrap">
            {status === 'done' ? (
              <div className="wl-success">
                <p className="wl-success-msg">You're in. We'll be in touch.</p>
              </div>
            ) : (
              <>
                <form className="wl-form" onSubmit={handleWaitlist} aria-label="Join the waitlist">
                  <label
                    htmlFor="wl-email"
                    style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
                  >
                    Email address
                  </label>
                  <input
                    className="wl-input"
                    type="email"
                    id="wl-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    autoComplete="email"
                    disabled={status === 'loading'}
                  />
                  <button
                    className="wl-btn"
                    type="submit"
                    disabled={status === 'loading'}
                    style={{ opacity: status === 'loading' ? 0.7 : 1 }}
                  >
                    {status === 'loading' ? 'Joining…' : 'Join Waitlist'}
                  </button>
                </form>

                {status === 'error' && (
                  <p className="wl-error">{errorMsg}</p>
                )}

                <p className="wl-privacy">
                  We respect your privacy. Unsubscribe any time.{' '}
                  <Link to="/privacy">Privacy Policy</Link>.
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="site-footer" aria-label="Site footer">
        <div className="foot-inner">
          <div className="foot-top">

            {/* Brand column */}
            <div>
              <div className="foot-brand-name">The Vedic Protocol</div>
              <div className="foot-brand-sub">Ancient Wisdom · Modern Ritual</div>
              <p className="foot-tagline">
                Clinical Ayurvedic skincare &amp; haircare. Rooted in the Charaka Samhita.
                Validated by modern dermatological science.
              </p>
              <div className="foot-certs">
                <span className="foot-cert">PhD Formulated</span>
                <span className="foot-cert">Cruelty Free</span>
                <span className="foot-cert">Vegan</span>
                <span className="foot-cert">Zero Synthetics</span>
              </div>
            </div>

            {/* Explore */}
            <nav aria-label="Explore">
              <div className="foot-col-title">Explore</div>
              <ul className="foot-links">
                <li><Link to="/shop">Formulations</Link></li>
                <li><Link to="/science">The Science</Link></li>
                <li><Link to="/blog">Journal</Link></li>
                <li><Link to="/about">Our Philosophy</Link></li>
                <li><Link to="/social-impact">Social Impact</Link></li>
              </ul>
            </nav>

            {/* Community */}
            <nav aria-label="Community">
              <div className="foot-col-title">Community</div>
              <ul className="foot-links">
                <li><Link to="/vedic-points">Vedic Points</Link></li>
                <li><Link to="/contact">Contact Us</Link></li>
                <li>
                  <a href="https://www.instagram.com/thevedicprotocol" target="_blank" rel="noopener noreferrer">
                    Instagram
                  </a>
                </li>
                <li>
                  <a href="https://www.facebook.com/share/1LPdYQNbhb/" target="_blank" rel="noopener noreferrer">
                    Facebook
                  </a>
                </li>
              </ul>
            </nav>

            {/* Legal */}
            <nav aria-label="Legal">
              <div className="foot-col-title">Legal</div>
              <ul className="foot-links">
                <li><Link to="/privacy">Privacy Policy</Link></li>
                <li><Link to="/terms">Terms of Use</Link></li>
                <li><Link to="/returns">Returns</Link></li>
                <li><Link to="/cookies">Cookie Policy</Link></li>
              </ul>
            </nav>
          </div>

          <div className="foot-bottom">
            <p className="foot-copy">
              © {new Date().getFullYear()} The Vedic Protocol Ltd. All rights reserved.
            </p>
            <nav className="foot-social" aria-label="Social media">
              <a href="https://www.instagram.com/thevedicprotocol" target="_blank" rel="noopener noreferrer">
                Instagram
              </a>
              <a href="https://www.facebook.com/share/1LPdYQNbhb/" target="_blank" rel="noopener noreferrer">
                Facebook
              </a>
            </nav>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;