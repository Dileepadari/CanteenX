import React from 'react';
import VendorLayout from '@/components/layout/VendorLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShoppingCart, CheckCircle, AlertTriangle, MenuSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { menuItems } from '@/data/mockData';
import { Alert, AlertDescription } from '@/components/ui/alert';

const VendorDashboard = () => {
  const navigate = useNavigate();

  return (
    <VendorLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Vendor Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <DashboardCard
            title="Total Orders"
            value="125"
            icon={<ShoppingCart className="h-6 w-6 text-blue-500" />}
            description="All orders received"
            buttonText="View Orders"
            buttonAction={() => navigate('/vendor/orders')}
          />
          <DashboardCard
            title="Completed Orders"
            value="110"
            icon={<CheckCircle className="h-6 w-6 text-green-500" />}
            description="Orders successfully delivered"
            buttonText="View Orders"
            buttonAction={() => navigate('/vendor/orders')}
          />
          <DashboardCard
            title="Total Menu Items"
            value={menuItems.length.toString()}
            icon={<MenuSquare className="h-6 w-6 text-orange-500" />}
            description="Manage your menu items"
            buttonText="Manage Menu"
            buttonAction={() => navigate('/vendor/menu')}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Popular Items</CardTitle>
            </CardHeader>
            <CardContent>
              <PopularItems />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Low Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <LowStockItems />
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <AlertCard
            icon={<AlertTriangle className="h-12 w-12 text-orange-500" />}
            title="Low Stock Items"
            description="Some items are running low on stock."
            buttonText="View Inventory"
            buttonAction={() => navigate('/vendor/menu')}
            variant="default"
          />
        </div>
      </div>
    </VendorLayout>
  );
};

interface DashboardCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  description: string;
  buttonText: string;
  buttonAction: () => void;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  description,
  buttonText,
  buttonAction,
}) => (
  <Card>
    <CardContent className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="text-4xl font-bold">{value}</div>
        <div className="p-3 bg-gray-100 rounded-full">{icon}</div>
      </div>
      <div className="flex flex-col justify-between h-full">
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        <Button variant="secondary" size="sm" className="mt-4" onClick={buttonAction}>
          {buttonText} <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

const PopularItems = () => {
  // Convert to match the data type
  const vendorItems = menuItems.filter(item => String(item.canteenId) === "1");
  
  // Sort by rating count instead of orderCount
  const sortedItems = [...vendorItems].sort((a, b) => b.ratingCount - a.ratingCount);
  
  return (
    <ul className="space-y-2">
      {sortedItems.slice(0, 3).map((item) => (
        <li key={item.id} className="flex items-center justify-between">
          <span>{item.name}</span>
          <span className="text-gray-500">Rating: {item.rating}</span>
        </li>
      ))}
    </ul>
  );
};

const LowStockItems = () => {
  const vendorItems = menuItems.filter(item => String(item.canteenId) === "1");
  
  // Use a fixed number for demo purposes, or add stockCount to the items
  const lowStockItems = vendorItems.slice(0, 3); // Just take first 3 for demo
  
  return (
    <ul className="space-y-2">
      {lowStockItems.map((item) => (
        <li key={item.id} className="flex items-center justify-between">
          <span>{item.name}</span>
          <span className="text-gray-500">Stock: Low</span>
        </li>
      ))}
    </ul>
  );
};

interface AlertCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  buttonAction: () => void;
  variant?: "default" | "destructive";
}

const AlertCard: React.FC<AlertCardProps> = ({
  icon,
  title,
  description,
  buttonText,
  buttonAction,
  variant = "default",
}) => (
  <Alert variant={variant}>
    {icon}
    <div className="ml-4 space-y-1">
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>
        {description}
        <Button variant="link" size="sm" className="ml-2" onClick={buttonAction}>
          {buttonText}
        </Button>
      </AlertDescription>
    </div>
  </Alert>
);

export default VendorDashboard;
