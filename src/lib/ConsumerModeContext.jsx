import React, { createContext, useContext, useState, useEffect } from 'react';

const ConsumerModeContext = createContext();

export function ConsumerModeProvider({ children }) {
  const [isConsumerMode, setIsConsumerMode] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('marketCart');
    if (saved) {
      try {
        setCartItems(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load cart from localStorage:', e);
      }
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem('marketCart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item) => {
    setCartItems(prev => {
      const existing = prev.find(
        i => i.id === item.id && i.shop_id === item.shop_id
      );
      if (existing) {
        return prev.map(i =>
          i.id === item.id && i.shop_id === item.shop_id
            ? { ...i, quantity: (i.quantity || 1) + (item.quantity || 1) }
            : i
        );
      }
      return [...prev, { ...item, quantity: item.quantity || 1 }];
    });
  };

  const removeFromCart = (itemId, shopId) => {
    setCartItems(prev => prev.filter(i => !(i.id === itemId && i.shop_id === shopId)));
  };

  const updateQuantity = (itemId, shopId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(itemId, shopId);
      return;
    }
    setCartItems(prev =>
      prev.map(i =>
        i.id === itemId && i.shop_id === shopId ? { ...i, quantity } : i
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const toggleConsumerMode = (enabled) => {
    setIsConsumerMode(enabled);
    if (!enabled) {
      setCartOpen(false);
    }
  };

  return (
    <ConsumerModeContext.Provider
      value={{
        isConsumerMode,
        toggleConsumerMode,
        cartItems,
        cartOpen,
        setCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </ConsumerModeContext.Provider>
  );
}

export function useConsumerMode() {
  const context = useContext(ConsumerModeContext);
  if (!context) {
    throw new Error('useConsumerMode must be used within ConsumerModeProvider');
  }
  return context;
}