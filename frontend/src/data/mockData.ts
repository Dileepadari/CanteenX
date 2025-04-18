// Mock data for the Smart Canteen application

// Canteens
export const canteens = [
    {
      id: 1,
      name: "Himalaya Food Court",
      image: "/placeholder.svg",
      location: "Near Academic Block",
      rating: 4.5,
      openTime: "08:00",
      closeTime: "22:00",
      isOpen: true,
      description: "Multi-cuisine restaurant offering a variety of dishes from across India.",
      phone: "040-23456789",
      userId: 2
    },
    {
      id: 2,
      name: "Vindhya Canteen",
      image: "/placeholder.svg",
      location: "Vindhya Building Ground Floor",
      rating: 4.2,
      openTime: "09:00",
      closeTime: "21:00",
      isOpen: true,
      description: "Fast food and quick bites for students on the go.",
      phone: "040-23456788",
      userId: 2
    },
    {
      id: 3,
      name: "Faculty Dining",
      image: "/placeholder.svg",
      location: "Admin Block",
      rating: 4.8,
      openTime: "08:30",
      closeTime: "20:30",
      isOpen: true,
      description: "Premium dining experience with table service and gourmet options.",
      phone: "040-23456787",
      userId: 2
    },
    {
      id: 4,
      name: "South Campus Cafeteria",
      image: "/placeholder.svg",
      location: "South Campus Main Building",
      rating: 3.9,
      openTime: "08:00",
      closeTime: "21:00",
      isOpen: false,
      description: "Budget-friendly meals with a focus on South Indian cuisine.",
      phone: "040-23456786",
      userId: 2
    },
    {
      id: 5,
      name: "Night Canteen",
      image: "/placeholder.svg",
      location: "Hostel Complex",
      rating: 4.0,
      openTime: "18:00",
      closeTime: "03:00",
      isOpen: true,
      description: "Late night food options for hostel students. Popular for midnight snacks.",
      phone: "040-23456785",
      userId: 2
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
      userId: 101,
      canteenId: 1,
      items: [
        { 
          itemId: 1, 
          quantity: 2, 
          customizations: ["Extra Cheese", "No Onion"],
          note: "Make it spicy please" 
        },
        { 
          itemId: 3, 
          quantity: 1, 
          customizations: [],
          note: "" 
        }
      ],
      totalAmount: 300,
      status: "delivered",
      orderTime: "2025-04-17T12:30:00",
      confirmedTime: "2025-04-17T12:32:00",
      preparingTime: "2025-04-17T12:35:00",
      readyTime: "2025-04-17T12:45:00",
      deliveryTime: "2025-04-17T12:50:00",
      paymentMethod: "UPI",
      paymentStatus: "Paid",
      customerNote: "Please ensure the food is hot when delivered.",
      discount: 0,
      phone: "9876543210",
      pickupTime: null,
      isPreOrder: false,
      cancelledTime: null,
      cancellationReason: null
    },
    {
      id: 1002,
      userId: 101,
      canteenId: 2,
      items: [
        { 
          itemId: 5, 
          quantity: 1, 
          customizations: ["No Cheese"],
          note: "Extra napkins please" 
        }
      ],
      totalAmount: 180,
      status: "ready",
      orderTime: "2025-04-18T10:15:00",
      confirmedTime: "2025-04-18T10:17:00",
      preparingTime: "2025-04-18T10:20:00",
      readyTime: "2025-04-18T10:30:00",
      deliveryTime: null,
      paymentMethod: "Wallet",
      paymentStatus: "Paid",
      customerNote: "",
      discount: 0,
      phone: "9876543210",
      pickupTime: null,
      isPreOrder: false,
      cancelledTime: null,
      cancellationReason: null
    },
    {
      id: 1003,
      userId: 102,
      canteenId: 3,
      items: [
        { 
          itemId: 8, 
          quantity: 2, 
          customizations: [],
          note: "" 
        },
        { 
          itemId: 9, 
          quantity: 1, 
          customizations: ["Iced"],
          note: "Less sugar" 
        }
      ],
      totalAmount: 250,
      status: "preparing",
      orderTime: "2025-04-18T11:00:00",
      confirmedTime: "2025-04-18T11:02:00",
      preparingTime: "2025-04-18T11:05:00",
      readyTime: null,
      deliveryTime: null,
      paymentMethod: "Credit Card",
      paymentStatus: "Paid",
      customerNote: "",
      discount: 0,
      phone: "9876543210",
      pickupTime: null,
      isPreOrder: false,
      cancelledTime: null,
      cancellationReason: null
    },
    {
      id: 1004,
      userId: 103,
      canteenId: 1,
      items: [
        { 
          itemId: 2, 
          quantity: 1, 
          customizations: ["Extra Spicy"],
          note: "" 
        }
      ],
      totalAmount: 150,
      status: "cancelled",
      orderTime: "2025-04-17T15:30:00",
      confirmedTime: null,
      preparingTime: null,
      readyTime: null,
      deliveryTime: null,
      paymentMethod: "UPI",
      paymentStatus: "Refunded",
      customerNote: "",
      discount: 0,
      phone: "9876543210",
      pickupTime: null,
      isPreOrder: false,
      cancelledTime: "2025-04-17T15:35:00",
      cancellationReason: "Item out of stock"
    },
    {
      id: 1005,
      userId: 101,
      canteenId: 2,
      items: [
        { 
          itemId: 5, 
          quantity: 2, 
          customizations: [],
          note: "" 
        },
        { 
          itemId: 6, 
          quantity: 1, 
          customizations: ["Extra Sauce"],
          note: "" 
        }
      ],
      totalAmount: 400,
      status: "confirmed",
      orderTime: "2025-04-18T09:45:00",
      confirmedTime: "2025-04-18T09:47:00",
      preparingTime: null,
      readyTime: null,
      deliveryTime: null,
      paymentMethod: "Debit Card",
      paymentStatus: "Paid",
      customerNote: "Please pack separately",
      discount: 40,
      phone: "9876543210",
      pickupTime: null,
      isPreOrder: false,
      cancelledTime: null,
      cancellationReason: null
    },
    {
      id: 1006,
      userId: 102,
      canteenId: 3,
      items: [
        { 
          itemId: 8, 
          quantity: 1, 
          customizations: [],
          note: "" 
        }
      ],
      totalAmount: 130,
      status: "pending",
      orderTime: "2025-04-18T11:30:00",
      confirmedTime: null,
      preparingTime: null,
      readyTime: null,
      deliveryTime: null,
      paymentMethod: "Cash",
      paymentStatus: "Pending",
      customerNote: "",
      discount: 0,
      phone: "9876543210",
      pickupTime: null,
      isPreOrder: false,
      cancelledTime: null,
      cancellationReason: null
    },
    {
      id: 1007,
      userId: 101,
      canteenId: 1,
      items: [
        { 
          itemId: 1, 
          quantity: 3, 
          customizations: ["Extra Cheese"],
          note: "Birthday celebration" 
        },
        { 
          itemId: 4, 
          quantity: 2, 
          customizations: [],
          note: "" 
        }
      ],
      totalAmount: 500,
      status: "confirmed",
      orderTime: "2025-04-19T18:00:00",
      confirmedTime: "2025-04-19T18:02:00",
      preparingTime: null,
      readyTime: null,
      deliveryTime: null,
      paymentMethod: "UPI",
      paymentStatus: "Paid",
      customerNote: "Special celebration, please add candles",
      discount: 50,
      phone: "9876543210",
      pickupTime: "2025-04-19T19:00:00",
      isPreOrder: true,
      cancelledTime: null,
      cancellationReason: null
    }
  ];
  
  // User data
  export const userData = [{
    id: 1,
    name: "Aryan Kumar",
    email: "aryan.kumar@example.edu",
    role: "student",
    favoriteCanteens: [1, 2],
    recentOrders: [1001, 1002]
  } , 
  {
    id:2,
    name:"Admin User",
    email : "admin@example.edu",
    role : "admin",
    favoriteCanteens : [],
    recentOrders : []
}
] ;
  
  // Payment method options
  export const paymentMethodOptions = [
    { id: 1, name: "Credit Card" },
    { id: 2, name: "Debit Card" },
    { id: 3, name: "UPI" },
    { id: 4, name: "Wallet" },
    { id: 5, name: "Cash" },
    { id: 6, name: "Pay Later" },
  ];
  
  // Payment status options
  export const paymentStatusOptions = [
    { id: 1, name: "Pending" },
    { id: 2, name: "Paid" },
    { id: 3, name: "Failed" },
    { id: 4, name: "Refunded" },
  ];
  
  // Order status options
  export const orderStatusOptions = [
    { id: 1, name: "pending", label: "Pending", color: "bg-yellow-500" },
    { id: 2, name: "confirmed", label: "Confirmed", color: "bg-blue-500" },
    { id: 3, name: "preparing", label: "Preparing", color: "bg-blue-500" },
    { id: 4, name: "ready", label: "Ready", color: "bg-green-500" },
    { id: 5, name: "delivered", label: "Delivered", color: "bg-green-500" },
    { id: 6, name: "cancelled", label: "Cancelled", color: "bg-red-500" },
  ];