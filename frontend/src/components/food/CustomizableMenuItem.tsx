
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/contexts/CartContext';
import { canteens } from '@/data/mockData';

interface CustomizationOption {
  id: string;
  name: string;
  price: number;
}

interface CustomizationCategory {
  type: 'single' | 'multiple';
  name: string;
  options: CustomizationOption[];
}

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
  customizationOptions?: CustomizationCategory[];
}

interface CustomizableMenuItemProps {
  item: MenuItem;
  onClose?: () => void;
}

const CustomizableMenuItem: React.FC<CustomizableMenuItemProps> = ({ item, onClose }) => {
  const { toast } = useToast();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string[]>>({});
  const [specialInstructions, setSpecialInstructions] = useState('');
  
  // Find canteen info
  const canteen = canteens.find(c => c.id === item.canteenId);
  
  // Calculate total price with customizations
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
  
  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
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
            : [...currentSelected, optionId]
        };
      } else {
        // For radio groups (single selection)
        return {
          ...prev,
          [category]: [optionId]
        };
      }
    });
  };
  
  const handleAddToCart = () => {
    if (!item.isAvailable) {
      toast({
        title: "Item Unavailable",
        description: "Sorry, this item is currently not available.",
        variant: "destructive",
      });
      return;
    }
    
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
    
    // Add item to cart
    addItem({
      id: Date.now(),
      itemId: item.id,
      name: item.name,
      price: calculateTotalPrice() / quantity, // Price per item with customizations
      quantity,
      canteenId: item.canteenId,
      canteenName: canteen?.name || "Unknown Canteen",
      image: item.image,
      customizations: customizations.length > 0 ? customizations : undefined,
    });
    
    // Reset state
    setQuantity(1);
    setSelectedOptions({});
    setSpecialInstructions('');
    
    // Close modal if provided
    if (onClose) {
      onClose();
    }
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <div className="relative h-48">
        <img 
          src={item.image} 
          alt={item.name} 
          className="w-full h-full object-cover rounded-t-lg"
        />
        {!item.isAvailable && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center rounded-t-lg">
            <span className="text-white font-semibold text-lg">Currently Unavailable</span>
          </div>
        )}
      </div>
      
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle>{item.name}</CardTitle>
          <div className="text-lg font-bold">₹{item.price.toFixed(2)}</div>
        </div>
        <p className="text-gray-500 text-sm">{item.description}</p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Customization options */}
        {item.customizationOptions && item.customizationOptions.length > 0 && (
          <div className="space-y-4">
            {item.customizationOptions.map((category, idx) => (
              <div key={idx} className="space-y-2">
                <h3 className="font-medium">{category.name}</h3>
                
                {category.type === 'multiple' ? (
                  <div className="space-y-2">
                    {category.options.map(option => (
                      <div key={option.id} className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`option-${option.id}`}
                            checked={(selectedOptions[category.name] || []).includes(option.id)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                handleOptionChange(category.name, option.id, true);
                              } else {
                                handleOptionChange(category.name, option.id, true);
                              }
                            }}
                            disabled={!item.isAvailable}
                          />
                          <Label htmlFor={`option-${option.id}`}>{option.name}</Label>
                        </div>
                        
                        {option.price > 0 && (
                          <span className="text-sm">+₹{option.price.toFixed(2)}</span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <RadioGroup
                    value={(selectedOptions[category.name] || [])[0]}
                    onValueChange={(value) => handleOptionChange(category.name, value, false)}
                    disabled={!item.isAvailable}
                  >
                    {category.options.map(option => (
                      <div key={option.id} className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                          <Label htmlFor={`option-${option.id}`}>{option.name}</Label>
                        </div>
                        
                        {option.price > 0 && (
                          <span className="text-sm">+₹{option.price.toFixed(2)}</span>
                        )}
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Special instructions */}
        <div>
          <h3 className="font-medium mb-2">Special Instructions (Optional)</h3>
          <textarea
            className="w-full p-2 border rounded-md text-sm"
            placeholder="Any special requests for this item?"
            value={specialInstructions}
            onChange={(e) => setSpecialInstructions(e.target.value)}
            disabled={!item.isAvailable}
            rows={2}
          />
        </div>
        
        <Separator />
        
        {/* Quantity selector */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="font-medium">Quantity:</span>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={quantity <= 1 || !item.isAvailable}
                onClick={() => handleQuantityChange(quantity - 1)}
              >
                -
              </Button>
              <span className="mx-2 w-8 text-center">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
                disabled={!item.isAvailable}
                onClick={() => handleQuantityChange(quantity + 1)}
              >
                +
              </Button>
            </div>
          </div>
          
          <div className="font-bold">
            ₹{calculateTotalPrice().toFixed(2)}
          </div>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleAddToCart}
          disabled={!item.isAvailable}
        >
          {item.isAvailable ? "Add to Cart" : "Currently Unavailable"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CustomizableMenuItem;
