
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  BarChart3, 
  Bell, 
  ChefHat, 
  ChevronDown, 
  ClipboardList, 
  DollarSign, 
  Home, 
  LogOut, 
  Package, 
  Settings, 
  ShoppingBag, 
  Users, 
  Utensils
} from "lucide-react";
import OrderStatusBadge from "@/components/order/OrderStatusBadge";
import { orders, menuItems } from "@/data/mockData";

const VendorDashboard = () => {
  const { toast } = useToast();
  const [currentTab, setCurrentTab] = useState("dashboard");

  // Mock incoming orders (in a real app, these would come from an API)
  const incomingOrders = orders.filter(
    (order) => order.status === "pending" || order.status === "confirmed"
  );

  // Mock preparing orders
  const preparingOrders = orders.filter(
    (order) => order.status === "preparing"
  );

  // Mock completed orders
  const completedOrders = orders.filter(
    (order) => order.status === "ready" || order.status === "delivered"
  );

  // Mock function to handle order status update
  const handleUpdateStatus = (orderId: number, newStatus: string) => {
    toast({
      title: "Order Status Updated",
      description: `Order #${orderId} is now ${newStatus}`,
    });
  };

  // Helper function to find menu item by id
  const findMenuItem = (itemId: number) => {
    return menuItems.find((item) => item.id === itemId);
  };

  // Helper function to format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
          <Link
            to="/vendor/dashboard"
            className={`flex items-center px-3 py-2 rounded-md ${
              currentTab === "dashboard"
                ? "bg-canteen-orange/10 text-canteen-orange"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setCurrentTab("dashboard")}
          >
            <Home className="h-5 w-5 mr-3" />
            Dashboard
          </Link>
          <Link
            to="/vendor/orders"
            className={`flex items-center px-3 py-2 rounded-md ${
              currentTab === "orders"
                ? "bg-canteen-orange/10 text-canteen-orange"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setCurrentTab("orders")}
          >
            <ClipboardList className="h-5 w-5 mr-3" />
            Orders
          </Link>
          <Link
            to="/vendor/menu"
            className={`flex items-center px-3 py-2 rounded-md ${
              currentTab === "menu"
                ? "bg-canteen-orange/10 text-canteen-orange"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setCurrentTab("menu")}
          >
            <Utensils className="h-5 w-5 mr-3" />
            Menu Management
          </Link>
          <Link
            to="/vendor/inventory"
            className={`flex items-center px-3 py-2 rounded-md ${
              currentTab === "inventory"
                ? "bg-canteen-orange/10 text-canteen-orange"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setCurrentTab("inventory")}
          >
            <Package className="h-5 w-5 mr-3" />
            Inventory
          </Link>
          <Link
            to="/vendor/analytics"
            className={`flex items-center px-3 py-2 rounded-md ${
              currentTab === "analytics"
                ? "bg-canteen-orange/10 text-canteen-orange"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            onClick={() => setCurrentTab("analytics")}
          >
            <BarChart3 className="h-5 w-5 mr-3" />
            Analytics
          </Link>
        </nav>

        <div className="p-4 border-t border-gray-200">
          <Link
            to="/vendor/settings"
            className="flex items-center px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <Settings className="h-5 w-5 mr-3" />
            Settings
          </Link>
          <Link
            to="/login"
            className="flex items-center px-3 py-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>

          <div className="flex items-center space-x-4">
            <Button variant="outline" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center rounded-full bg-canteen-orange text-white text-xs">
                3
              </span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  Central Canteen
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Switch Canteen</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Central Canteen</DropdownMenuItem>
                <DropdownMenuItem>Tech Hub Cafe</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">New Orders</p>
                    <h3 className="text-2xl font-bold mt-1">12</h3>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <ShoppingBag className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="text-green-500 text-sm mt-2 flex items-center">
                  <span className="mr-1">↑</span> 8% from yesterday
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Today's Revenue</p>
                    <h3 className="text-2xl font-bold mt-1">₹8,540</h3>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="text-green-500 text-sm mt-2 flex items-center">
                  <span className="mr-1">↑</span> 12% from yesterday
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Active Orders</p>
                    <h3 className="text-2xl font-bold mt-1">5</h3>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <ChefHat className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
                <div className="text-orange-500 text-sm mt-2 flex items-center">
                  Processing now
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-500 text-sm">Active Users</p>
                    <h3 className="text-2xl font-bold mt-1">124</h3>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="text-gray-500 text-sm mt-2 flex items-center">
                  Online now
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Orders Section */}
          <Tabs defaultValue="incoming" className="mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Orders</h2>
              <TabsList>
                <TabsTrigger value="incoming" className="relative">
                  Incoming
                  <Badge className="ml-1">{incomingOrders.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="preparing" className="relative">
                  Preparing
                  <Badge className="ml-1">{preparingOrders.length}</Badge>
                </TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="incoming">
              {incomingOrders.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500">No incoming orders at the moment</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {incomingOrders.map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          {/* Order details */}
                          <div className="p-4 flex-1">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div className="flex items-center">
                                  <h3 className="font-semibold">Order #{order.id}</h3>
                                  <OrderStatusBadge
                                    status={order.status}
                                    className="ml-3"
                                  />
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  Ordered at {formatTime(order.orderTime)}
                                </div>
                              </div>
                            </div>

                            {/* Order items */}
                            <div className="mt-3">
                              <h4 className="text-sm font-medium mb-2">Items</h4>
                              <ul className="space-y-1">
                                {order.items.map((item) => {
                                  const menuItem = findMenuItem(item.itemId);
                                  return (
                                    <li key={item.itemId} className="text-sm flex justify-between">
                                      <span>
                                        {item.quantity} × {menuItem?.name || "Unknown Item"}
                                        {item.customizations?.length > 0 && (
                                          <span className="text-gray-500">
                                            {" "}
                                            (
                                            {item.customizations
                                              .map(
                                                (customId) =>
                                                  menuItem?.customizationOptions.find(
                                                    (c) => c.id === customId
                                                  )?.name || ""
                                              )
                                              .join(", ")}
                                            )
                                          </span>
                                        )}
                                      </span>
                                      <span className="text-gray-600">
                                        ₹{menuItem ? item.quantity * menuItem.price : 0}
                                      </span>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>

                            {/* Order total */}
                            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
                              <span className="font-medium">Total</span>
                              <span className="font-semibold">₹{order.totalAmount}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="bg-gray-50 p-4 flex flex-row sm:flex-col justify-between items-center gap-3 sm:border-l border-gray-100">
                            <Button
                              onClick={() => handleUpdateStatus(order.id, "confirmed")}
                              className="w-full"
                            >
                              Accept
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => handleUpdateStatus(order.id, "rejected")}
                              className="w-full"
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="preparing">
              {preparingOrders.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500">No orders in preparation</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {preparingOrders.map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          {/* Order details (similar to above) */}
                          <div className="p-4 flex-1">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div className="flex items-center">
                                  <h3 className="font-semibold">Order #{order.id}</h3>
                                  <OrderStatusBadge
                                    status={order.status}
                                    className="ml-3"
                                  />
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  Ordered at {formatTime(order.orderTime)}
                                </div>
                              </div>
                            </div>

                            {/* Order items (similar to above) */}
                            <div className="mt-3">
                              <h4 className="text-sm font-medium mb-2">Items</h4>
                              <ul className="space-y-1">
                                {order.items.map((item) => {
                                  const menuItem = findMenuItem(item.itemId);
                                  return (
                                    <li key={item.itemId} className="text-sm flex justify-between">
                                      <span>
                                        {item.quantity} × {menuItem?.name || "Unknown Item"}
                                      </span>
                                      <span className="text-gray-600">
                                        ₹{menuItem ? item.quantity * menuItem.price : 0}
                                      </span>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>

                            {/* Order total */}
                            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
                              <span className="font-medium">Total</span>
                              <span className="font-semibold">₹{order.totalAmount}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="bg-gray-50 p-4 flex flex-row sm:flex-col justify-between items-center gap-3 sm:border-l border-gray-100">
                            <Button
                              onClick={() => handleUpdateStatus(order.id, "ready")}
                              className="w-full"
                            >
                              Mark Ready
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              {completedOrders.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center">
                    <p className="text-gray-500">No completed orders yet</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {completedOrders.slice(0, 3).map((order) => (
                    <Card key={order.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          {/* Order details (similar to above) */}
                          <div className="p-4 flex-1">
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <div className="flex items-center">
                                  <h3 className="font-semibold">Order #{order.id}</h3>
                                  <OrderStatusBadge
                                    status={order.status}
                                    className="ml-3"
                                  />
                                </div>
                                <div className="text-sm text-gray-500 mt-1">
                                  Ordered at {formatTime(order.orderTime)}
                                </div>
                              </div>
                            </div>

                            {/* Order total */}
                            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
                              <span className="font-medium">Total</span>
                              <span className="font-semibold">₹{order.totalAmount}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Menu Management Preview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Menu Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Popular Items</h3>
                <Button variant="outline" size="sm">
                  Manage Menu
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {menuItems
                  .filter((item) => item.isPopular && item.canteenId === 1)
                  .slice(0, 3)
                  .map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <div className="h-12 w-12 rounded-md overflow-hidden">
                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">₹{item.price}</span>
                          <Badge variant={item.isAvailable ? "success" : "destructive"}>
                            {item.isAvailable ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default VendorDashboard;
