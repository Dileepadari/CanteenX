'use client';

import { useState, useEffect } from 'react';

interface OrderItem {
  id: number;
  menuItemId: number;
  itemName: string;
  quantity: number;
  price: number;
  notes?: string;
}

interface Order {
  id: number;
  customerName: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  createdAt: string;
  notes?: string;
}

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<Order['status'] | 'all'>('all');
  
  // Add the canteen ID here (you would normally get this from auth context)
  const canteenId = 1;

  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    setLoading(true);
    try {
      console.log('Fetching orders...');
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: `
            query GetOrders($canteenId: Int) {
              orders(canteenId: $canteenId) {
                id
                customerName
                status
                totalAmount
                createdAt
                notes
                items {
                  id
                  menuItemId
                  itemName
                  quantity
                  price
                  notes
                }
              }
            }
          `,
          variables: {
            canteenId: canteenId,
          },
        }),
      });

      const result = await response.json();
      console.log('Received response:', result);
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      
      // No transformation needed as the field names already match
      setOrders(result.data.orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  async function updateOrderStatus(orderId: number, newStatus: Order['status']) {
    try {
      console.log(`Updating order ${orderId} to status ${newStatus}`);
      const response = await fetch('/api/graphql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          query: `
            mutation UpdateOrderStatus($orderId: Int!, $status: OrderStatus!) {
              updateOrderStatus(orderId: $orderId, status: $status)
            }
          `,
          variables: {
            orderId: orderId,
            status: newStatus.toUpperCase(),
          },
        }),
      });

      const result = await response.json();
      console.log('Update status response:', result);
      
      if (result.errors) {
        throw new Error(result.errors[0].message);
      }
      
      if (result.data.updateOrderStatus) {
        // Update local state only if mutation was successful
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ));
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    }
  }

  // Filter the orders based on the selected status
  const filteredOrders = statusFilter === 'all' 
    ? orders 
    : orders.filter(order => order.status === statusFilter);

  if (loading) {
    return <div className="text-center p-8">Loading orders...</div>;
  }

  if (error) {
    return <div className="text-center p-8 text-red-500">Error: {error}</div>;
  }

  if (orders.length === 0) {
    return <div className="text-center p-8">No orders found.</div>;
  }

  // Function to format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Orders Management</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center">
            <label htmlFor="statusFilter" className="mr-2 text-gray-700 dark:text-gray-300">Filter by status:</label>
            <select
              id="statusFilter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Order['status'] | 'all')}
              className="border dark:border-gray-600 rounded px-3 py-1.5 text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <button 
            onClick={fetchOrders} 
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Refresh Orders
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            No orders found matching the selected filter.
          </div>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-100">Order #{order.id}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{order.customerName}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(order.createdAt)}</p>
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
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' :
                    order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' :
                    order.status === 'ready' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' :
                    'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300'
                  }`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
              </div>
              
              {order.notes && (
                <div className="mb-4 p-2 bg-gray-50 dark:bg-gray-700 rounded text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Notes:</span> {order.notes}
                </div>
              )}
              
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
                        <td>{item.itemName}</td>
                        <td className="text-right">{item.quantity}</td>
                        <td className="text-right">₹{item.price * item.quantity}</td>
                      </tr>
                    ))}
                    <tr className="font-semibold">
                      <td colSpan={2} className="text-right">Total:</td>
                      <td className="text-right">₹{order.totalAmount}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 