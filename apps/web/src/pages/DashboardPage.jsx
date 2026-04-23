/* ═══════════════════════════════════════════════
   DASHBOARD PAGE
   ═══════════════════════════════════════════════ */
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import supabase from '@/lib/supabaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import InfluencerDashboard from '@/components/InfluencerDashboard.jsx';
import AddressesSidebar from '@/components/AddressesSidebar.jsx';

const VP_DEDUCT_TYPES = ['redeem', 'redemption', 'order_cancelled'];

const fetchVedicPoints = async (userId) => {
  const { data } = await supabase
    .from('loyalty_points')
    .select('points_earned, transaction_type')
    .eq('customer_id', userId);
  if (!data) return 0;
  return Math.max(0, data.reduce((sum, r) => {
    const pts = r.points_earned ?? 0;
    return VP_DEDUCT_TYPES.includes(r.transaction_type) ? sum - pts : sum + pts;
  }, 0));
};

export const DashboardPage = () => {
  const { currentUser, logout, isInfluencer } = useAuth();
  const [orders, setOrders]           = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [apptLoading, setApptLoading] = useState(true);
  const [tab, setTab]                 = useState('orders');
  const [cancellingId, setCancellingId] = useState(null);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);
  const [orderCancelModal, setOrderCancelModal] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [vedicPoints, setVedicPoints] = useState(null);

  /* ── Responsive breakpoints ── */
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isMobile = windowWidth < 768;
  const isTablet = windowWidth < 1024;

  const DB_STYLES = '@keyframes db-slideDown { from { opacity: 0; transform: translateY(-12px); } to { opacity: 1; transform: translateY(0); } }';

  const handleSelectItem = (type, data) => {
    setSelectedItem(prev =>
      prev && prev.type === type && prev.data.id === data.id ? null : { type, data }
    );
  };

  /* Format "09:00" → "9:00 AM", "14:30" → "2:30 PM" */
  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour = h % 12 || 12;
    return `${hour}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  /* Format appointment date — stored as "YYYY-MM-DD 12:00:00.000Z" */
  const formatApptDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr.includes('T') ? dateStr : dateStr.replace(' ', 'T'));
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  useEffect(() => {
    if (!currentUser) return;
    setVedicPoints(currentUser.vedic_points ?? 0);
    fetchVedicPoints(currentUser.id).then(setVedicPoints);
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    supabase.from('orders').select('*')
      .eq('customer_id', currentUser.id).order('created', { ascending: false }).limit(50)
      .then(({ data }) => { setOrders(data ?? []); setLoading(false); }).catch(() => setLoading(false));
  }, [currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    supabase.from('appointments').select('*, doctor:doctor_id(*)')
      .eq('customer_id', currentUser.id).order('created', { ascending: false }).limit(50)
      .then(({ data }) => { setAppointments(data ?? []); setApptLoading(false); })
      .catch(() => setApptLoading(false));
  }, [currentUser]);

  const handleCancelOrder = async (order) => {
    setCancellingOrderId(order.id);
    setOrderCancelModal(null);
    try {
      const { error: cancelError } = await supabase.from('orders').update({ status: 'cancelled' }).eq('id', order.id);
      if (cancelError) throw cancelError;

      const { data: earnedRecords } = await supabase
        .from('loyalty_points')
        .select('id, points_earned, transaction_type')
        .eq('customer_id', currentUser.id)
        .eq('order_id', order.id);

      if (earnedRecords && earnedRecords.length > 0) {
        // Restore points that were redeemed/spent on this order
        const restorations = earnedRecords
          .filter(r => ['redeem', 'redemption'].includes(r.transaction_type))
          .map(r => ({
            customer_id: currentUser.id,
            points_earned: r.points_earned,
            transaction_type: 'order_restore',
            order_id: order.id,
          }));
        if (restorations.length > 0) await supabase.from('loyalty_points').insert(restorations);

        // Reverse points that were earned from this purchase
        const reversals = earnedRecords
          .filter(r => r.transaction_type === 'purchase')
          .map(r => ({
            customer_id: currentUser.id,
            points_earned: r.points_earned,
            transaction_type: 'order_cancelled',
            order_id: order.id,
          }));
        if (reversals.length > 0) await supabase.from('loyalty_points').insert(reversals);
      }

      const items = order.items ?? [];
      for (const item of items) {
        if (!item.id) continue;
        const qty = item.quantity || item.qty || 0;
        if (qty <= 0) continue;
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.id)
          .single();
        if (product != null) {
          await supabase
            .from('products')
            .update({ stock: (product.stock || 0) + qty })
            .eq('id', item.id);
        }
      }

      setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o));
      setSelectedItem(prev =>
        prev && prev.type === 'order' && prev.data.id === order.id
          ? { ...prev, data: { ...prev.data, status: 'cancelled' } }
          : prev
      );
      fetchVedicPoints(currentUser.id).then(setVedicPoints);
    } catch (err) {
      console.error('Order cancellation failed:', err);
      alert('Failed to cancel order. Please try again or contact support.');
    } finally {
      setCancellingOrderId(null);
    }
  };

  const handleCancelAppointment = async (apptId, slotId, apptData) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    setCancellingId(apptId);
    try {
      await supabase.from('appointments').update({ status: 'cancelled' }).eq('id', apptId);

      let resolvedSlotId = slotId || null;

      if (!resolvedSlotId && apptData) {
        try {
          const raw = apptData.date || '';
          const dateStr = raw.substring(0, 10);

          if (dateStr.length === 10 && apptData.doctor_id && apptData.time) {
            const { data: slots } = await supabase.from('availability_slots').select('id')
              .eq('doctor_id', apptData.doctor_id)
              .eq('time', apptData.time)
              .gte('date', dateStr + 'T00:00:00')
              .lt('date', dateStr + 'T23:59:59')
              .limit(1);
            if (slots?.length > 0) resolvedSlotId = slots[0].id;
          }
        } catch (lookupErr) {
          console.warn('Slot lookup failed:', lookupErr);
        }
      }

      if (resolvedSlotId) {
        await supabase.from('availability_slots').update({ is_booked: false }).eq('id', resolvedSlotId);
      }

      setAppointments(prev => prev.map(a => a.id === apptId ? { ...a, status: 'cancelled' } : a));
      setSelectedItem(prev =>
        prev && prev.type === 'appointment' && prev.data.id === apptId
          ? { ...prev, data: { ...prev.data, status: 'cancelled' } }
          : prev
      );
    } catch (err) {
      console.error('Cancel failed:', err);
      alert('Failed to cancel appointment. Please try again or contact support.');
    } finally {
      setCancellingId(null);
    }
  };

  const getOrderQty = (o) => {
    if (o.quantity) return o.quantity;
    return (o.items ?? []).reduce((sum, item) => sum + (item.quantity || item.qty || 0), 0);
  };

  const apptStatusStyle = (status) => {
    switch (status) {
      case 'booked':    return { background: '#dcfce7', color: '#166534' };
      case 'completed': return { background: '#e0f2fe', color: '#0369a1' };
      case 'cancelled': return { background: '#f3f4f6', color: '#4b5563' };
      default:          return { background: '#f3f4f6', color: '#4b5563' };
    }
  };

  const statuses = { pending: 'status-pending', processing: 'status-processing', shipped: 'status-shipped', delivered: 'status-delivered' };

  return (
    <>
      <Helmet>
        <title>Dashboard | The Vedic Protocol</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      {/* ── Order cancel confirmation modal ── */}
      {orderCancelModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 9000,
            background: 'rgba(20,18,14,0.55)', backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setOrderCancelModal(null)}
        >
          <div
            style={{
              background: 'var(--white)', border: '1px solid var(--line)',
              padding: isMobile ? '28px 20px' : '40px', maxWidth: '480px', width: '100%',
              animation: 'db-slideDown 0.28s cubic-bezier(0.22,1,0.36,1) both',
            }}
            onClick={e => e.stopPropagation()}
          >
            <style>{DB_STYLES}</style>
            <div style={{ width: '48px', height: '48px', border: '1px solid var(--line)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="var(--ink-4)" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p style={{ fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '8px' }}>Cancel Order</p>
            <h3 style={{ fontFamily: 'var(--serif)', fontSize: isMobile ? '18px' : '22px', fontWeight: 400, color: 'var(--ink)', marginBottom: '12px', lineHeight: 1.3 }}>
              We're sad to see you step away<br />from your ritual.
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--ink-3)', lineHeight: 1.8, marginBottom: '8px' }}>
              Order <strong style={{ color: 'var(--ink)' }}>#{orderCancelModal.legacy_id || orderCancelModal.id.slice(0, 8).toUpperCase()}</strong> will be marked as cancelled.
              Any Vedic Points earned on this order will be reversed and your balance adjusted accordingly.
            </p>
            <p style={{ fontSize: '12px', color: 'var(--ink-4)', marginBottom: '32px' }}>
              This action cannot be undone. If you have concerns, please reach out to our support team before proceeding.
            </p>
            <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '12px' }}>
              <button
                onClick={() => handleCancelOrder(orderCancelModal)}
                disabled={cancellingOrderId === orderCancelModal.id}
                style={{
                  flex: '1', background: 'var(--ink)', color: 'var(--white)',
                  border: '1px solid var(--ink)', padding: '12px 20px',
                  fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
                  cursor: cancellingOrderId === orderCancelModal.id ? 'not-allowed' : 'pointer',
                  opacity: cancellingOrderId === orderCancelModal.id ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                {cancellingOrderId === orderCancelModal.id ? 'Cancelling…' : 'Yes, Cancel Order'}
              </button>
              <button
                onClick={() => setOrderCancelModal(null)}
                style={{
                  flex: '1', background: 'none', color: 'var(--ink)',
                  border: '1px solid var(--line)', padding: '12px 20px',
                  fontSize: '11px', letterSpacing: '0.08em', textTransform: 'uppercase',
                  cursor: 'pointer', transition: 'border-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--ink)'}
                onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line)'}
              >
                Keep My Order
              </button>
            </div>
          </div>
        </div>
      )}

      <Header />
      <main id="main">
        <div style={{ maxWidth: 'var(--max)', margin: '0 auto', padding: isMobile ? '28px 16px 48px' : isTablet ? '40px 24px 64px' : '56px 40px 80px' }}>

          {/* Header row */}
          <div style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: isMobile ? 'flex-start' : 'flex-end',
            gap: isMobile ? '16px' : '0',
            marginBottom: isMobile ? '32px' : '48px',
            paddingBottom: '24px',
            borderBottom: '1px solid var(--line)',
          }}>
            <div>
              <p style={{ fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '8px' }}>Your Account</p>
              <h1 style={{ fontFamily: 'var(--serif)', fontSize: isMobile ? '28px' : '36px', fontWeight: 400, color: 'var(--ink)' }}>
                {currentUser?.name || 'Welcome back'}.
              </h1>
            </div>
            <button type="button" className="btn btn-light" onClick={logout} style={{ fontSize: '11px', alignSelf: isMobile ? 'flex-start' : 'auto' }}>Log Out</button>
          </div>

          {/* ── Detail Panel ── */}
          {selectedItem && (
            <div style={{
              marginBottom: '32px',
              border: '1px solid var(--line)',
              background: 'var(--white)',
              overflow: 'hidden',
              animation: 'db-slideDown 0.28s cubic-bezier(0.22,1,0.36,1) both',
            }}>
              <style>{DB_STYLES}</style>

              {/* Panel top bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: 'var(--off)', borderBottom: '1px solid var(--line)' }}>
                <p style={{ fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', margin: 0 }}>
                  {selectedItem.type === 'order' ? 'Order Details' : 'Appointment Details'}
                </p>
                <button
                  onClick={() => setSelectedItem(null)}
                  aria-label="Close detail panel"
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ink-4)', padding: '4px', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-4)'}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M1.5 1.5l11 11M12.5 1.5l-11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>

              {/* Order detail */}
              {selectedItem.type === 'order' && (() => {
                const o = selectedItem.data;
                const isCancelledOrder  = o.status === 'cancelled';
                const isDeliveredOrder  = o.status === 'delivered';
                const isShippedOrder    = o.status === 'shipped';
                const canCancelOrder    = !isCancelledOrder && !isDeliveredOrder && !isShippedOrder;
                return (
                  <div style={{ padding: isMobile ? '20px 16px' : '28px 24px' }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(6, 1fr)',
                      gap: isMobile ? '16px' : '24px',
                      paddingBottom: '24px',
                      borderBottom: '1px solid var(--line)',
                      marginBottom: '24px',
                    }}>
                      {[
                        ['Order Number', `#${o.legacy_id || o.id.slice(0, 8).toUpperCase()}`, false],
                        ['Date', new Date(o.created).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }), false],
                        ['Total', `₹${o.total?.toFixed(0)}`, false],
                        ['Quantity', `${getOrderQty(o)} item${getOrderQty(o) !== 1 ? 's' : ''}`, false],
                        ['Vedic Pts Used', o.vedic_points_used > 0 ? `${o.vedic_points_used} pts` : '—', true],
                        ['Status', o.status, false],
                      ].map(([label, value, isGold]) => (
                        <div key={label}>
                          <p style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: '6px' }}>{label}</p>
                          <p style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: isGold && o.vedic_points_used > 0 ? 'var(--gold)' : 'var(--ink)', textTransform: label === 'Status' ? 'capitalize' : 'none' }}>{value}</p>
                        </div>
                      ))}
                    </div>
                    {o.items?.length > 0 && (
                      <div>
                        <p style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: '12px' }}>Items</p>
                        {o.items.map((item, i) => (
                          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line)', fontSize: '13px' }}>
                            <div>
                              <p style={{ color: 'var(--ink)', marginBottom: '2px' }}>{item.name}</p>
                              <p style={{ color: 'var(--ink-4)', fontSize: '11px' }}>Qty: {item.quantity || item.qty}</p>
                            </div>
                            <span style={{ color: 'var(--ink)', flexShrink: 0, marginLeft: '12px' }}>₹{((item.price) * (item.quantity || item.qty)).toFixed(0)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {o.shipping_address && (
                      <div style={{ marginTop: '20px' }}>
                        <p style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: '6px' }}>Shipping Address</p>
                        <p style={{ fontSize: '13px', color: 'var(--ink-3)', lineHeight: 1.7 }}>
                          {(() => { const a = o.shipping_address; if (!a) return 'N/A'; if (typeof a === 'object') return `${a.address || ''}, ${a.city || ''}, ${a.state || ''} ${a.zip || ''}`; try { const p = JSON.parse(a); return `${p.address}, ${p.city}, ${p.state} ${p.zip}`; } catch { return String(a); } })()}
                        </p>
                      </div>
                    )}
                    {canCancelOrder && (
                      <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--line)' }}>
                        <button
                          onClick={() => setOrderCancelModal(o)}
                          disabled={cancellingOrderId === o.id}
                          style={{
                            background: 'none', border: '1px solid #fecaca', padding: '8px 20px',
                            fontSize: '12px', color: '#dc2626',
                            cursor: cancellingOrderId === o.id ? 'not-allowed' : 'pointer',
                            transition: 'all 0.2s', opacity: cancellingOrderId === o.id ? 0.6 : 1,
                          }}
                          onMouseEnter={e => { if (cancellingOrderId !== o.id) { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#dc2626'; } }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = '#fecaca'; }}
                        >
                          {cancellingOrderId === o.id ? 'Cancelling…' : 'Cancel Order'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Appointment detail */}
              {selectedItem.type === 'appointment' && (() => {
                const appt = selectedItem.data;
                const doctorName = appt.doctor?.name || 'Doctor';
                const doctorSpec = appt.doctor?.specialization || '';
                const doctorQual = appt.doctor?.title || '';
                const isCancelled = appt.status === 'cancelled';
                const isCompleted = appt.status === 'completed';
                const canCancel   = !isCancelled && !isCompleted;
                return (
                  <div style={{ padding: isMobile ? '20px 16px' : '28px 24px' }}>
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
                      gap: isMobile ? '16px' : '24px',
                      paddingBottom: '24px',
                      borderBottom: '1px solid var(--line)',
                      marginBottom: '24px',
                    }}>
                      {[
                        ['Doctor', doctorName],
                        ['Date', formatApptDate(appt.date)],
                        ['Time', formatTime(appt.time)],
                        ['Status', appt.status],
                      ].map(([label, value]) => (
                        <div key={label}>
                          <p style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: '6px' }}>{label}</p>
                          <p style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: label === 'Status' ? (isCancelled ? '#4b5563' : isCompleted ? '#0369a1' : '#166534') : 'var(--ink)', textTransform: 'capitalize' }}>{value}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '16px' : '24px', marginBottom: canCancel ? '24px' : '0' }}>
                      {doctorSpec && (
                        <div>
                          <p style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: '6px' }}>Specialisation</p>
                          <p style={{ fontSize: '13px', color: 'var(--ink-3)' }}>{doctorSpec}</p>
                        </div>
                      )}
                      {doctorQual && (
                        <div>
                          <p style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: '6px' }}>Qualification</p>
                          <p style={{ fontSize: '13px', color: 'var(--ink-3)' }}>{doctorQual}</p>
                        </div>
                      )}
                      {appt.name && (
                        <div>
                          <p style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: '6px' }}>Patient Name</p>
                          <p style={{ fontSize: '13px', color: 'var(--ink-3)' }}>{appt.name}</p>
                        </div>
                      )}
                      {appt.phone && (
                        <div>
                          <p style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: '6px' }}>Phone</p>
                          <p style={{ fontSize: '13px', color: 'var(--ink-3)' }}>{appt.phone}</p>
                        </div>
                      )}
                      {appt.concerns && (
                        <div style={{ gridColumn: isMobile ? '1' : '1 / -1' }}>
                          <p style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: '6px' }}>Concern</p>
                          <p style={{ fontSize: '13px', color: 'var(--ink-3)', lineHeight: 1.7 }}>{appt.concerns}</p>
                        </div>
                      )}
                    </div>
                    {canCancel && (
                      <button
                        onClick={() => handleCancelAppointment(appt.id, appt.slot_id, appt)}
                        disabled={cancellingId === appt.id}
                        style={{
                          background: 'none', border: '1px solid #fecaca', padding: '8px 20px',
                          fontSize: '12px', color: '#dc2626', cursor: cancellingId === appt.id ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s', opacity: cancellingId === appt.id ? 0.6 : 1,
                        }}
                        onMouseEnter={e => { if (cancellingId !== appt.id) { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.borderColor = '#dc2626'; } }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = '#fecaca'; }}
                      >
                        {cancellingId === appt.id ? 'Cancelling…' : 'Cancel Appointment'}
                      </button>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* ── Mobile Nav Tabs (shown only on mobile/tablet above content) ── */}
          {isMobile && (
            <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '1px solid var(--line)', overflowX: 'auto' }}>
              {[['orders','Orders'],['appointments','Appointments']].map(([t, l]) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setSelectedItem(null); }}
                  style={{
                    padding: '10px 16px',
                    fontSize: '11px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                    color: tab === t ? 'var(--ink)' : 'var(--ink-4)',
                    background: 'none',
                    border: 'none',
                    borderBottom: tab === t ? '2px solid var(--ink)' : '2px solid transparent',
                    cursor: 'pointer',
                    fontWeight: tab === t ? 500 : 400,
                    whiteSpace: 'nowrap',
                    marginBottom: '-1px',
                    transition: 'color 0.2s, border-color 0.2s',
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : isTablet ? '220px 1fr' : '260px 1fr', gap: isMobile ? '24px' : '48px', alignItems: 'start' }}>

            {/* ── Sidebar ── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '12px' : '16px', position: isMobile ? 'static' : 'sticky', top: '88px' }}>

              {/* Profile card */}
              <div style={{ background: 'var(--off)', border: '1px solid var(--line)', padding: isMobile ? '16px' : '24px', borderRadius: '16px' }}>
                {isMobile ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', background: 'var(--ink)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontFamily: 'var(--serif)', fontSize: '14px', color: 'var(--gold)' }}>
                        {(currentUser?.name || 'U')[0].toUpperCase()}
                      </span>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--ink)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser?.name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--ink-4)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentUser?.email}</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: '4px' }}>Logged in as</p>
                    <p style={{ fontFamily: 'var(--serif)', fontSize: '16px', color: 'var(--ink)', marginBottom: '2px' }}>{currentUser?.name}</p>
                    <p style={{ fontSize: '12px', color: 'var(--ink-4)' }}>{currentUser?.email}</p>
                    {isInfluencer && (
                      <span className="inline-block mt-3 px-2 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] uppercase tracking-wider rounded border border-[#D4AF37]/20">
                        Influencer Partner
                      </span>
                    )}
                  </>
                )}
              </div>

              {/* Vedic Points card */}
              <div style={{ background: 'var(--ink)', padding: isMobile ? '16px 20px' : '24px', borderRadius: '16px' }}>
                {isMobile ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '4px' }}>Vedic Points</p>
                      <p style={{ fontFamily: 'var(--serif)', fontSize: '28px', color: 'var(--gold)', lineHeight: 1 }}>{vedicPoints ?? currentUser?.vedic_points ?? 0}</p>
                      <p style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginTop: '4px' }}>Tier: {currentUser?.tier || 'Bronze'}</p>
                    </div>
                    <Link to="/vedic-points" style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-lt)', borderBottom: '1px solid rgba(201,169,110,0.4)', paddingBottom: '2px', flexShrink: 0 }}>
                      View →
                    </Link>
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.4)', marginBottom: '8px' }}>Vedic Points</p>
                    <p style={{ fontFamily: 'var(--serif)', fontSize: '40px', color: 'var(--gold)', lineHeight: 1, marginBottom: '8px' }}>{vedicPoints ?? currentUser?.vedic_points ?? 0}</p>
                    <p style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)' }}>Tier: {currentUser?.tier || 'Bronze'}</p>
                    <Link to="/vedic-points" style={{ display: 'inline-block', marginTop: '16px', fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--gold-lt)', borderBottom: '1px solid rgba(201,169,110,0.4)', paddingBottom: '2px' }}>
                      View Details →
                    </Link>
                  </>
                )}
              </div>

              {/* Nav — hidden on mobile (tabs shown above instead) */}
              {!isMobile && (
                <nav style={{ display: 'flex', flexDirection: 'column' }} aria-label="Dashboard navigation">
                  {[['orders','Order History'],['appointments','My Appointments'],['shop','Browse Formulations']].map(([t,l]) => (
                    t === 'shop'
                      ? <Link key={t} to="/shop" style={{ padding: '12px 0', fontSize: '12px', color: 'var(--ink-3)', borderTop: '1px solid var(--line)', letterSpacing: '0.04em' }}>{l}</Link>
                      : <button key={t} onClick={() => { setTab(t); setSelectedItem(null); }} style={{ padding: '12px 0', fontSize: '12px', color: tab === t ? 'var(--ink)' : 'var(--ink-3)', borderTop: '1px solid var(--line)', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontWeight: tab === t ? 500 : 400, letterSpacing: '0.04em' }}>{l}</button>
                  ))}
                </nav>
              )}

              {/* Addresses Sidebar Module */}
              {!isMobile && <AddressesSidebar />}
            </div>

            {/* ── Main content ── */}
            <div className="min-w-0">
              {/* Influencer Dashboard Section */}
              {isInfluencer && (
                <InfluencerDashboard currentUser={currentUser} />
              )}

              {/* ── ADDRESSES TAB ── */}
              {tab === 'addresses' && (
                <AddressesSidebar />
              )}

              {/* ── ORDER HISTORY TAB ── */}
              {tab === 'orders' && (
                <>
                  {!isMobile && (
                    <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 400, color: 'var(--ink)', marginBottom: '24px' }}>Order History</h2>
                  )}
                  {loading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[1,2,3].map(i => <div key={i} style={{ height: '72px', background: 'var(--stone)', borderRadius: '12px' }}></div>)}
                    </div>
                  ) : orders.length === 0 ? (
                    <div style={{ padding: isMobile ? '40px 20px' : '64px 40px', background: 'var(--off)', border: '1px solid var(--line)', textAlign: 'center', borderRadius: '16px' }}>
                      <p style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--ink)', fontStyle: 'italic', marginBottom: '6px' }}>No orders yet.</p>
                      <p style={{ fontSize: '12px', color: 'var(--ink-4)', marginBottom: '24px' }}>Your order history will appear here.</p>
                      <Link to="/shop" className="btn btn-dark">Start Your Protocol</Link>
                    </div>
                  ) : isMobile ? (
                    /* ── MOBILE: Order cards ── */
                    <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--line)', borderRadius: '12px', overflow: 'hidden' }}>
                      {orders.map((o, idx) => {
                        const isCancelledOrder = o.status === 'cancelled';
                        const isDeliveredOrder = o.status === 'delivered';
                        const isShippedOrder   = o.status === 'shipped';
                        const canCancelOrder   = !isCancelledOrder && !isDeliveredOrder && !isShippedOrder;
                        return (
                          <div
                            key={o.id}
                            onClick={() => handleSelectItem('order', o)}
                            style={{
                              padding: '16px',
                              borderBottom: idx < orders.length - 1 ? '1px solid var(--line)' : 'none',
                              cursor: 'pointer',
                              background: selectedItem?.data?.id === o.id ? 'var(--off)' : 'var(--white)',
                              opacity: isCancelledOrder ? 0.6 : 1,
                              transition: 'background 0.15s',
                            }}
                          >
                            {/* Top row: order number + status */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <span style={{ fontFamily: 'var(--serif)', fontSize: '16px', color: 'var(--ink)' }}>
                                #{o.legacy_id || o.id.slice(0, 8).toUpperCase()}
                              </span>
                              <span className={`status ${statuses[o.status] || 'status-pending'}`} style={{ flexShrink: 0, marginLeft: '8px' }}>
                                {o.status}
                              </span>
                            </div>
                            {/* Second row: date + total + qty */}
                            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--ink-3)', marginBottom: o.vedic_points_used > 0 || canCancelOrder ? '8px' : '0' }}>
                              <span>{new Date(o.created).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                              <span style={{ color: 'var(--ink)', fontWeight: 500 }}>₹{o.total?.toFixed(0)}</span>
                              <span style={{ color: 'var(--ink-4)' }}>{getOrderQty(o)} item{getOrderQty(o) !== 1 ? 's' : ''}</span>
                            </div>
                            {/* Vedic points row */}
                            {o.vedic_points_used > 0 && (
                              <div style={{ fontSize: '11px', color: 'var(--gold)', marginBottom: canCancelOrder ? '8px' : '0' }}>
                                {o.vedic_points_used} Vedic Points used
                              </div>
                            )}
                            {/* Cancel button */}
                            {canCancelOrder && (
                              <div onClick={e => e.stopPropagation()}>
                                <button
                                  onClick={() => setOrderCancelModal(o)}
                                  disabled={cancellingOrderId === o.id}
                                  style={{
                                    background: 'none', border: '1px solid #fecaca',
                                    padding: '6px 14px', fontSize: '11px',
                                    color: cancellingOrderId === o.id ? 'var(--ink-4)' : '#dc2626',
                                    cursor: cancellingOrderId === o.id ? 'not-allowed' : 'pointer',
                                    borderRadius: '4px',
                                  }}
                                >
                                  {cancellingOrderId === o.id ? 'Cancelling…' : 'Cancel Order'}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* ── DESKTOP: Order table ── */
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 100px 100px 120px 100px 80px', gap: '16px', padding: '12px 0', borderBottom: '1px solid var(--line)', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>
                        <span>Order</span><span>Date</span><span>Total</span><span>Qty</span><span>Vedic Pts Used</span><span>Status</span><span></span>
                      </div>
                      {orders.map(o => {
                        const isCancelledOrder = o.status === 'cancelled';
                        const isDeliveredOrder = o.status === 'delivered';
                        const isShippedOrder   = o.status === 'shipped';
                        const canCancelOrder   = !isCancelledOrder && !isDeliveredOrder && !isShippedOrder;
                        return (
                          <div
                            key={o.id}
                            onClick={() => handleSelectItem('order', o)}
                            style={{
                              display: 'grid', gridTemplateColumns: '1fr 140px 100px 100px 120px 100px 80px', gap: '16px',
                              borderBottom: '1px solid var(--line)', alignItems: 'center',
                              cursor: 'pointer', transition: 'background 0.15s',
                              background: selectedItem?.data?.id === o.id ? 'var(--off)' : 'transparent',
                              margin: '0 -12px', padding: '16px 12px',
                              opacity: isCancelledOrder ? 0.55 : 1,
                            }}
                            onMouseEnter={e => { if (selectedItem?.data?.id !== o.id) e.currentTarget.style.background = 'var(--stone)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = selectedItem?.data?.id === o.id ? 'var(--off)' : 'transparent'; }}
                          >
                            <span style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--ink)' }}>#{o.legacy_id || o.id.slice(0, 8).toUpperCase()}</span>
                            <span style={{ fontSize: '12px', color: 'var(--ink-3)' }}>{new Date(o.created).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</span>
                            <span style={{ fontSize: '13px', color: 'var(--ink)' }}>₹{o.total?.toFixed(0)}</span>
                            <span style={{ fontSize: '13px', color: 'var(--ink)' }}>{getOrderQty(o)}</span>
                            <span style={{ fontSize: '13px', color: o.vedic_points_used > 0 ? 'var(--gold)' : 'var(--ink-4)' }}>
                              {o.vedic_points_used > 0 ? `${o.vedic_points_used} pts` : '—'}
                            </span>
                            <span className={`status ${statuses[o.status] || 'status-pending'}`}>{o.status}</span>
                            <div onClick={e => e.stopPropagation()}>
                              {canCancelOrder && (
                                <button
                                  onClick={() => setOrderCancelModal(o)}
                                  disabled={cancellingOrderId === o.id}
                                  style={{
                                    background: 'none', border: '1px solid var(--line-dk)',
                                    padding: '5px 10px', fontSize: '11px',
                                    color: cancellingOrderId === o.id ? 'var(--ink-4)' : '#dc2626',
                                    cursor: cancellingOrderId === o.id ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s', whiteSpace: 'nowrap',
                                  }}
                                  onMouseEnter={e => { if (cancellingOrderId !== o.id) e.currentTarget.style.background = '#fef2f2'; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                                >
                                  {cancellingOrderId === o.id ? '...' : 'Cancel'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* ── APPOINTMENTS TAB ── */}
              {tab === 'appointments' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    {!isMobile && <h2 style={{ fontFamily: 'var(--serif)', fontSize: '24px', fontWeight: 400, color: 'var(--ink)' }}>My Appointments</h2>}
                    {isMobile && <p style={{ fontFamily: 'var(--serif)', fontSize: '20px', fontWeight: 400, color: 'var(--ink)' }}>My Appointments</p>}
                    <Link to="/doctors" className="btn btn-light" style={{ fontSize: '11px' }}>Book New</Link>
                  </div>

                  {apptLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[1,2,3].map(i => <div key={i} style={{ height: '88px', background: 'var(--stone)', borderRadius: '12px' }}></div>)}
                    </div>
                  ) : appointments.length === 0 ? (
                    <div style={{ padding: isMobile ? '40px 20px' : '64px 40px', background: 'var(--off)', border: '1px solid var(--line)', textAlign: 'center', borderRadius: '16px' }}>
                      <p style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--ink)', fontStyle: 'italic', marginBottom: '6px' }}>No appointments yet.</p>
                      <p style={{ fontSize: '12px', color: 'var(--ink-4)', marginBottom: '24px' }}>Book a consultation with one of our Ayurvedic doctors.</p>
                      <Link to="/doctors" className="btn btn-dark">Talk to Doctors</Link>
                    </div>
                  ) : isMobile ? (
                    /* ── MOBILE: Appointment cards ── */
                    <div style={{ display: 'flex', flexDirection: 'column', border: '1px solid var(--line)', borderRadius: '12px', overflow: 'hidden' }}>
                      {appointments.map((appt, idx) => {
                        const doctorName = appt.doctor?.name || appt.doctor_name || 'Doctor';
                        const doctorSpec = appt.doctor?.specialization || '';
                        const isCancelled = appt.status === 'cancelled';
                        const isCompleted = appt.status === 'completed';
                        const canCancel   = !isCancelled && !isCompleted;

                        return (
                          <div
                            key={appt.id}
                            onClick={() => handleSelectItem('appointment', appt)}
                            style={{
                              padding: '16px',
                              borderBottom: idx < appointments.length - 1 ? '1px solid var(--line)' : 'none',
                              cursor: 'pointer',
                              background: selectedItem?.data?.id === appt.id ? 'var(--off)' : 'var(--white)',
                              opacity: isCancelled ? 0.6 : 1,
                              transition: 'background 0.15s',
                            }}
                          >
                            {/* Top row: doctor name + status badge */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                              <div style={{ minWidth: 0, flex: 1, marginRight: '8px' }}>
                                <p style={{ fontFamily: 'var(--serif)', fontSize: '16px', color: 'var(--ink)', marginBottom: '2px' }}>
                                  {doctorName}
                                </p>
                                {doctorSpec && (
                                  <p style={{ fontSize: '10px', letterSpacing: '0.06em', color: 'var(--ink-4)', textTransform: 'uppercase' }}>
                                    {doctorSpec}
                                  </p>
                                )}
                              </div>
                              <span style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                height: '22px',
                                padding: '0 8px',
                                fontSize: '9px',
                                letterSpacing: '0.06em',
                                textTransform: 'uppercase',
                                borderRadius: '2px',
                                fontWeight: 500,
                                flexShrink: 0,
                                ...apptStatusStyle(appt.status),
                              }}>
                                {appt.status}
                              </span>
                            </div>
                            {/* Date + Time row */}
                            <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: 'var(--ink-3)', marginBottom: canCancel ? '12px' : '0' }}>
                              <span>{formatApptDate(appt.date)}</span>
                              <span style={{ color: 'var(--ink)', fontFamily: 'var(--serif)' }}>{formatTime(appt.time)}</span>
                            </div>
                            {/* Cancel button */}
                            {canCancel && (
                              <div onClick={e => e.stopPropagation()}>
                                <button
                                  onClick={() => handleCancelAppointment(appt.id, appt.slot_id, appt)}
                                  disabled={cancellingId === appt.id}
                                  style={{
                                    background: 'none', border: '1px solid #fecaca',
                                    padding: '6px 14px', fontSize: '11px',
                                    color: cancellingId === appt.id ? 'var(--ink-4)' : '#dc2626',
                                    cursor: cancellingId === appt.id ? 'not-allowed' : 'pointer',
                                    borderRadius: '4px',
                                  }}
                                >
                                  {cancellingId === appt.id ? 'Cancelling…' : 'Cancel'}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* ── DESKTOP: Appointment table ── */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0', overflowX: 'auto' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) 160px 120px 100px 80px', gap: '16px', padding: '12px 0', borderBottom: '1px solid var(--line)', fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-4)', minWidth: '600px' }}>
                        <span>Doctor</span>
                        <span>Date</span>
                        <span>Time</span>
                        <span>Status</span>
                        <span></span>
                      </div>

                      {appointments.map(appt => {
                        const doctorName = appt.doctor?.name || appt.doctor_name || 'Doctor';
                        const doctorSpec = appt.doctor?.specialization || '';
                        const isCancelled = appt.status === 'cancelled';
                        const isCompleted = appt.status === 'completed';
                        const canCancel   = !isCancelled && !isCompleted;

                        return (
                          <div
                            key={appt.id}
                            onClick={() => handleSelectItem('appointment', appt)}
                            style={{
                              display: 'grid',
                              gridTemplateColumns: '1fr 160px 120px 100px 80px',
                              gap: '16px',
                              padding: '20px 12px',
                              margin: '0 -12px',
                              borderBottom: '1px solid var(--line)',
                              alignItems: 'center',
                              opacity: isCancelled ? 0.55 : 1,
                              cursor: 'pointer',
                              transition: 'background 0.15s, opacity 0.2s',
                              background: selectedItem?.data?.id === appt.id ? 'var(--off)' : 'transparent',
                              minWidth: '600px',
                            }}
                            onMouseEnter={e => { if (selectedItem?.data?.id !== appt.id) e.currentTarget.style.background = 'var(--stone)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = selectedItem?.data?.id === appt.id ? 'var(--off)' : 'transparent'; }}
                          >
                            <div>
                              <p style={{ fontFamily: 'var(--serif)', fontSize: '15px', color: 'var(--ink)', marginBottom: '2px' }}>
                                {doctorName}
                              </p>
                              {doctorSpec && (
                                <p style={{ fontSize: '10px', letterSpacing: '0.08em', color: 'var(--ink-4)', textTransform: 'uppercase' }}>
                                  {doctorSpec}
                                </p>
                              )}
                            </div>
                            <span style={{ fontSize: '12px', color: 'var(--ink-3)' }}>
                              {formatApptDate(appt.date)}
                            </span>
                            <span style={{ fontSize: '13px', color: 'var(--ink)', fontFamily: 'var(--serif)' }}>
                              {formatTime(appt.time)}
                            </span>
                            <span style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              height: '24px',
                              padding: '0 10px',
                              fontSize: '10px',
                              letterSpacing: '0.06em',
                              textTransform: 'uppercase',
                              borderRadius: '2px',
                              fontWeight: 500,
                              ...apptStatusStyle(appt.status),
                            }}>
                              {appt.status}
                            </span>
                            <div>
                              {canCancel && (
                                <button
                                  onClick={e => { e.stopPropagation(); handleCancelAppointment(appt.id, appt.slot_id, appt); }}
                                  disabled={cancellingId === appt.id}
                                  style={{
                                    background: 'none',
                                    border: '1px solid var(--line-dk)',
                                    padding: '5px 10px',
                                    fontSize: '11px',
                                    color: cancellingId === appt.id ? 'var(--ink-4)' : '#dc2626',
                                    cursor: cancellingId === appt.id ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    whiteSpace: 'nowrap',
                                  }}
                                  onMouseEnter={e => { if (cancellingId !== appt.id) e.currentTarget.style.background = '#fef2f2'; }}
                                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                                >
                                  {cancellingId === appt.id ? '...' : 'Cancel'}
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              )}

              {/* Addresses on mobile shown at bottom of main content */}
              {isMobile && (
                <div style={{ marginTop: '24px' }}>
                  <AddressesSidebar />
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

/* ═══════════════════════════════════════════════
   VEDIC POINTS PAGE
   ═══════════════════════════════════════════════ */
const VP_REDEEM_TYPES = ['redeem', 'redemption', 'order_cancelled'];

export const VedicPointsPage = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [currentTier, setCurrentTier] = useState('Bronze');

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isMobile = windowWidth < 768;

  useEffect(() => {
    if (!isAuthenticated || !currentUser) { setLoading(false); return; }
    Promise.all([
      supabase.from('loyalty_points').select('points_earned, transaction_type').eq('customer_id', currentUser.id),
      supabase.from('loyalty_points').select('*').eq('customer_id', currentUser.id).order('created', { ascending: false }).limit(20),
    ]).then(([{ data: allPts }, { data: hist }]) => {
      const total = (allPts ?? []).reduce((sum, r) => {
        const pts = r.points_earned ?? 0;
        return VP_REDEEM_TYPES.includes(r.transaction_type) ? sum - pts : sum + pts;
      }, 0);
      const computed = Math.max(0, total);
      setBalance(computed);
      setCurrentTier(computed >= 5000 ? 'Gold' : computed >= 1000 ? 'Silver' : 'Bronze');
      setHistory(hist ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [isAuthenticated, currentUser]);

  const tiers = [
    { name: 'Bronze', range: '0 – 999 pts', perks: 'Early access to new formulations' },
    { name: 'Silver', range: '1,000 – 4,999 pts', perks: 'Free shipping + exclusive bundles' },
    { name: 'Gold', range: '5,000+ pts', perks: 'Priority formulations + clinical consultations' },
  ];

  return (
    <>
      <Helmet>
        <title>Vedic Points | The Vedic Protocol</title>
        <meta name="description" content="The Vedic Protocol loyalty programme — earn 10 points per ₹1 spent. Redeem for exclusive formulations and clinical rewards." />
        <link rel="canonical" href="https://www.thevedicprotocol.com/vedic-points" />
      </Helmet>
      <Header />
      <main id="main">

        <div className="page-hero">
          <p className="page-hero-label">Loyalty Programme</p>
          <h1>Vedic<br /><em>Points.</em></h1>
          <p className="page-hero-sub">Earn with every purchase. Redeem for exclusive clinical formulations, early access, and more.</p>
        </div>

        {/* How it works */}
        <section style={{ maxWidth: 'var(--max)', margin: '0 auto', padding: isMobile ? '40px 20px' : '64px 40px', borderBottom: '1px solid var(--line)', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '0' }} aria-labelledby="how-h2">
          {[
            ['01. Earn','Accumulate 10 Vedic Points for every ₹1 invested in your protocol.'],
            ['02. Accumulate','Progress through Bronze, Silver, and Gold clinical tiers as you build your ritual.'],
            ['03. Redeem','Apply points at checkout for discounts on exclusive formulations.'],
          ].map(([t,d], i) => (
            <div key={t} style={{ padding: isMobile ? '24px 0' : '40px', borderLeft: (!isMobile && i > 0) ? '1px solid var(--line)' : 'none', borderTop: (isMobile && i > 0) ? '1px solid var(--line)' : 'none' }}>
              <h3 style={{ fontFamily: 'var(--serif)', fontSize: '20px', fontWeight: 400, color: 'var(--ink)', marginBottom: '10px' }}>{t}</h3>
              <p style={{ fontSize: '13px', color: 'var(--ink-3)', lineHeight: 1.8 }}>{d}</p>
            </div>
          ))}
        </section>

        {/* Tiers */}
        <section style={{ background: 'var(--off)', borderBottom: '1px solid var(--line)', padding: isMobile ? '40px 20px' : '64px 40px' }} aria-labelledby="tiers-h2">
          <div style={{ maxWidth: 'var(--max)', margin: '0 auto' }}>
            <p className="section-label">Clinical Tiers</p>
            <h2 className="section-h2" style={{ marginBottom: '40px' }}>Your tier<br /><em>unlocks more.</em></h2>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: '20px' }}>
              {tiers.map((t, i) => {
                const isCurrent = isAuthenticated ? currentTier === t.name : i === 0;
                return (
                  <div key={t.name} style={{ padding: isMobile ? '24px' : '32px', background: isCurrent ? 'var(--ink)' : 'var(--white)', border: `1px solid ${isCurrent ? 'var(--ink)' : 'var(--line)'}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <h3 style={{ fontFamily: 'var(--serif)', fontSize: '22px', fontWeight: 400, color: isCurrent ? 'var(--gold)' : 'var(--ink)' }}>{t.name}</h3>
                      {isCurrent && <span style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--gold)', border: '1px solid rgba(201,169,110,0.4)', padding: '4px 8px' }}>Current</span>}
                    </div>
                    <p style={{ fontSize: '11px', color: isCurrent ? 'rgba(255,255,255,0.4)' : 'var(--ink-4)', marginBottom: '12px', letterSpacing: '0.04em' }}>{t.range}</p>
                    <p style={{ fontSize: '13px', color: isCurrent ? 'rgba(255,255,255,0.7)' : 'var(--ink-3)', lineHeight: 1.7 }}>{t.perks}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* User balance + history or CTA */}
        <div style={{ maxWidth: 'var(--max)', margin: '0 auto', padding: isMobile ? '40px 20px' : '64px 40px' }}>
          {isAuthenticated ? (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '280px 1fr', gap: isMobile ? '24px' : '40px', alignItems: 'start' }}>
              <div style={{ background: 'var(--ink)', padding: isMobile ? '24px' : '32px' }}>
                <p style={{ fontSize: '9px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '12px' }}>Current Balance</p>
                <p style={{ fontFamily: 'var(--serif)', fontSize: isMobile ? '40px' : '56px', color: 'var(--gold)', lineHeight: 1, marginBottom: '16px' }}>{balance}</p>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                  <p style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.35)', marginBottom: '4px' }}>Clinical Tier</p>
                  <p style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--white)' }}>{currentTier}</p>
                </div>
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--serif)', fontSize: '22px', fontWeight: 400, color: 'var(--ink)', marginBottom: '20px' }}>Recent Activity</h3>
                {loading ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[1,2,3].map(i => <div key={i} style={{ height: '52px', background: 'var(--stone)' }}></div>)}
                  </div>
                ) : history.length === 0 ? (
                  <div style={{ padding: '40px', background: 'var(--off)', border: '1px solid var(--line)', textAlign: 'center' }}>
                    <p style={{ fontSize: '13px', color: 'var(--ink-3)' }}>No point activity yet. Make your first purchase to start earning.</p>
                  </div>
                ) : (
                  <div style={{ border: '1px solid var(--line)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 120px 80px', gap: '16px', padding: '12px 20px', borderBottom: '1px solid var(--line)', fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>
                      <span>Transaction</span><span>Date</span><span style={{ textAlign: 'right' }}>Points</span>
                    </div>
                    {history.map(r => (
                      <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1fr 120px 80px', gap: '16px', padding: '14px 20px', borderBottom: '1px solid var(--line)', alignItems: 'center' }}>
                        <span style={{ fontSize: '13px', color: 'var(--ink)', textTransform: 'capitalize' }}>{r.transaction_type}</span>
                        <span style={{ fontSize: '11px', color: 'var(--ink-4)' }}>{new Date(r.created).toLocaleDateString('en-IN', { day:'numeric', month:'short' })}</span>
                        <span style={{ fontSize: '13px', color: VP_REDEEM_TYPES.includes(r.transaction_type) ? 'var(--ink)' : 'var(--gold)', textAlign: 'right', fontWeight: 500 }}>
                          {VP_REDEEM_TYPES.includes(r.transaction_type) ? '−' : '+'}{r.points_earned ?? 0}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: isMobile ? '48px 24px' : '72px 40px', background: 'var(--off)', border: '1px solid var(--line)', textAlign: 'center' }}>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: '28px', fontWeight: 400, color: 'var(--ink)', marginBottom: '8px' }}>Join the Protocol.</h2>
              <p style={{ fontSize: '13px', color: 'var(--ink-3)', marginBottom: '28px' }}>Create an account to start earning Vedic Points with every purchase.</p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <Link to="/signup" className="btn btn-dark">Create Account</Link>
                <Link to="/login" className="btn btn-light">Log In</Link>
              </div>
            </div>
          )}
        </div>

      </main>
      <Footer />
    </>
  );
};

/* ═══════════════════════════════════════════════
   ORDER CONFIRMATION PAGE
   ═══════════════════════════════════════════════ */
export const OrderConfirmationPage = () => {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [points, setPoints] = useState(0);
  const [loading, setLoading] = useState(true);
  const location = (typeof window !== 'undefined' ? window.history.state?.state : null);

  useEffect(() => {
    const stateOrder = location?.order;
    if (stateOrder) { setOrder(stateOrder); setPoints(location?.pointsEarned || 0); setLoading(false); return; }
    if (id) {
      supabase.from('orders').select('*').eq('id', id).single()
        .then(({ data: o, error }) => {
          if (!error && o) { setOrder(o); setPoints(Math.floor(o.total * 10)); }
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    } else { setLoading(false); }
  }, [id, location]);

  if (loading) return (
    <><Header /><div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="spinner"></div></div><Footer /></>
  );

  if (!order) return (
    <><Header /><div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', textAlign: 'center' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontSize: '28px', color: 'var(--ink)' }}>Order not found.</h1>
      <Link to="/shop" className="btn btn-dark">Continue Shopping</Link>
    </div><Footer /></>
  );

  const eta = new Date();
  eta.setDate(eta.getDate() + 7);

  return (
    <>
      <Helmet>
        <title>Order Confirmed — {order.legacy_id || order.id?.slice(0, 8).toUpperCase()} | The Vedic Protocol</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <Header />
      <main id="main">
        <div style={{ maxWidth: '720px', margin: '0 auto', padding: '72px 40px 80px', textAlign: 'center' }}>

          {/* Check mark */}
          <div style={{ width: '64px', height: '64px', border: '1px solid var(--gold)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 28px' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12l5 5L20 7" stroke="#C9A96E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </div>

          <p style={{ fontSize: '10px', letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '12px' }}>Order Confirmed</p>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px,5vw,48px)', fontWeight: 400, color: 'var(--ink)', lineHeight: 1.1, marginBottom: '12px' }}>
            Your protocol<br /><em style={{ fontStyle: 'italic', color: 'var(--gold)' }}>is on its way.</em>
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--ink-3)', marginBottom: '56px' }}>A confirmation email has been sent to your registered address.</p>

          {/* Order detail card */}
          <div style={{ background: 'var(--off)', border: '1px solid var(--line)', padding: '40px', textAlign: 'left', marginBottom: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '28px', paddingBottom: '28px', borderBottom: '1px solid var(--line)' }}>
              <div>
                <p style={{ fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: '8px' }}>Order Number</p>
                <p style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--ink)' }}>{order.legacy_id || order.id?.slice(0, 8).toUpperCase()}</p>
              </div>
              <div>
                <p style={{ fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: '8px' }}>Estimated Delivery</p>
                <p style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--ink)' }}>{eta.toLocaleDateString('en-IN', { day:'numeric', month:'long' })}</p>
              </div>
              <div>
                <p style={{ fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: '8px' }}>Order Total</p>
                <p style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--ink)' }}>₹{order.total?.toFixed(0)}</p>
              </div>
              <div>
                <p style={{ fontSize: '9px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: '8px' }}>Vedic Points Earned</p>
                <p style={{ fontFamily: 'var(--serif)', fontSize: '18px', color: 'var(--gold)' }}>+{points}</p>
              </div>
            </div>

            {/* Items */}
            {order.items?.map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--line)', fontSize: '13px' }}>
                <div>
                  <p style={{ color: 'var(--ink)', marginBottom: '2px' }}>{item.name}</p>
                  <p style={{ color: 'var(--ink-4)', fontSize: '11px' }}>Qty: {item.quantity || item.qty}</p>
                </div>
                <span style={{ color: 'var(--ink)' }}>₹{((item.price) * (item.quantity || item.qty)).toFixed(0)}</span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/dashboard" className="btn btn-dark">View Dashboard</Link>
            <Link to="/shop" className="btn btn-light">Continue Shopping</Link>
          </div>

        </div>
      </main>
      <Footer />
    </>
  );
};

export default DashboardPage;