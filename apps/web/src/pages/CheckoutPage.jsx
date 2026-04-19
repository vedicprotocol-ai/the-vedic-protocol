/* ═══════════════════════════════════════════════
   CHECKOUT PAGE
   ═══════════════════════════════════════════════ */
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import supabase, { getImageUrl } from '@/lib/supabaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useCart } from '@/contexts/CartContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import AddressForm from '@/components/AddressForm.jsx';

export const CheckoutPage = () => {
  const navigate = useNavigate();
  const { currentUser, canOrder } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [usePoints, setUsePoints] = useState(false);
  const [error, setError] = useState('');
  const [shipping, setShipping] = useState({ name: currentUser?.name || '', address: '', city: '', state: '', zip: '' });

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressLoading, setAddressLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  useEffect(() => {
    if (!currentUser?.id) return;
    const fetchAddresses = async () => {
      setAddressLoading(true);
      const { data } = await supabase
        .from('customer_address')
        .select('*')
        .eq('customer_id', currentUser.id)
        .order('created', { ascending: false });
      setSavedAddresses(data || []);
      if (data && data.length > 0) {
        setSelectedAddressId(data[0].id);
        const a = data[0];
        setShipping(s => ({ ...s, address: a.address, city: a.city, state: a.state, zip: a.zip }));
      } else {
        setShowAddressForm(true);
      }
      setAddressLoading(false);
    };
    fetchAddresses();
  }, [currentUser?.id]);

  const handleSelectAddress = (addr) => {
    setSelectedAddressId(addr.id);
    setShipping(s => ({ ...s, address: addr.address, city: addr.city, state: addr.state, zip: addr.zip }));
    setShowAddressForm(false);
  };

  const handleSaveNewAddress = async (formData) => {
    setSavingAddress(true);
    setError('');
    try {
      const { data, error: insertErr } = await supabase
        .from('customer_address')
        .insert({ customer_id: currentUser.id, ...formData })
        .select()
        .single();
      if (insertErr) throw insertErr;
      setSavedAddresses(prev => [data, ...prev]);
      handleSelectAddress(data);
      setShowAddressForm(false);
    } catch (e) {
      setError(e.message || 'Failed to save address. Please try again.');
    } finally {
      setSavingAddress(false);
    }
  };

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
      const selectedAddr = savedAddresses.find(x => x.id === selectedAddressId);
      const orderData = {
        customer_id: currentUser.id,
        items: cartItems.map(i => ({ id: i.id, name: i.name, price: i.price, qty: i.quantity })),
        subtotal, shipping: shippingCost, tax: 0, total, status: 'pending',
        shipping_address: selectedAddr
          ? { name: shipping.name, address: selectedAddr.address, city: selectedAddr.city, state: selectedAddr.state, zip: selectedAddr.zip, country: selectedAddr.country }
          : shipping,
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
                  <h2 style={{ fontFamily: 'var(--serif)', fontSize: '22px', fontWeight: 400, marginBottom: '28px' }}>Shipping Address</h2>

                  {addressLoading ? (
                    <p style={{ fontSize: '13px', color: 'var(--ink-3)' }}>Loading your addresses…</p>
                  ) : (
                    <>
                      {/* Saved address cards */}
                      {savedAddresses.length > 0 && !showAddressForm && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                          {savedAddresses.map(addr => (
                            <label
                              key={addr.id}
                              onClick={() => handleSelectAddress(addr)}
                              style={{
                                display: 'flex', alignItems: 'flex-start', gap: '12px',
                                padding: '14px 16px', border: `1px solid ${selectedAddressId === addr.id ? 'var(--gold)' : 'var(--line-dk)'}`,
                                background: selectedAddressId === addr.id ? 'var(--white)' : 'transparent',
                                cursor: 'pointer', fontSize: '13px', color: 'var(--ink-3)', lineHeight: 1.6,
                              }}
                            >
                              <input
                                type="radio"
                                name="savedAddress"
                                readOnly
                                checked={selectedAddressId === addr.id}
                                style={{ accentColor: 'var(--gold)', marginTop: '2px', flexShrink: 0 }}
                              />
                              <span>
                                <span style={{ display: 'block', fontWeight: 500, color: 'var(--ink)' }}>{addr.address}</span>
                                {addr.city}, {addr.state} {addr.zip} — {addr.country}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* Add new address inline form */}
                      {showAddressForm ? (
                        <div style={{ background: 'var(--white)', border: '1px solid var(--line-dk)', padding: '20px', marginBottom: '20px' }}>
                          <p style={{ fontFamily: 'var(--serif)', fontSize: '15px', marginBottom: '16px' }}>
                            {savedAddresses.length === 0 ? 'No saved address found. Please add one to continue.' : 'Add a new address'}
                          </p>
                          <AddressForm
                            onSubmit={handleSaveNewAddress}
                            onCancel={savedAddresses.length > 0 ? () => setShowAddressForm(false) : null}
                            isLoading={savingAddress}
                          />
                        </div>
                      ) : (
                        <button
                          className="btn btn-light"
                          style={{ fontSize: '12px', marginBottom: '20px' }}
                          onClick={() => setShowAddressForm(true)}
                        >
                          + Add New Address
                        </button>
                      )}

                      {/* Recipient name */}
                      {!showAddressForm && (
                        <div className="field" style={{ marginBottom: '20px' }}>
                          <label className="field-label">Recipient Name</label>
                          <input {...iClass} value={shipping.name} onChange={e => setShipping({...shipping, name: e.target.value})} />
                        </div>
                      )}

                      {!showAddressForm && (
                        <button
                          className="btn btn-dark"
                          onClick={() => setStep(2)}
                          disabled={!selectedAddressId || !shipping.name}
                        >
                          Continue to Payment
                        </button>
                      )}
                    </>
                  )}
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
                    {(() => {
                      const a = savedAddresses.find(x => x.id === selectedAddressId);
                      return a ? (
                        <>
                          <p>{a.address}</p>
                          <p>{a.city}, {a.state} {a.zip}, {a.country}</p>
                        </>
                      ) : (
                        <p>{shipping.address}, {shipping.city}, {shipping.state} {shipping.zip}</p>
                      );
                    })()}
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
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--ink-3)', padding: '8px 0', borderBottom: '1px solid var(--line)' }}>
                    {item.image_url && (
                      <img
                        src={getImageUrl(item.image_url)}
                        alt={item.name}
                        style={{ width: '40px', height: '40px', objectFit: 'cover', flexShrink: 0, border: '1px solid var(--line)' }}
                      />
                    )}
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.quantity}× {item.name}</span>
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