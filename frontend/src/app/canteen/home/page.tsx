'use client';

import { useState } from 'react';

export default function CanteenHome() {
  const [metrics] = useState({
    totalOrders: 45,
    pendingOrders: 12,
    todayRevenue: 25000,
    activePromotions: 3,
    weeklyRevenue: [
      { day: 'Monday', amount: 22500 },
      { day: 'Tuesday', amount: 18700 },
      { day: 'Wednesday', amount: 24300 },
      { day: 'Thursday', amount: 21800 },
      { day: 'Friday', amount: 29400 },
      { day: 'Saturday', amount: 32600 },
      { day: 'Sunday', amount: 25000 },
    ],
    popularItems: [
      { name: 'Chicken Biryani', orders: 45 },
      { name: 'Veg Thali', orders: 32 },
      { name: 'Masala Dosa', orders: 28 },
    ],
    customerFeedback: {
      avgRating: 4.2,
      totalReviews: 128,
      recentFeedback: [
        { user: 'Raj M.', rating: 5, comment: 'Food was fresh and delicious' },
        { user: 'Priya S.', rating: 3, comment: 'Good food but slow service' },
        { user: 'Anand K.', rating: 4, comment: 'Excellent variety today' },
      ]
    }
  });

  // Calculate weekly total revenue
  const weeklyTotal = metrics.weeklyRevenue.reduce((total, day) => total + day.amount, 0);
  
  // Calculate the max revenue for scaling the chart
  const maxRevenue = Math.max(...metrics.weeklyRevenue.map(day => day.amount));

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Canteen Operations Overview</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm">Total Orders</h3>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{metrics.totalOrders}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm">Pending Orders</h3>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{metrics.pendingOrders}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm">Today's Revenue</h3>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">₹{metrics.todayRevenue}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-gray-500 dark:text-gray-400 text-sm">Customer Rating</h3>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{metrics.customerFeedback.avgRating}/5</p>
        </div>
      </div>

      {/* Weekly Revenue Chart */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Weekly Revenue</h2>
          <div className="text-right">
            <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
            <p className="text-xl font-semibold text-gray-800 dark:text-white">₹{weeklyTotal.toLocaleString()}</p>
          </div>
        </div>
        
        <div className="mt-2 px-4">
          <div className="space-y-6">
            {metrics.weeklyRevenue.map((day, index) => (
              <div key={index} className="relative">
                <div className="flex items-center">
                  <div className="w-20 text-sm text-gray-600 dark:text-gray-400 font-medium pr-2">
                    {day.day.substring(0, 3)}
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <div 
                        className="h-10 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg shadow-md relative overflow-hidden hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300"
                        style={{ width: `${(day.amount / maxRevenue) * 100}%` }}
                      >
                        <div className="absolute inset-0 flex items-center justify-end pr-3">
                          <span className="text-white text-sm font-medium">₹{(day.amount/1000).toFixed(1)}K</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Highest revenue day: <span className="font-medium text-indigo-600 dark:text-indigo-400">
              {metrics.weeklyRevenue.reduce((max, day) => day.amount > max.amount ? day : max, metrics.weeklyRevenue[0]).day}
            </span> (₹{maxRevenue.toLocaleString()})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Popular Items */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Popular Items Today</h2>
          <div className="space-y-4">
            {metrics.popularItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center border-b border-gray-100 dark:border-gray-700 pb-2">
                <span className="text-gray-800 dark:text-gray-200">{item.name}</span>
                <span className="text-gray-500 dark:text-gray-400">{item.orders} orders</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-2 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Recommendation: Prepare additional Chicken Biryani for dinner rush
            </p>
          </div>
        </div>

        {/* Customer Feedback */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Recent Customer Feedback</h2>
          <div className="space-y-4">
            {metrics.customerFeedback.recentFeedback.map((feedback, index) => (
              <div key={index} className="border-b border-gray-100 dark:border-gray-700 pb-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800 dark:text-gray-200">{feedback.user}</span>
                  <div className="flex items-center">
                    <span className="text-gray-500 dark:text-gray-400 mr-1">{feedback.rating}</span>
                    <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{feedback.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
            New Order
          </button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
            Update Inventory
          </button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
            Create Promotion
          </button>
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
            Staff Schedule
          </button>
        </div>
      </div>
    </div>
  );
} 