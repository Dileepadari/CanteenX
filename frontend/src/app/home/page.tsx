'use client';

import React, { useState } from "react";
import MenuGrid from "../../components/menu/MenuGrid";
import MenuFilters from "../../components/menu/MenuFilters";
import OrderTracker from "../../components/orders/OrderTracker";
import PreOrderScheduler from "../../components/orders/PreOrderScheduler";
import OrderHistory from "../../components/orders/OrderHistory";
import CustomizationModal from "../../components/menu/CustomizationModal";
import Navbar from "../../components/navbar";

// Mock data for filters
const mockCanteens = ['Central Canteen', 'North Campus', 'South Campus', 'West Block Cafe', 'Library Cafe'];
const mockVendors = ['Indian Delights', 'Asian Wok', 'Sweet Treats', 'South Indian Kitchen', 'Biryani House', 'Coffee Corner'];
const mockCategories = ['Main Course', 'Rice', 'Dessert', 'Breakfast', 'Beverages'];
const mockDietaryOptions = ['Vegetarian', 'Non-Vegetarian', 'Vegan', 'Gluten-Free', 'Contains Nuts', 'Spicy', 'Contains Dairy'];

// Mock data for active orders
const mockActiveOrder = {
  orderId: "ORD12345",
  estimatedDeliveryTime: "12:45 PM",
  currentStatus: "Preparing",
  steps: [
    {
      status: "Order Placed",
      description: "Your order has been received by the vendor.",
      time: "12:15 PM",
      completed: true,
      current: false,
    },
    {
      status: "Preparing",
      description: "The kitchen is preparing your food.",
      time: "12:20 PM",
      completed: false,
      current: true,
    },
    {
      status: "Ready for Pickup",
      description: "Your order is ready for pickup.",
      time: "",
      completed: false,
      current: false,
    },
    {
      status: "Completed",
      description: "Your order has been picked up.",
      time: "",
      completed: false,
      current: false,
    },
  ],
};

// Mock data for order history
const mockOrderHistory = [
  {
    id: "ORD12344",
    date: "2025-04-12T15:30:00.000Z",
    total: 320,
    status: "Completed",
    canteenName: "Central Canteen",
    vendorName: "Indian Delights",
    items: [
      {
        id: "item1",
        name: "Paneer Butter Masala",
        price: 180,
        quantity: 1,
        customizations: ["Extra Spicy", "Regular Portion"],
        vendorName: "Indian Delights",
      },
      {
        id: "item2",
        name: "Garlic Naan",
        price: 40,
        quantity: 2,
        customizations: [],
        vendorName: "Indian Delights",
      },
      {
        id: "item3",
        name: "Jeera Rice",
        price: 60,
        quantity: 1,
        customizations: [],
        vendorName: "Indian Delights",
      },
    ],
  },
  {
    id: "ORD12343",
    date: "2025-04-10T12:15:00.000Z",
    total: 150,
    status: "Completed",
    canteenName: "Library Cafe",
    vendorName: "Coffee Corner",
    items: [
      {
        id: "item4",
        name: "Veg Sandwich",
        price: 80,
        quantity: 1,
        customizations: ["No Onions"],
        vendorName: "Coffee Corner",
      },
      {
        id: "item5",
        name: "Cold Coffee",
        price: 70,
        quantity: 1,
        customizations: [],
        vendorName: "Coffee Corner",
      },
    ],
  },
];

// Mock data for customization modal
const mockCustomizationOptions = {
  itemName: "Paneer Butter Masala",
  basePrice: 180,
  addOns: [
    { id: "addon1", name: "Extra Cheese", price: 30 },
    { id: "addon2", name: "Extra Paneer", price: 50 },
    { id: "addon3", name: "Butter", price: 15 },
  ],
  portionOptions: [
    { id: "portion1", name: "Small", priceModifier: -40 },
    { id: "portion2", name: "Regular", priceModifier: 0 },
    { id: "portion3", name: "Large", priceModifier: 60 },
  ],
  customizationOptions: [
    { 
      id: "spice", 
      name: "Spice Level", 
      options: ["Mild", "Medium", "Spicy", "Extra Spicy"] 
    },
    { 
      id: "cooking", 
      name: "Cooking Style", 
      options: ["Regular", "Less Oil", "Extra Creamy"] 
    },
  ],
};

// TODO: Protect this route with authentication middleware and JWT token validation
export default function Home() {
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'orders', 'history'
  const [filters, setFilters] = useState({});
  const [sortOption, setSortOption] = useState('popularity');
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(2); // Mock cart item count

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    // In a real app, this would trigger an API call with the new filters
  };

  const handleSortChange = (newSortOption: string) => {
    setSortOption(newSortOption);
    // In a real app, this would trigger an API call with the new sort option
  };

  const handleScheduleOrder = (date: Date, time: string, notes: string) => {
    console.log('Order scheduled for:', { date, time, notes });
    // In a real app, this would submit the scheduled order to an API
  };

  const handleReorder = (order: any) => {
    console.log('Reordering:', order);
    // In a real app, this would add the items back to the cart
  };

  const handleAddToCart = (customizedItem: any) => {
    console.log('Adding to cart:', customizedItem);
    // In a real app, this would add the item to the cart in context
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar cartItemCount={cartItemCount} />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Tabs for navigation */}
        <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700 mb-6">
          <button
            className={`mr-8 py-4 px-1 font-medium text-sm border-b-2 ${
              activeTab === 'menu'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('menu')}
          >
            Menu
          </button>
          <button
            className={`mr-8 py-4 px-1 font-medium text-sm border-b-2 ${
              activeTab === 'orders'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('orders')}
          >
            Active Orders
          </button>
          <button
            className={`mr-8 py-4 px-1 font-medium text-sm border-b-2 ${
              activeTab === 'history'
                ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('history')}
          >
            Order History
          </button>
        </div>

        {/* Content based on active tab */}
        <div className="mt-6">
          {activeTab === 'menu' && (
            <>
              <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Campus Food Menu</h1>
              <MenuFilters
                canteens={mockCanteens}
                vendors={mockVendors}
                categories={mockCategories}
                dietaryOptions={mockDietaryOptions}
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
              />
              {/* Pre-order scheduler */}
              <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <PreOrderScheduler onSchedule={handleScheduleOrder} />
              </div>
              {/* Menu items grid */}
              <MenuGrid />
            </>
          )}

          {activeTab === 'orders' && (
            <>
              <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Active Orders</h1>
              <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <OrderTracker
                  orderId={mockActiveOrder.orderId}
                  estimatedDeliveryTime={mockActiveOrder.estimatedDeliveryTime}
                  currentStatus={mockActiveOrder.currentStatus}
                  steps={mockActiveOrder.steps}
                />
              </div>
            </>
          )}

          {activeTab === 'history' && (
            <>
              <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Order History</h1>
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <OrderHistory
                  orders={mockOrderHistory}
                  onReorder={handleReorder}
                />
              </div>
            </>
          )}
        </div>

        <CustomizationModal
          isOpen={isCustomizationModalOpen}
          onClose={() => setIsCustomizationModalOpen(false)}
          itemName={mockCustomizationOptions.itemName}
          basePrice={mockCustomizationOptions.basePrice}
          addOns={mockCustomizationOptions.addOns}
          portionOptions={mockCustomizationOptions.portionOptions}
          customizationOptions={mockCustomizationOptions.customizationOptions}
          onAddToCart={handleAddToCart}
        />
      </div>
    </div>
  );
}