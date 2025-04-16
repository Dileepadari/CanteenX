'use client';

import { useState } from 'react';

interface BulkOrder {
  id: string;
  organizationName: string;
  contactPerson: string;
  email: string;
  phone: string;
  eventDate: string;
  numberOfPeople: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  status: 'pending' | 'confirmed' | 'preparing' | 'completed';
  totalAmount: number;
}

export default function BulkOrdersManagement() {
  const [bulkOrders, setBulkOrders] = useState<BulkOrder[]>([
    {
      id: 'BO1',
      organizationName: 'Tech Corp',
      contactPerson: 'Jane Smith',
      email: 'jane@techcorp.com',
      phone: '+91-9876543210',
      eventDate: '2024-04-15',
      numberOfPeople: 100,
      items: [
        { name: 'Veg Thali', quantity: 70, price: 120 },
        { name: 'Non-Veg Thali', quantity: 30, price: 150 }
      ],
      status: 'confirmed',
      totalAmount: 12900
    }
  ]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Bulk Orders Management</h1>
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
          New Bulk Order
        </button>
      </div>

      <div className="grid gap-6">
        {bulkOrders.map((order) => (
          <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{order.organizationName}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Order #{order.id}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs ${
                order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                order.status === 'confirmed' ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300' :
                order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}>
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4 text-sm text-gray-800 dark:text-gray-200">
              <div>
                <p><span className="font-semibold">Contact:</span> {order.contactPerson}</p>
                <p><span className="font-semibold">Email:</span> {order.email}</p>
                <p><span className="font-semibold">Phone:</span> {order.phone}</p>
              </div>
              <div>
                <p><span className="font-semibold">Event Date:</span> {new Date(order.eventDate).toLocaleDateString()}</p>
                <p><span className="font-semibold">Number of People:</span> {order.numberOfPeople}</p>
                <p><span className="font-semibold">Total Amount:</span> ₹{order.totalAmount}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h4 className="font-semibold mb-2 text-gray-800 dark:text-gray-100">Order Items</h4>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 dark:text-gray-400">
                    <th className="text-left">Item</th>
                    <th className="text-right">Quantity</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800 dark:text-gray-200">
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td className="text-right">{item.quantity}</td>
                      <td className="text-right">₹{item.price}</td>
                      <td className="text-right">₹{item.quantity * item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex justify-end gap-2">
              <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">Edit Order</button>
              <button className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300">Update Status</button>
              <button className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">Cancel Order</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 