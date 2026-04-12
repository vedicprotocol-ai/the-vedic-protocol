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

  // Fetch the customer profile row and merge with the auth user
  const loadProfile = async (authUser) => {
    if (!authUser) { setCurrentUser(null); return; }
    const { data: profile } = await supabase
      .from('customers')
      .select('*')
      .eq('id', authUser.id)
      .single();
    setCurrentUser(profile ? { ...authUser, ...profile } : authUser);
  };

  useEffect(() => {
    // Restore session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      loadProfile(session?.user ?? null).finally(() => setInitialLoading(false));
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProfile(session?.user ?? null);
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
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        if (error.message?.toLowerCase().includes('already registered')) {
          return { success: false, error: 'This email is already registered. Try logging in or use a different email.' };
        }
        return { success: false, error: error.message };
      }

      // Upsert customer profile — handles the case where a Supabase trigger
      // already inserted a bare row on auth.users creation.
      const { error: profileErr } = await supabase.from('customers').upsert({
        id: data.user.id,
        email,
        name,
        phone: phone || null,
        vedic_points: 0,
        tier: 'Bronze',
        role: 'user',
      }, { onConflict: 'id' });
      if (profileErr) console.error('Profile upsert error:', profileErr);

      await loadProfile(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: error.message || 'Registration failed. Please try again.' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
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
