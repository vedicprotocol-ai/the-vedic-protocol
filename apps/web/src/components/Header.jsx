import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useCart } from '@/contexts/CartContext.jsx';

/* ─── Icons ─────────────────────────────────────────────────── */
const IconSearch = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
  </svg>
);
const IconUser = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const IconBag = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

/* Bottom nav icons — slightly larger for touch targets */
const IconHome = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);
const IconShop = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);
const IconScience = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" />
  </svg>
);
const IconDoctors = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /><path d="M12 12v6m-3-3h6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const IconJournal = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);
const IconAccount = () => (
  <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);

/* ─── Component ─────────────────────────────────────────────── */
const Header = ({ showDoctorsNav = false }) => {
  const { isAuthenticated, isAdmin } = useAuth();
  const { cartItems } = useCart();
  const cartCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminDropdownOpen, setAdminDropdownOpen] = useState(false);

  /* Frosted glass on scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close mobile menu on route change */
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const scrollToWaitlist = () => {
    const el = document.getElementById('wl-email');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => el.focus(), 600);
    } else {
      navigate('/');
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* ── Trust Bar ── */}
      <div className="trust-bar" role="marquee" aria-label="Brand highlights">
        <div className="trust-track">
          {[
            'PhD Formulated', '100% Botanical', 'Cruelty Free & Vegan',
            'Clinical Skincare & Haircare', 'Charaka Samhita Verified',
            'Zero Chemicals', 'Super Clean Formula',
            'PhD Formulated', '100% Botanical', 'Cruelty Free & Vegan',
            'Clinical Skincare & Haircare', 'Charaka Samhita Verified',
            'Zero Synthetics', 'Super Clean Formula',
          ].map((t, i) => (
            <span key={i} className="trust-item">{t}</span>
          ))}
        </div>
      </div>

      {/* ── Header ── */}
      <header className={`site-header${scrolled ? ' scrolled' : ''}`} role="banner">
        <nav className="nav-inner" aria-label="Main navigation">

          {/* Left nav */}
          <div className="nav-left">
            <Link to="/about" className="nav-link" aria-current={isActive('/about') ? 'page' : undefined}>
              About
            </Link>
            <Link to="/science" className="nav-link" aria-current={isActive('/science') ? 'page' : undefined}>
              Science
            </Link>
            <Link to="/blog" className="nav-link" aria-current={isActive('/blog') ? 'page' : undefined}>
              Journal
            </Link>
            <Link to="/shop" className="nav-link" aria-current={isActive('/shop') ? 'page' : undefined}>
              Shop
            </Link>
            <Link to="/doctors" className="nav-link" aria-current={isActive('/doctors') ? 'page' : undefined}>
              Talk to Doctors
            </Link>
            {isAdmin && (
              <div
                className="nav-admin-dropdown"
                style={{ position: 'relative' }}
                onMouseEnter={() => setAdminDropdownOpen(true)}
                onMouseLeave={() => setAdminDropdownOpen(false)}
              >
                <button
                  className="nav-link"
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '4px',
                    color: (isActive('/admin/doctors') || isActive('/admin/blog') || isActive('/admin/influencers') || isActive('/admin/products')) ? 'var(--ink)' : undefined,
                  }}
                  aria-haspopup="true"
                  aria-expanded={adminDropdownOpen}
                >
                  Admin
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{ opacity: 0.5, marginTop: '1px' }}>
                    <path d="M2 3.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                {adminDropdownOpen && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0,
                    background: 'var(--white)', border: '1px solid var(--line)',
                    minWidth: '170px', zIndex: 100,
                    boxShadow: '0 8px 24px -4px rgba(0,0,0,0.12)',
                    paddingTop: '4px', paddingBottom: '4px',
                  }}>
                    {[
                      ['/admin/doctors',     'Manage Doctors'],
                      ['/admin/blog',        'Manage Blog'],
                      ['/admin/influencers', 'Manage Influencers'],
                      ['/admin/products',    'Manage Products'],
                    ].map(([path, label]) => (
                      <Link
                        key={path}
                        to={path}
                        style={{
                          display: 'block',
                          padding: '10px 16px',
                          fontSize: '12px',
                          letterSpacing: '0.04em',
                          color: isActive(path) ? 'var(--gold)' : 'var(--ink)',
                          background: isActive(path) ? 'var(--off)' : 'transparent',
                          transition: 'background 0.15s',
                          whiteSpace: 'nowrap',
                        }}
                        onMouseEnter={e => { if (!isActive(path)) e.currentTarget.style.background = 'var(--off)'; }}
                        onMouseLeave={e => { if (!isActive(path)) e.currentTarget.style.background = 'transparent'; }}
                      >
                        {label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Logo — centre */}
          <Link to="/" className="nav-logo" aria-label="The Vedic Protocol — Home">
            <img
              src="https://horizons-cdn.hostinger.com/bfed98a7-6f91-43f0-8610-351a61a344ed/062f48878062e4b8f9ee07b47af1bf7d.png"
              alt=""
              aria-hidden="true"
              style={{ height: '38px', width: 'auto', display: 'block', mixBlendMode: 'multiply', flexShrink: 0 }}
            />
            <span className="nav-logo-name">The Vedic Protocol</span>
          </Link>

          {/* Right nav */}
          <div className="nav-right">
            <Link to="/social-impact" className="nav-link" aria-current={isActive('/social-impact') ? 'page' : undefined}>
              Social Impact
            </Link>

            {/* Search */}
            <Link to="/shop" className="nav-icon" aria-label="Search formulations">
              <IconSearch />
            </Link>

            {/* Account */}
            {isAuthenticated ? (
              <Link to="/dashboard" className="nav-icon" aria-label="Your account">
                <IconUser />
              </Link>
            ) : (
              <Link to="/login" className="nav-icon" aria-label="Log in">
                <IconUser />
              </Link>
            )}

            {/* Cart */}
            <Link to="/cart" className="nav-icon" aria-label={`Bag — ${cartCount} item${cartCount !== 1 ? 's' : ''}`} style={{ position: 'relative' }}>
              <IconBag />
              {cartCount > 0 && (
                <span className="nav-cart-count" aria-hidden="true">{cartCount}</span>
              )}
            </Link>

            {/* Refined CTA — ghost link style */}
            <button className="nav-cta" onClick={scrollToWaitlist} aria-label="Join the waitlist">
              Join Waitlist
            </button>

            {/* Hamburger — mobile only (hidden via CSS on desktop) */}
            <button
              className="nav-hamburger"
              onClick={() => setMobileMenuOpen(o => !o)}
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
            >
              {mobileMenuOpen ? (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* ── Mobile Menu Overlay ── */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav"
          style={{
            position: 'fixed', inset: 0, zIndex: 150,
            background: 'var(--cream)',
            display: 'flex', flexDirection: 'column',
            padding: '80px 32px 120px',
          }}
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
        >
          <button
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close menu"
            style={{
              position: 'absolute', top: '20px', right: '24px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--ink-3)', padding: '8px',
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {[
              ['/', 'Home'],
              ['/shop', 'Shop'],
              ['/science', 'Science'],
              ['/blog', 'Journal'],
              ['/about', 'About'],
              ['/doctors', 'Consultation'],
              ['/social-impact', 'Social Impact'],
              ['/contact', 'Contact'],
              ...(isAdmin ? [
                ['/admin/doctors',     'Admin — Doctors'],
                ['/admin/blog',        'Admin — Blog'],
                ['/admin/influencers', 'Admin — Influencers'],
              ] : []),
            ].map(([path, label]) => (
              <Link
                key={path}
                to={path}
                style={{
                  fontFamily: 'var(--serif)',
                  fontSize: 'clamp(28px, 7vw, 40px)',
                  fontWeight: 300,
                  color: isActive(path) ? 'var(--gold)' : 'var(--ink)',
                  padding: '14px 0',
                  borderBottom: '1px solid var(--line)',
                  fontStyle: isActive(path) ? 'italic' : 'normal',
                  transition: 'color 0.2s',
                }}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div style={{ marginTop: 'auto', paddingTop: '32px' }}>
            <p style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: '12px' }}>
              PhD Formulated · 100% Botanical · Zero Synthetics
            </p>
            {!isAuthenticated && (
              <Link to="/login" className="btn btn-dark btn-full" style={{ marginBottom: '12px' }}>
                Log In
              </Link>
            )}
          </div>
        </div>
      )}

      {/* ── iOS Bottom Tab Bar (mobile only) ── */}
      <nav className="bottom-nav" aria-label="Mobile navigation" role="navigation">
        <Link
          to="/"
          className={`bottom-nav-item${isActive('/') ? ' active' : ''}`}
          aria-label="Home"
          aria-current={isActive('/') ? 'page' : undefined}
        >
          <IconHome />
          <span>Home</span>
        </Link>

        <Link
          to="/shop"
          className={`bottom-nav-item${isActive('/shop') ? ' active' : ''}`}
          aria-label="Shop"
          aria-current={isActive('/shop') ? 'page' : undefined}
        >
          <IconShop />
          <span>Shop</span>
        </Link>

        {showDoctorsNav ? (
          <Link
            to="/doctors"
            className={`bottom-nav-item${isActive('/doctors') ? ' active' : ''}`}
            aria-label="Talk to Doctors"
            aria-current={isActive('/doctors') ? 'page' : undefined}
          >
            <IconDoctors />
            <span>Doctors</span>
          </Link>
        ) : (
          <Link
            to="/science"
            className={`bottom-nav-item${isActive('/science') ? ' active' : ''}`}
            aria-label="Science"
            aria-current={isActive('/science') ? 'page' : undefined}
          >
            <IconScience />
            <span>Science</span>
          </Link>
        )}

        <Link
          to="/blog"
          className={`bottom-nav-item${isActive('/blog') ? ' active' : ''}`}
          aria-label="Journal"
          aria-current={isActive('/blog') ? 'page' : undefined}
        >
          <IconJournal />
          <span>Journal</span>
        </Link>

        <Link
          to={isAuthenticated ? '/dashboard' : '/login'}
          className={`bottom-nav-item${isActive('/dashboard') || isActive('/login') ? ' active' : ''}`}
          aria-label={isAuthenticated ? 'Account' : 'Log in'}
        >
          <IconAccount />
          <span>Account</span>
        </Link>
      </nav>
    </>
  );
};

export default Header;