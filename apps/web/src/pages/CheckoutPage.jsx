/* ═══════════════════════════════════════════════
   CHECKOUT PAGE
   ═══════════════════════════════════════════════ */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import supabase from '@/lib/supabaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useCart } from '@/contexts/CartContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { currentUser, canOrder } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [error, setError] = useState('');
  const [shipping, setShipping] = useState({ name: currentUser?.name || '', address: '', city: '', state: '', zip: '' });

  const subtotal = getCartTotal();
  const shippingCost = subtotal > 500 ? 0 : 99;
  const pointsDiscount = usePoints ? Math.min(subtotal, (currentUser?.vedic_points || 0) / 100) : 0;
  const total = subtotal + shippingCost - pointsDiscount;

  if (cartItems.length === 0) { navigate('/cart'); return null; }

  // Require verified email + saved phone before checkout
  if (!canOrder) {
    const emailConfirmed = !!currentUser?.email_confirmed_at;
    const hasPhone = !!currentUser?.phone;
    return (
      <>
        <Helmet>
          <title>Checkout | The Vedic Protocol</title>
          <meta name="robots" content="noindex" />
        </Helmet>
        <Header />
        <main id="main">
          <div style={{ maxWidth: '520px', margin: '80px auto', padding: '0 24px', textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 400, color: 'var(--ink)', marginBottom: '16px' }}>
              One more step.
            </p>
            {!emailConfirmed && (
              <p style={{ fontSize: '13px', color: 'var(--ink-3)', lineHeight: 1.8, marginBottom: '12px' }}>
                Please confirm your email address before placing an order. Check your inbox for the confirmation link we sent when you registered.
              </p>
            )}
            {emailConfirmed && !hasPhone && (
              <p style={{ fontSize: '13px', color: 'var(--ink-3)', lineHeight: 1.8, marginBottom: '12px' }}>
                A phone number is required to place an order. Please add it in your{' '}
                <Link to="/dashboard" style={{ color: 'var(--gold)' }}>dashboard</Link>.
              </p>
            )}
            <Link to="/dashboard" className="btn btn-dark" style={{ display: 'inline-block', marginTop: '16px' }}>
              Go to Dashboard
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const handleOrder = async () => {
    setLoading(true); setError('');
    try {
      const orderData = {
        customer_id: currentUser.id,
        legacy_id: `VP-${Date.now()}`,
        items: cartItems.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.quantity })),
        subtotal, shipping: shippingCost, tax: 0, total, status: 'pending',
        shipping_address: shipping,
        payment_method: 'credit_card',
        payment_status: 'pending',
      };
      const { data: order, error: orderErr } = await supabase.from('orders').insert(orderData).select().single();
      if (orderErr) throw orderErr;

      // Decrement stock for each purchased product
      for (const item of cartItems) {
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.id)
          .single();
        if (product) {
          const newStock = Math.max(0, (product.stock || 0) - item.quantity);
          await supabase.from('products').update({ stock: newStock }).eq('id', item.id);
        }
      }

      const pts = Math.floor(total * 10);
      await supabase.from('loyalty_points').insert({ customer_id: currentUser.id, points_earned: pts, transaction_type: 'purchase', order_id: order.id });
      await supabase.from('customers').update({ vedic_points: (currentUser.vedic_points || 0) + pts }).eq('id', currentUser.id);
      clearCart();
      navigate(`/order-confirmation/${order.id}`, { state: { order, pointsEarned: pts } });
    } catch (e) {
      setError(e.message || 'Checkout failed. Please try again.');
      setLoading(false);
    }
  };

  const StepBar = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '40px', fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
      {['Shipping','Payment','Review'].map((s, i) => (
        <React.Fragment key={s}>
          <span style={{ color: step > i ? 'var(--ink)' : step === i + 1 ? 'var(--gold)' : 'var(--ink-4)', fontWeight: step === i + 1 ? 500 : 400 }}>{i+1}. {s}</span>
          {i < 2 && <span style={{ color: 'var(--line-dk)', margin: '0 4px' }}>—</span>}
        </React.Fragment>
      ))}
    </div>
  );

  const iClass = { style: { padding: '12px 16px', fontSize: '13px', color: 'var(--ink)', background: 'var(--white)', border: '1px solid var(--line-dk)', outline: 'none', width: '100%' } };

  return (
    <>
      <Helmet>
        <title>Checkout | The Vedic Protocol</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Header />
      <main id="main">
        <div style={{ maxWidth: 'var(--max)', margin: '0 auto', padding: '56px 40px 80px' }}>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: '32px', fontWeight: 400, color: 'var(--ink)', marginBottom: '32px' }}>Secure Checkout</h1>
          <StepBar />
          {error && <p style={{ fontSize: '12px', color: '#c0392b', padding: '12px 16px', background: '#fff5f5', border: '1px solid #fecdd3', marginBottom: '24px' }}>{error}</p>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '48px', alignItems: 'start' }}>
            <div style={{ background: 'var(--off)', border: '1px solid var(--line)', padding: '40px' }}>

              {step === 1 && (
                <>
                  <h2 style={{ fontFamily: 'var(--serif)', fontSize: '22px', fontWeight: 400, marginBottom: '28px' }}>Shipping Details</h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div className="field"><label className="field-label">Full Name</label><input {...iClass} value={shipping.name} onChange={e => setShipping({...shipping, name: e.target.value})} /></div>
                    <div className="field"><label className="field-label">Street Address</label><input {...iClass} value={shipping.address} onChange={e => setShipping({...shipping, address: e.target.value})} /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div className="field"><label className="field-label">City</label><input {...iClass} value={shipping.city} onChange={e => setShipping({...shipping, city: e.target.value})} /></div>
                      <div className="field"><label className="field-label">State</label><input {...iClass} value={shipping.state} onChange={e => setShipping({...shipping, state: e.target.value})} /></div>
                    </div>
                    <div className="field"><label className="field-label">PIN Code</label><input {...iClass} value={shipping.zip} onChange={e => setShipping({...shipping, zip: e.target.value})} /></div>
                  </div>
                  <button className="btn btn-dark" style={{ marginTop: '28px' }} onClick={() => setStep(2)} disabled={!shipping.name || !shipping.address || !shipping.city}>Continue to Payment</button>
                </>
              )}

              {step === 2 && (
                <>
                  <h2 style={{ fontFamily: 'var(--serif)', fontSize: '22px', fontWeight: 400, marginBottom: '28px' }}>Payment</h2>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: '1px solid var(--gold)', background: 'var(--white)', cursor: 'pointer', fontSize: '13px' }}>
                    <input type="radio" checked readOnly style={{ accentColor: 'var(--gold)' }} /> Credit / Debit Card (Demo)
                  </label>
                  {(currentUser?.vedic_points || 0) > 0 && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: '1px solid var(--line)', marginTop: '12px', cursor: 'pointer', fontSize: '13px' }}>
                      <input type="checkbox" checked={usePoints} onChange={e => setUsePoints(e.target.checked)} style={{ accentColor: 'var(--gold)' }} />
                      Apply {currentUser.vedic_points} Vedic Points (₹{(currentUser.vedic_points / 100).toFixed(0)} value)
                    </label>
                  )}
                  <div style={{ display: 'flex', gap: '12px', marginTop: '28px' }}>
                    <button className="btn btn-light" onClick={() => setStep(1)}>Back</button>
                    <button className="btn btn-dark" onClick={() => setStep(3)}>Review Order</button>
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h2 style={{ fontFamily: 'var(--serif)', fontSize: '22px', fontWeight: 400, marginBottom: '28px' }}>Review & Confirm</h2>
                  <div style={{ padding: '16px', background: 'var(--white)', border: '1px solid var(--line)', fontSize: '13px', color: 'var(--ink-3)', marginBottom: '24px' }}>
                    <p style={{ fontWeight: 500, color: 'var(--ink)', marginBottom: '4px' }}>Shipping to:</p>
                    <p>{shipping.name}</p>
                    <p>{shipping.address}, {shipping.city}, {shipping.state} {shipping.zip}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-light" onClick={() => setStep(2)}>Back</button>
                    <button className="btn btn-dark" onClick={handleOrder} disabled={loading}>
                      {loading ? 'Processing…' : 'Complete Order'}
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Order Summary */}
            <div style={{ background: 'var(--off)', border: '1px solid var(--line)', padding: '28px', position: 'sticky', top: '88px' }}>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '18px', fontWeight: 400, marginBottom: '20px' }}>Order Summary</h3>
              <div style={{ maxHeight: '240px', overflowY: 'auto', marginBottom: '20px' }}>
                {cartItems.map(item => (
                  <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: 'var(--ink-3)', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                    <span style={{ flexShrink: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>{item.quantity}× {item.name}</span>
                    <span style={{ flexShrink: 0 }}>₹{(item.price * item.quantity).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '12px', borderTop: '1px solid var(--line)', fontSize: '13px', color: 'var(--ink-3)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span>₹{subtotal.toFixed(0)}</span></div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Shipping</span><span>{shippingCost === 0 ? 'Free' : `₹${shippingCost}`}</span></div>
                {usePoints && pointsDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gold)' }}><span>Points Applied</span><span>−₹{pointsDiscount.toFixed(0)}</span></div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--ink)', paddingTop: '12px', borderTop: '1px solid var(--line)' }}>
                  <span>Total</span><span>₹{total.toFixed(0)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default CheckoutPage;