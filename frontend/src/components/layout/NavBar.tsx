import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
import { useUserStore } from "@/stores/userStore";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { items } = useCart();
  const { unreadCount } = useNotification();
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useUserStore();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const roleLower = user?.role?.toLowerCase?.() || '';
  const isVendor = roleLower === 'vendor';
  const isAdmin = roleLower === 'admin' || roleLower === 'administrator';

  return (
    <header className="sticky top-0 z-50 w-full backdrop-blur-sm bg-background/90 border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-primary">Smart</span>
            <span className="text-2xl font-bold text-secondary">Canteen</span>
          </Link>
        </div>

        <nav className="hidden md:flex md:items-center md:space-x-4 lg:space-x-6">
          <NavLinks role={user?.role} isVendor={isVendor} />
        </nav>

        <div className="flex items-center space-x-4">
          {isVendor ? <VendorNotifications /> : <UserNotifications />}

          {!isVendor && (
            <Link to="/cart">
              <Button variant="outline" size="icon" className="relative">
                <ShoppingCart />
                {items.length > 0 && (
                  <Badge
                    className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center p-0 bg-primary text-primary-foreground"
                    variant="default"
                  >
                    {items.length}
                  </Badge>
                )}
              </Button>
            </Link>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="cursor-pointer">
                  <AvatarImage src={(user as any)?.profilePicture || "/placeholder.svg"} />
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
                {isVendor ? (
                  <DropdownMenuItem asChild>
                    <Link to="/" className="cursor-pointer w-full">Switch to User</Link>
                  </DropdownMenuItem>
                ) : isAdmin ? (
                  <DropdownMenuItem asChild>
                    <Link to="/admin/dashboard" className="cursor-pointer w-full">Admin Dashboard</Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild>
                    <Link to="/vendor/dashboard" className="cursor-pointer w-full">Switch to Vendor</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive cursor-pointer" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link to="/login">Login</Link>
            </Button>
          )}

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
                  <span className="text-lg font-semibold">CanteenX</span>
                </Link>
                <nav className="flex flex-col space-y-4">
                  <NavLinks
                    role={user?.role}
                    isVendor={isVendor}
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
