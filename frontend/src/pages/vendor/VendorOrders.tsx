
import React, { useState } from "react";
import VendorLayout from "@/components/layout/VendorLayout";
import { orders, menuItems, canteens } from "@/data/mockData";
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
} from "lucide-react";

const VendorOrders = () => {
  const [selectedCanteen, setSelectedCanteen] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("time");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const { addNotification } = useNotification();

  // Filter orders by selected canteen
  const canteenOrders = orders.filter(order => order.canteenId === selectedCanteen);

  // Filter by status and search (order ID or customer name)
  const filteredOrders = canteenOrders.filter(order => {
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch = 
      searchQuery === "" || 
      order.id.toString().includes(searchQuery) || 
      (order.customerName && order.customerName.toLowerCase().includes(searchQuery.toLowerCase()));
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

  // Update order status
  const updateOrderStatus = (orderId: number, newStatus: string) => {
    // In a real app, this would update the status in the database
    console.log(`Updating order ${orderId} to ${newStatus}`);
    
    // Show notification
    addNotification({
      title: "Order Status Updated",
      description: `Order #${orderId} has been marked as ${newStatus}`,
      type: "success",
    });
  };

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Function to find a menu item by its id
  const findMenuItem = (itemId: number) => {
    return menuItems.find(item => item.id === itemId);
  };

  // Function to calculate items count in an order
  const getItemCount = (order: any) => {
    return order.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
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
                {canteens.map((canteen) => (
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
                                <span>{order.customerName || "Guest"}</span>
                              </div>
                            </div>
                            <div className="flex items-center">
                              <Badge variant="outline" className="mr-2">
                                {getItemCount(order)} items
                              </Badge>
                              <Badge variant="secondary">₹{order.totalAmount}</Badge>
                            </div>
                          </div>

                          <Separator className="my-3" />

                          {/* Order items */}
                          <div className="space-y-2">
                            {order.items.map((item: any) => {
                              const menuItem = findMenuItem(item.itemId);
                              return (
                                <div key={item.itemId} className="flex justify-between text-sm">
                                  <div>
                                    <span className="font-medium">{item.quantity}×</span>{" "}
                                    {menuItem?.name || `Item #${item.itemId}`}
                                    {item.note && (
                                      <p className="text-xs text-muted-foreground ml-5">{item.note}</p>
                                    )}
                                  </div>
                                  <div>₹{menuItem ? (menuItem.price * item.quantity) : 0}</div>
                                </div>
                              );
                            })}
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
                            {order.status === "pending" && (
                              <>
                                <Button 
                                  size="sm" 
                                  className="flex-1"
                                  onClick={() => updateOrderStatus(order.id, "confirmed")}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Confirm
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  className="flex-1"
                                  onClick={() => updateOrderStatus(order.id, "cancelled")}
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
                                onClick={() => updateOrderStatus(order.id, "preparing")}
                              >
                                <ChefHat className="h-4 w-4 mr-2" />
                                Start Preparing
                              </Button>
                            )}
                            
                            {order.status === "preparing" && (
                              <Button 
                                size="sm" 
                                className="w-full"
                                onClick={() => updateOrderStatus(order.id, "ready")}
                              >
                                <PackageCheck className="h-4 w-4 mr-2" />
                                Mark Ready
                              </Button>
                            )}
                            
                            {order.status === "ready" && (
                              <Button 
                                size="sm" 
                                className="w-full"
                                onClick={() => updateOrderStatus(order.id, "delivered")}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Mark Delivered
                              </Button>
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
          </TabsContent>
        </Tabs>
      </div>
    </VendorLayout>
  );
};

export default VendorOrders;
