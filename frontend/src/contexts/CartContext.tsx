'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the type for menu items
export interface MenuItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  quantity: number;
  customizations?: Record<string, string | boolean | number>;
}

// Define the CartContext type
interface CartContextType {
  cartItems: MenuItem[];
  addToCart: (item: MenuItem) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setCartItems: (items: MenuItem[]) => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

// Define props type for CartProvider
interface CartProviderProps {
  children: ReactNode;
}

// Create the context with a default value
const CartContext = createContext<CartContextType>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  setCartItems: () => {},
  getTotalPrice: () => 0,
  getItemCount: () => 0,
});

// Custom hook to use the cart context
export const useCart = () => useContext(CartContext);

// CartProvider component to wrap your app
export function CartProvider({ children }: CartProviderProps) {
  // Initialize cart state, check localStorage for any existing cart
  const [cartItems, setCartItems] = useState<MenuItem[]>([]);

  // Load cart from localStorage on component mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart
  const addToCart = (item: MenuItem) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(i => i.id === item.id && 
        JSON.stringify(i.customizations) === JSON.stringify(item.customizations));
      
      if (existingItem) {
        // If item exists, update its quantity
        return prevItems.map(i => 
          i.id === item.id && JSON.stringify(i.customizations) === JSON.stringify(item.customizations)
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        // Otherwise add new item
        return [...prevItems, item];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  // Update item quantity
  const updateQuantity = (itemId: string, quantity: number) => {
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  // Clear the entire cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate total price of items in cart
  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Get total number of items in cart
  const getItemCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Provide the cart context to children
  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      setCartItems,
      getTotalPrice,
      getItemCount
    }}>
      {children}
    </CartContext.Provider>
  );
}