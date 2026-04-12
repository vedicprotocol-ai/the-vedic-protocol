import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';
import supabase, { getImageUrl } from '@/lib/supabaseClient.js';

const STYLES = `
  @keyframes vp-backdropIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes vp-modalIn {
    from { opacity: 0; transform: translateY(40px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0) scale(1); }
  }
  @keyframes vp-backdropOut {
    from { opacity: 1; }
    to   { opacity: 0; }
  }
  @keyframes vp-modalOut {
    from { opacity: 1; transform: translateY(0) scale(1); }
    to   { opacity: 0; transform: translateY(24px) scale(0.97); }
  }

  .vp-backdrop {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(14, 12, 9, 0.72);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    animation: vp-backdropIn 0.28s ease both;
  }
  .vp-backdrop.closing {
    animation: vp-backdropOut 0.24s ease both;
  }
  .vp-modal {
    position: relative;
    background: var(--white);
    width: 100%;
    max-width: 860px;
    max-height: 90vh;
    overflow-y: auto;
    animation: vp-modalIn 0.32s cubic-bezier(0.22, 1, 0.36, 1) both;
    box-shadow: 0 32px 80px -16px rgba(0,0,0,0.45);
  }
  .vp-backdrop.closing .vp-modal {
    animation: vp-modalOut 0.22s ease both;
  }

  .vp-modal::-webkit-scrollbar { width: 4px; }
  .vp-modal::-webkit-scrollbar-track { background: transparent; }
  .vp-modal::-webkit-scrollbar-thumb { background: var(--line-dk); border-radius: 2px; }

  @media (max-width: 640px) {
    .vp-modal-body { grid-template-columns: 1fr !important; }
    .vp-photo-col  { border-right: none !important; border-bottom: 1px solid var(--line); }
    .vp-photo-wrap { aspect-ratio: 4/3 !important; max-height: 260px; }
    .booking-grid { grid-template-columns: 1fr !important; }
    .booking-sidebar { border-right: none !important; border-bottom: 1px solid var(--line); }
  }

  .skeleton {
    background: linear-gradient(90deg, var(--stone) 25%, var(--line) 50%, var(--stone) 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
    border-radius: 2px;
  }
  @keyframes skeleton-loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
  }

  /* ── Calendar styles ── */
  .vp-cal { width: 100%; margin-bottom: 24px; user-select: none; }
  .vp-cal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .vp-cal-title { font-family: var(--serif); font-size: 16px; color: var(--ink); font-weight: 400; }
  .vp-cal-nav {
    background: none; border: 1px solid var(--line); width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center; cursor: pointer;
    color: var(--ink-3); transition: all 0.2s; flex-shrink: 0;
  }
  .vp-cal-nav:hover:not(:disabled) { border-color: var(--ink-3); color: var(--ink); }
  .vp-cal-nav:disabled { opacity: 0.3; cursor: not-allowed; }
  .vp-cal-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 3px; }
  .vp-cal-dow { text-align: center; font-size: 9px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink-4); padding: 6px 0; }
  .vp-cal-day {
    aspect-ratio: 1; display: flex; align-items: center; justify-content: center;
    font-size: 13px; color: var(--ink); cursor: pointer;
    border: 1px solid transparent; transition: all 0.15s;
    background: none; font-family: inherit; position: relative;
  }
  .vp-cal-day:hover:not(.disabled):not(.empty):not(.past) { border-color: var(--line-dk); background: var(--off); }
  .vp-cal-day.selected { background: var(--ink); color: var(--white); border-color: var(--ink); }
  .vp-cal-day.today:not(.selected) { border-color: var(--gold); color: var(--gold); }
  .vp-cal-day.past, .vp-cal-day.empty { color: var(--ink-4); cursor: default; opacity: 0.35; }
  .vp-cal-day.has-slots:not(.past):not(.selected)::after {
    content: ''; position: absolute; bottom: 4px; left: 50%; transform: translateX(-50%);
    width: 4px; height: 4px; border-radius: 50%; background: var(--gold);
  }
  .vp-cal-day.selected::after { background: var(--white); }
  .vp-cal-legend { display: flex; align-items: center; gap: 6px; margin-top: 12px; font-size: 11px; color: var(--ink-4); }
  .vp-cal-legend-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--gold); flex-shrink: 0; }

  .time-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
    margin-bottom: 32px;
  }
  .time-btn {
    padding: 12px 0;
    text-align: center;
    border: 1px solid var(--line);
    background: var(--white);
    font-size: 13px;
    color: var(--ink);
    cursor: pointer;
    transition: all 0.2s;
  }
  .time-btn:hover:not(:disabled) { border-color: var(--ink-3); }
  .time-btn.active {
    background: var(--gold);
    border-color: var(--gold);
    color: var(--white);
  }
  .time-btn:disabled {
    background: var(--off);
    color: var(--ink-4);
    cursor: not-allowed;
    text-decoration: line-through;
  }

  .form-group { margin-bottom: 20px; }
  .form-label { display: block; font-size: 11px; letter-spacing: 0.05em; text-transform: uppercase; color: var(--ink-3); margin-bottom: 8px; }
  .form-input, .form-textarea {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--line);
    background: var(--off);
    color: var(--ink);
    font-family: inherit;
    font-size: 14px;
    transition: border-color 0.2s;
  }
  .form-input:focus, .form-textarea:focus { outline: none; border-color: var(--gold); }
  .form-textarea { min-height: 100px; resize: vertical; }
`;

export default function DoctorDiscoveryPage() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedDoc, setSelectedDoc] = useState(null);
  const [closing, setClosing] = useState(false);
  const closeBtn = useRef(null);

  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();

  // Booking Modal State
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingDoctor, setBookingDoctor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Calendar state
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [calYear, setCalYear] = useState(today.getFullYear());
  const [calMonth, setCalMonth] = useState(today.getMonth()); // 0-indexed

  const [selectedDate, setSelectedDate] = useState(null); // null until user picks
  const [selectedSlot, setSelectedSlot] = useState(null);

  const [formData, setFormData] = useState({
    patient_name: '',
    phone_number: '',
    problem_brief: ''
  });
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [slotError, setSlotError] = useState('');
  const [bookingError, setBookingError] = useState(null);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  const fetchDoctors = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: res, error } = await supabase.from('doctors').select('*').limit(100);
      if (error) throw error;
      setDoctors(res ?? []);
    } catch (err) {
      console.error('Error fetching doctors:', err);
      setError('Failed to load doctors. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const openModal = (doc) => {
    setClosing(false);
    setSelectedDoc(doc);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setClosing(true);
    document.body.style.overflow = '';
    setTimeout(() => {
      setSelectedDoc(null);
      setClosing(false);
    }, 240);
  };

  const openBookingModal = (doc) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/doctors' } } });
      return;
    }
    if (selectedDoc) closeModal(); // Close profile modal if open

    setBookingDoctor(doc);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    setCalYear(now.getFullYear());
    setCalMonth(now.getMonth());
    setSelectedDate(null);
    setAvailableSlots([]);
    setSelectedSlot(null);
    setFormData({
      patient_name: currentUser?.name || '',
      phone_number: currentUser?.phone || '',
      email: currentUser?.email || '',
      problem_brief: ''
    });
    setBookingError(null);
    setFieldErrors({});
    setSlotError('');
    setBookingSuccess(false);
    setShowBookingModal(true);
    document.body.style.overflow = 'hidden';
  };

  const closeBookingModal = () => {
    setShowBookingModal(false);
    document.body.style.overflow = '';
    setTimeout(() => {
      setBookingDoctor(null);
    }, 240);
  };

  const fetchAvailableSlots = async (doctorId, dateStr) => {
    setSlotsLoading(true);
    try {
      // Fetch slots for the specific date
      const nextDay = new Date(dateStr);
      nextDay.setDate(nextDay.getDate() + 1);
      const nextDayStr = nextDay.toISOString().split('T')[0];

      const { data: res } = await supabase.from('availability_slots').select('*')
        .eq('doctor_id', doctorId)
        .gte('date', dateStr + 'T00:00:00')
        .lt('date', nextDayStr + 'T00:00:00')
        .eq('is_booked', false)
        .order('time');
      setAvailableSlots(res ?? []);
    } catch (err) {
      console.error('Error fetching slots:', err);
    } finally {
      setSlotsLoading(false);
    }
  };

  const handleDateSelect = (dateStr) => {
    setSelectedDate(dateStr);
    setSelectedSlot(null);
    setSlotError('');
    if (bookingDoctor) {
      fetchAvailableSlots(bookingDoctor.id, dateStr);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear the error for this field as the user types
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const submitBooking = async (e) => {
    e.preventDefault();

    // ── Per-field validation ──
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s\-()]{7,15}$/;

    const errs = {};
    if (!formData.patient_name.trim())
      errs.patient_name = 'Patient name is required.';
    if (!formData.phone_number.trim())
      errs.phone_number = 'Phone number is required.';
    else if (!phoneRegex.test(formData.phone_number.trim()))
      errs.phone_number = 'Enter a valid phone number (7–15 digits, may include +, spaces, or dashes).';
    if (!formData.email.trim())
      errs.email = 'Email address is required.';
    else if (!emailRegex.test(formData.email.trim()))
      errs.email = 'Enter a valid email address.';
    if (!formData.problem_brief.trim())
      errs.problem_brief = 'Please briefly describe your concern.';

    setFieldErrors(errs);

    // ── Slot validation ──
    if (!selectedSlot) {
      setSlotError('Please select a time slot before confirming.');
    } else {
      setSlotError('');
    }

    if (Object.keys(errs).length > 0 || !selectedSlot) return;

    setBookingSubmitting(true);
    setBookingError(null);

    const formattedDate = new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
    });

    try {
      // 1. Create appointment
      await supabase.from('appointments').insert({
        doctor_id: bookingDoctor.id,
        customer_id: currentUser.id,
        name: formData.patient_name,
        phone: formData.phone_number,
        email: formData.email,
        concerns: formData.problem_brief,
        date: selectedDate + " 12:00:00.000Z",
        time: selectedSlot.time,
        slot_id: selectedSlot.id,
        status: 'booked'
      }, { $autoCancel: false });

      // 2. Mark slot as booked
      await supabase.from('availability_slots').update({ is_booked: true }).eq('id', selectedSlot.id);

      // 3. Send confirmation email via Brevo
      const BREVO_KEY = import.meta.env.VITE_BREVO_KEY;
      if (BREVO_KEY) {
        try {
          await fetch('https://api.brevo.com/v3/smtp/email', {
            method: 'POST',
            headers: { 'api-key': BREVO_KEY, 'Content-Type': 'application/json' },
            body: JSON.stringify({
              sender: { name: 'The Vedic Protocol', email: 'drsonam@thevedicprotocol.com' },
              to: [{ email: formData.email, name: formData.patient_name }],
              subject: `Appointment Confirmed — ${bookingDoctor.name} · ${formattedDate}`,
              htmlContent: `
                <div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;border:1px solid #e8e6e1;">
                  <div style="background:#1a1814;padding:32px;text-align:center;">
                    <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#C9A96E;">The Vedic Protocol</p>
                  </div>
                  <div style="padding:48px;">
                    <p style="font-size:11px;letter-spacing:0.16em;text-transform:uppercase;color:#C9A96E;margin:0 0 8px;">Appointment Confirmed</p>
                    <h1 style="font-size:26px;font-weight:400;color:#1a1814;margin:0 0 24px;">Your consultation is booked, ${formData.patient_name}.</h1>

                    <div style="background:#fafaf8;border:1px solid #e8e6e1;padding:24px;margin:0 0 28px;">
                      <table style="width:100%;border-collapse:collapse;font-size:13px;">
                        <tr>
                          <td style="padding:8px 0;color:#9a9690;border-bottom:1px solid #e8e6e1;width:40%;">Doctor</td>
                          <td style="padding:8px 0;color:#1a1814;border-bottom:1px solid #e8e6e1;font-weight:500;">${bookingDoctor.name}</td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0;color:#9a9690;border-bottom:1px solid #e8e6e1;">Specialisation</td>
                          <td style="padding:8px 0;color:#1a1814;border-bottom:1px solid #e8e6e1;">${bookingDoctor.specialization}</td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0;color:#9a9690;border-bottom:1px solid #e8e6e1;">Date</td>
                          <td style="padding:8px 0;color:#1a1814;border-bottom:1px solid #e8e6e1;">${formattedDate}</td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0;color:#9a9690;border-bottom:1px solid #e8e6e1;">Time</td>
                          <td style="padding:8px 0;color:#1a1814;border-bottom:1px solid #e8e6e1;">${selectedSlot.time}</td>
                        </tr>
                        <tr>
                          <td style="padding:8px 0;color:#9a9690;">Your concern</td>
                          <td style="padding:8px 0;color:#1a1814;">${formData.problem_brief}</td>
                        </tr>
                      </table>
                    </div>

                    <p style="font-size:13px;color:#6b6660;line-height:1.9;margin:0 0 12px;">
                      Please be available at the scheduled time. If you need to reschedule or cancel,
                      contact us at <a href="mailto:support@thevedicprotocol.com" style="color:#C9A96E;">support@thevedicprotocol.com</a> at least 24 hours in advance.
                    </p>

                    <hr style="border:none;border-top:1px solid #e8e6e1;margin:32px 0;">
                    <p style="font-size:18px;font-style:italic;color:#1a1814;margin:0 0 4px;">Dr. Sonam</p>
                    <p style="font-size:10px;letter-spacing:0.12em;text-transform:uppercase;color:#9a9690;margin:0;">PhD · Ayurvedic Pharmacology · Founder</p>
                  </div>
                </div>
              `
            })
          });
        } catch (emailErr) {
          // Email failure should not block booking confirmation
          console.error('Appointment confirmation email failed:', emailErr);
        }
      } else {
        console.warn('VITE_BREVO_KEY not set — appointment confirmation email skipped.');
      }

      setBookingSuccess(true);
      setTimeout(() => {
        closeBookingModal();
      }, 3000);

    } catch (err) {
      console.error('Booking error:', err);
      setBookingError('Failed to confirm booking. The slot might have been taken. Please try again.');
      fetchAvailableSlots(bookingDoctor.id, selectedDate);
      setSelectedSlot(null);
      setSlotError('Please select another time slot.');
    } finally {
      setBookingSubmitting(false);
    }
  };

  /* Focus the close button when modal opens for accessibility */
  useEffect(() => {
    if (selectedDoc && !closing) {
      setTimeout(() => closeBtn.current?.focus(), 50);
    }
  }, [selectedDoc]);

  /* Close on Escape */
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (selectedDoc) closeModal();
        if (showBookingModal) closeBookingModal();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedDoc, showBookingModal]);

  /* Cleanup on unmount */
  useEffect(() => () => { document.body.style.overflow = ''; }, []);

  return (
    <>
      <style>{STYLES}</style>

      <Helmet>
        <title>Consult an Ayurvedic Doctor | The Vedic Protocol</title>
        <meta name="description" content="Connect with qualified Ayurvedic doctors for personalized consultations. Structured guidance based on classical Ayurveda and clinical understanding." />
      </Helmet>

      <Header />

      <main id="main" style={{ minHeight: '100vh', background: 'var(--off)' }}>

        {/* Page Hero */}
        <div className="page-hero" style={{ background: 'var(--white)' }}>
          <p className="page-hero-label">Consultation</p>
          <h1>Consult an<br /><em>Ayurvedic Doctor.</em></h1>
          <p className="page-hero-sub">
            Structured guidance based on classical Ayurveda and clinical understanding.
          </p>
        </div>

        {/* Doctor Grid */}
        <div style={{ maxWidth: 'var(--max)', margin: '0 auto', padding: '80px 40px' }}>

          {loading && (
            <div className="blog-grid" style={{ padding: 0 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="blog-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div className="blog-card__body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div className="skeleton" style={{ height: '28px', width: '70%', marginBottom: '8px' }} />
                    <div className="skeleton" style={{ height: '12px', width: '40%', marginBottom: '24px' }} />
                    <div style={{ marginBottom: '32px', flex: 1 }}>
                      <div className="skeleton" style={{ height: '16px', width: '100%', marginBottom: '12px' }} />
                      <div className="skeleton" style={{ height: '16px', width: '100%', marginTop: '12px' }} />
                    </div>
                    <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                      <div className="skeleton" style={{ height: '44px', width: '100%' }} />
                      <div className="skeleton" style={{ height: '44px', width: '100%' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && !loading && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ color: 'var(--ink-3)', marginBottom: '16px' }}>{error}</p>
              <button className="btn btn-dark" onClick={fetchDoctors}>Retry</button>
            </div>
          )}

          {!loading && !error && doctors.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <p style={{ color: 'var(--ink-3)' }}>No doctors available at the moment.</p>
            </div>
          )}

          {!loading && !error && doctors.length > 0 && (
            <div className="blog-grid" style={{ padding: 0 }}>
              {doctors.map((doc) => (
                <div
                  key={doc.id}
                  className="blog-card"
                  style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                >
                  <div className="blog-card__body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h2 style={{ fontFamily: 'var(--serif)', fontSize: '22px', color: 'var(--ink)', marginBottom: '8px' }}>
                      {doc.name}
                    </h2>
                    <p style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: '24px' }}>
                      {doc.qualification}
                    </p>

                    <div style={{ marginBottom: '32px', flex: 1 }}>
                      <p style={{ fontSize: '13px', color: 'var(--ink-3)', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>Experience</span>
                        <span style={{ color: 'var(--ink)', fontWeight: 400 }}>{doc.experience_years} years</span>
                      </p>
                      <p style={{ fontSize: '13px', color: 'var(--ink-3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--line)', paddingTop: '12px' }}>
                        <span>Focus</span>
                        <span style={{ color: 'var(--ink)', fontWeight: 400, textAlign: 'right' }}>{doc.specialization}</span>
                      </p>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: 'auto' }}>
                      <button
                        className="btn btn-light btn-full"
                        onClick={() => openModal(doc)}
                      >
                        View Details
                      </button>
                      <button
                        className="btn btn-dark btn-full"
                        onClick={() => openBookingModal(doc)}
                      >
                        Book Appointment
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* ── Profile Modal Overlay ── */}
      {selectedDoc && (
        <div
          className={`vp-backdrop${closing ? ' closing' : ''}`}
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
          role="dialog"
          aria-modal="true"
          aria-label={`Profile of ${selectedDoc.name}`}
        >
          <div className="vp-modal">

            {/* Modal top bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '18px 28px',
              borderBottom: '1px solid var(--line)',
              background: 'var(--off)',
              position: 'sticky',
              top: 0,
              zIndex: 2,
            }}>
              <p style={{ fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', margin: 0 }}>
                Doctor Profile
              </p>
              <button
                ref={closeBtn}
                onClick={closeModal}
                aria-label="Close profile"
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--ink-4)',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'color 0.2s',
                  borderRadius: '2px',
                }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--ink)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--ink-4)'}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M1.5 1.5l13 13M14.5 1.5l-13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div
              className="vp-modal-body"
              style={{ display: 'grid', gridTemplateColumns: '240px 1fr' }}
            >
              {/* ── Photo + stats ── */}
              <div
                className="vp-photo-col"
                style={{ borderRight: '1px solid var(--line)', display: 'flex', flexDirection: 'column' }}
              >
                <div
                  className="vp-photo-wrap"
                  style={{ aspectRatio: '3/4', overflow: 'hidden', background: 'var(--stone)' }}
                >
                  {selectedDoc.photo ? (
                    <img
                      src={getImageUrl(selectedDoc.photo)}
                      alt={`Photograph of ${selectedDoc.name}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
                    />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-4)' }}>
                      No Photo
                    </div>
                  )}
                </div>

                <div style={{ padding: '20px' }}>
                  {[
                    ['Qualification', selectedDoc.qualification],
                    ['Experience', `${selectedDoc.experience_years} years`],
                    ['Specialisation', selectedDoc.specialization],
                  ].map(([label, value], i, arr) => (
                    <div
                      key={label}
                      style={{
                        paddingBottom: '12px',
                        marginBottom: i < arr.length - 1 ? '12px' : 0,
                        borderBottom: i < arr.length - 1 ? '1px solid var(--line)' : 'none',
                      }}
                    >
                      <p style={{ fontSize: '9px', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--ink-4)', margin: '0 0 3px' }}>
                        {label}
                      </p>
                      <p style={{ fontSize: '12px', color: 'var(--ink)', lineHeight: 1.5, margin: 0 }}>
                        {value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Description ── */}
              <div style={{ padding: '36px 40px', display: 'flex', flexDirection: 'column' }}>
                <h2 style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 'clamp(22px, 3vw, 30px)',
                  fontWeight: 400,
                  color: 'var(--ink)',
                  lineHeight: 1.15,
                  marginBottom: '6px',
                }}>
                  {selectedDoc.name}
                </h2>
                <p style={{ fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--gold)', marginBottom: '24px' }}>
                  {selectedDoc.qualification}
                </p>

                <div style={{ fontSize: '14px', color: 'var(--ink-3)', lineHeight: 1.9, flex: 1, whiteSpace: 'pre-wrap' }}>
                  {selectedDoc.full_description || selectedDoc.short_description}
                </div>

                <div style={{
                  marginTop: '32px',
                  paddingTop: '24px',
                  borderTop: '1px solid var(--line)',
                  display: 'flex',
                  gap: '12px',
                  flexWrap: 'wrap',
                }}>
                  <button
                    className="btn btn-dark"
                    onClick={() => openBookingModal(selectedDoc)}
                  >
                    Book Appointment
                  </button>
                  <button
                    className="btn btn-light"
                    onClick={closeModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── Booking Modal Overlay ── */}
      {showBookingModal && bookingDoctor && (
        <div
          className="vp-backdrop"
          onClick={(e) => { if (e.target === e.currentTarget && !bookingSubmitting) closeBookingModal(); }}
          role="dialog"
          aria-modal="true"
          aria-label={`Book appointment with ${bookingDoctor.name}`}
        >
          <div className="vp-modal" style={{ maxWidth: '960px' }}>

            {/* Modal top bar */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '18px 28px',
              borderBottom: '1px solid var(--line)',
              background: 'var(--off)',
              position: 'sticky',
              top: 0,
              zIndex: 2,
            }}>
              <p style={{ fontSize: '10px', letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--gold)', margin: 0 }}>
                Book Consultation
              </p>
              <button
                onClick={closeBookingModal}
                disabled={bookingSubmitting}
                aria-label="Close booking"
                style={{
                  background: 'none', border: 'none', cursor: bookingSubmitting ? 'not-allowed' : 'pointer',
                  color: 'var(--ink-4)', padding: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'color 0.2s', borderRadius: '2px', opacity: bookingSubmitting ? 0.5 : 1
                }}
                onMouseEnter={e => !bookingSubmitting && (e.currentTarget.style.color = 'var(--ink)')}
                onMouseLeave={e => !bookingSubmitting && (e.currentTarget.style.color = 'var(--ink-4)')}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M1.5 1.5l13 13M14.5 1.5l-13 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            {bookingSuccess ? (
              <div style={{ padding: '80px 40px', textAlign: 'center' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--gold)', color: 'var(--white)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <h2 style={{ fontFamily: 'var(--serif)', fontSize: '28px', color: 'var(--ink)', marginBottom: '12px' }}>Booking Confirmed</h2>
                <p style={{ color: 'var(--ink-3)', marginBottom: '32px' }}>
                  Your consultation with {bookingDoctor.name} is scheduled for {selectedDate ? new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }) : ''} at {selectedSlot?.time_slot}.
                </p>
                <p style={{ fontSize: '12px', color: 'var(--ink-4)' }}>Closing automatically...</p>
              </div>
            ) : (
              <div className="booking-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 380px' }}>

                {/* Left: Calendar + Slots */}
                <div className="booking-sidebar" style={{ padding: '32px', borderRight: '1px solid var(--line)' }}>
                  <h3 style={{ fontFamily: 'var(--serif)', fontSize: '20px', marginBottom: '24px' }}>Select Date & Time</h3>

                  {/* ── Calendar ── */}
                  {(() => {
                    const firstDay = new Date(calYear, calMonth, 1).getDay(); // 0=Sun
                    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
                    const todayStr = today.toISOString().split('T')[0];
                    const monthLabel = new Date(calYear, calMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    const isPrevDisabled = calYear === today.getFullYear() && calMonth === today.getMonth();

                    const cells = [];
                    for (let i = 0; i < firstDay; i++) cells.push(null);
                    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

                    return (
                      <div className="vp-cal">
                        <div className="vp-cal-header">
                          <button
                            type="button"
                            className="vp-cal-nav"
                            disabled={isPrevDisabled || bookingSubmitting}
                            onClick={() => {
                              if (calMonth === 0) { setCalMonth(11); setCalYear(y => y - 1); }
                              else setCalMonth(m => m - 1);
                              setSelectedDate(null);
                              setAvailableSlots([]);
                              setSelectedSlot(null);
                            }}
                            aria-label="Previous month"
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M7.5 2L4 6l3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                          <span className="vp-cal-title">{monthLabel}</span>
                          <button
                            type="button"
                            className="vp-cal-nav"
                            disabled={bookingSubmitting}
                            onClick={() => {
                              if (calMonth === 11) { setCalMonth(0); setCalYear(y => y + 1); }
                              else setCalMonth(m => m + 1);
                              setSelectedDate(null);
                              setAvailableSlots([]);
                              setSelectedSlot(null);
                            }}
                            aria-label="Next month"
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M4.5 2L8 6l-3.5 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </button>
                        </div>

                        <div className="vp-cal-grid">
                          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <div key={d} className="vp-cal-dow">{d}</div>
                          ))}
                          {cells.map((day, idx) => {
                            if (!day) return <div key={`empty-${idx}`} className="vp-cal-day empty" />;
                            const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isPast = dateStr < todayStr;
                            const isToday = dateStr === todayStr;
                            const isSel = dateStr === selectedDate;
                            let cls = 'vp-cal-day';
                            if (isPast) cls += ' past';
                            if (isToday) cls += ' today';
                            if (isSel) cls += ' selected';
                            return (
                              <button
                                key={dateStr}
                                type="button"
                                className={cls}
                                disabled={isPast || bookingSubmitting}
                                onClick={() => !isPast && handleDateSelect(dateStr)}
                                aria-label={dateStr}
                                aria-pressed={isSel}
                              >
                                {day}
                              </button>
                            );
                          })}
                        </div>

                        <div className="vp-cal-legend">
                          <span className="vp-cal-legend-dot" />
                          <span>Slots available on this date</span>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ── Time slots ── */}
                  {!selectedDate ? (
                    <div>
                      <div style={{ padding: '24px 0 8px', textAlign: 'center', color: 'var(--ink-4)', fontSize: '13px' }}>
                        Select a date above to see available slots.
                      </div>
                      {slotError && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 12px', marginTop: '4px' }}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                            <circle cx="7" cy="7" r="6" stroke="#dc2626" strokeWidth="1.2" />
                            <path d="M7 4v3.5M7 10h.01" stroke="#dc2626" strokeWidth="1.4" strokeLinecap="round" />
                          </svg>
                          {slotError}
                        </div>
                      )}
                    </div>
                  ) : slotsLoading ? (
                    <div className="time-grid">
                      {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="skeleton" style={{ height: '44px' }} />)}
                    </div>
                  ) : availableSlots.length === 0 ? (
                    <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--ink-4)', border: '1px dashed var(--line)', fontSize: '13px' }}>
                      No available slots on this date.
                    </div>
                  ) : (
                    <>
                      <p style={{ fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: '12px' }}>
                        Available times
                      </p>
                      {slotError && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '10px 12px', marginBottom: '12px' }}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                            <circle cx="7" cy="7" r="6" stroke="#dc2626" strokeWidth="1.2" />
                            <path d="M7 4v3.5M7 10h.01" stroke="#dc2626" strokeWidth="1.4" strokeLinecap="round" />
                          </svg>
                          {slotError}
                        </div>
                      )}
                      <div className="time-grid">
                        {availableSlots.map(slot => (
                          <button
                            key={slot.id}
                            type="button"
                            className={`time-btn ${selectedSlot?.id === slot.id ? 'active' : ''}`}
                            disabled={!slot.is_available || bookingSubmitting}
                            onClick={() => { setSelectedSlot(slot); setSlotError(''); }}
                          >
                            {slot.time_slot}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Right: Form */}
                <div style={{ padding: '32px', background: 'var(--off)' }}>
                  <h3 style={{ fontFamily: 'var(--serif)', fontSize: '20px', marginBottom: '24px' }}>Patient Details</h3>

                  <form onSubmit={submitBooking}>
                    <div className="form-group">
                      <label className="form-label">Patient Name</label>
                      <input
                        type="text"
                        name="patient_name"
                        className="form-input"
                        style={{ borderColor: fieldErrors.patient_name ? '#dc2626' : undefined }}
                        value={formData.patient_name}
                        onChange={handleFormChange}
                        required
                        disabled={bookingSubmitting}
                      />
                      {fieldErrors.patient_name && (
                        <span style={{ display: 'block', fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>
                          {fieldErrors.patient_name}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Phone Number</label>
                      <input
                        type="tel"
                        name="phone_number"
                        className="form-input"
                        style={{ borderColor: fieldErrors.phone_number ? '#dc2626' : undefined }}
                        value={formData.phone_number}
                        onChange={handleFormChange}
                        required
                        placeholder="e.g. +91 98765 43210"
                        disabled={bookingSubmitting}
                      />
                      {fieldErrors.phone_number && (
                        <span style={{ display: 'block', fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>
                          {fieldErrors.phone_number}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Email Address</label>
                      <input
                        type="email"
                        name="email"
                        className="form-input"
                        style={{ borderColor: fieldErrors.email ? '#dc2626' : undefined }}
                        value={formData.email}
                        onChange={handleFormChange}
                        required
                        autoComplete="email"
                        placeholder="Confirmation will be sent here"
                        disabled={bookingSubmitting}
                      />
                      {fieldErrors.email && (
                        <span style={{ display: 'block', fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>
                          {fieldErrors.email}
                        </span>
                      )}
                    </div>

                    <div className="form-group">
                      <label className="form-label">Problem Brief</label>
                      <textarea
                        name="problem_brief"
                        className="form-textarea"
                        style={{ borderColor: fieldErrors.problem_brief ? '#dc2626' : undefined }}
                        placeholder="Briefly describe your primary concern..."
                        value={formData.problem_brief}
                        onChange={handleFormChange}
                        required
                        disabled={bookingSubmitting}
                      />
                      {fieldErrors.problem_brief && (
                        <span style={{ display: 'block', fontSize: '11px', color: '#dc2626', marginTop: '4px' }}>
                          {fieldErrors.problem_brief}
                        </span>
                      )}
                    </div>

                    <div style={{
                      background: 'var(--white)',
                      padding: '16px',
                      border: '1px solid var(--line)',
                      marginBottom: '24px',
                      fontSize: '13px',
                      color: 'var(--ink-3)'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                        <span>Doctor</span>
                        <span style={{ color: 'var(--ink)' }}>{bookingDoctor.name}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Schedule</span>
                        <span style={{ color: 'var(--ink)' }}>
                          {selectedSlot && selectedDate
                            ? `${new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${selectedSlot.time_slot}`
                            : 'Not selected'}
                        </span>
                      </div>
                    </div>

                    {bookingError && (
                      <div style={{ color: '#dc2626', fontSize: '13px', marginBottom: '16px', padding: '12px', background: '#fef2f2', border: '1px solid #fecaca' }}>
                        {bookingError}
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px' }}>
                      <button
                        type="submit"
                        className="btn btn-dark"
                        style={{ flex: 1 }}
                        disabled={bookingSubmitting}
                      >
                        {bookingSubmitting ? 'Confirming...' : 'Confirm Booking'}
                      </button>
                      <button
                        type="button"
                        className="btn btn-light"
                        onClick={closeBookingModal}
                        disabled={bookingSubmitting}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}