import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast.js';

const NewsletterSignup = ({ className = '' }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || loading) return;
    setLoading(true);

    try {
      const BREVO_KEY = import.meta.env.VITE_BREVO_KEY;
      if (!BREVO_KEY) throw new Error('Email service is not configured.');

      const res = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'api-key': BREVO_KEY,
        },
        body: JSON.stringify({
          sender: { email: 'drsonam@thevedicprotocol.com', name: 'The Vedic Protocol' },
          to: [{ email }],
          subject: "You're on the list — The Vedic Protocol",
          htmlContent: `
            <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;border:1px solid #e8e6e1;">
              <div style="background:#1a1814;padding:32px;text-align:center;">
                <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#C9A96E;">
                  The Vedic Protocol
                </p>
              </div>
              <div style="padding:48px;">
                <p style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#C9A96E;margin:0 0 8px;">
                  Welcome
                </p>
                <h1 style="font-size:24px;font-weight:400;color:#1a1814;margin:0 0 20px;">
                  From the lab, to your inbox.
                </h1>
                <p style="font-size:14px;color:#6b6660;line-height:1.9;margin:0 0 16px;">
                  You're now part of a small circle that receives our formulation notes,
                  research updates, and Ayurvedic insights — never more than twice a month,
                  always worth your time.
                </p>
                <p style="font-size:14px;color:#6b6660;line-height:1.9;margin:0 0 32px;">
                  Questions? Write to us at
                  <a href="mailto:support@thevedicprotocol.com" style="color:#C9A96E;">
                    support@thevedicprotocol.com
                  </a>.
                </p>
                <hr style="border:none;border-top:1px solid #e8e6e1;margin:32px 0;">
                <p style="font-size:18px;font-style:italic;color:#1a1814;margin:0 0 4px;">Dr. Sonam</p>
                <p style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#9a9690;margin:0;">
                  PhD · Ayurvedic Pharmacology · Founder
                </p>
              </div>
            </div>
          `,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || 'Failed to subscribe.');
      }

      setDone(true);
      setEmail('');
    } catch (err) {
      toast({
        title: 'Subscription failed',
        description: err.message || 'Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className={`newsletter-section ${className}`} aria-labelledby="nl-heading">
      <div className="newsletter-inner">
        <div className="newsletter-text">
          <p className="section-label">Stay Close to the Protocol</p>
          <h2 className="newsletter-h2" id="nl-heading">
            From the lab,<br /><em>to your inbox.</em>
          </h2>
          <p className="newsletter-sub">
            New formulations, research notes, and Ayurvedic wisdom — delivered
            thoughtfully, never more than twice a month.
          </p>
        </div>

        <div className="newsletter-form-wrap">
          {done ? (
            <div className="newsletter-success">
              <p className="newsletter-success-msg">You're in. We'll be in touch.</p>
            </div>
          ) : (
            <>
              <form className="wl-form" onSubmit={handleSubmit} aria-label="Subscribe to the newsletter">
                <label
                  htmlFor="nl-email"
                  style={{ position: 'absolute', width: '1px', height: '1px', overflow: 'hidden', clip: 'rect(0,0,0,0)' }}
                >
                  Email address
                </label>
                <input
                  className="wl-input"
                  type="email"
                  id="nl-email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                  disabled={loading}
                />
                <button
                  className="wl-btn"
                  type="submit"
                  disabled={loading}
                  style={{ opacity: loading ? 0.7 : 1 }}
                >
                  {loading ? 'Subscribing…' : 'Subscribe'}
                </button>
              </form>
              <p className="wl-privacy">Thoughtful emails only. Unsubscribe any time.</p>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default NewsletterSignup;