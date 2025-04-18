
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import NavLinks from "./NavLinks";
import { useCart } from "@/contexts/CartContext";
import { Menu, LogOut, User } from "lucide-react";
import { ShoppingCart } from "@/components/cart/ShoppingCart";
import { useNotification } from "@/contexts/NotificationContext";
import UserNotifications from "../notification/UserNotifications";
import VendorNotifications from "../notification/VendorNotifications";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items } = useCart();
  const { unreadCount } = useNotification();
  const location = useLocation();
  
  // Check if current path is a vendor path
  const isVendorRoute = location.pathname.startsWith('/vendor');

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-sm bg-white/90 border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-canteen-orange">Smart</span>
              <span className="text-2xl font-bold text-canteen-blue">Canteen</span>
            </Link>
          </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex md:items-center md:space-x-4 lg:space-x-6">
          <NavLinks isVendor={isVendorRoute} />
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          {isVendorRoute ? <VendorNotifications /> : <UserNotifications />}

          {/* Cart (Only show on user routes) */}
          {!isVendorRoute && (
            <Link to="/menu">
              <Button variant="outline" size="icon" className="relative">
                <ShoppingCart  />
                {items.length > 0 && (
                  <Badge 
                    className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 bg-orange-500"
                    variant="default"
                  >
                    {items.length}
                  </Badge>
                )}
              </Button>
            </Link>
          )}

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer w-full">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/orders" className="cursor-pointer w-full">Orders</Link>
              </DropdownMenuItem>
              {isVendorRoute ? (
                <DropdownMenuItem asChild>
                  <Link to="/" className="cursor-pointer w-full">Switch to User</Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem asChild>
                  <Link to="/vendor/dashboard" className="cursor-pointer w-full">Switch to Vendor</Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600 cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile Menu */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="py-4">
                <Link 
                  to="/" 
                  className="flex items-center space-x-2 mb-6"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <img src="/placeholder.svg" alt="Logo" className="w-8 h-8" />
                  <span className="text-lg font-semibold">Smart Canteen</span>
                </Link>
                <nav className="flex flex-col space-y-4">
                  <NavLinks 
                    isVendor={isVendorRoute} 
                    isMobile 
                    onItemClick={() => setIsMenuOpen(false)}
                  />
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
