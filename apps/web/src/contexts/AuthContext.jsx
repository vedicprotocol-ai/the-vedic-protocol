import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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

  // Monotonically-increasing counter to discard stale concurrent loadProfile calls.
  // Without this, a slow first call can overwrite a faster second call's result.
  const loadSeqRef = useRef(0);

  // Fetch the customer profile row and merge with the auth user.
  // Falls back to auth user_metadata (name/phone) when the customers row
  // doesn't exist yet so the dashboard always has a name to show.
  const loadProfile = async (authUser) => {
    const seq = ++loadSeqRef.current;           // claim a sequence number
    if (!authUser) {
      if (seq === loadSeqRef.current) setCurrentUser(null);
      return;
    }

    const { data: profile, error: profileError } = await Promise.race([
      supabase.from('customers').select('*').eq('id', authUser.id).single(),
      new Promise(resolve => setTimeout(() => resolve({ data: null, error: { message: 'timeout' } }), 6000)),
    ]);

    // Discard result if a newer loadProfile call has already started
    if (seq !== loadSeqRef.current) return;

    console.log('[AuthContext] profile fetched:', profile, 'error:', profileError);
    if (profile) {
      console.log('[AuthContext] role value:', profile.role, '| isAdmin:', profile.role?.toLowerCase() === 'admin');
      setCurrentUser({ ...authUser, ...profile });
    } else {
      // Profile row missing — use auth metadata as a temporary fallback.
      // NOTE: if this keeps happening, run Database/set_admin_role.sql in
      // Supabase Dashboard → SQL Editor to ensure the customers row exists
      // and has the correct role value.
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
        // Name-patch for the signup edge case where the DB trigger created the
        // customers row before auth metadata was available. Fire-and-forget so
        // it does NOT block loadProfile (and therefore does not slow sign-in).
        if (meta.name) {
          supabase
            .from('customers').select('id, name, phone').eq('id', user.id).single()
            .then(({ data: existing }) => {
              if (existing && (!existing.name || existing.name === '') && meta.name) {
                supabase.from('customers').update({
                  name: meta.name,
                  phone: existing.phone || meta.phone || null,
                }).eq('id', user.id);
              }
            });
        }
      }
      // Await so that the sequence counter correctly guards against concurrent calls
      await loadProfile(user);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        // Log the real error so developers can diagnose via browser console.
        console.error('[Auth] signInWithPassword failed — code:', error.code, '| status:', error.status, '| message:', error.message);
        // Rate limiting: too many attempts in a short window.
        if (error.code === 'over_request_rate_limit' || error.status === 429) {
          return {
            success: false,
            errorCode: 'rate_limited',
            error: 'Too many login attempts. Please wait a few minutes and try again.',
          };
        }
        // Email not yet confirmed (email_confirmed_at or confirmed_at is null in auth.users).
        if (error.code === 'email_not_confirmed') {
          return {
            success: false,
            errorCode: 'email_not_confirmed',
            error: 'Your email address has not been confirmed yet. Please check your inbox for a confirmation link.',
          };
        }
        // Default: invalid_credentials or unexpected error.
        return {
          success: false,
          errorCode: error.code || 'invalid_credentials',
          error: 'Invalid email or password. Please try again.',
        };
      }
      // Fetch the profile directly rather than through loadProfile so that the
      // seq-counter race between this call and the concurrent onAuthStateChange
      // handler cannot cause setCurrentUser to be silently skipped (which would
      // result in currentUser=null at navigation time and an apparent redirect
      // bounce back to /login).
      // A 6-second timeout prevents the button hanging forever if the DB is slow.
      const { data: profile } = await Promise.race([
        supabase.from('customers').select('*').eq('id', data.user.id).single(),
        new Promise(resolve => setTimeout(() => resolve({ data: null }), 6000)),
      ]);
      if (profile) {
        setCurrentUser({ ...data.user, ...profile });
      } else {
        const meta = data.user.user_metadata || {};
        setCurrentUser({ ...data.user, name: meta.name || '', phone: meta.phone || '' });
      }
      return { success: true, user: data.user };
    } catch (err) {
      console.error('[Auth] login exception:', err);
      return { success: false, errorCode: 'unknown', error: 'Invalid email or password. Please try again.' };
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
      // the Supabase server is slow.
      await Promise.race([
        supabase.auth.signOut(),
        new Promise(resolve => setTimeout(resolve, 3000)),
      ]);
    } catch (err) {
      console.warn('signOut error (proceeding anyway):', err.message);
    }

    // Wipe all browser storage so nothing is left behind.
    try { localStorage.clear(); } catch (_) {}
    try { sessionStorage.clear(); } catch (_) {}

    // Clear all cookies for this origin.
    try {
      document.cookie.split(';').forEach(cookie => {
        const name = cookie.split('=')[0].trim();
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });
    } catch (_) {}

    window.location.href = '/login';
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
