import React, { useState, useEffect } from "react";
import VendorLayout from "@/components/layout/VendorLayout";
// remove mockData import; fetch canteens via GraphQL
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useNotification } from "@/contexts/NotificationContext";
import OrderStatusBadge from "@/components/order/OrderStatusBadge";
import {
  Search,
  Clock,
  ChevronRight,
  ArrowUpDown,
  ArrowDown,
  CheckCircle2,
  ChefHat,
  PackageCheck,
  X,
  Loader2,
  User,
} from "lucide-react";
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import { GET_CANTEENS } from '@/gql/queries/canteens';
import { GET_CANTEEN_ORDERS } from "@/gql/queries/orders";
import { UPDATE_ORDER_STATUS } from "@/gql/mutations/orders";
import { GET_MENU_ITEMS_BY_CANTEEN } from "@/gql/queries/menuItems";
import { useUserStore } from "@/stores/userStore";
import { formatIST } from "@/lib/ist";

interface MenuItem {
  id: number | string;
  name: string;
  price: number;
  image: string;
  category: string;
  description: string;
}

interface OrderItem {
  itemId: number;
  quantity: number;
  customizations?: {
    size?: string;
    additions?: string[];
    removals?: string[];
    notes?: string;
  };
  note?: string;
}

interface Order {
  id: number;
  userId: string;
  canteenId: number;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  orderTime: string;
  confirmedTime?: string;
  preparingTime?: string;
  readyTime?: string;
  deliveryTime?: string;
  pickupTime?: string;
  cancelledTime?: string;
  paymentMethod: string;
  paymentStatus: string;
  customerNote?: string;
  cancellationReason?: string;
  phone?: string;
  isPreOrder?: boolean;
}

const VendorOrders = () => {
  const [selectedCanteen, setSelectedCanteen] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("time");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { addNotification } = useNotification();
  const { user } = useUserStore();
  const currentUserId = user?.id || '';

  // Get orders for the selected canteen
  const { loading: ordersLoading, error: ordersError, data: ordersData, refetch: refetchOrders } = useQuery(GET_CANTEEN_ORDERS, {
    variables: { canteenId: selectedCanteen },
    fetchPolicy: 'network-only',
  });

  // Get menu items for the selected canteen
  const { loading: menuItemsLoading, error: menuItemsError, data: menuItemsData } = useQuery(GET_MENU_ITEMS_BY_CANTEEN, {
    variables: { canteenId: selectedCanteen },
    fetchPolicy: 'network-only',
  });

  // Get all canteens for selection
  const { data: canteenData } = useQuery(GET_CANTEENS, { fetchPolicy: 'cache-first' });
  const allCanteens = canteenData?.getAllCanteens || [];

  // Update order status mutation
  const [updateOrderStatus, { loading: updatingStatus }] = useMutation(UPDATE_ORDER_STATUS);

  // Store all menu items for lookup
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  // Update menu items when data changes
  useEffect(() => {
    if (menuItemsData?.getMenuItemsByCanteen) {
      setMenuItems(menuItemsData.getMenuItemsByCanteen);
    }
  }, [menuItemsData]);

  // Update orders when data changes
  useEffect(() => {
    if (ordersData?.getCanteenOrders) {
      setOrders(ordersData.getCanteenOrders);
    }
  }, [ordersData]);

  // Filter orders by selected canteen
  const canteenOrders = orders;

  // Filter by status and search (order ID or customer name)
  const filteredOrders = canteenOrders.filter(order => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch = 
      searchQuery === "" || 
      order.id.toString().includes(searchQuery) || 
      order.userId.toString().includes(searchQuery);
    return matchesStatus && matchesSearch;
  });

  // Sort the filtered orders
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let comparison = 0;
    
    if (sortBy === "time") {
      comparison = new Date(b.orderTime).getTime() - new Date(a.orderTime).getTime();
    } else if (sortBy === "total") {
      comparison = b.totalAmount - a.totalAmount;
    } else if (sortBy === "items") {
      comparison = b.items.reduce((sum, item) => sum + item.quantity, 0) - 
                   a.items.reduce((sum, item) => sum + item.quantity, 0);
    }
    
    return sortOrder === "asc" ? -comparison : comparison;
  });

  // Handle order status update
  const handleUpdateOrderStatus = async (orderId: number, newStatus: string) => {
    // Optimistic update: update local state immediately
    const prevOrders = orders;
    setOrders((cur) => cur.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)));

    try {
      const { data } = await updateOrderStatus({
        variables: {
          orderId,
          status: newStatus,
          currentUserId,
        },
      });

      if (data?.updateOrderStatus?.success) {
        addNotification({
          title: 'Order Status Updated',
          description: `Order #${orderId} has been marked as ${newStatus}`,
          type: 'success',
        });

        // refresh to get server canonical timestamps
        refetchOrders();
      } else {
        // revert optimistic update
        setOrders(prevOrders);
        addNotification({
          title: 'Error',
          description: data?.updateOrderStatus?.message || 'Failed to update order status',
          type: 'error',
        });
      }
    } catch (error) {
      // revert optimistic update
      setOrders(prevOrders);
      console.error('Error updating order status:', error);
      addNotification({
        title: 'Error',
        description: 'An error occurred while updating the order status',
        type: 'error',
      });
    }
  };

  // Poll for new orders periodically to keep vendor view fresh
  useEffect(() => {
    const interval = setInterval(() => {
      try {
        refetchOrders();
      } catch (e) {
        // ignore polling errors
      }
    }, 10000); // every 10s

    return () => clearInterval(interval);
  }, [refetchOrders]);

  // Format date function (IST)
  const formatDate = (dateString: string) => {
    return formatIST(dateString, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  // Function to find a menu item by its id
  const findMenuItem = (itemId: number): MenuItem | undefined => {
    return menuItems.find(item => Number(item.id) === itemId);
  };

  // Function to calculate items count in an order
  const getItemCount = (order: Order) => {
    return order.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Toggle sort order
  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  // Order status counts
  const statusCounts = {
    all: canteenOrders.length,
    pending: canteenOrders.filter(order => order.status === "pending").length,
    confirmed: canteenOrders.filter(order => order.status === "confirmed").length,
    preparing: canteenOrders.filter(order => order.status === "preparing").length,
    ready: canteenOrders.filter(order => order.status === "ready").length,
    delivered: canteenOrders.filter(order => order.status === "delivered").length,
    cancelled: canteenOrders.filter(order => order.status === "cancelled").length,
  };

  return (
    <VendorLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Order Management</h1>
            <p className="text-muted-foreground">
              View and manage all customer orders
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Select value={selectedCanteen.toString()} onValueChange={(value) => setSelectedCanteen(Number(value))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Canteen" />
              </SelectTrigger>
              <SelectContent>
                {allCanteens.map((canteen) => (
                  <SelectItem key={canteen.id} value={canteen.id.toString()}>
                    {canteen.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by order ID..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time">Order Time</SelectItem>
                <SelectItem value="total">Total Amount</SelectItem>
                <SelectItem value="items">Number of Items</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="icon" onClick={toggleSortOrder}>
              <ArrowUpDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Status Tabs */}
        <Tabs defaultValue="all" value={statusFilter} onValueChange={setStatusFilter}>
          <TabsList className="mb-6">
            <TabsTrigger value="all">
              All Orders {statusCounts.all > 0 && `(${statusCounts.all})`}
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending {statusCounts.pending > 0 && `(${statusCounts.pending})`}
            </TabsTrigger>
            <TabsTrigger value="confirmed">
              Confirmed {statusCounts.confirmed > 0 && `(${statusCounts.confirmed})`}
            </TabsTrigger>
            <TabsTrigger value="preparing">
              Preparing {statusCounts.preparing > 0 && `(${statusCounts.preparing})`}
            </TabsTrigger>
            <TabsTrigger value="ready">
              Ready {statusCounts.ready > 0 && `(${statusCounts.ready})`}
            </TabsTrigger>
            <TabsTrigger value="delivered">
              Delivered {statusCounts.delivered > 0 && `(${statusCounts.delivered})`}
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled {statusCounts.cancelled > 0 && `(${statusCounts.cancelled})`}
            </TabsTrigger>
          </TabsList>

          <TabsContent value={statusFilter}>
            {ordersLoading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
                <p>Loading orders...</p>
              </div>
            ) : ordersError ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <div className="rounded-full bg-red-100 p-3 mb-4">
                    <X className="h-6 w-6 text-red-600" />
                  </div>
                  <h3 className="text-lg font-semibold">Error loading orders</h3>
                  <p className="text-muted-foreground text-center mt-1">
                    There was a problem fetching the orders. Please try again.
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4" 
                    onClick={() => refetchOrders()}
                  >
                    Retry
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {sortedOrders.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <div className="rounded-full bg-muted p-3 mb-4">
                        <Search className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold">No orders found</h3>
                      <p className="text-muted-foreground text-center mt-1">
                        {searchQuery 
                          ? "Try adjusting your search query or filters." 
                          : statusFilter !== "all" 
                          ? `No ${statusFilter} orders at the moment.` 
                          : "No orders have been placed yet."}
                      </p>
                      {statusFilter !== "all" && (
                        <Button variant="link" onClick={() => setStatusFilter("all")}>
                          View all orders
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  sortedOrders.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                          {/* Order information */}
                          <div className="p-4 flex-1">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                              <div>
                                <div className="flex items-center">
                                  <h3 className="font-medium">Order #{order.id}</h3>
                                  <OrderStatusBadge status={order.status} className="ml-2" />
                                </div>
                                <div className="flex items-center text-sm text-muted-foreground mt-1">
                                  <Clock className="h-3.5 w-3.5 mr-1" />
                                  <span>{formatDate(order.orderTime)}</span>
                                  <span className="mx-2">•</span>
                                  <div className="flex items-center">
                                    <User className="h-3.5 w-3.5 mr-1" />
                                    <span>User #{order.userId}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <Badge className="mr-2">
                                  {getItemCount(order)} items
                                </Badge>
                                <Badge>
                                  ₹{order.totalAmount.toFixed(2)}
                                </Badge>
                              </div>
                            </div>

                            <Separator className="my-3" />

                            {/* Order items */}
                            <div className="space-y-2">
                              {order.items.map((item, index) => {
                                const menuItem = findMenuItem(item.itemId);
                                return (
                                  <div key={`${order.id}-${item.itemId}-${index}`} className="flex justify-between text-sm">
                                    <div>
                                      <span className="font-medium">{item.quantity}×</span>{" "}
                                      {menuItem?.name || `Item #${item.itemId}`}
                                      {item.note && (
                                        <p className="text-xs text-muted-foreground ml-5">{item.note}</p>
                                      )}
                                    </div>
                                    <div>₹{menuItem ? (menuItem.price * item.quantity).toFixed(2) : "N/A"}</div>
                                  </div>
                                );
                              })}
                            </div>

                            {/* Payment method */}
                            <div className="mt-3 text-sm">
                              <span className="text-muted-foreground">Payment Method: </span>
                              <span className="font-medium">{order.paymentMethod}</span>
                              <span className="mx-2">•</span>
                              <span className="text-muted-foreground">Status: </span>
                              <span className="font-medium">{order.paymentStatus}</span>
                            </div>

                            {/* Customer notes if available */}
                            {order.customerNote && (
                              <div className="mt-3 p-2 bg-muted rounded-md">
                                <p className="text-xs font-medium">Customer Note:</p>
                                <p className="text-sm">{order.customerNote}</p>
                              </div>
                            )}
                          </div>

                          {/* Actions sidebar */}
                          <div className="bg-gray-50 p-4 md:w-64 flex flex-row md:flex-col md:justify-start items-center gap-2 border-t md:border-t-0 md:border-l">
                            <div className="flex flex-wrap gap-2 w-full">
                              {updatingStatus ? (
                                <Button size="sm" disabled className="w-full">
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Updating...
                                </Button>
                              ) : (
                                <>
                                  {order.status === "pending" && (
                                    <>
                                      <Button 
                                        size="sm" 
                                        className="flex-1"
                                        onClick={() => handleUpdateOrderStatus(order.id, "confirmed")}
                                      >
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Confirm
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        variant="destructive"
                                        className="flex-1"
                                        onClick={() => handleUpdateOrderStatus(order.id, "cancelled")}
                                      >
                                        <X className="h-4 w-4 mr-2" />
                                        Reject
                                      </Button>
                                    </>
                                  )}
                                  
                                  {order.status === "confirmed" && (
                                    <Button 
                                      size="sm" 
                                      className="w-full"
                                      onClick={() => handleUpdateOrderStatus(order.id, "preparing")}
                                    >
                                      <ChefHat className="h-4 w-4 mr-2" />
                                      Start Preparing
                                    </Button>
                                  )}
                                  
                                  {order.status === "preparing" && (
                                    <Button 
                                      size="sm" 
                                      className="w-full"
                                      onClick={() => handleUpdateOrderStatus(order.id, "ready")}
                                    >
                                      <PackageCheck className="h-4 w-4 mr-2" />
                                      Mark Ready
                                    </Button>
                                  )}
                                  
                                  {order.status === "ready" && (
                                    <Button 
                                      size="sm" 
                                      className="w-full"
                                      onClick={() => handleUpdateOrderStatus(order.id, "delivered")}
                                    >
                                      <CheckCircle2 className="h-4 w-4 mr-2" />
                                      Mark Delivered
                                    </Button>
                                  )}
                                </>
                              )}
                              
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="w-full"
                                asChild
                              >
                                <a href={`/vendor/orders/${order.id}`}>
                                  View Details
                                  <ChevronRight className="ml-1 h-4 w-4" />
                                </a>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </VendorLayout>
  );
};

export default VendorOrders;
