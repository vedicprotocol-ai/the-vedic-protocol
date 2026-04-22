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
  const { currentUser, canOrder, refreshProfile } = useAuth();
  const { cartItems, getCartTotal, clearCart } = useCart();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [shipping, setShipping] = useState({ name: currentUser?.name || '', address: '', city: '', state: '', zip: '' });

  // Saved addresses
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [addressLoading, setAddressLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  // Vedic Points
  const pointsAvailable = currentUser?.vedic_points || 0;
  const [usePoints, setUsePoints] = useState(false);
  const [pointsToUse, setPointsToUse] = useState(0);

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [showAvailableCoupons, setShowAvailableCoupons] = useState(false);

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

  useEffect(() => {
    const fetchAvailableCoupons = async () => {
      const now = new Date().toISOString();
      const { data } = await supabase
        .from('coupons')
        .select('id, code, discount_type, discount_value, valid_until, usage_limit, usage_count, description, min_order_amount')
        .eq('status', 'active')
        .is('influencer_id', null)
        .or(`valid_from.is.null,valid_from.lte.${now}`)
        .or(`valid_until.is.null,valid_until.gte.${now}`)
        .order('discount_value', { ascending: false });
      if (!data) return;

      // Filter out globally exhausted coupons
      const globallyValid = data.filter(c =>
        c.usage_limit === null || c.usage_count < c.usage_limit
      );

      // Build per-customer usage map if user is logged in
      let userCouponCounts = {};
      if (currentUser?.id) {
        const { data: userOrders } = await supabase
          .from('orders')
          .select('coupon_code')
          .eq('customer_id', currentUser.id)
          .not('coupon_code', 'is', null);
        (userOrders || []).forEach(o => {
          if (o.coupon_code) userCouponCounts[o.coupon_code] = (userCouponCounts[o.coupon_code] || 0) + 1;
        });
      }

      const filtered = globallyValid.filter(c =>
        c.usage_limit === null || (userCouponCounts[c.code] || 0) < c.usage_limit
      );
      setAvailableCoupons(filtered);
    };
    fetchAvailableCoupons();
  }, [currentUser?.id]);

  const handleSelectAvailableCoupon = async (coupon) => {
    setCouponError('');
    setCouponSuccess('');
    if (coupon.usage_limit !== null && currentUser?.id) {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('customer_id', currentUser.id)
        .eq('coupon_code', coupon.code);
      if (count >= coupon.usage_limit) {
        setCouponError('You have already used this coupon the maximum number of times.');
        setShowAvailableCoupons(false);
        return;
      }
    }
    setCouponCode(coupon.code);
    setAppliedCoupon(coupon);
    const discLabel = coupon.discount_type === 'percent'
      ? `${coupon.discount_value}% off`
      : `₹${coupon.discount_value} off`;
    setCouponSuccess(`Coupon applied — ${discLabel} on your order!`);
    setShowAvailableCoupons(false);
  };

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

  // Toggle vedic points
  const handleTogglePoints = (checked) => {
    setUsePoints(checked);
    if (checked) {
      setPointsToUse(pointsAvailable);
    } else {
      setPointsToUse(0);
    }
  };

  const handlePointsInput = (val) => {
    const num = parseInt(val, 10);
    if (isNaN(num) || num < 0) { setPointsToUse(0); return; }
    if (num > pointsAvailable) { setPointsToUse(pointsAvailable); return; }
    setPointsToUse(num);
  };

  // Apply coupon
  const handleApplyCoupon = async () => {
    setCouponError('');
    setCouponSuccess('');
    if (!couponCode.trim()) { setCouponError('Please enter a coupon code.'); return; }
    setCouponLoading(true);
    try {
      const { data, error: fetchErr } = await supabase
        .from('coupons')
        .select('*')
        .eq('code', couponCode.trim().toUpperCase())
        .single();

      if (fetchErr || !data) { setCouponError('Invalid coupon code.'); return; }
      if (data.status !== 'active') { setCouponError('This coupon is no longer active.'); return; }

      const now = new Date();
      if (data.valid_from && new Date(data.valid_from) > now) {
        setCouponError('This coupon is not yet active.'); return;
      }
      if (data.valid_until && new Date(data.valid_until) < now) {
        setCouponError('This coupon has expired.'); return;
      }
      if (data.usage_limit !== null && data.usage_count >= data.usage_limit) {
        setCouponError('This coupon has reached its usage limit.'); return;
      }

      // Per-customer usage check
      if (data.usage_limit !== null && currentUser?.id) {
        const { count } = await supabase
          .from('orders')
          .select('*', { count: 'exact', head: true })
          .eq('customer_id', currentUser.id)
          .eq('coupon_code', data.code);
        if (count >= data.usage_limit) {
          setCouponError('You have already used this coupon the maximum number of times.'); return;
        }
      }

      setAppliedCoupon(data);
      const discLabel = data.discount_type === 'percent'
        ? `${data.discount_value}% off`
        : `₹${data.discount_value} off`;
      setCouponSuccess(`Coupon applied — ${discLabel} on your order!`);
    } catch (e) {
      setCouponError('Failed to validate coupon. Please try again.');
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
    setCouponSuccess('');
  };

  // Pricing
  const subtotal = getCartTotal();
  const shippingCost = subtotal > 500 ? 0 : 99;

  // 4 vedic points = ₹1
  const pointsDiscount = usePoints
    ? Math.min(subtotal, Math.floor(Math.min(pointsToUse, pointsAvailable)) / 4)
    : 0;

  // Coupon applies to subtotal only (not shipping)
  const couponDiscount = appliedCoupon
    ? appliedCoupon.discount_type === 'percent'
      ? Math.min(subtotal, subtotal * (Number(appliedCoupon.discount_value) / 100))
      : Math.min(subtotal, Number(appliedCoupon.discount_value))
    : 0;

  const total = subtotal + shippingCost - pointsDiscount - couponDiscount;

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
        coupon_code: appliedCoupon?.code || null,
        discount: couponDiscount || 0,
        vedic_points_used: usePoints ? Math.min(pointsToUse, pointsAvailable) : 0,
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

      // Increment coupon usage count
      if (appliedCoupon) {
        await supabase
          .from('coupons')
          .update({ usage_count: (appliedCoupon.usage_count || 0) + 1 })
          .eq('id', appliedCoupon.id);
      }

      // Deduct used vedic points from customer
      if (usePoints && pointsToUse > 0) {
        const deducted = Math.min(pointsToUse, pointsAvailable);
        const newBalance = Math.max(0, pointsAvailable - deducted);
        await supabase.from('customers').update({ vedic_points: newBalance }).eq('id', currentUser.id);
        await supabase.from('loyalty_points').insert({
          customer_id: currentUser.id,
          points_earned: deducted,
          transaction_type: 'redemption',
          order_id: order.id,
        });
      }

      // Points earned = (amount paid for products) / 4   [4 pts = ₹1]
      const amountPaidForProducts = subtotal - pointsDiscount - couponDiscount;
      const pts = Math.floor(amountPaidForProducts / 4);
      if (pts > 0) {
        await supabase.from('loyalty_points').insert({ customer_id: currentUser.id, points_earned: pts, transaction_type: 'purchase', order_id: order.id });
        const updatedBalance = usePoints
          ? Math.max(0, pointsAvailable - Math.min(pointsToUse, pointsAvailable)) + pts
          : pointsAvailable + pts;
        const newTier = updatedBalance >= 5000 ? 'Gold' : updatedBalance >= 1000 ? 'Silver' : 'Bronze';
        await supabase.from('customers').update({ vedic_points: updatedBalance, tier: newTier }).eq('id', currentUser.id);
      } else if (usePoints && pointsToUse > 0) {
        // Points were only spent (no new points earned) — recalculate tier from new balance
        const updatedBalance = Math.max(0, pointsAvailable - Math.min(pointsToUse, pointsAvailable));
        const newTier = updatedBalance >= 5000 ? 'Gold' : updatedBalance >= 1000 ? 'Silver' : 'Bronze';
        await supabase.from('customers').update({ tier: newTier }).eq('id', currentUser.id);
      }

      clearCart();
      await refreshProfile();
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

                  {/* Payment method */}
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', border: '1px solid var(--gold)', background: 'var(--white)', cursor: 'pointer', fontSize: '13px' }}>
                    <input type="radio" checked readOnly style={{ accentColor: 'var(--gold)' }} /> Credit / Debit Card (Demo)
                  </label>

                  {/* Vedic Points */}
                  {pointsAvailable > 0 && (
                    <div style={{ marginTop: '20px', border: '1px solid var(--line)', background: 'var(--white)', padding: '16px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: 'var(--ink)', fontWeight: 500, marginBottom: usePoints ? '14px' : 0 }}>
                        <input
                          type="checkbox"
                          checked={usePoints}
                          onChange={e => handleTogglePoints(e.target.checked)}
                          style={{ accentColor: 'var(--gold)', width: '15px', height: '15px' }}
                        />
                        Use Vedic Points
                        <span style={{ fontWeight: 400, color: 'var(--ink-3)', marginLeft: '4px' }}>
                          (Available: {pointsAvailable} pts = ₹{Math.floor(pointsAvailable / 4)})
                        </span>
                      </label>

                      {usePoints && (
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ flex: 1 }}>
                              <input
                                type="number"
                                min="0"
                                max={pointsAvailable}
                                value={pointsToUse}
                                onChange={e => handlePointsInput(e.target.value)}
                                style={{ padding: '10px 14px', fontSize: '13px', color: 'var(--ink)', background: 'var(--off)', border: '1px solid var(--line-dk)', outline: 'none', width: '100%' }}
                              />
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--ink-3)', whiteSpace: 'nowrap' }}>pts</span>
                            <span style={{ fontSize: '13px', color: 'var(--gold)', fontWeight: 500, whiteSpace: 'nowrap' }}>
                              = ₹{Math.floor(Math.min(pointsToUse, pointsAvailable) / 4)} off
                            </span>
                          </div>
                          <p style={{ fontSize: '11px', color: 'var(--ink-4)', marginTop: '6px' }}>
                            4 Vedic Points = ₹1 · Max usable: {pointsAvailable} pts
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Coupon Code */}
                  <div style={{ marginTop: '20px', border: '1px solid var(--line)', background: 'var(--white)', padding: '16px' }}>
                    <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--ink)', marginBottom: '12px' }}>Have a Coupon Code?</p>

                    {appliedCoupon ? (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                        <div>
                          <span style={{ fontSize: '13px', color: '#166534', fontWeight: 500 }}>{appliedCoupon.code}</span>
                          <span style={{ fontSize: '12px', color: '#15803d', marginLeft: '8px' }}>
                            {appliedCoupon.discount_type === 'percent'
                              ? `${appliedCoupon.discount_value}% off`
                              : `₹${appliedCoupon.discount_value} off`}
                          </span>
                        </div>
                        <button
                          onClick={handleRemoveCoupon}
                          style={{ fontSize: '11px', color: '#c0392b', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px', textDecoration: 'underline' }}
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            value={couponCode}
                            onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); setCouponSuccess(''); }}
                            placeholder="Enter coupon code"
                            style={{ flex: 1, padding: '10px 14px', fontSize: '13px', color: 'var(--ink)', background: 'var(--off)', border: '1px solid var(--line-dk)', outline: 'none', letterSpacing: '0.05em' }}
                          />
                          <button
                            className="btn btn-light"
                            onClick={handleApplyCoupon}
                            disabled={couponLoading}
                            style={{ fontSize: '12px', whiteSpace: 'nowrap', flexShrink: 0 }}
                          >
                            {couponLoading ? 'Checking…' : 'Apply'}
                          </button>
                        </div>
                        {couponError && (
                          <p style={{ fontSize: '12px', color: '#c0392b', marginTop: '8px' }}>{couponError}</p>
                        )}
                        {couponSuccess && (
                          <p style={{ fontSize: '12px', color: '#15803d', marginTop: '8px' }}>{couponSuccess}</p>
                        )}

                        {availableCoupons.length > 0 && (
                          <div style={{ marginTop: '10px' }}>
                            <button
                              type="button"
                              onClick={() => setShowAvailableCoupons(v => !v)}
                              style={{ fontSize: '12px', color: 'var(--gold)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, textDecoration: 'underline', letterSpacing: '0.02em' }}
                            >
                              {showAvailableCoupons ? 'Hide coupons' : `${availableCoupons.length} coupon${availableCoupons.length > 1 ? 's' : ''} available`}
                            </button>

                            {showAvailableCoupons && (
                              <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {availableCoupons.map(c => (
                                  <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => handleSelectAvailableCoupon(c)}
                                    style={{
                                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                      padding: '10px 12px', border: '1px dashed var(--line-dk)',
                                      background: 'var(--off)', cursor: 'pointer', textAlign: 'left', width: '100%',
                                    }}
                                  >
                                    <div>
                                      <span style={{ fontSize: '12px', fontWeight: 600, letterSpacing: '0.06em', fontFamily: 'monospace', color: 'var(--ink)' }}>
                                        {c.code}
                                      </span>
                                      {c.description && (
                                        <span style={{ display: 'block', fontSize: '11px', color: 'var(--ink-3)', marginTop: '2px' }}>
                                          {c.description}
                                        </span>
                                      )}
                                      {c.min_order_amount > 0 && (
                                        <span style={{ display: 'block', fontSize: '11px', color: 'var(--ink-4)', marginTop: '1px' }}>
                                          Min. order ₹{c.min_order_amount}
                                        </span>
                                      )}
                                    </div>
                                    <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--gold)', flexShrink: 0, marginLeft: '12px' }}>
                                      {c.discount_type === 'percent' ? `${c.discount_value}% off` : `₹${c.discount_value} off`}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>

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

                  {/* Discount summary on review step */}
                  {(usePoints && pointsDiscount > 0) || appliedCoupon ? (
                    <div style={{ padding: '14px 16px', background: 'var(--white)', border: '1px solid var(--line)', fontSize: '12px', color: 'var(--ink-3)', marginBottom: '24px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <p style={{ fontWeight: 500, color: 'var(--ink)', marginBottom: '2px', fontSize: '13px' }}>Discounts Applied</p>
                      {usePoints && pointsDiscount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>{Math.min(pointsToUse, pointsAvailable)} Vedic Points</span>
                          <span style={{ color: 'var(--gold)' }}>−₹{pointsDiscount.toFixed(0)}</span>
                        </div>
                      )}
                      {appliedCoupon && couponDiscount > 0 && (
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                          <span>Coupon: {appliedCoupon.code}</span>
                          <span style={{ color: 'var(--gold)' }}>−₹{couponDiscount.toFixed(0)}</span>
                        </div>
                      )}
                    </div>
                  ) : null}

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
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gold)' }}>
                    <span>Vedic Points ({Math.min(pointsToUse, pointsAvailable)} pts)</span>
                    <span>−₹{pointsDiscount.toFixed(0)}</span>
                  </div>
                )}
                {appliedCoupon && couponDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--gold)' }}>
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span>−₹{couponDiscount.toFixed(0)}</span>
                  </div>
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