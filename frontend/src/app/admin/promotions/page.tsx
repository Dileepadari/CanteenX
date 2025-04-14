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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Promotions Management</h1>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          Add New Promotion
        </button>
      </div>

      <div className="grid gap-6">
        {promotions.map((promo) => (
          <div key={promo.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{promo.name}</h3>
                <p className="text-sm text-gray-500">
                  {promo.type === 'percentage' ? `${promo.value}% off` : `₹${promo.value} off`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  promo.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {promo.active ? 'Active' : 'Inactive'}
                </span>
                <button className="text-blue-500 hover:text-blue-700">Edit</button>
                <button className="text-red-500 hover:text-red-700">Delete</button>
              </div>
            </div>
            
            <div className="mt-4 text-sm">
              <p>Valid: {new Date(promo.startDate).toLocaleDateString()} - {new Date(promo.endDate).toLocaleDateString()}</p>
              <p className="mt-2">Applicable Items:</p>
              <ul className="list-disc list-inside text-gray-600">
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