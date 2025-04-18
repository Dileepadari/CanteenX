
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, ShoppingCart, User, BellRing, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { ShoppingCart as CartComponent } from "@/components/cart/ShoppingCart";
import { NotificationCenter } from "@/components/notification/NotificationCenter";

const NavBar = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would navigate to search results
    console.log("Searching for:", searchQuery);
  };

  const navLinks = [
    { name: "Canteens", path: "/canteens" },
    { name: "Menu", path: "/menu" },
    { name: "My Orders", path: "/orders" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Name */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-canteen-orange">Smart</span>
              <span className="text-2xl font-bold text-canteen-blue">Canteen</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </Button>

          {/* Search Bar */}
          <form 
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md mx-6"
          >
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="search"
                placeholder="Search for canteens, dishes..."
                className="pl-10 py-2 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </form>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                to={link.path}
                className={`text-sm font-medium px-3 py-2 rounded-md transition-colors ${
                  location.pathname === link.path 
                    ? "bg-gray-100 text-gray-900" 
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Action Icons */}
          <div className="flex items-center space-x-2">
            <CartComponent />
            <NotificationCenter />
            <Link to="/profile">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/login" className="hidden md:block">
              <Button size="sm" variant="default">Log In</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>
              <Link 
                to="/" 
                className="flex items-center space-x-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="text-2xl font-bold text-canteen-orange">Smart</span>
                <span className="text-2xl font-bold text-canteen-blue">Canteen</span>
              </Link>
            </SheetTitle>
          </SheetHeader>
          <div className="py-4">
            <form 
              onSubmit={handleSearch}
              className="mb-6 mt-2"
            >
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  type="search"
                  placeholder="Search for canteens, dishes..."
                  className="pl-10 py-2 w-full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </form>
            <div className="space-y-1">
              {navLinks.map((link) => (
                <SheetClose key={link.path} asChild>
                  <Link 
                    to={link.path}
                    className={`block px-3 py-2 rounded-md transition-colors ${
                      location.pathname === link.path 
                        ? "bg-gray-100 text-gray-900" 
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    {link.name}
                  </Link>
                </SheetClose>
              ))}
              <SheetClose asChild>
                <Link 
                  to="/profile"
                  className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  My Profile
                </Link>
              </SheetClose>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-200">
              <SheetClose asChild>
                <Link to="/login" className="w-full">
                  <Button size="sm" className="w-full">Log In</Button>
                </Link>
              </SheetClose>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  );
};

export default NavBar;
