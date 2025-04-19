import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { menuItems, canteens } from "@/data/mockData";
import OrderStatusBadge from "@/components/order/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Clock, Repeat, Receipt, Loader2, AlertCircle } from "lucide-react";
import { useQuery } from "@apollo/client";
import { GET_ALL_ORDERS } from "@/gql/queries/orders";
import { GET_CURRENT_USER } from "@/gql/queries/user";
import { useToast } from "@/hooks/use-toast";

const OrderHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState("");
  const [orders, setOrders] = useState([]);

  // get_current user from graphql
  const { loading: userLoading, error: userError, data: userData } = useQuery(GET_CURRENT_USER, {
    fetchPolicy: "network-only",
  });
  useEffect(() => {
    if (userData && userData.getCurrentUser) {
      setUserId(userData.getCurrentUser.id);
    }
  }, [userData]);


  const { loading, error, data } = useQuery(GET_ALL_ORDERS, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (data && data.getAllOrders) {
      setOrders(data.getAllOrders);
    }
  }, [data]);

  // Helper function to find menu item by id
  const findMenuItem = (itemId: number) => {
    return menuItems.find((item) => parseInt(item.id) === itemId);
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

  // Handler for reordering
  const handleReorder = (orderId: number) => {
    // In a real implementation, this would copy the order items to the cart
    // and navigate to the checkout page
    alert(`Reordering order #${orderId}`);
    navigate("/menu");
  };

  // Active orders (pending, preparing, ready)
  const activeOrders = orders.filter(
    (order) => ["pending", "confirmed", "preparing", "ready"].includes(order.status)
  );

  // Past orders (delivered, cancelled)
  const pastOrders = orders.filter(
    (order) => ["delivered", "cancelled"].includes(order.status)
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[50vh]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-orange-500 animate-spin mb-4" />
            <h3 className="text-lg font-semibold">Loading orders...</h3>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-flex h-20 w-20 rounded-full bg-red-100 p-4 items-center justify-center mb-4">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Error loading orders</h3>
            <p className="text-gray-500 mb-4">{error.message}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

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
                                {order.items.map((item, idx) => {
                                  const menuItem = findMenuItem(item.itemId);
                                  return (
                                    <li key={idx} className="text-sm flex justify-between">
                                      <span>
                                        {item.quantity} × {menuItem?.name || "Item #" + item.itemId}
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
                          {/* <div className="bg-gray-50 p-4 flex flex-row sm:flex-col justify-between items-center gap-2 sm:border-l border-gray-100">
                            <Link to={`/orders/${order.id}/track`} className="w-full">
                              <Button variant="outline" size="sm" className="w-full gap-1">
                                <Repeat className="h-4 w-4" />
                                Track
                              </Button>
                            </Link>
                            <Link to={`/orders/${order.id}`} className="w-full">
                              <Button size="sm" className="w-full gap-1">
                                Details
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div> */}
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
                                {order.items.map((item, idx) => {
                                  const menuItem = findMenuItem(item.itemId);
                                  return (
                                    <li key={idx} className="text-sm flex justify-between">
                                      <span>
                                        {item.quantity} × {menuItem?.name || "Item #" + item.itemId}
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
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="w-full gap-1"
                              onClick={() => handleReorder(order.id)}
                            >
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
