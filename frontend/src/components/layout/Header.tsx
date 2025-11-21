import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '@/stores/userStore';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, LogOut, UtensilsCrossed, Menu } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const roleLower = user?.role?.toLowerCase?.() || '';
  const isVendor = roleLower === 'vendor';
  const isAdmin = roleLower === 'admin' || roleLower === 'administrator';

  // Build links based on role (reused for mobile drawer)
  const baseLinks = [
    { to: '/', label: 'Home' },
    { to: '/canteens', label: 'Canteens' },
    { to: '/menu', label: 'Menu' },
  ];
  const userLinks = user ? [{ to: '/orders', label: 'Orders' }] : [];
  const vendorLinks = isVendor ? [{ to: '/vendor/dashboard', label: 'Vendor Dashboard' }] : [];
  const adminLinks = isAdmin ? [{ to: '/admin/dashboard', label: 'Admin Dashboard' }] : [];
  const allLinks = [...baseLinks, ...userLinks, ...vendorLinks, ...adminLinks];

  // Close drawer on route change for better UX
  useEffect(() => { setIsMenuOpen(false); }, [location.pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2" aria-label="Home">
          <UtensilsCrossed className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">CanteenX</span>
        </Link>

        {/* Desktop navigation (≥ lg) */}
        <nav className="hidden lg:flex items-center space-x-6" aria-label="Primary navigation">
          {allLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className="text-sm font-medium transition-colors hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/40 rounded"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-2 sm:space-x-4">
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
            <Button asChild className="max-[400px]:hidden">
              <Link to="/login">Login</Link>
            </Button>
          )}

          {/* Mobile / Tablet hamburger (below lg) */}
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                aria-label="Open navigation menu"
                aria-expanded={isMenuOpen}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 sm:w-80" aria-label="Mobile navigation drawer">
              <div className="py-4 flex flex-col h-full">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 mb-6 focus:outline-none focus:ring-2 focus:ring-primary/40 rounded"
                >
                  <UtensilsCrossed className="h-5 w-5 text-primary" />
                  <span className="text-lg font-semibold">CanteenX</span>
                </Link>
                <nav className="flex-1 flex flex-col space-y-1" aria-label="Mobile primary">
                  {allLinks.map(l => (
                    <Link
                      key={l.to}
                      to={l.to}
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center py-2 px-4 text-sm rounded-md hover:bg-muted transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      {l.label}
                    </Link>
                  ))}
                  {!user && (
                    <Link
                      to="/login"
                      onClick={() => setIsMenuOpen(false)}
                      className="mt-2 flex items-center justify-center py-2 px-4 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary/40"
                    >
                      Login
                    </Link>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default Header;
