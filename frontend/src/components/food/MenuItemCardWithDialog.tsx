
import React, { useState } from "react";
import { PlusCircle, Clock, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MenuItemDialog } from "./MenuItemDialog";
import { useCart } from "@/contexts/CartContext";
import { canteens } from "@/data/mockData";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVegetarian: boolean;
  isAvailable: boolean;
  isPopular: boolean;
  canteenId: number;
  preparationTime: number;
  ingredients?: string[];
  allergens?: string[];
  nutritionalInfo?: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  customizationOptions?: {
    type: string;
    name: string;
    options: {
      id: string;
      name: string;
      price: number;
    }[];
  }[];
}

interface MenuItemCardProps {
  item: MenuItem;
}

const MenuItemCardWithDialog = ({ item }: MenuItemCardProps) => {
  const [showDetails, setShowDetails] = useState(false);
  const { addItem } = useCart();
  
  const canteen = canteens.find(c => c.id === item.canteenId);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!item.isAvailable) return;
    
    // If the item has customization options, open the dialog instead of quick adding
    if (item.customizationOptions && item.customizationOptions.length > 0) {
      setShowDetails(true);
      return;
    }
    
    addItem({
      id: Date.now(),
      itemId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
      canteenId: item.canteenId,
      canteenName: canteen?.name || "Unknown Canteen",
      image: item.image,
    });
  };

  return (
    <>
      <div 
        className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
        onClick={() => setShowDetails(true)}
      >
        <div className="relative h-40">
          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {item.isVegetarian && (
              <Badge variant="success" className="text-xs">Veg</Badge>
            )}
            {item.isPopular && (
              <Badge variant="default" className="text-xs">Popular</Badge>
            )}
          </div>
          {!item.isAvailable && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-medium px-3 py-1 bg-black/60 rounded-full">
                Unavailable
              </span>
            </div>
          )}
        </div>
        
        <div className="p-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium line-clamp-1">{item.name}</h3>
              <div className="flex items-center text-xs text-gray-500 mt-1">
                <Clock className="h-3 w-3 mr-1" />
                <span>{item.preparationTime} mins</span>
              </div>
            </div>
            <Button 
              size="icon" 
              variant="ghost" 
              className="h-8 w-8 rounded-full"
              disabled={!item.isAvailable}
              onClick={handleQuickAdd}
            >
              <PlusCircle className={`h-5 w-5 ${!item.isAvailable ? 'text-gray-300' : 'text-canteen-orange'}`} />
            </Button>
          </div>
          
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>
          
          <div className="flex justify-between items-center mt-2">
            <span className="font-semibold">₹{item.price.toFixed(2)}</span>
            
            {item.customizationOptions && item.customizationOptions.length > 0 && (
              <span className="text-xs text-gray-500">Customizable</span>
            )}
          </div>
        </div>
      </div>
      
      <MenuItemDialog
        item={item}
        open={showDetails}
        onOpenChange={setShowDetails}
      />
    </>
  );
};

export default MenuItemCardWithDialog;
