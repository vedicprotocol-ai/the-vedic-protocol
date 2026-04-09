import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext.jsx';

export default function ProtectedAdminRoute({ children }) {
  const { isAdmin, isAuthenticated, initialLoading } = useAuth();

  if (initialLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--off)' }}>
        <p style={{ color: 'var(--ink-3)', fontFamily: 'var(--serif)', fontStyle: 'italic' }}>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isAdmin) {
    // Logged in but not admin — redirect to their dashboard silently
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}