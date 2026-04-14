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
    const { data: profile, error: profileError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', authUser.id)
      .single();
    console.log('[AuthContext] profile fetched:', profile, 'error:', profileError);
    if (profile) {
      console.log('[AuthContext] role value:', profile.role, '| isAdmin:', profile.role?.toLowerCase() === 'admin');
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
        if ((!existing?.name || existing?.name === '') && meta.name && existing) {
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
      // Profile loading failure must not block a successful auth — set the bare
      // auth user as a fallback so isAuthenticated is true and navigate works.
      try {
        await loadProfile(data.user);
      } catch {
        setCurrentUser(data.user);
      }
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
      // ── Duplicate check ────────────────────────────────────────────────
      // The RPC runs as SECURITY DEFINER so it can bypass RLS and check the
      // customers table without an active session.
      const { data: dupCheck, error: dupErr } = await supabase.rpc(
        'check_registration_exists',
        { p_email: email, p_phone: phone || null }
      );
      if (!dupErr && dupCheck) {
        if (dupCheck.email_taken) {
          return {
            success: false,
            error: 'This email is already registered. Please log in or use a different email address.',
          };
        }
        if (dupCheck.phone_taken) {
          return {
            success: false,
            error: 'This phone number is already registered. Please use a different number or log in to your existing account.',
          };
        }
      }
      // If dupErr (RPC not yet deployed), fall through — Supabase auth and the
      // identities check below still catch duplicate emails as a fallback.

      // ── Create auth user ───────────────────────────────────────────────
      // Store name & phone in auth metadata so they're always available
      // even before the customers profile row is created.
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, phone: phone || '' },
          // After email confirmation the user lands on the shop with a welcome banner.
          emailRedirectTo: `${window.location.origin}/shop?welcome=1`,
        },
      });
      if (error) {
        if (error.message?.toLowerCase().includes('already registered')) {
          return {
            success: false,
            error: 'This email is already registered. Please log in or use a different email address.',
          };
        }
        return { success: false, error: error.message };
      }

      // When Supabase email-confirm mode is ON, signing up with an already-used
      // email does NOT return an error — it silently "succeeds" but the returned
      // user object has an empty identities array.  Catch that here.
      if (!data.user?.identities || data.user.identities.length === 0) {
        return {
          success: false,
          error: 'This email is already registered. Please log in or use a different email address.',
        };
      }

      // Always create the customers row immediately after signUp,
      // regardless of whether email confirmation is required.
      const { error: insertError } = await supabase.from('customers').insert({
        id: data.user.id,
        email,
        name,
        phone: phone || null,
        vedic_points: 0,
        tier: 'Bronze',
        role: 'customer',
      });
      if (insertError) console.error('Profile insert error:', JSON.stringify(insertError));

      const emailConfirmRequired = !data.session;

      if (emailConfirmRequired) {
        // No live session yet — surface what we know locally so the UI has a
        // name to show on the confirmation screen.
        setCurrentUser({ ...data.user, name, phone: phone || '' });
      } else {
        await loadProfile(data.user);
      }

      // emailConfirmRequired is true when Supabase email confirmation is enabled —
      // the caller can show a "check your email" message instead of redirecting.
      return { success: true, user: data.user, emailConfirmRequired };
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed. Please try again.' };
    }
  };

  const logout = async () => {
    // Clear React state immediately so ProtectedRoute stops guarding.
    setCurrentUser(null);
    try {
      // Resolve (not reject) after 3 s so the redirect always fires even if
      // the Supabase server is slow — signOut clears localStorage before the
      // network call, so the local session is gone regardless of the timeout.
      await Promise.race([
        supabase.auth.signOut(),
        new Promise(resolve => setTimeout(resolve, 3000)),
      ]);
    } catch (err) {
      console.warn('signOut error (proceeding anyway):', err.message);
    }
    window.location.href = '/';
  };

  const getIsAdmin = () => {
    return currentUser?.role?.toLowerCase() === 'admin';
  };

  // canOrder: true only when the user's email is confirmed AND a phone number
  // is on record. Checkout is blocked until both conditions are met.
  const canOrder = !!(
    currentUser?.email_confirmed_at &&
    currentUser?.phone
  );

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    isAdmin: getIsAdmin(),
    canOrder,
    login,
    signup,
    logout,
    initialLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
