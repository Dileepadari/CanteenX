import Image from 'next/image';
import React from 'react';

interface MenuItemProps {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  isAvailable: boolean;
  canteenName: string;
  vendorName: string;
  dietaryInfo: string[];
  rating: number;
  onAddToCart?: () => void;
}

export default function MenuCard({
  id,
  name,
  description,
  price,
  imageUrl,
  isAvailable,
  vendorName,
  dietaryInfo,
  rating,
  onAddToCart,
}: MenuItemProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl flex flex-col h-full border border-gray-200 dark:border-gray-700">
      <div className="relative h-48">
        <div className={`absolute top-0 right-0 z-10 px-2 py-1 m-2 text-xs font-semibold text-white rounded ${isAvailable ? 'bg-green-500' : 'bg-red-500'}`}>
          {isAvailable ? 'Available' : 'Unavailable'}
        </div>
        <Image
          src={imageUrl || '/assets/default-food.jpg'}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{
            objectFit: 'cover',
            opacity: !isAvailable ? 0.6 : 1,
            filter: !isAvailable ? 'grayscale(1)' : 'none'
          }}
          priority
        />
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold dark:text-white">{name}</h3>
          <span className="text-amber-500 flex items-center gap-1">
            {rating} <span className="text-xs">★</span>
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{vendorName}</p>
        <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm flex-grow">{description.length > 100 ? `${description.substring(0, 100)}...` : description}</p>
        <div className="mt-3 flex flex-wrap gap-1">
          {dietaryInfo.map((info, idx) => (
            <span key={idx} className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs px-2 py-1 rounded">
              {info}
            </span>
          ))}
        </div>
        <div className="mt-4">
          <span className="font-bold text-lg dark:text-white">₹{price.toFixed(2)}</span>
        </div>
        <button
          onClick={isAvailable ? onAddToCart : undefined}
          disabled={!isAvailable}
          className={`w-full mt-3 py-2 rounded-md font-medium flex items-center justify-center gap-2 ${
            isAvailable 
              ? 'bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600' 
              : 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed'
          }`}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
          </svg>
          {isAvailable ? 'Add to Order' : 'Not Available'}
        </button>
      </div>
    </div>
  );
}