'use client';

import { useState } from 'react';

interface Order {
  id: string;
  customerName: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed';
  timestamp: string;
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      customerName: 'John Doe',
      items: [
        { name: 'Chicken Biryani', quantity: 2, price: 180 },
        { name: 'Naan', quantity: 3, price: 30 }
      ],
      total: 450,
      status: 'pending',
      timestamp: '2024-03-20T10:30:00'
    }
  ]);

  const updateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-100">Orders Management</h1>
      
      <div className="grid grid-cols-1 gap-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold text-gray-800 dark:text-gray-100">Order #{order.id}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{order.customerName}</p>
              </div>
              <div className="flex items-center gap-2">
                <select 
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                  className="border dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                >
                  <option value="pending">Pending</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                </select>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                  order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                  order.status === 'ready' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                  'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500 dark:text-gray-400">
                    <th className="text-left">Item</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Price</th>
                  </tr>
                </thead>
                <tbody className="text-gray-800 dark:text-gray-200">
                  {order.items.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td className="text-right">{item.quantity}</td>
                      <td className="text-right">₹{item.price * item.quantity}</td>
                    </tr>
                  ))}
                  <tr className="font-semibold">
                    <td colSpan={2} className="text-right">Total:</td>
                    <td className="text-right">₹{order.total}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 