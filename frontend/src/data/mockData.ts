// Mock data for the Smart Canteen application

// Canteens
export const canteens = [
  {
    id: 1,
    name: "Central Canteen",
    image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop",
    location: "Main Campus Building",
    rating: 4.2,
    openTime: "07:30",
    closeTime: "22:00",
    isOpen: true,
    description: "The main canteen serving a variety of cuisines including Indian, Chinese, and Continental."
  },
  {
    id: 2,
    name: "Tech Hub Cafe",
    image: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=2047&auto=format&fit=crop",
    location: "Technology Block",
    rating: 4.5,
    openTime: "08:00",
    closeTime: "20:00",
    isOpen: true,
    description: "Modern cafe with quick bites, beverages, and light meals for tech students."
  },
  {
    id: 3,
    name: "Hostel Mess",
    image: "https://images.unsplash.com/photo-1590846406792-0adc7f938f1d?q=80&w=1972&auto=format&fit=crop",
    location: "Hostel Complex",
    rating: 3.8,
    openTime: "07:00",
    closeTime: "21:30",
    isOpen: true,
    description: "The main dining facility for hostel residents with breakfast, lunch, and dinner options."
  },
  {
    id: 4,
    name: "Faculty Lounge",
    image: "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=2071&auto=format&fit=crop",
    location: "Admin Block",
    rating: 4.7,
    openTime: "09:00",
    closeTime: "18:00",
    isOpen: false,
    description: "Exclusive dining area for faculty and staff with premium food options."
  }
];

// Food Categories
export const categories = [
  { id: 1, name: "Breakfast", icon: "coffee" },
  { id: 2, name: "Lunch", icon: "utensils" },
  { id: 3, name: "Dinner", icon: "moon" },
  { id: 4, name: "Snacks", icon: "cookie" },
  { id: 5, name: "Beverages", icon: "mug-hot" },
  { id: 6, name: "Desserts", icon: "ice-cream" }
];

// Food Items
export const menuItems = [
  {
    id: "101",
    canteenId: "1",
    canteenName: "Faculty Lounge",
    name: "Masala Dosa",
    description: "Crispy rice crepe filled with spiced potato mixture, served with sambar and chutney",
    price: 60,
    category: "Breakfast",
    image: "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?q=80&w=2070&auto=format&fit=crop",
    tags: ["South Indian", "Vegetarian"],
    rating: 4.5,
    ratingCount: 120,
    isAvailable: true,
    preparationTime: 15,
    isPopular: true,
    customizationOptions: {
      sizes: [
        { name: "small" as const, price: 50 },
        { name: "medium" as const, price: 60 },
        { name: "large" as const, price: 70 },
      ],
      additions: [
        { name: "Extra Chutney", price: 10 },
        { name: "Ghee Roast", price: 15 },
      ],
      removals: ["Onions", "Green Chilies"],
    },
  },
  {
    id: "102",
    canteenId: "2",
    canteenName: "Faculty Lounge",
    name: "Chole Bhature",
    description: "Spicy chickpea curry served with deep-fried bread",
    price: 80,
    category: "Lunch",
    image: "https://images.unsplash.com/photo-1589352911312-5d218efc96be?q=80&w=1974&auto=format&fit=crop",
    tags: ["North Indian", "Vegetarian"],
    rating: 4.3,
    ratingCount: 95,
    isAvailable: true,
    preparationTime: 20,
    isPopular: true,
    customizationOptions: {
      sizes: [
        { name: "small" as const, price: 70 },
        { name: "medium" as const, price: 80 },
        { name: "large" as const, price: 90 },
      ],
      additions: [
        { name: "Extra Bhature", price: 20 },
        { name: "Onions on Side", price: 0 },
      ],
      removals: ["Spices"],
    },
  },
  {
    id: "103",
    canteenId: "1",
    canteenName: "Central Canteen",
    name: "Chicken Biryani",
    description: "Fragrant basmati rice cooked with chicken, spices, and herbs",
    price: 120,
    category: "Lunch",
    image: "https://images.unsplash.com/photo-1589309736404-be8c25f8dea8?q=80&w=1974&auto=format&fit=crop",
    tags: ["Hyderabadi", "Non-Vegetarian"],
    rating: 4.7,
    ratingCount: 150,
    isAvailable: true,
    preparationTime: 30,
    isPopular: true,
    customizationOptions: {
      sizes: [
        { name: "small" as const, price: 100 },
        { name: "medium" as const, price: 120 },
        { name: "large" as const, price: 140 },
      ],
      additions: [
        { name: "Extra Raita", price: 15 },
        { name: "Extra Spicy", price: 0 },
      ],
      removals: ["Coriander"],
    },
  },
  {
    id: "104",
    canteenId: "1",
    canteenName: "Central Canteen",
    name: "Veg Pulao",
    description: "Basmati rice cooked with mixed vegetables and mild spices",
    price: 90,
    category: "Dinner",
    image: "https://images.unsplash.com/photo-1596797038530-2c107aa4606c?q=80&w=1935&auto=format&fit=crop",
    tags: ["North Indian", "Vegetarian"],
    rating: 4.0,
    ratingCount: 80,
    isAvailable: false,
    preparationTime: 25,
    isPopular: false,
    customizationOptions: {
      sizes: [
        { name: "small" as const, price: 80 },
        { name: "medium" as const, price: 90 },
        { name: "large" as const, price: 100 },
      ],
      additions: [{ name: "Extra Raita", price: 15 }],
      removals: ["Peas"],
    },
  },
];

// Orders
export const orders = [
  {
    id: 1001,
    userId: 1,
    canteenId: 1,
    items: [
      { itemId: 101, quantity: 2, customizations: [1] },
      { itemId: 103, quantity: 1, customizations: [5, 6] }
    ],
    totalAmount: 240,
    status: "delivered",
    orderTime: "2023-04-10T08:30:00",
    deliveryTime: "2023-04-10T08:45:00"
  },
  {
    id: 1002,
    userId: 1,
    canteenId: 2,
    items: [
      { itemId: 201, quantity: 1, customizations: [8] },
      { itemId: 202, quantity: 2, customizations: [] }
    ],
    totalAmount: 205,
    status: "preparing",
    orderTime: "2023-04-10T13:15:00",
    deliveryTime: null
  }
];

// User data
export const userData = {
  id: 1,
  name: "Aryan Kumar",
  email: "aryan.kumar@example.edu",
  role: "student",
  favoriteCanteens: [1, 2],
  recentOrders: [1001, 1002]
};

// Order status options
export const orderStatusOptions = [
  "pending", 
  "confirmed", 
  "preparing", 
  "ready", 
  "delivered", 
  "cancelled"
];
