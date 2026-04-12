import React, { createContext, useContext, useState, useEffect } from 'react';
import supabase from '@/lib/supabaseClient.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Fetch the customer profile row and merge with the auth user.
  // Falls back to auth user_metadata (name/phone) when the customers row
  // doesn't exist yet so the dashboard always has a name to show.
  const loadProfile = async (authUser) => {
    if (!authUser) { setCurrentUser(null); return; }
    const { data: profile } = await supabase
      .from('customers')
      .select('*')
      .eq('id', authUser.id)
      .single();
    if (profile) {
      setCurrentUser({ ...authUser, ...profile });
    } else {
      // Profile row missing — use auth metadata as a temporary fallback
      const meta = authUser.user_metadata || {};
      setCurrentUser({ ...authUser, name: meta.name || '', phone: meta.phone || '' });
    }
  };

  useEffect(() => {
    // Restore session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadProfile(session?.user ?? null).finally(() => setInitialLoading(false));
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const user = session?.user ?? null;
      if (event === 'SIGNED_IN' && user) {
        const meta = user.user_metadata || {};
        // Check whether the customers row has name filled in
        const { data: existing } = await supabase
          .from('customers').select('id, name, phone').eq('id', user.id).single();
        if (!existing) {
          // Row doesn't exist yet (trigger not installed) — create it
          await supabase.from('customers').upsert({
            id: user.id,
            email: user.email,
            name: meta.name || '',
            phone: meta.phone || null,
            vedic_points: 0,
            tier: 'Bronze',
            role: 'user',
          }, { onConflict: 'id' });
        } else if ((!existing.name || existing.name === '') && meta.name) {
          // Row exists but name is empty (trigger ran before metadata was set) — patch it
          await supabase.from('customers').update({
            name: meta.name,
            phone: existing.phone || meta.phone || null,
          }).eq('id', user.id);
        }
      }
      loadProfile(user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, error: 'Invalid email or password. Please try again.' };
      await loadProfile(data.user);
      return { success: true, user: data.user };
    } catch {
      return { success: false, error: 'Invalid email or password. Please try again.' };
    }
  };

  const signup = async (name, email, password, passwordConfirm, phone = '') => {
    if (!email || !password || !passwordConfirm || !name) {
      return { success: false, error: 'Please fill in all required fields.' };
    }
    if (password.length < 6 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return {
        success: false,
        error: 'Password must be at least 6 characters with uppercase, lowercase, and a number.',
      };
    }

    try {
      // Store name & phone in auth metadata so they're always available
      // even before the customers profile row is created.
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, phone: phone || '' } },
      });
      if (error) {
        if (error.message?.toLowerCase().includes('already registered')) {
          return { success: false, error: 'This email is already registered. Try logging in or use a different email.' };
        }
        return { success: false, error: error.message };
      }

      // Always upsert the customers row. When email confirmation is disabled
      // (data.session is set) this succeeds immediately. When email confirmation
      // is enabled (no session yet) this may fail with RLS — the DB trigger and
      // the SIGNED_IN handler above act as fallbacks.
      const { error: profileErr } = await supabase.from('customers').upsert({
        id: data.user.id,
        email,
        name,
        phone: phone || null,
        vedic_points: 0,
        tier: 'Bronze',
        role: 'user',
      }, { onConflict: 'id' });
      if (profileErr) {
        console.error('Profile upsert error:', JSON.stringify(profileErr));
      }

      await loadProfile(data.user);
      // emailConfirmRequired is true when Supabase email confirmation is enabled —
      // the caller can show a "check your email" message instead of redirecting.
      return { success: true, user: data.user, emailConfirmRequired: !data.session };
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed. Please try again.' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
    // Navigate to home — works in both browser and any future SSR context
    window.location.href = '/';
  };

  const getIsAdmin = () => {
    return currentUser?.role?.toLowerCase() === 'admin';
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isAdmin: getIsAdmin(),
    login,
    signup,
    logout,
    initialLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
