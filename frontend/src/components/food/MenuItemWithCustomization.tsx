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
import { useApolloClient, gql } from "@apollo/client";
import { useNavigate } from 'react-router-dom';
import { ADD_TO_CART } from "@/gql/mutations/cart";
import { getPlaceholderImage, ensureImageSrc } from '@/lib/image';
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
  isVegetarian?: boolean;
  isPopular?: boolean;
  preparationTime: number;
  stockCount?: number;
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
  // Default customization fields requested: cooking requests
  const [cookingRequests, setCookingRequests] = useState("");
  const [totalPrice, setTotalPrice] = useState(item.price);

  const client = useApolloClient();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    if (item.customizationOptions?.sizes?.length) {
      setSelectedSize(item.customizationOptions.sizes[0].name);
    } else {
      setSelectedSize("");
    }
    setSelectedAdditions([]);
    setSelectedRemovals([]);
  setNotes("");
  setCookingRequests("");
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
    // Check stock before opening the customization dialog.
    // Treat null/undefined as "no stock constraint". Only if a numeric
    // stockCount is present, enforce stock limits.
    const stock = item.stockCount == null ? null : Number(item.stockCount);
    if (stock !== null && stock <= 0) {
      toast({ title: 'Out of stock', description: 'This item is currently out of stock', variant: 'destructive' });
      return;
    }

    // Always open the customization dialog so default fields (cooking
    // requests, quantity, notes) are available for every item.
    setIsCustomizationOpen(true);
  };

  const sendAddToCartMutation = async (cartItem) => {
    try {
      const { data } = await client.mutate({
        mutation: ADD_TO_CART,
        variables: {
          input: {
            menuItemId: cartItem.id, // Ensure this is passed correctly
            name: cartItem.name,
            price: cartItem.price,
            quantity: cartItem.quantity,
            canteenId: cartItem.canteenId,
            canteenName: cartItem.canteenName,
            customizations: cartItem.customizations,
          },
        },
      });
      if (data.addToCart.success) {
        toast({
          title: "Added to cart",
          description: `${cartItem.quantity}x ${cartItem.name} has been added to your cart`,
        });
      } else {
        // If server returned a specific message about authentication, show login prompt
        const msg = data.addToCart.message || "Failed to add item to cart";
        if (/logged in|login/i.test(msg)) {
          setShowLoginPrompt(true);
          return;
        }
        toast({
          title: "Error",
          description: msg,
          variant: "destructive",
        });
      }
    } catch (error) {
      // Inspect GraphQL errors for authentication requirement
      const gqlErrors = (error && error.graphQLErrors) || [];
      const authError = gqlErrors.find((e: any) => /logged in|login|not authenticated|must be logged in/i.test(e.message));
      if (authError) {
        setShowLoginPrompt(true);
        return;
      }

      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const handleCustomizedAddToCart = () => {
    let finalPrice = item.price;

    // Check stock for requested quantity. Only enforce when stockCount
    // is provided (not null/undefined).
    const stock = item.stockCount == null ? null : Number(item.stockCount);
    if (stock !== null && quantity > stock) {
      toast({ title: 'Not enough stock', description: `Only ${stock} left`, variant: 'destructive' });
      return;
    }

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

    // Pack additional default customization fields into the notes JSON so
    // the server (which accepts `notes` in the CustomizationsInput) receives
    // structured data without schema changes.
    const notesPayload: any = {
      userNotes: notes || undefined,
      cookingRequests: cookingRequests || undefined,
    };

    sendAddToCartMutation({
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
        // Serialize structured extra fields into notes string
        notes: JSON.stringify(notesPayload),
      },
    });

    setIsCustomizationOpen(false);
  };

  // Disable conditions used by both the main Add button and the dialog's
  // Add to Cart button. Keep the same semantics across the component.
  const isOutOfStock = !item.isAvailable || (item.stockCount != null && Number(item.stockCount) <= 0);
  const exceedsRequestedStock = (item.stockCount != null) && quantity > Number(item.stockCount);

  return (
    <>
      <Card className="overflow-hidden transition-all duration-300 hover:shadow-xl border border-border hover:border-border bg-gradient-to-br from-muted to-white">
        <div className="aspect-video overflow-hidden relative">
          <img
            src={ensureImageSrc(item.image, item.id, 800, 480)}
            alt={item.name}
            className="object-cover w-full h-full transition-transform hover:scale-105"
            onError={(e) => { (e.target as HTMLImageElement).src = getPlaceholderImage(item.id, 800, 480); }}
          />

          {/* Popular badge (top-left) */}
          {item.isPopular && (
            <div className="absolute top-3 left-3">
              <Badge className="text-xs px-2 py-1">Popular</Badge>
            </div>
          )}

          {/* Veg / Non-veg marker */}
          <div className="absolute top-3 right-3">
            <div
              title={item.isVegetarian ? 'Vegetarian' : 'Non - Vegetarian'}
              className={`w-6 h-6 rounded-full ring-2 ring-white ${item.isVegetarian ? 'bg-emerald-500' : 'bg-red-600'}`}
            />
          </div>

          {/* Bottom-left overlays: prep time & stock */}
          <div className="absolute bottom-3 left-3 flex gap-2">
            {item.preparationTime != null && (
              <div className="bg-white/90 text-xs text-gray-800 px-2 py-1 rounded-md">{item.preparationTime} min</div>
            )}
            {item.stockCount != null && (
              <div className={`text-xs px-2 py-1 rounded-md ${item.stockCount > 0 ? 'bg-white/90 text-gray-800' : 'bg-red-50 text-red-600'}`}>
                {item.stockCount > 0 ? `${item.stockCount} left` : 'Out of stock'}
              </div>
            )}
          </div>
        </div>
        <CardHeader className="p-4 pb-0">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg text-primary">{item.name}</CardTitle>
              <CardDescription className="text-sm mt-1">{item.description}</CardDescription>
            </div>
            <Badge variant="outline" className={`${item.isAvailable ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {item.isAvailable ? 'Available' : 'Sold Out'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          <div className="flex items-center mb-2">
            <Star className="w-4 h-4 text-primary mr-1" />
            <span className="text-sm">{item.rating}</span>
            <span className="text-xs text-muted-foreground ml-2">({item.ratingCount} ratings)</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {/* If item has category, show a small Popular chip here for visibility on list */}
            {item.category && (
              <Badge variant="outline" className="text-xs ml-1 bg-yellow-50 text-yellow-700">{item.category}</Badge>
            )}
            {(item.tags || []).slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs bg-muted text-primary hover:bg-muted">
                {tag}
              </Badge>
            ))}
            {/* If more than 3 tags, show a compact +N indicator */}
            {(item.tags || []).length > 3 && (
              <Badge variant="secondary" className="text-xs">+{(item.tags || []).length - 3} more</Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between items-center p-4 pt-0">
          <p className="font-semibold text-lg text-primary">₹{item.price}</p>
          <Button
            onClick={handleAddToCartClick}
            variant="default"
            size="sm"
            className="bg-primary hover:bg-primary/90"
            disabled={!item.isAvailable || (item.stockCount != null && Number(item.stockCount) <= 0)}
          >
            <Plus className="w-4 h-4 mr-2" /> Add
          </Button>
        </CardFooter>
      </Card>

      <Dialog open={isCustomizationOpen} onOpenChange={(open) => !open && setIsCustomizationOpen(false)}>
        <DialogContent className="sm:max-w-[500px] overflow-y-auto max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-xl text-primary">Customize Your Order</DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
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
                  className="h-8 w-8 p-0 border-border"
                >-</Button>
                <span className="w-12 text-center">{quantity}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setQuantity(quantity + 1)}
                  className="h-8 w-8 p-0 border-border"
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
                      className={selectedSize === size.name ? "bg-primary hover:bg-primary/90" : "border-border"}
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
                  <AccordionTrigger className="px-4 text-primary hover:text-primary/90">Add Extra Items</AccordionTrigger>
                  <AccordionContent className="px-4 space-y-2">
                    {item.customizationOptions.additions.map((addition) => (
                      <div key={addition.name} className="flex items-center justify-between py-1">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id={`addition-${addition.name}`}
                            checked={selectedAdditions.includes(addition.name)}
                            onCheckedChange={(checked) => handleAddition(addition.name, checked === true)}
                            className="border-border text-primary"
                          />
                          <Label
                            htmlFor={`addition-${addition.name}`}
                            className="text-sm cursor-pointer"
                          >
                            {addition.name}
                          </Label>
                        </div>
                        <span className="text-sm text-muted-foreground">+₹{addition.price}</span>
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
                  <AccordionTrigger className="px-4 text-primary hover:text-primary/90">Remove Items</AccordionTrigger>
                  <AccordionContent className="px-4 space-y-2">
                    {item.customizationOptions.removals.map((removal) => (
                      <div key={removal} className="flex items-center space-x-2 py-1">
                        <Checkbox
                          id={`removal-${removal}`}
                          checked={selectedRemovals.includes(removal)}
                          onCheckedChange={(checked) => handleRemoval(removal, checked === true)}
                          className="border-border text-primary"
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
                className="border-border focus:border-primary"
              />
            </div>

            {/* Cooking requests (default field) */}
            <div className="space-y-2">
              <h3 className="font-medium">Cooking Requests</h3>
              <Textarea
                placeholder="e.g., less oil, extra spicy..."
                value={cookingRequests}
                onChange={(e) => setCookingRequests(e.target.value)}
                className="border-border focus:border-primary"
              />
            </div>

            {/* Schedule order removed from item customization (handled at checkout) */}

            {/* Total Price */}
            <div className="bg-muted p-4 rounded-md">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total Price:</span>
                <span className="text-xl font-bold text-primary">₹{totalPrice.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCustomizationOpen(false)}
              className="border-border text-primary"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCustomizedAddToCart}
              className="bg-primary hover:bg-primary/90"
              disabled={isOutOfStock || exceedsRequestedStock}
              title={isOutOfStock ? 'Item unavailable' : exceedsRequestedStock ? `Only ${item.stockCount} left` : undefined}
            >
              Add to Cart
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Login prompt when server requires authentication to modify cart */}
      <Dialog open={showLoginPrompt} onOpenChange={(open) => !open && setShowLoginPrompt(false)}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-lg">Login required</DialogTitle>
            <DialogDescription>
              You must be logged in to add items to your cart. Please login to continue.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowLoginPrompt(false)}>Cancel</Button>
            <Button onClick={() => { setShowLoginPrompt(false); navigate('/login'); }}>Login</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MenuItemWithCustomization;
