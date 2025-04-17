'use client';

import { useEffect } from 'react';
import { useCart, MenuItem } from '@/contexts/CartContext';

// Sample menu items for demonstration
const mockMenuItems: MenuItem[] = [
  {
    id: '1',
    name: 'Classic Burger',
    price: 120,
    description: 'Juicy beef patty with cheese, lettuce, tomatoes, and our special sauce',
    image: '/assets/mockups/classic-burger.jpg',
    quantity: 1,
  },
  {
    id: '2',
    name: 'Masala Dosa',
    price: 80,
    description: 'South Indian crispy crepe filled with spicy potato filling',
    image: '/assets/mockups/masala-dosa.jpg',
    quantity: 2,
    customizations: {
      'Extra Chutney': true,
      'Spice Level': 'Medium'
    }
  },
  {
    id: '3',
    name: 'Cold Coffee',
    price: 70,
    description: 'Refreshing cold coffee with ice cream',
    image: '/assets/mockups/cold-coffee.jpg',
    quantity: 1,
    customizations: {
      'Sugar': 'Less',
      'Ice': 'Regular'
    }
  },
  {
    id: '4',
    name: 'Paneer Sandwich',
    price: 90,
    description: 'Grilled sandwich with cottage cheese, veggies, and mint chutney',
    image: '/assets/mockups/paneer-sandwich.jpg',
    quantity: 1
  }
];

// Default placeholder image URLs if you don't have actual images
const placeholderImages = [
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1637861892088-3642b6e5dc4f?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=300&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1539252554453-80ab65ce3586?q=80&w=300&auto=format&fit=crop'
];

export default function CartMockData() {
  const { cartItems, addToCart, clearCart } = useCart();

  useEffect(() => {
    // Only add mock data if cart is empty
    if (cartItems.length === 0) {
      // Clear any existing items first
      clearCart();
      
      // Add mock items with placeholder images
      mockMenuItems.forEach((item, index) => {
        // Use placeholder images instead of potentially missing local images
        const itemWithImage = {
          ...item,
          image: placeholderImages[index % placeholderImages.length]
        };
        addToCart(itemWithImage);
      });
      
      console.log('Added mock items to cart for demo purposes');
    }
  }, []);

  return null; // This component doesn't render anything
}