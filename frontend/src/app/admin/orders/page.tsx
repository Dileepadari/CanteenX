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
    <div>
      <h1 className="text-2xl font-bold mb-6">Orders Management</h1>
      
      <div className="grid grid-cols-1 gap-4">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-semibold">Order #{order.id}</h3>
                <p className="text-sm text-gray-500">{order.customerName}</p>
              </div>
              <div className="flex items-center gap-2">
                <select 
                  value={order.status}
                  onChange={(e) => updateOrderStatus(order.id, e.target.value as Order['status'])}
                  className="border rounded px-2 py-1 text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                </select>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  order.status === 'completed' ? 'bg-green-100 text-green-800' :
                  order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
              </div>
            </div>
            
            <div className="border-t pt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-gray-500">
                    <th className="text-left">Item</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Price</th>
                  </tr>
                </thead>
                <tbody>
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