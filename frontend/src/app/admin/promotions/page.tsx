'use client';

import { useState } from 'react';

interface Promotion {
  id: string;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  startDate: string;
  endDate: string;
  active: boolean;
  applicableItems: string[];
}

export default function PromotionsManagement() {
  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: '1',
      name: 'Summer Special',
      type: 'percentage',
      value: 15,
      startDate: '2024-03-20',
      endDate: '2024-04-20',
      active: true,
      applicableItems: ['Chicken Biryani', 'Veg Thali']
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Promotions Management</h1>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
        >
          Add New Promotion
        </button>
      </div>

      <div className="grid gap-6">
        {promotions.map((promo) => (
          <div key={promo.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-100">{promo.name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {promo.type === 'percentage' ? `${promo.value}% off` : `₹${promo.value} off`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  promo.active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
                }`}>
                  {promo.active ? 'Active' : 'Inactive'}
                </span>
                <button className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">Edit</button>
                <button className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300">Delete</button>
              </div>
            </div>
            
            <div className="mt-4 text-sm">
              <p className="text-gray-800 dark:text-gray-200">Valid: {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}</p>
              <p className="mt-2 text-gray-800 dark:text-gray-200">Applicable Items:</p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
                {promo.applicableItems.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 