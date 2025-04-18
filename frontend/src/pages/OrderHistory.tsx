
import React from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { orders, menuItems, canteens, orderStatusOptions } from "@/data/mockData";
import OrderStatusBadge from "@/components/order/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Clock, Repeat, Receipt } from "lucide-react";

const OrderHistory = () => {
  // Helper function to find menu item by id
  const findMenuItem = (itemId: number) => {
    return menuItems.find((item) => item.id === itemId);
  };

  // Helper function to find canteen by id
  const findCanteen = (canteenId: number) => {
    return canteens.find((canteen) => canteen.id === canteenId);
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Helper function to format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Active orders (preparing, ready)
  const activeOrders = orders.filter(
    (order) => order.status === "preparing" || order.status === "ready"
  );

  // Past orders (delivered, cancelled)
  const pastOrders = orders.filter(
    (order) => order.status === "delivered" || order.status === "cancelled"
  );

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>

        <Tabs defaultValue="active">
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active Orders</TabsTrigger>
            <TabsTrigger value="past">Past Orders</TabsTrigger>
          </TabsList>

          {/* Active Orders */}
          <TabsContent value="active">
            {activeOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex h-20 w-20 rounded-full bg-gray-100 p-4 items-center justify-center mb-4">
                  <Receipt className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No active orders</h3>
                <p className="text-gray-500 mb-4">Explore our canteens and place an order</p>
                <Link to="/">
                  <Button>Browse Canteens</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrders.map((order) => {
                  const canteen = findCanteen(order.canteenId);
                  return (
                    <Card key={order.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          {/* Order status and canteen info */}
                          <div className="p-4 flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold">
                                  {canteen?.name || "Unknown Canteen"}
                                </h3>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Clock className="h-3.5 w-3.5 mr-1" />
                                  <span>
                                    {formatDate(order.orderTime)}, {formatTime(order.orderTime)}
                                  </span>
                                </div>
                              </div>
                              <OrderStatusBadge status={order.status} />
                            </div>

                            {/* Order items summary */}
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

                          {/* Action buttons */}
                          <div className="bg-gray-50 p-4 flex flex-row sm:flex-col justify-between items-center gap-2 sm:border-l border-gray-100">
                            <Button variant="outline" size="sm" className="w-full gap-1">
                              <Repeat className="h-4 w-4" />
                              Track
                            </Button>
                            <Link to={`/orders/${order.id}`} className="w-full">
                              <Button size="sm" className="w-full gap-1">
                                Details
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Past Orders */}
          <TabsContent value="past">
            {pastOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex h-20 w-20 rounded-full bg-gray-100 p-4 items-center justify-center mb-4">
                  <Receipt className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No past orders</h3>
                <p className="text-gray-500 mb-4">Explore our canteens and place an order</p>
                <Link to="/">
                  <Button>Browse Canteens</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {pastOrders.map((order) => {
                  const canteen = findCanteen(order.canteenId);
                  return (
                    <Card key={order.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          {/* Order status and canteen info */}
                          <div className="p-4 flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold">
                                  {canteen?.name || "Unknown Canteen"}
                                </h3>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Clock className="h-3.5 w-3.5 mr-1" />
                                  <span>
                                    {formatDate(order.orderTime)}, {formatTime(order.orderTime)}
                                  </span>
                                </div>
                              </div>
                              <OrderStatusBadge status={order.status} />
                            </div>

                            {/* Order items summary */}
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

                          {/* Action buttons */}
                          <div className="bg-gray-50 p-4 flex flex-row sm:flex-col justify-between items-center gap-2 sm:border-l border-gray-100">
                            <Button variant="outline" size="sm" className="w-full gap-1">
                              <Repeat className="h-4 w-4" />
                              Reorder
                            </Button>
                            <Link to={`/orders/${order.id}`} className="w-full">
                              <Button size="sm" variant="secondary" className="w-full gap-1">
                                Details
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default OrderHistory;
