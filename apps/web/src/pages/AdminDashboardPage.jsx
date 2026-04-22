import React from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header.jsx';
import Footer from '@/components/Footer.jsx';

const ADMIN_SECTIONS = [
  {
    path: '/admin/products',
    label: 'Manage Products',
    description: 'Add, edit, or remove products from the shop.',
    icon: (
      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    path: '/admin/doctors',
    label: 'Manage Doctors',
    description: 'Add or update doctor profiles for consultations.',
    icon: (
      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
        <path d="M12 12v6m-3-3h6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    path: '/admin/influencers',
    label: 'Manage Influencers',
    description: 'View and manage influencer partnerships.',
    icon: (
      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
        <path d="M17 11l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    path: '/admin/coupons',
    label: 'Manage Coupons',
    description: 'Create and manage discount codes.',
    icon: (
      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <circle cx="7" cy="7" r="1.5" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    path: '/admin/blog',
    label: 'Manage Blog',
    description: 'Write, edit, and publish journal articles.',
    icon: (
      <svg width="32" height="32" fill="none" stroke="currentColor" strokeWidth="1.4" viewBox="0 0 24 24">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
];

const AdminDashboardPage = () => (
  <>
    <Header />
    <main style={{ minHeight: '80vh', padding: '120px 24px 80px', maxWidth: '960px', margin: '0 auto' }}>
      <h1 style={{ fontFamily: 'var(--serif)', fontWeight: 300, fontSize: 'clamp(28px, 5vw, 42px)', marginBottom: '8px' }}>
        Admin Dashboard
      </h1>
      <p style={{ color: 'var(--ink-3)', fontSize: '14px', letterSpacing: '0.03em', marginBottom: '48px' }}>
        Select a section to manage.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '20px',
      }}>
        {ADMIN_SECTIONS.map(({ path, label, description, icon }) => (
          <Link
            key={path}
            to={path}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              padding: '28px 24px',
              border: '1px solid var(--line)',
              background: 'var(--white)',
              color: 'var(--ink)',
              textDecoration: 'none',
              transition: 'box-shadow 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.boxShadow = '0 8px 24px -4px rgba(0,0,0,0.10)';
              e.currentTarget.style.borderColor = 'var(--gold)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.borderColor = 'var(--line)';
            }}
          >
            <span style={{ color: 'var(--gold)' }}>{icon}</span>
            <div>
              <p style={{ fontFamily: 'var(--serif)', fontSize: '18px', fontWeight: 400, marginBottom: '6px' }}>
                {label}
              </p>
              <p style={{ fontSize: '13px', color: 'var(--ink-3)', lineHeight: 1.5 }}>
                {description}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
    <Footer />
  </>
);

export default AdminDashboardPage;