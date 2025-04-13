import React, { useState, useEffect } from 'react';
import MenuCard from './MenuCard';
import CustomizationModal from './CustomizationModal';

// This would typically come from an API
const MOCK_MENU_ITEMS = [
  {
    id: '1',
    name: 'Paneer Butter Masala',
    description: 'Rich and creamy paneer curry made with tomatoes, butter, and aromatic spices.',
    price: 180,
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?q=80&w=500&auto=format&fit=crop',
    category: 'Main Course',
    isAvailable: true,
    canteenName: 'Central Canteen',
    vendorName: 'Indian Delights',
    dietaryInfo: ['Vegetarian', 'Gluten-Free'],
    rating: 4.5
  },
  {
    id: '2',
    name: 'Veg Fried Rice',
    description: 'Chinese style fried rice with mixed vegetables and soy sauce.',
    price: 120,
    imageUrl: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?q=80&w=500&auto=format&fit=crop',
    category: 'Rice',
    isAvailable: true,
    canteenName: 'Central Canteen',
    vendorName: 'Asian Wok',
    dietaryInfo: ['Vegetarian'],
    rating: 4.2
  },
  {
    id: '3',
    name: 'Chocolate Brownie',
    description: 'Rich chocolate brownie with nuts, served warm.',
    price: 80,
    imageUrl: 'https://images.unsplash.com/photo-1564355808539-22fda35bed7e?q=80&w=500&auto=format&fit=crop',
    category: 'Dessert',
    isAvailable: false,
    canteenName: 'West Block Cafe',
    vendorName: 'Sweet Treats',
    dietaryInfo: ['Contains Nuts', 'Contains Gluten'],
    rating: 4.7
  },
  {
    id: '4',
    name: 'Masala Dosa',
    description: 'South Indian crispy crepe made from fermented rice batter, stuffed with spiced potatoes.',
    price: 90,
    imageUrl: 'https://images.unsplash.com/photo-1637861892088-3642b6e5dc4f?q=80&w=500&auto=format&fit=crop',
    category: 'Breakfast',
    isAvailable: true,
    canteenName: 'South Campus',
    vendorName: 'South Indian Kitchen',
    dietaryInfo: ['Vegetarian', 'Gluten-Free'],
    rating: 4.6
  },
  {
    id: '5',
    name: 'Chicken Biryani',
    description: 'Aromatic rice dish made with basmati rice, spices and chicken.',
    price: 200,
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?q=80&w=500&auto=format&fit=crop',
    category: 'Main Course',
    isAvailable: true,
    canteenName: 'North Campus',
    vendorName: 'Biryani House',
    dietaryInfo: ['Non-Vegetarian', 'Spicy'],
    rating: 4.8
  },
  {
    id: '6',
    name: 'Cold Coffee',
    description: 'Chilled coffee with ice cream and chocolate sauce.',
    price: 120,
    imageUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?q=80&w=500&auto=format&fit=crop',
    category: 'Beverages',
    isAvailable: false,
    canteenName: 'Library Cafe',
    vendorName: 'Coffee Corner',
    dietaryInfo: ['Contains Dairy'],
    rating: 4.3
  }
];

// Mock customization options
const mockCustomizationOptions = {
  itemName: "",
  basePrice: 0,
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
  ]
};

export default function MenuGrid() {
  const [menuItems, setMenuItems] = useState(MOCK_MENU_ITEMS);
  const [isLoading, setIsLoading] = useState(false);
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [customizationOptions, setCustomizationOptions] = useState(mockCustomizationOptions);

  // This would typically fetch from an API
  useEffect(() => {
    const fetchMenuItems = async () => {
      setIsLoading(true);
      try {
        // Simulate API call
        // const response = await fetch('/api/menu');
        // const data = await response.json();
        // setMenuItems(data);
        
        // Using mock data instead
        setTimeout(() => {
          setMenuItems(MOCK_MENU_ITEMS);
          setIsLoading(false);
        }, 500);
      } catch (error) {
        console.error('Failed to fetch menu items:', error);
        setIsLoading(false);
      }
    };

    fetchMenuItems();
  }, []);

  const handleAddToCart = (item: any) => {
    // In a real app, this would open the customization modal or directly add to cart
    setSelectedItem(item);
    
    // Set the customization options for the selected item
    setCustomizationOptions({
      ...mockCustomizationOptions,
      itemName: item.name,
      basePrice: item.price
    });
    
    setIsCustomizationModalOpen(true);
  };

  const handleAddCustomizedToCart = (customizedItem: any) => {
    console.log('Adding to cart:', customizedItem);
    // In a real app, this would add the item to the cart in context
    setIsCustomizationModalOpen(false);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!menuItems.length) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <p className="text-gray-500 text-lg">No menu items available right now.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {menuItems.map(item => (
          <MenuCard 
            key={item.id} 
            {...item} 
            onAddToCart={() => handleAddToCart(item)} 
          />
        ))}
      </div>

      <CustomizationModal
        isOpen={isCustomizationModalOpen}
        onClose={() => setIsCustomizationModalOpen(false)}
        itemName={customizationOptions.itemName}
        basePrice={customizationOptions.basePrice}
        addOns={customizationOptions.addOns}
        portionOptions={customizationOptions.portionOptions}
        customizationOptions={customizationOptions.customizationOptions}
        onAddToCart={handleAddCustomizedToCart}
      />
    </>
  );
}