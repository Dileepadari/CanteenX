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
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Total Orders</h3>
          <p className="text-2xl font-bold">{metrics.totalOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Pending Orders</h3>
          <p className="text-2xl font-bold">{metrics.pendingOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Today's Revenue</h3>
          <p className="text-2xl font-bold">₹{metrics.todayRevenue}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500 text-sm">Active Promotions</h3>
          <p className="text-2xl font-bold">{metrics.activePromotions}</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
              New Order
            </button>
            <button className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600">
              Add Menu Item
            </button>
            <button className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600">
              Create Promotion
            </button>
            <button className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600">
              Bulk Order
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Popular Items Today</h2>
          <div className="space-y-4">
            {metrics.popularItems.map((item, index) => (
              <div key={index} className="flex justify-between items-center">
                <span>{item.name}</span>
                <span className="text-gray-500">{item.orders} orders</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
} 