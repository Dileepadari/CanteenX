'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useCart } from '@/contexts/CartContext';
import PreOrderScheduler from '@/components/orders/PreOrderScheduler';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import CartMockData from '@/components/demo/CartMockData';
// Import GraphQL queries
import { GET_CART_ITEMS, UPDATE_CART_ITEM, REMOVE_FROM_CART, CLEAR_CART } from '@/gql/queries/cart';
import { executeGraphQL } from '@/utils/graphql';

export default function CartPage() {
  const router = useRouter();
  const { cartItems, removeFromCart, updateQuantity, getTotalPrice, clearCart, getItemCount, setCartItems } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [scheduledDate, setScheduledDate] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  // For demo purposes, hardcoded userId - in a real app this would come from auth
  const userId = 1; 

  // Fetch cart items from backend when component mounts
  useEffect(() => {
    const fetchCartItems = async () => {
      setIsLoading(true);
      try {
        // In a real-world app, we'd use the actual user ID from authentication
        const response = await executeGraphQL(GET_CART_ITEMS, { userId });
        
        if (response?.getCartItems?.items) {
          // If we have real cart data from the backend, use it
          const backendItems = response.getCartItems.items.map((item: any) => ({
            id: item.id.toString(),
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            description: item.description,
            customizations: item.customizations ? JSON.parse(item.customizations) : {},
            vendorName: item.vendorName
          }));
          
          // Only update if we have items from backend and cart is empty
          if (backendItems.length > 0 && cartItems.length === 0) {
            setCartItems(backendItems);
          }
        }
      } catch (error) {
        console.error('Error fetching cart items:', error);
        // If API fails, fall back to mock data
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, []);

  const handleQuantityChange = async (id: string, newQuantity: number) => {
    if (newQuantity < 1) {
      await handleRemoveItem(id);
    } else {
      // Update locally first for better UX
      updateQuantity(id, newQuantity);
      
      // Then update on backend
      try {
        await executeGraphQL(UPDATE_CART_ITEM, {
          userId,
          cartItemId: parseInt(id),
          quantity: newQuantity
        });
      } catch (error) {
        console.error('Error updating cart item:', error);
        // Revert local change if API fails
        const originalItem = cartItems.find(item => item.id === id);
        if (originalItem) {
          updateQuantity(id, originalItem.quantity);
        }
      }
    }
  };

  const handleRemoveItem = async (id: string) => {
    // Remove locally first for better UX
    removeFromCart(id);
    
    // Then remove on backend
    try {
      await executeGraphQL(REMOVE_FROM_CART, {
        userId,
        cartItemId: parseInt(id)
      });
    } catch (error) {
      console.error('Error removing item from cart:', error);
      // No need to revert as user intended to remove
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) return;

    setIsProcessing(true);
    
    try {
      // Here you would typically call your API to place the order
      // const response = await fetch('/api/orders', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     items: cartItems,
      //     scheduledFor: scheduledDate,
      //     totalAmount: getTotalPrice()
      //   })
      // });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Clear cart in backend too
      await executeGraphQL(CLEAR_CART, { userId });
      
      setOrderSuccess(true);
      clearCart();
      
      // Redirect to order confirmation after a delay
      setTimeout(() => {
        router.push('/home');
      }, 2000);
    } catch (error) {
      console.error('Error placing order:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScheduleOrder = (date: Date) => {
    setScheduledDate(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center">
            <div className="mb-6">
              <svg className="mx-auto h-16 w-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Order Placed Successfully!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {scheduledDate 
                ? `Your order has been scheduled for ${scheduledDate.toLocaleDateString()} at ${scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
                : 'Your order has been placed successfully and is being processed.'}
            </p>
            <button
              onClick={() => router.push('/home')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Return to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Only include mock data in development */}
      {process.env.NODE_ENV === 'development' && <CartMockData />}
      
      {/* Include Navbar with cart count */}
      <Navbar cartItemCount={getItemCount()} />

      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">Your Cart</h1>
          
          {isLoading ? (
            <div className="mt-12 text-center py-12 bg-white dark:bg-gray-800 shadow rounded-lg">
              <svg className="animate-spin mx-auto h-8 w-8 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">Loading your cart...</p>
            </div>
          ) : cartItems.length === 0 ? (
            // Empty cart view
            <div className="mt-12 text-center py-12 bg-white dark:bg-gray-800 shadow rounded-lg">
              <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
              </svg>
              <h2 className="mt-2 text-lg font-medium text-gray-900 dark:text-gray-100">Your cart is empty</h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Looks like you haven't added any items to your cart yet.</p>
              <div className="mt-6">
                <button
                  onClick={() => router.push('/home')}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            // Cart items view
            <div className="mt-12 lg:grid lg:grid-cols-12 lg:gap-x-8">
              <div className="lg:col-span-8">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
                  <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
                    {cartItems.map((item) => (
                      <li key={item.id} className="py-6 flex">
                        {item.image && (
                          <div className="flex-shrink-0 w-24 h-24 overflow-hidden rounded-md relative">
                            <Image 
                              src={item.image} 
                              alt={item.name} 
                              className="object-cover object-center" 
                              width={96}
                              height={96}
                              priority
                            />
                          </div>
                        )}

                        <div className="ml-4 flex-1 flex flex-col">
                          <div>
                            <div className="flex justify-between">
                              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                                {item.name}
                              </h3>
                              <p className="ml-4 text-md font-medium text-gray-900 dark:text-gray-100">
                                {formatCurrency(item.price)}
                              </p>
                            </div>
                            {item.description && (
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                {item.description}
                              </p>
                            )}
                            {item.customizations && Object.keys(item.customizations).length > 0 && (
                              <div className="mt-1">
                                <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400">Customizations:</h4>
                                <ul className="text-sm text-gray-500 dark:text-gray-400">
                                  {Object.entries(item.customizations).map(([key, value]) => (
                                    <li key={key} className="inline-block mr-3">
                                      {key}: {value.toString()}
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 flex items-end justify-between text-sm">
                            <div className="flex items-center">
                              <label htmlFor={`quantity-${item.id}`} className="sr-only">
                                Quantity
                              </label>
                              <button
                                className="text-gray-500 dark:text-gray-400 focus:outline-none p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              </button>
                              <input
                                id={`quantity-${item.id}`}
                                name={`quantity-${item.id}`}
                                type="number"
                                min="1"
                                className="mx-2 w-12 text-center border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                                value={item.quantity}
                                onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 1)}
                              />
                              <button
                                className="text-gray-500 dark:text-gray-400 focus:outline-none p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                                onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                              </button>
                            </div>

                            <div className="flex">
                              <button
                                type="button"
                                onClick={() => handleRemoveItem(item.id)}
                                className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300"
                              >
                                Remove
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-6 lg:mt-0 lg:col-span-4">
                <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">Order Summary</h2>
                  
                  <dl className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <dt className="text-sm text-gray-600 dark:text-gray-400">Subtotal</dt>
                      <dd className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatCurrency(getTotalPrice())}</dd>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <dt className="text-base font-medium text-gray-900 dark:text-gray-100">Order Total</dt>
                      <dd className="text-base font-medium text-gray-900 dark:text-gray-100">{formatCurrency(getTotalPrice())}</dd>
                    </div>
                  </dl>

                  <div className="mt-6 space-y-4">
                    {scheduledDate && (
                      <div className="rounded-md bg-blue-50 dark:bg-blue-900 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">Order Scheduled</h3>
                            <div className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                              <p>Your order is scheduled for {scheduledDate.toLocaleDateString()} at {scheduledDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.</p>
                            </div>
                            <div className="mt-1">
                              <button 
                                type="button" 
                                onClick={() => setScheduledDate(null)}
                                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                Cancel Schedule
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {!scheduledDate && (
                      <PreOrderScheduler onSchedule={handleScheduleOrder} />
                    )}
                    
                    <button
                      type="button"
                      onClick={handlePlaceOrder}
                      disabled={isProcessing || cartItems.length === 0}
                      className={`flex items-center justify-center w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
                        isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : scheduledDate ? 'Place Scheduled Order' : 'Place Order Now'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}