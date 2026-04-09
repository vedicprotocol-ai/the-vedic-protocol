/* ═══════════════════════════════════════════════
   CART PAGE
   ═══════════════════════════════════════════════ */
import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import pb from '@/lib/pocketbaseClient.js';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import { useCart } from '@/contexts/CartContext.jsx';

export const CartPage = () => {
  const { cartItems, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const subtotal = getCartTotal();
  const shipping = subtotal > 0 ? 10 : 0;
  const total = subtotal + shipping;

  return (
    <>
      <Helmet>
        <title>Your Protocol | The Vedic Protocol</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Header />
      <main id="main">

        <div style={{ maxWidth: 'var(--max)', margin: '0 auto', padding: '56px 40px 80px' }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px,4vw,44px)', fontWeight: 400, color: 'var(--ink)', marginBottom: '40px', paddingBottom: '24px', borderBottom: '1px solid var(--line)' }}>
            Your Protocol
          </h1>

          {cartItems.length === 0 ? (
            <div style={{ padding: '80px 40px', background: 'var(--off)', border: '1px solid var(--line)', textAlign: 'center' }}>
              <p style={{ fontFamily: 'var(--serif)', fontSize: '20px', color: 'var(--ink)', fontStyle: 'italic', marginBottom: '8px' }}>Your protocol is empty.</p>
              <p style={{ fontSize: '13px', color: 'var(--ink-3)', marginBottom: '28px' }}>Explore our clinical formulations to begin your ritual.</p>
              <Link to="/shop" className="btn btn-dark">Explore Formulations</Link>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '48px', alignItems: 'start' }}>

              {/* Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {cartItems.map((item, i) => (
                  <div key={item.id} style={{ display: 'flex', gap: '24px', padding: '24px 0', borderBottom: '1px solid var(--line)', position: 'relative' }}>
                    <div style={{ width: '88px', height: '110px', background: 'var(--stone)', flexShrink: 0, overflow: 'hidden' }}>
                      <img
                        src={item.image ? pb.files.getUrl(item, item.image) : 'https://horizons-cdn.hostinger.com/bfed98a7-6f91-43f0-8610-351a61a344ed/364e063677ed92860e4ca29d681e1311.jpg'}
                        alt={item.name}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                        <h3 style={{ fontFamily: 'var(--serif)', fontSize: '17px', fontWeight: 400, color: 'var(--ink)' }}>{item.name}</h3>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', padding: '4px', flexShrink: 0 }}
                          aria-label={`Remove ${item.name}`}
                        >
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                        </button>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div className="qty-ctrl" role="group" aria-label={`Quantity of ${item.name}`}>
                          <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease">
                            <svg width="10" height="2" viewBox="0 0 10 2" fill="none"><path d="M1 1h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          </button>
                          <span className="qty-val" aria-live="polite">{item.quantity}</span>
                          <button className="qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
                          </button>
                        </div>
                        <span style={{ fontFamily: 'var(--serif)', fontSize: '16px', color: 'var(--ink)' }}>₹{(item.price * item.quantity).toFixed(0)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Summary */}
              <div style={{ background: 'var(--off)', border: '1px solid var(--line)', padding: '32px', position: 'sticky', top: '88px' }}>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '22px', fontWeight: 400, color: 'var(--ink)', marginBottom: '24px' }}>Summary</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid var(--line)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--ink-3)' }}>
                    <span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: 'var(--ink-3)' }}>
                    <span>Shipping</span><span>₹{shipping.toFixed(0)}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--ink)' }}>Total</span>
                  <span style={{ fontFamily: 'var(--serif)', fontSize: '20px', color: 'var(--ink)' }}>₹{total.toFixed(0)}</span>
                </div>
                <Link to="/checkout" className="btn btn-dark btn-full btn-lg" style={{ textAlign: 'center', display: 'block' }}>
                  Proceed to Checkout
                </Link>
                <Link to="/shop" style={{ display: 'block', textAlign: 'center', fontSize: '11px', letterSpacing: '0.08em', color: 'var(--ink-4)', marginTop: '16px' }}>
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>

      </main>
      <Footer />
    </>
  );
};

export default CartPage;