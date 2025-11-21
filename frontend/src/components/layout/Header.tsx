import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, LogOut, UtensilsCrossed } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface HeaderProps {
  cartItemCount?: number;
}

export const Header: React.FC<HeaderProps> = ({ cartItemCount = 0 }) => {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleLower = user?.role?.toLowerCase?.() || '';
  const isVendor = roleLower === 'vendor';
  const isAdmin = roleLower === 'admin' || roleLower === 'administrator';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <UtensilsCrossed className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">CanteenX</span>
        </Link>

        <nav className="flex items-center space-x-6">
          <Link to="/" className="text-sm font-medium transition-colors hover:text-primary">
            Home
          </Link>
          <Link to="/canteens" className="text-sm font-medium transition-colors hover:text-primary">
            Canteens
          </Link>
          <Link to="/menu" className="text-sm font-medium transition-colors hover:text-primary">
            Menu
          </Link>
          {user && (
            <Link to="/orders" className="text-sm font-medium transition-colors hover:text-primary">
              Orders
            </Link>
          )}
          {isVendor && (
            <Link to="/vendor/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
              Vendor
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin/dashboard" className="text-sm font-medium transition-colors hover:text-primary">
              Admin
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-4">
          {user && (
            <Button variant="ghost" size="icon" asChild className="relative">
              <Link to="/cart" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItemCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                  >
                    {cartItemCount}
                  </Badge>
                )}
              </Link>
            </Button>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">Profile</Link>
                </DropdownMenuItem>
                {isVendor && (
                  <DropdownMenuItem asChild>
                    <Link to="/vendor/dashboard">Vendor Dashboard</Link>
                  </DropdownMenuItem>
                )}
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin/dashboard">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                  <Link to="/orders">My Orders</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/feedback">Feedback</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild>
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
