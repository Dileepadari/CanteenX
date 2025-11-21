import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home,
  Users,
  FileText,
  BarChart3,
  Settings,
  LogOut,
  Grid,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import NotificationBell from '@/components/notification/NotificationBell';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const handleLogout = () => {
    toast({ title: 'Logged out successfully' });
    navigate('/logout');
  };

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Grid, label: 'Canteens', path: '/admin/canteens' },
    { icon: Users, label: 'Vendors', path: '/admin/vendors' },
    { icon: Users, label: 'Staff', path: '/admin/staff' },
    { icon: FileText, label: 'Complaints', path: '/admin/complaints' },
    { icon: BarChart3, label: 'Reports', path: '/admin/reports' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Link to="/admin/dashboard" className="flex items-center">
            <span className="text-xl font-bold text-primary">Admin</span>
            <span className="text-xl font-bold text-muted-foreground ml-1">Console</span>
          </Link>
          <div className="mt-2 text-sm text-gray-500">Admin Portal</div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-3 py-2 rounded-md ${
                location.pathname === item.path ? 'bg-muted/10 text-primary' : 'text-gray-600 hover:bg-muted'
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
            className="w-full justify-start text-destructive hover:text-destructive/90 hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </div>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {navItems.find(item => item.path === location.pathname)?.label || 'Admin Dashboard'}
          </h1>

          <div className="flex items-center space-x-4">
            <NotificationBell />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
