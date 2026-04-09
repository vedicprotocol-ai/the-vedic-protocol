import React, { createContext, useContext, useState, useEffect } from 'react';
import pb from '@/lib/pocketbaseClient.js';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const generateRandomCode = () => {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    if (pb.authStore.isValid) {
      setCurrentUser(pb.authStore.record || pb.authStore.model);
    }
    setInitialLoading(false);

    const unsubscribe = pb.authStore.onChange((token, model) => {
      setCurrentUser(pb.authStore.record || model);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      const authData = await pb.collection('customers').authWithPassword(email, password, { $autoCancel: false });
      setCurrentUser(authData.record);
      return { success: true, user: authData.record };
    } catch (error) {
      return { success: false, error: 'Invalid email or password. Please try again.' };
    }
  };

  const signup = async (name, email, password, passwordConfirm, role = 'user') => {
    if (!email || !password || !passwordConfirm || !name) {
      return { success: false, error: 'Please fill in all required fields.' };
    }

    if (password.length < 6 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      return { 
        success: false, 
        error: 'Password must be at least 6 characters with uppercase, lowercase, and a number.' 
      };
    }

    try {
      const userData = {
        email,
        password,
        passwordConfirm,
        name,
        vedic_points: 0,
        tier: 'Bronze',
        emailVisibility: true,
        role: role
      };
      
      const record = await pb.collection('customers').create(userData, { $autoCancel: false });
      
      await pb.collection('customers').authWithPassword(email, password, { $autoCancel: false });
      setCurrentUser(pb.authStore.record || pb.authStore.model);
      
      let influencerRecord = null;
      if (role === 'influencer') {
        try {
          const influencerCode = `VEDIC_${generateRandomCode()}`;
          influencerRecord = await pb.collection('influencers').create({
            user_id: record.id,
            customer_id: record.id,
            influencer_code: influencerCode,
            total_earnings: 0,
            vedic_points: 0,
            status: 'active'
          }, { $autoCancel: false });
        } catch (influencerError) {
          console.error('Failed to create influencer profile:', influencerError);
        }
      }
      
      return { success: true, user: record, influencer: influencerRecord };
    } catch (error) {
      let errorMessage = 'Registration failed. Please try again or contact support.';
      const pbErrorData = error.response?.data || {};
      
      if (pbErrorData.email?.code === 'validation_not_unique' || error.message?.toLowerCase().includes('email')) {
        errorMessage = 'This email is already registered. Try logging in or use a different email.';
      } else if (pbErrorData.password) {
        errorMessage = 'Password must be at least 6 characters with uppercase, lowercase, and a number.';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setCurrentUser(null);
  };

  // Derive isAdmin from currentUser — works after hydration
  // Also read directly from localStorage as fallback for immediate first render
  const getIsAdmin = () => {
    if (currentUser?.role) return currentUser.role.toLowerCase() === 'admin';
    try {
      const auth = JSON.parse(localStorage.getItem('pocketbase_auth') || '{}');
      const role = auth.record?.role || auth.model?.role || '';
      return role.toLowerCase() === 'admin';
    } catch { return false; }
  };

  const value = {
    currentUser,
    isAuthenticated: pb.authStore.isValid,
    isAdmin: getIsAdmin(),
    login,
    signup,
    logout,
    initialLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};