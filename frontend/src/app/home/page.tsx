'use client';

import React, { useState, useEffect, useMemo } from "react";
import MenuGrid from "../../components/menu/MenuGrid";
import MenuFilters from "../../components/menu/MenuFilters";
import OrderTracker from "../../components/orders/OrderTracker";
import PreOrderScheduler from "../../components/orders/PreOrderScheduler";
import OrderHistory from "../../components/orders/OrderHistory";
import CustomizationModal from "../../components/menu/CustomizationModal";
import Navbar from "../../components/navbar";
import { executeGraphQL } from "../../utils/graphql";
import { processMenuItems } from "../../utils/menuFilters";
import { GET_CANTEENS, GET_MENU_ITEMS, GET_FEATURED_MENU_ITEMS, GET_MENU_ITEMS_BY_CANTEEN } from "../../gql/queries/vendors";
import { GET_USER_PROFILE } from "../../gql/queries/users";
import { GET_ACTIVE_ORDERS, GET_ORDER_HISTORY } from "../../gql/queries/orders";

// Define interfaces for type safety
interface Canteen {
  id: number;
  name: string;
  location?: string;
  openingTime?: string;
  closingTime?: string;
}

interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: string;
  canteenId: number;
  isAvailable: boolean;
  isVegetarian: boolean;
  isFeatured: boolean;
}

interface UserProfile {
  user: {
    id: number;
    name: string;
    email: string;
    profilePicture?: string;
    preferredPayment?: string;
  };
  favoriteCanteenId?: number;
  dietaryPreferences: string[];
  recentOrders: number[];
}

// Mock data for filters (will be replaced by real data later)
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
  const [filters, setFilters] = useState({
    canteen: '',
    category: '',
    dietaryOptions: [],
    availableOnly: false
  });
  const [sortOption, setSortOption] = useState('popularity');
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(2); // Mock cart item count

  // State for GraphQL data
  const [canteens, setCanteens] = useState<Canteen[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [featuredItems, setFeaturedItems] = useState<MenuItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [vendorsList, setVendorsList] = useState<string[]>([]);
  const [selectedCanteenId, setSelectedCanteenId] = useState<number | null>(null);
  
  // State for orders
  const [activeOrders, setActiveOrders] = useState<any[]>([]);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState<{[key: string]: boolean}>({
    canteens: false,
    menuItems: false,
    featuredItems: false,
    userProfile: false,
    activeOrders: false,
    orderHistory: false
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch canteens data
  useEffect(() => {
    const getCanteens = async () => {
      setIsLoading(prev => ({ ...prev, canteens: true }));
      try {
        const result = await executeGraphQL(GET_CANTEENS);
        const canteensData = result.getCanteens;
        console.log("Fetched canteens:", canteensData);
        setCanteens(canteensData);
        // Extract unique vendor names
        if (canteensData && canteensData.length > 0) {
          const vendors = Array.from(new Set(canteensData.map((c: Canteen) => c.name)));
          setVendorsList(vendors);
          // Removed automatic selection of the first canteen
          // This ensures no filter is pre-selected when page loads
        }
      } catch (err) {
        console.error('Failed to fetch canteens:', err);
        setError('Failed to load canteens. Please try again later.');
      } finally {
        setIsLoading(prev => ({ ...prev, canteens: false }));
      }
    };
    
    getCanteens();
  }, []);

  // Fetch featured menu items
  useEffect(() => {
    const getFeaturedItems = async () => {
      setIsLoading(prev => ({ ...prev, featuredItems: true }));
      try {
        const result = await executeGraphQL(GET_FEATURED_MENU_ITEMS);
        const itemsData = result.getFeaturedMenuItems;
        console.log("Fetched featured items:", itemsData);
        setFeaturedItems(itemsData);
      } catch (err) {
        console.error('Failed to fetch featured items:', err);
      } finally {
        setIsLoading(prev => ({ ...prev, featuredItems: false }));
      }
    };
    
    getFeaturedItems();
  }, []);

  // Fetch all menu items instead of filtering by canteen
  useEffect(() => {
    const getMenuItems = async () => {
      setIsLoading(prev => ({ ...prev, menuItems: true }));
      try {
        const result = await executeGraphQL(GET_MENU_ITEMS);
        const itemsData = result.getMenuItems;
        console.log(`Fetched all menu items:`, itemsData);
        setMenuItems(itemsData);
      } catch (err) {
        console.error(`Failed to fetch menu items:`, err);
      } finally {
        setIsLoading(prev => ({ ...prev, menuItems: false }));
      }
    };
    
    getMenuItems();
  }, []);

  // Set selected canteen ID when changed through filters
  useEffect(() => {
    if (selectedCanteenId) {
      console.log(`Selected canteen changed to: ${selectedCanteenId}`);
      // We no longer need to fetch menu items by canteen - filtering is handled by processMenuItems
    }
  }, [selectedCanteenId]);

  // Fetch user profile (mock user ID 1 for now)
  useEffect(() => {
    const getUserProfile = async () => {
      const userId = 1; // Mock user ID - should come from auth context in real app
      setIsLoading(prev => ({ ...prev, userProfile: true }));
      try {
        const result = await executeGraphQL(GET_USER_PROFILE, { userId });
        const profileData = result.getUserProfile;
        console.log("Fetched user profile:", profileData);
        setUserProfile(profileData);
        
        // Removed automatic setting of favorite canteen
        // This ensures no filter is pre-selected when page loads
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
      } finally {
        setIsLoading(prev => ({ ...prev, userProfile: false }));
      }
    };
    
    getUserProfile();
  }, []);

  // Fetch active orders
  useEffect(() => {
    const getActiveOrders = async () => {
      const userId = 1; // Mock user ID - should come from auth context in real app
      setIsLoading(prev => ({ ...prev, activeOrders: true }));
      try {
        const result = await executeGraphQL(GET_ACTIVE_ORDERS, { userId });
        const ordersData = result.getActiveOrders;
        console.log("Fetched active orders:", ordersData);
        setActiveOrders(ordersData);
      } catch (err) {
        console.error('Failed to fetch active orders:', err);
      } finally {
        setIsLoading(prev => ({ ...prev, activeOrders: false }));
      }
    };
    
    if (activeTab === 'orders') {
      getActiveOrders();
    }
  }, [activeTab]);

  // Fetch order history
  useEffect(() => {
    const getOrderHistory = async () => {
      const userId = 1; // Mock user ID - should come from auth context in real app
      setIsLoading(prev => ({ ...prev, orderHistory: true }));
      try {
        const result = await executeGraphQL(GET_ORDER_HISTORY, { userId });
        const historyData = result.getOrderHistory;
        console.log("Fetched order history:", historyData);
        setOrderHistory(historyData);
      } catch (err) {
        console.error('Failed to fetch order history:', err);
      } finally {
        setIsLoading(prev => ({ ...prev, orderHistory: false }));
      }
    };
    
    if (activeTab === 'history') {
      getOrderHistory();
    }
  }, [activeTab]);

  // Apply filters and sort to menu items using memoization for efficiency
  const filteredMenuItems = useMemo(() => {
    return processMenuItems(menuItems, filters, sortOption, canteens);
  }, [menuItems, filters, sortOption, canteens]);

  // Apply filters and sort to featured items - but preserve featured status
  const filteredFeaturedItems = useMemo(() => {
    // Apply the same filtering as regular menu items, but maintain featured status
    // This ensures consistent filtering behavior across both sections
    return processMenuItems(featuredItems, filters, sortOption, canteens);
  }, [featuredItems, filters, sortOption, canteens]);

  // Show all original menu items when no filters are applied
  const shouldShowAllItems = useMemo(() => {
    return !filters.canteen && 
           !filters.category && 
           filters.dietaryOptions.length === 0 && 
           !filters.availableOnly;
  }, [filters]);

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    
    // Handle canteen selection specifically
    if (newFilters.canteen) {
      const selectedCanteen = canteens.find(c => c.name === newFilters.canteen);
      if (selectedCanteen) {
        setSelectedCanteenId(selectedCanteen.id);
      }
    }
  };

  const handleSortChange = (newSortOption: string) => {
    setSortOption(newSortOption);
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
    setCartItemCount(prevCount => prevCount + 1);
    // In a real app, this would add the item to the cart in context
  };

  const isPageLoading = Object.values(isLoading).some(Boolean);

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
              <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                {userProfile ? `Welcome back, ${userProfile.user.name}!` : 'Campus Food Menu'}
              </h1>
              
              {/* Show loading indicator while data is loading */}
              {isLoading.canteens ? (
                <div className="flex justify-center items-center h-16 mb-6">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <MenuFilters
                  canteens={canteens}
                  vendors={vendorsList}
                  categories={mockCategories}
                  dietaryOptions={mockDietaryOptions}
                  onFilterChange={handleFilterChange}
                  onSortChange={handleSortChange}
                  userPreferences={userProfile?.dietaryPreferences || []}
                />
              )}
              
              {/* Pre-order scheduler */}
              <div className="mb-6 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <PreOrderScheduler onSchedule={handleScheduleOrder} />
              </div>
              
              {/* Featured items section - only show if we have items after filtering */}
              {filteredFeaturedItems.length > 0 && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                    Featured Items {filters.dietaryOptions.length > 0 && `(${filters.dietaryOptions.join(', ')})`}
                  </h2>
                  <div className="relative">
                    {isLoading.featuredItems ? (
                      <div className="flex justify-center items-center h-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                      </div>
                    ) : (
                      <MenuGrid 
                        items={filteredFeaturedItems}
                        onItemClick={() => setIsCustomizationModalOpen(true)}
                      />
                    )}
                  </div>
                </div>
              )}
              
              {/* Menu items grid */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
                  All Menu Items {filters.dietaryOptions.length > 0 && `(${filters.dietaryOptions.join(', ')})`}
                </h2>
                {isLoading.menuItems ? (
                  <div className="flex justify-center items-center h-16">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : filteredMenuItems.length > 0 ? (
                  <MenuGrid 
                    items={filteredMenuItems}
                    onItemClick={() => setIsCustomizationModalOpen(true)}
                  />
                ) : (
                  <div className="py-10 text-center">
                    <p className="text-gray-500 dark:text-gray-400">
                      No menu items match your filters. Try adjusting your filters.
                    </p>
                    <button
                      onClick={handleFilterChange.bind(null, {
                        canteen: '',
                        category: '',
                        dietaryOptions: [],
                        availableOnly: false,
                      })}
                      className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'orders' && (
            <>
              <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Active Orders</h1>
              {isLoading.activeOrders ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : activeOrders.length > 0 ? (
                <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  {/* We're mapping through activeOrders in case the user has multiple active orders */}
                  {activeOrders.map((order) => (
                    <OrderTracker
                      key={order.id}
                      orderId={order.id}
                      estimatedDeliveryTime={order.estimatedDeliveryTime || ""}
                      currentStatus={order.currentStatus || "Processing"}
                      steps={order.steps.map((step: any) => ({
                        status: step.status,
                        description: step.description,
                        time: step.time || "",
                        completed: step.completed,
                        current: step.current,
                      }))}
                    />
                  ))}
                </div>
              ) : (
                <div className="max-w-3xl mx-auto p-8 text-center bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="text-gray-500 dark:text-gray-400 mb-4">
                    <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">No active orders</h3>
                  <p className="mt-1 text-gray-500 dark:text-gray-400">You don't have any active orders at the moment.</p>
                  <button
                    onClick={() => setActiveTab('menu')}
                    className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Browse Menu
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'history' && (
            <>
              <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Order History</h1>
              {isLoading.orderHistory ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <OrderHistory
                    orders={orderHistory}
                    onReorder={handleReorder}
                  />
                </div>
              )}
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