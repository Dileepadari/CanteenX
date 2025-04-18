
import React, { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Plus, Minus, Clock } from "lucide-react";
import { useCart, CartItem } from "@/contexts/CartContext";
import { canteens } from "@/data/mockData";

interface MenuItemDialogProps {
  item: {
    id: number;
    name: string;
    price: number;
    description: string;
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
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function MenuItemDialog({ item, open, onOpenChange }: MenuItemDialogProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [specialInstructions, setSpecialInstructions] = useState("");
  
  const canteen = canteens.find(c => c.id === item.canteenId);
  
  // Calculate total price including customizations
  const calculateTotalPrice = () => {
    let total = item.price * quantity;
    
    // Add prices of selected options
    if (item.customizationOptions) {
      item.customizationOptions.forEach(category => {
        const selectedIds = selectedOptions[category.name] || [];
        category.options.forEach(option => {
          if (selectedIds.includes(option.id)) {
            total += option.price * quantity;
          }
        });
      });
    }
    
    return total;
  };
  
  const handleAddToCart = () => {
    // Gather selected customizations as text
    const customizations: string[] = [];
    
    if (item.customizationOptions) {
      item.customizationOptions.forEach(category => {
        const selectedIds = selectedOptions[category.name] || [];
        const selectedNames = category.options
          .filter(option => selectedIds.includes(option.id))
          .map(option => option.name);
        
        if (selectedNames.length > 0) {
          customizations.push(`${category.name}: ${selectedNames.join(', ')}`);
        }
      });
    }
    
    if (specialInstructions) {
      customizations.push(`Notes: ${specialInstructions}`);
    }
    
    const cartItem: CartItem = {
      id: Date.now(),
      itemId: item.id,
      name: item.name,
      price: item.price,
      quantity: quantity,
      canteenId: item.canteenId,
      canteenName: canteen?.name || "Unknown Canteen",
      image: item.image,
      customizations: customizations.length > 0 ? customizations : undefined,
    };
    
    addItem(cartItem);
    onOpenChange(false);
    
    // Reset state after adding to cart
    setQuantity(1);
    setSelectedOptions({});
    setSpecialInstructions("");
  };
  
  const handleOptionChange = (category: string, optionId: string, isMultiple: boolean) => {
    setSelectedOptions(prev => {
      const currentSelected = prev[category] || [];
      
      if (isMultiple) {
        // For checkbox groups (multiple selection)
        return {
          ...prev,
          [category]: currentSelected.includes(optionId)
            ? currentSelected.filter(id => id !== optionId)
            : [...currentSelected, optionId],
        };
      } else {
        // For radio groups (single selection)
        return {
          ...prev,
          [category]: [optionId],
        };
      }
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <div className="relative h-48 sm:h-64 -mx-6 -mt-6 mb-4">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          <div className="absolute bottom-4 left-4 right-4">
            {item.isVegetarian && (
              <Badge variant="success" className="mb-2">Vegetarian</Badge>
            )}
            <DialogTitle className="text-2xl text-white font-bold mb-1">{item.name}</DialogTitle>
            <div className="flex items-center text-white/80 text-sm">
              <Clock className="h-3.5 w-3.5 mr-1" />
              <span>{item.preparationTime} mins</span>
            </div>
          </div>
        </div>
        
        <DialogDescription className="text-foreground">{item.description}</DialogDescription>
        
        {item.nutritionalInfo && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-2">Nutritional Information</h4>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div className="rounded-lg bg-gray-50 p-2">
                <p className="text-sm font-medium">{item.nutritionalInfo.calories}</p>
                <p className="text-xs text-gray-500">Calories</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-2">
                <p className="text-sm font-medium">{item.nutritionalInfo.protein}g</p>
                <p className="text-xs text-gray-500">Protein</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-2">
                <p className="text-sm font-medium">{item.nutritionalInfo.carbs}g</p>
                <p className="text-xs text-gray-500">Carbs</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-2">
                <p className="text-sm font-medium">{item.nutritionalInfo.fat}g</p>
                <p className="text-xs text-gray-500">Fat</p>
              </div>
            </div>
          </div>
        )}
        
        {item.allergens && item.allergens.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium mb-1">Allergens</h4>
            <p className="text-sm text-gray-500">{item.allergens.join(", ")}</p>
          </div>
        )}
        
        <Separator className="my-4" />
        
        {/* Customization Options */}
        {item.customizationOptions && item.customizationOptions.length > 0 && (
          <div className="space-y-4">
            {item.customizationOptions.map((category) => (
              <div key={category.name}>
                <h4 className="font-medium mb-2">{category.name}</h4>
                
                {category.type === "multiple" ? (
                  <div className="space-y-2">
                    {category.options.map((option) => (
                      <div className="flex items-center justify-between" key={option.id}>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={option.id}
                            checked={(selectedOptions[category.name] || []).includes(option.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleOptionChange(category.name, option.id, true);
                              } else {
                                handleOptionChange(category.name, option.id, true);
                              }
                            }}
                          />
                          <Label htmlFor={option.id} className="text-sm">
                            {option.name}
                          </Label>
                        </div>
                        {option.price > 0 && (
                          <span className="text-sm">+₹{option.price}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <RadioGroup
                    value={(selectedOptions[category.name] || [])[0]}
                    onValueChange={(value) => handleOptionChange(category.name, value, false)}
                  >
                    {category.options.map((option) => (
                      <div className="flex items-center justify-between" key={option.id}>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={option.id} id={option.id} />
                          <Label htmlFor={option.id} className="text-sm">
                            {option.name}
                          </Label>
                        </div>
                        {option.price > 0 && (
                          <span className="text-sm">+₹{option.price}</span>
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Special Instructions */}
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Special Instructions (Optional)</h4>
          <textarea
            className="w-full p-2 border rounded-md text-sm"
            placeholder="Any special requests for this item?"
            rows={2}
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
          ></textarea>
        </div>
        
        <Separator className="my-4" />
        
        {/* Quantity and Add to Cart */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              disabled={quantity <= 1}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center">{quantity}</span>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setQuantity(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <span className="text-lg font-bold">₹{calculateTotalPrice().toFixed(2)}</span>
        </div>
        
        <DialogFooter className="mt-4">
          <Button
            className="w-full"
            disabled={!item.isAvailable}
            onClick={handleAddToCart}
          >
            {item.isAvailable ? "Add to Cart" : "Currently Unavailable"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
