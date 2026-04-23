import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import supabase from '@/lib/supabaseClient.js';
import { useAuth } from '@/contexts/AuthContext.jsx';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const { currentUser } = useAuth();
  const prevUserIdRef = useRef(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    const prevUserId = prevUserIdRef.current;
    const nextUserId = currentUser?.id ?? null;
    prevUserIdRef.current = nextUserId;

    if (nextUserId && nextUserId !== prevUserId) {
      // User logged in — load from Supabase, merging any local items
      loadCartFromSupabase(nextUserId);
    } else if (!nextUserId && prevUserId) {
      // User logged out — persist current state to localStorage, clear items
      localStorage.setItem('vedic_cart', JSON.stringify(cartItems));
      setCartItems([]);
      initializedRef.current = false;
    } else if (!nextUserId && !initializedRef.current) {
      // Guest on mount — load from localStorage
      initializedRef.current = true;
      const saved = localStorage.getItem('vedic_cart');
      if (saved) {
        try { setCartItems(JSON.parse(saved)); } catch {}
      }
    }
  }, [currentUser?.id]);

  // Persist to localStorage for guest sessions
  useEffect(() => {
    if (!currentUser?.id) {
      localStorage.setItem('vedic_cart', JSON.stringify(cartItems));
    }
  }, [cartItems, currentUser?.id]);

  const loadCartFromSupabase = async (customerId) => {
    try {
      // Get local items to merge in
      let localItems = [];
      try { localItems = JSON.parse(localStorage.getItem('vedic_cart') || '[]'); } catch {}

      const { data: dbRows } = await supabase
        .from('cart_items')
        .select('id, product_id, quantity, products(id, name, price, image, category, stock)')
        .eq('customer_id', customerId);

      const dbCart = (dbRows || []).map(row => ({
        ...(row.products || {}),
        id: row.product_id,
        quantity: row.quantity,
      }));

      // Merge local-only items into Supabase
      for (const local of localItems) {
        const inDb = dbCart.find(i => i.id === local.id);
        if (inDb) {
          const newQty = inDb.quantity + local.quantity;
          await supabase
            .from('cart_items')
            .update({ quantity: newQty, updated: new Date().toISOString() })
            .eq('customer_id', customerId)
            .eq('product_id', local.id);
          inDb.quantity = newQty;
        } else {
          const { data: newRow } = await supabase
            .from('cart_items')
            .insert({ customer_id: customerId, product_id: local.id, quantity: local.quantity })
            .select('id')
            .single();
          if (newRow) dbCart.push({ ...local });
        }
      }

      localStorage.removeItem('vedic_cart');
      initializedRef.current = true;
      setCartItems(dbCart);
    } catch (err) {
      console.error('Failed to load cart from Supabase:', err);
    }
  };

  const addToCart = async (product, quantity = 1) => {
    const existingItem = cartItems.find(i => i.id === product.id);

    if (existingItem) {
      const newQty = existingItem.quantity + quantity;
      setCartItems(prev =>
        prev.map(item => item.id === product.id ? { ...item, quantity: newQty } : item)
      );
      if (currentUser?.id) {
        await supabase
          .from('cart_items')
          .update({ quantity: newQty, updated: new Date().toISOString() })
          .eq('customer_id', currentUser.id)
          .eq('product_id', product.id);
      }
    } else {
      setCartItems(prev => [...prev, { ...product, quantity }]);
      if (currentUser?.id) {
        await supabase
          .from('cart_items')
          .insert({ customer_id: currentUser.id, product_id: product.id, quantity });
      }
    }
  };

  const removeFromCart = async (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
    if (currentUser?.id) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('customer_id', currentUser.id)
        .eq('product_id', productId);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => item.id === productId ? { ...item, quantity } : item)
    );
    if (currentUser?.id) {
      await supabase
        .from('cart_items')
        .update({ quantity, updated: new Date().toISOString() })
        .eq('customer_id', currentUser.id)
        .eq('product_id', productId);
    }
  };

  const clearCart = async () => {
    setCartItems([]);
    if (currentUser?.id) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('customer_id', currentUser.id);
    }
  };

  const getCartTotal = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const getCartCount = () =>
    cartItems.reduce((count, item) => count + item.quantity, 0);

  const value = {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
