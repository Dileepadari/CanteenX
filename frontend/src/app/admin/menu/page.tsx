'use client';

import { useState } from 'react';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  available: boolean;
}

export default function MenuManagement() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { id: '1', name: 'Chicken Biryani', price: 180, category: 'Main Course', available: true },
    { id: '2', name: 'Veg Thali', price: 120, category: 'Main Course', available: true },
  ]);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Menu Management</h1>
        <button className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600">
          Add New Item
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {menuItems.map((item) => (
              <tr key={item.id}>
                <td className="px-6 py-4">{item.name}</td>
                <td className="px-6 py-4">₹{item.price}</td>
                <td className="px-6 py-4">{item.category}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    item.available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {item.available ? 'Available' : 'Unavailable'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-blue-500 hover:text-blue-700 mr-2">Edit</button>
                  <button className="text-red-500 hover:text-red-700">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 