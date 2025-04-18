
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { menuItems as allMenuItems } from "@/data/mockData";

export interface CartItem {
  id: number;
  itemId: number;
  name: string;
  price: number;
  quantity: number;
  canteenId: number;
  canteenName: string;
  image: string;
  customizations?: string[];
}

interface CartContextType {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
  checkout: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("smartCanteenCart");
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Failed to parse saved cart:", error);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("smartCanteenCart", JSON.stringify(items));
  }, [items]);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const addItem = useCallback((newItem: CartItem) => {
    setItems(prev => {
      // Check if item from same canteen
      const hasItemsFromOtherCanteen = prev.some(item => item.canteenId !== newItem.canteenId && prev.length > 0);
      
      if (hasItemsFromOtherCanteen) {
        toast({
          title: "Cannot add items from multiple canteens",
          description: "Please complete your current order or clear your cart first.",
          variant: "destructive",
        });
        return prev;
      }

      // Check if item already exists
      const existingItemIndex = prev.findIndex(item => item.itemId === newItem.itemId);
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedItems = [...prev];
        updatedItems[existingItemIndex].quantity += newItem.quantity;
        
        toast({
          title: "Item quantity updated",
          description: `${newItem.name} quantity increased to ${updatedItems[existingItemIndex].quantity}`,
        });
        
        return updatedItems;
      } else {
        // Add new item
        toast({
          title: "Item added to cart",
          description: `${newItem.name} added to your order`,
        });
        
        return [...prev, { ...newItem, id: Date.now() }];
      }
    });
  }, [toast]);

  const removeItem = useCallback((id: number) => {
    setItems(prev => {
      const itemToRemove = prev.find(item => item.id === id);
      if (itemToRemove) {
        toast({
          title: "Item removed",
          description: `${itemToRemove.name} removed from your order`,
        });
      }
      return prev.filter(item => item.id !== id);
    });
  }, [toast]);

  const updateQuantity = useCallback((id: number, quantity: number) => {
    if (quantity < 1) {
      removeItem(id);
      return;
    }
    
    setItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart",
    });
  }, [toast]);

  const checkout = useCallback(() => {
    // In a real app, this would send the order to the backend
    toast({
      title: "Order placed successfully",
      description: `Your order of ${totalItems} items has been placed`,
    });
    setItems([]);
  }, [totalItems, toast]);

  return (
    <CartContext.Provider
      value={{
        items,
        totalItems,
        totalPrice,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        checkout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
