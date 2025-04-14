import React, { useState } from 'react';
import MenuCard from './MenuCard';
import CustomizationModal from './CustomizationModal';

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

interface MenuGridProps {
  items: MenuItem[];
  onItemClick?: (item: MenuItem) => void;
}

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

export default function MenuGrid({ items = [], onItemClick }: MenuGridProps) {
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [customizationOptions, setCustomizationOptions] = useState(mockCustomizationOptions);

  // Format item for MenuCard component
  const formatItemForCard = (item: MenuItem) => {
    return {
      id: item.id.toString(),
      name: item.name,
      description: item.description || '',
      price: item.price,
      imageUrl: item.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image',
      category: item.category || 'Other',
      isAvailable: item.isAvailable,
      canteenName: `Canteen #${item.canteenId}`,
      vendorName: item.category || 'Unknown Vendor',
      dietaryInfo: [item.isVegetarian ? 'Vegetarian' : 'Non-Vegetarian'],
      rating: 4.5 // Default rating since we don't have this in the backend yet
    };
  };

  const handleAddToCart = (item: MenuItem) => {
    setSelectedItem(item);
    
    // Set the customization options for the selected item
    setCustomizationOptions({
      ...mockCustomizationOptions,
      itemName: item.name,
      basePrice: item.price
    });
    
    setIsCustomizationModalOpen(true);
    
    // Call the parent's click handler if provided
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const handleAddCustomizedToCart = (customizedItem: any) => {
    console.log('Adding to cart:', customizedItem);
    // In a real app, this would add the item to the cart in context
    setIsCustomizationModalOpen(false);
  };

  if (!items.length) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-gray-500 text-lg">No menu items available right now.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map(item => (
          <MenuCard 
            key={item.id} 
            {...formatItemForCard(item)} 
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
    </div>
  );
}