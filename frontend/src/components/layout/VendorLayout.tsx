
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  ClipboardList, 
  Utensils, 
  Tag, 
  BarChart3, 
  Settings, 
  LogOut,
  Package,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import VendorNotifications from '../notification/VendorNotifications';

interface VendorLayoutProps {
  children: React.ReactNode;
}

const VendorLayout = ({ children }: VendorLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = () => {
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate('/logout');
  };

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/vendor/dashboard' },
    { icon: ClipboardList, label: 'Orders', path: '/vendor/orders' },
    { icon: Package, label: 'Bulk Orders', path: '/vendor/bulk-orders' },
    { icon: Utensils, label: 'Menu', path: '/vendor/menu' },
    { icon: Tag, label: 'Promotions', path: '/vendor/promotions' },
    { icon: BarChart3, label: 'Analytics', path: '/vendor/analytics' },
    { icon: Settings, label: 'Settings', path: '/vendor/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Link to="/vendor/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-canteen-orange">Smart</span>
            <span className="text-xl font-bold text-canteen-blue">Canteen</span>
          </Link>
          <div className="mt-2 text-sm text-gray-500">Vendor Portal</div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-md ${
                location.pathname === item.path
                  ? 'bg-canteen-orange/10 text-canteen-orange'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {navItems.find(item => item.path === location.pathname)?.label || 'Vendor Dashboard'}
          </h1>

          <div className="flex items-center space-x-4">
            <VendorNotifications />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default VendorLayout;
