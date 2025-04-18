import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  canteenId: string;
  canteenName: string;
  customizations?: {
    size?: 'small' | 'medium' | 'large';
    additions?: string[];
    removals?: string[];
    notes?: string;
  };
}

export interface ScheduledPickup {
  date: string;
  time: string;
}

interface CartState {
  cartItems: CartItem[];
  scheduledPickup: ScheduledPickup | null;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  updateItemCustomizations: (itemId: string, customizations: CartItem['customizations']) => void;
  setScheduledPickup: (pickup: ScheduledPickup | null) => void;
  clearCart: () => void;
  getTotalAmount: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      cartItems: [],
      scheduledPickup: null,
      
      addItem: (newItem) => set((state) => {
        // Check if the item already exists in the cart
        const existingItemIndex = state.cartItems.findIndex(
          (item) => item.id === newItem.id
        );
        
        if (existingItemIndex >= 0) {
          // If the item exists, update its quantity
          const updatedItems = [...state.cartItems];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
          };
          return { cartItems: updatedItems };
        } else {
          // Otherwise add the new item
          return { cartItems: [...state.cartItems, newItem] };
        }
      }),
      
      removeItem: (itemId) => set((state) => ({
        cartItems: state.cartItems.filter((item) => item.id !== itemId),
      })),
      
      updateItemQuantity: (itemId, quantity) => set((state) => ({
        cartItems: state.cartItems.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        ),
      })),
      
      updateItemCustomizations: (itemId, customizations) => set((state) => ({
        cartItems: state.cartItems.map((item) =>
          item.id === itemId ? { ...item, customizations } : item
        ),
      })),
      
      setScheduledPickup: (pickup) => set({ scheduledPickup: pickup }),
      
      clearCart: () => set({ cartItems: [], scheduledPickup: null }),
      
      getTotalAmount: () => {
        return get().cartItems.reduce(
          (total, item) => total + item.price * item.quantity, 
          0
        );
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
