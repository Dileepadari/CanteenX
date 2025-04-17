import React, { useState } from 'react';
import ReviewSystem from '../reviews/ReviewSystem';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customizations: string[];
  vendorName: string;
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: string;
  canteenName: string;
  vendorName: string;
  items: OrderItem[];
}

interface OrderHistoryProps {
  orders: Order[];
  onReorder: (order: Order) => void;
}

export default function OrderHistory({ orders, onReorder }: OrderHistoryProps) {
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  
  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrderId(expandedOrderId === orderId ? null : orderId);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleReorder = (order: Order) => {
    onReorder(order);
  };

  const handleReviewSubmit = (review: any) => {
    console.log('Review submitted:', review);
    // In a real app, this would update the state or trigger a refetch
  };

  if (!orders.length) {
    return (
      <div className="text-center p-8">
        <div className="text-gray-500 dark:text-gray-400 mb-4">
          <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">No order history yet</h3>
        <p className="mt-1 text-gray-500 dark:text-gray-400">Your past orders will appear here once you place them.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-3xl mx-auto w-full">
      
      {orders.map((order) => (
        <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
          <div 
            className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150"
            onClick={() => toggleOrderDetails(order.id)}
          >
            <div>
              <div className="font-medium dark:text-white">Order #{order.id}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{formatDate(order.date)}</div>
              <div className="text-xs mt-1">
                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                  ${order.status === 'Completed' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' :
                    order.status === 'Processing' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' :
                    order.status === 'Cancelled' ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200' :
                    'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'}`}
                >
                  {order.status}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="font-semibold dark:text-white">₹{order.total.toFixed(2)}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">{order.items.length} item(s)</div>
            </div>
          </div>
          
          {expandedOrderId === order.id && (
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="mb-4 text-sm text-gray-700 dark:text-gray-300">
                <div><span className="font-medium dark:text-gray-200">Canteen:</span> {order.canteenName}</div>
                <div><span className="font-medium dark:text-gray-200">Vendor:</span> {order.vendorName}</div>
              </div>
              
              <div className="space-y-3 mb-4">
                <h4 className="font-medium dark:text-white">Items</h4>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <div className="font-medium dark:text-white">{item.name} × {item.quantity}</div>
                      {item.customizations.length > 0 && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {item.customizations.join(', ')}
                        </div>
                      )}
                      <div className="mt-2">
                        <ReviewSystem
                          itemId={item.id}
                          itemName={item.name}
                          vendorName={item.vendorName}
                          onSubmitReview={handleReviewSubmit}
                        />
                      </div>
                    </div>
                    <div className="text-right dark:text-white">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleReorder(order)}
                    className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-gray-700"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Reorder
                  </button>
                  
                  <button
                    className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    Help
                  </button>
                </div>
                
                <button
                  className="flex items-center px-4 py-2 border border-red-300 dark:border-red-700 rounded-md text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-gray-700"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                  </svg>
                  Report Issue
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}