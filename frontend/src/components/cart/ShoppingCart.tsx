
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart as CartIcon, Trash2, Plus, Minus, ChevronRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useCart } from "@/contexts/CartContext";

export const ShoppingCart = () => {
  const [open, setOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const navigate = useNavigate();
  const { items, totalItems, totalPrice, updateQuantity, removeItem, clearCart, checkout } = useCart();

  const handleCheckout = () => {
    checkout();
    setOpen(false);
    navigate("/orders");
  };

  const handleClearCart = () => {
    clearCart();
    setConfirmClearOpen(false);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <CartIcon className="h-5 w-5" />
            {totalItems > 0 && (
              <Badge 
                variant="default" 
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
              >
                {totalItems > 9 ? "9+" : totalItems}
              </Badge>
            )}
          </Button>
        </SheetTrigger>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Your Cart</SheetTitle>
          </SheetHeader>
          
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[70vh]">
              <div className="text-center mb-6">
                <CartIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">Your cart is empty</h3>
                <p className="text-muted-foreground mt-1">Explore our canteens and add some delicious food!</p>
              </div>
              <Button asChild className="mt-2">
                <Link to="/" onClick={() => setOpen(false)}>
                  Browse Canteens
                </Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between py-4">
                <div>
                  <p className="text-sm font-medium">
                    From {items[0]?.canteenName || "Canteen"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {totalItems} {totalItems === 1 ? "item" : "items"}
                  </p>
                </div>
                <AlertDialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Trash2 className="h-4 w-4" />
                      <span>Clear</span>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Clear your cart?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove all items from your cart. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleClearCart}>Clear Cart</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              
              <Separator />
              
              <div className="mt-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-15rem)]">
                {items.map((item) => (
                  <div key={item.id} className="flex items-start py-2">
                    <div className="h-16 w-16 rounded-md overflow-hidden flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="h-full w-full object-cover"
                      />
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground mb-1">₹{item.price}</p>
                      
                      {item.customizations && item.customizations.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {item.customizations.join(", ")}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center">
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            className="h-7 w-7"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <span className="font-medium">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 mt-auto pt-4">
                <Separator />
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Delivery Fee</span>
                  <span>₹0.00</span>
                </div>
                <Separator />
                <div className="flex justify-between py-2">
                  <span className="font-medium">Total</span>
                  <span className="font-medium">₹{totalPrice.toFixed(2)}</span>
                </div>
              </div>
              
              <SheetFooter className="mt-4">
                <Button className="w-full" onClick={handleCheckout}>
                  Checkout
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  );
};
