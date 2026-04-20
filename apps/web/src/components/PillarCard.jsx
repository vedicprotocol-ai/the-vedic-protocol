import React, { useState } from 'react';
import { useToast } from '@/hooks/use-toast.js';
import supabase from '@/lib/supabaseClient.js';

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
      const { error } = await supabase.from('newsletter_subscribers').insert({ email });
      if (error) {
        if (error.code === '23505') { setDone(true); return; }
        throw error;
      }
      setDone(true);
      setEmail('');
    } catch (err) {
      toast({ title: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="newsletter-section" className={`newsletter-section ${className}`}>
      <div className="newsletter-inner">
        <div className="newsletter-text">
          <p className="section-label">Join The Protocol</p>
          <h2 className="section-h2">
            Ancient wisdom.<br /><em>In your inbox.</em>
          </h2>
          <p className="newsletter-sub">
            Formulation updates, Ayurvedic research, and early access — directly from Dr. Sonam.
          </p>
        </div>
        <div className="newsletter-form-wrap">
          {done ? (
            <div className="newsletter-done">
              <p>You're on the list.</p>
              <span>We'll be in touch when The Vedic Protocol launches.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="newsletter-form">
              <input
                id="nl-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="newsletter-input"
              />
              <button type="submit" className="btn btn-dark" disabled={loading}>
                {loading ? 'Subscribing...' : 'Subscribe'}
              </button>
            </form>
          )}
          <p className="wl-privacy">Thoughtful emails only. <span>Unsubscribe anytime.</span></p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSignup;