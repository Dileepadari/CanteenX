import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogContent } from "@/components/ui/dialog";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCartStore } from "@/stores/cartStore";

export interface FoodItem {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  canteenId: string;
  canteenName: string;
  image: string;
  tags: string[];
  rating: number;
  ratingCount: number;
  isAvailable: boolean;
  isPopular?: boolean;
  preparationTime: number;
  customizationOptions?: {
    sizes?: { name: 'small' | 'medium' | 'large'; price: number }[];
    additions?: { name: string; price: number }[];
    removals?: string[];
  };
}

const MenuItemWithCustomization = ({ item }: { item: FoodItem }) => {
  const [isCustomizationOpen, setIsCustomizationOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<'small' | 'medium' | 'large' | "">("");
  const [selectedAdditions, setSelectedAdditions] = useState<string[]>([]);
  const [selectedRemovals, setSelectedRemovals] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [totalPrice, setTotalPrice] = useState(item.price);

  const { addItem } = useCartStore();
  const { toast } = useToast();

  useEffect(() => {
    if (item.customizationOptions?.sizes?.length) {
      setSelectedSize(item.customizationOptions.sizes[0].name);
    } else {
      setSelectedSize("");
    }
    setSelectedAdditions([]);
    setSelectedRemovals([]);
    setNotes("");
    setQuantity(1);
    setTotalPrice(item.price);
  }, [item]);

  useEffect(() => {
    let price = item.price;
    if (selectedSize && item.customizationOptions?.sizes) {
      const sizeOption = item.customizationOptions.sizes.find((s) => s.name === selectedSize);
      if (sizeOption) {
        price += sizeOption.price;
      }
    }
    if (selectedAdditions.length > 0 && item.customizationOptions?.additions) {
      selectedAdditions.forEach((addition) => {
        const additionOption = item.customizationOptions.additions?.find((a) => a.name === addition);
        if (additionOption) {
          price += additionOption.price;
        }
      });
    }
    setTotalPrice(price * quantity);
  }, [item, selectedSize, selectedAdditions, quantity]);

  const handleAddition = (addition: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedAdditions((prev) => [...prev, addition]);
    } else {
      setSelectedAdditions((prev) => prev.filter((a) => a !== addition));
    }
  };

  const handleRemoval = (removal: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedRemovals((prev) => [...prev, removal]);
    } else {
      setSelectedRemovals((prev) => prev.filter((r) => r !== removal));
    }
  };

  const handleAddToCartClick = () => {
    if (
      item.customizationOptions?.sizes?.length ||
      item.customizationOptions?.additions?.length ||
      item.customizationOptions?.removals?.length
    ) {
      setIsCustomizationOpen(true);
    } else {
      addItem({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: 1,
        canteenId: item.canteenId,
        canteenName: item.canteenName,
      });
      toast({
        title: "Added to cart",
        description: `${item.name} has been added to your cart`,
      });
    }
  };

  const handleCustomizedAddToCart = () => {
    let finalPrice = item.price;

    if (selectedSize && item.customizationOptions?.sizes) {
      const sizeOption = item.customizationOptions.sizes.find((s) => s.name === selectedSize);
      if (sizeOption) {
        finalPrice += sizeOption.price;
      }
    }

    if (selectedAdditions.length > 0 && item.customizationOptions?.additions) {
      selectedAdditions.forEach((addition) => {
        const additionOption = item.customizationOptions.additions.find((a) => a.name === addition);
        if (additionOption) {
          finalPrice += additionOption.price;
        }
      });
    }

    addItem({
      id: item.id,
      name: item.name,
      price: finalPrice,
      quantity,
      canteenId: item.canteenId,
      canteenName: item.canteenName,
      customizations: {
        size: selectedSize ? selectedSize : undefined,
        additions: selectedAdditions.length > 0 ? selectedAdditions : undefined,
        removals: selectedRemovals.length > 0 ? selectedRemovals : undefined,
        notes: notes || undefined,
      },
    });

    toast({
      title: "Added to cart",
      description: `${quantity}x ${item.name} has been added to your cart`,
    });

    setIsCustomizationOpen(false);
  };

  return (
    <>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl border border-orange-100 hover:border-orange-200 bg-gradient-to-br from-orange-50 to-white">
        <div className="aspect-video overflow-hidden">
          <img src={item.image} alt={item.name} className="object-cover w-full h-full transition-transform hover:scale-105" />
        </div>
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg text-orange-600">{item.name}</CardTitle>
              <CardDescription className="text-sm mt-1">{item.description}</CardDescription>
            </div>
            <Badge variant="outline" className={`${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {item.isAvailable ? 'Available' : 'Sold Out'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="flex items-center mb-2">
            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 mr-1" />
            <span className="text-sm">{item.rating}</span>
            <span className="text-xs text-gray-500 ml-2">({item.ratingCount} ratings)</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {item.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs bg-orange-100 text-orange-700 hover:bg-orange-200">
                {tag}
              </Badge>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center p-4 pt-0">
          <p className="font-semibold text-lg text-orange-600">₹{item.price}</p>
          <Button 
            onClick={handleAddToCartClick} 
            variant="default" 
            size="sm" 
            className="bg-orange-500 hover:bg-orange-600"
            disabled={!item.isAvailable}
          >
            <Plus className="w-4 h-4 mr-2" /> Add
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isCustomizationOpen} onOpenChange={(open) => !open && setIsCustomizationOpen(false)}>
        <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-xl text-orange-600">Customize Your Order</DialogTitle>
            <DialogDescription className="text-base text-gray-500">
              {item.name} - ₹{item.price}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 my-2">
            {/* Quantity selector */}
            <div className="space-y-2">
              <h3 className="font-medium">Quantity</h3>
              <div className="flex items-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => quantity > 1 && setQuantity(quantity - 1)}
                  className="h-8 w-8 p-0 border-orange-200"
                >-</Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-8 w-8 p-0 border-orange-200"
                >+</Button>
              </div>
            </div>
            
            {/* Size options */}
            {item.customizationOptions?.sizes && item.customizationOptions.sizes.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Size</h3>
                <div className="grid grid-cols-3 gap-2">
                  {item.customizationOptions.sizes.map((size) => (
                    <Button
                      key={size.name}
                      variant={selectedSize === size.name ? "default" : "outline"}
                      onClick={() => setSelectedSize(size.name)}
                      className={selectedSize === size.name ? "bg-orange-500 hover:bg-orange-600" : "border-orange-200"}
                    >
                      <span className="capitalize">{size.name}</span>
                      {size.price > 0 && <span className="ml-1 text-xs">(+₹{size.price})</span>}
                    </Button>
                  ))}
                </div>
              </div>
            )}
            
            {/* Additions */}
            {item.customizationOptions?.additions && item.customizationOptions.additions.length > 0 && (
              <Accordion type="single" collapsible className="border rounded-md">
                <AccordionItem value="additions">
                  <AccordionTrigger className="px-4 text-orange-600 hover:text-orange-700">Add Extra Items</AccordionTrigger>
                  <AccordionContent className="px-4 space-y-2">
                    {item.customizationOptions.additions.map((addition) => (
                      <div key={addition.name} className="flex items-center justify-between py-1">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`addition-${addition.name}`}
                            checked={selectedAdditions.includes(addition.name)}
                            onCheckedChange={(checked) => handleAddition(addition.name, checked === true)}
                            className="border-orange-300 text-orange-500"
                          />
                          <Label 
                            htmlFor={`addition-${addition.name}`} 
                            className="text-sm cursor-pointer"
                          >
                            {addition.name}
                          </Label>
                        </div>
                        <span className="text-sm text-gray-500">+₹{addition.price}</span>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
            
            {/* Removals */}
            {item.customizationOptions?.removals && item.customizationOptions.removals.length > 0 && (
              <Accordion type="single" collapsible className="border rounded-md">
                <AccordionItem value="removals">
                  <AccordionTrigger className="px-4 text-orange-600 hover:text-orange-700">Remove Items</AccordionTrigger>
                  <AccordionContent className="px-4 space-y-2">
                    {item.customizationOptions.removals.map((removal) => (
                      <div key={removal} className="flex items-center space-x-2 py-1">
                        <Checkbox 
                          id={`removal-${removal}`}
                          checked={selectedRemovals.includes(removal)}
                          onCheckedChange={(checked) => handleRemoval(removal, checked === true)}
                          className="border-orange-300 text-orange-500"
                        />
                        <Label 
                          htmlFor={`removal-${removal}`} 
                          className="text-sm cursor-pointer"
                        >
                          No {removal}
                        </Label>
                      </div>
                    ))}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
            
            {/* Special Instructions */}
            <div className="space-y-2">
              <h3 className="font-medium">Special Instructions (Optional)</h3>
              <Textarea 
                placeholder="Any special requests..." 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="border-orange-200 focus:border-orange-300"
              />
            </div>
            
            {/* Total Price */}
            <div className="bg-orange-50 p-4 rounded-md">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Price:</span>
                <span className="text-xl font-bold text-orange-600">₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCustomizationOpen(false)}
              className="border-orange-200 text-orange-600"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCustomizedAddToCart}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Add to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MenuItemWithCustomization;
