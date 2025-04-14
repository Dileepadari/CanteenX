'use client';

import { useState } from 'react';

export default function AdminDashboard() {
  const [metrics] = useState({
    totalOrders: 45,
    pendingOrders: 12,
    todayRevenue: 25000,
    activePromotions: 3,
    popularItems: [
      { name: 'Chicken Biryani', orders: 45 },
      { name: 'Veg Thali', orders: 32 },
      { name: 'Masala Dosa', orders: 28 },
    ],
  });

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Dashboard Overview</h1>
      
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
          <h3 className="text-gray-500 dark:text-gray-400 text-sm">Active Promotions</h3>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{metrics.activePromotions}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
              New Order
            </button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
              Add Menu Item
            </button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
              Create Promotion
            </button>
            <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
              Bulk Order
            </button>
          </div>
        </div>

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
        </div>
      </div>
    </div>
  );
} 