
import React, { useState } from "react";
import VendorLayout from "@/components/layout/VendorLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useNotification } from "@/contexts/NotificationContext";
import { canteens } from "@/data/mockData";
import {
  Calendar,
  Clock,
  Search,
  Filter,
  Plus,
  User,
  Users,
  Building,
  CheckCircle,
  XCircle,
  AlertTriangle,
  CalendarRange,
  FileText,
} from "lucide-react";

// Sample bulk orders data (in a real app, this would come from the backend)
const bulkOrders = [
  {
    id: 5001,
    name: "Computer Science Department Meeting",
    organizer: "Prof. Sharma",
    contactPhone: "9876543210",
    contactEmail: "sharma@example.edu",
    date: "2025-04-22",
    time: "13:00",
    numberOfPeople: 25,
    status: "confirmed",
    canteenId: 1,
    totalAmount: 6250,
    advancePayment: 3000,
    paymentStatus: "Partial",
    paymentMethod: "Bank Transfer",
    specialInstructions: "Need vegetarian options for 10 people. Please deliver to Conference Room A.",
    items: [
      { name: "Veg Biryani", quantity: 10, price: 150 },
      { name: "Chicken Biryani", quantity: 15, price: 200 },
      { name: "Gulab Jamun", quantity: 25, price: 30 },
      { name: "Soft Drinks", quantity: 25, price: 20 },
    ],
    createdAt: "2025-04-15T10:30:00Z",
  },
  {
    id: 5002,
    name: "Annual College Fest Committee",
    organizer: "Student Council",
    contactPhone: "9876543211",
    contactEmail: "studentcouncil@example.edu",
    date: "2025-04-25",
    time: "11:30",
    numberOfPeople: 40,
    status: "pending",
    canteenId: 1,
    totalAmount: 10000,
    advancePayment: 0,
    paymentStatus: "Unpaid",
    paymentMethod: "Pending",
    specialInstructions: "Need both veg and non-veg options. Will confirm final count 2 days before.",
    items: [
      { name: "Veg Thali", quantity: 15, price: 180 },
      { name: "Non-Veg Thali", quantity: 25, price: 250 },
      { name: "Ice Cream", quantity: 40, price: 40 },
    ],
    createdAt: "2025-04-16T14:45:00Z",
  },
  {
    id: 5003,
    name: "Faculty Development Program",
    organizer: "Academic Affairs",
    contactPhone: "9876543212",
    contactEmail: "academic@example.edu",
    date: "2025-04-30",
    time: "09:00",
    numberOfPeople: 35,
    status: "cancelled",
    canteenId: 2,
    totalAmount: 8750,
    advancePayment: 4000,
    paymentStatus: "Refunded",
    paymentMethod: "Credit Card",
    specialInstructions: "Cancelled due to scheduling conflict.",
    items: [
      { name: "Continental Breakfast", quantity: 35, price: 150 },
      { name: "Coffee/Tea", quantity: 35, price: 30 },
      { name: "Lunch Buffet", quantity: 35, price: 220 },
    ],
    createdAt: "2025-04-10T09:15:00Z",
    cancellationReason: "Event postponed due to unforeseen circumstances",
  },
  {
    id: 5004,
    name: "Engineering Project Showcase",
    organizer: "Engineering Department",
    contactPhone: "9876543213",
    contactEmail: "engineering@example.edu",
    date: "2025-05-05",
    time: "14:00",
    numberOfPeople: 60,
    status: "confirmed",
    canteenId: 1,
    totalAmount: 15000,
    advancePayment: 15000,
    paymentStatus: "Paid",
    paymentMethod: "Bank Transfer",
    specialInstructions: "Need high tea arrangement with snacks. Setup in the Engineering Block lobby.",
    items: [
      { name: "Assorted Sandwiches", quantity: 60, price: 80 },
      { name: "Samosas", quantity: 120, price: 15 },
      { name: "Pastries", quantity: 60, price: 40 },
      { name: "Coffee/Tea", quantity: 60, price: 30 },
      { name: "Soft Drinks", quantity: 60, price: 25 },
    ],
    createdAt: "2025-04-20T11:20:00Z",
  },
  {
    id: 5005,
    name: "Hostel Freshers' Party",
    organizer: "Hostel Committee",
    contactPhone: "9876543214",
    contactEmail: "hostel@example.edu",
    date: "2025-05-10",
    time: "19:00",
    numberOfPeople: 100,
    status: "preparing",
    canteenId: 3,
    totalAmount: 30000,
    advancePayment: 15000,
    paymentStatus: "Partial",
    paymentMethod: "UPI",
    specialInstructions: "Need both veg and non-veg dinner options. Setup in Hostel Lawn area.",
    items: [
      { name: "Veg Starter Platter", quantity: 40, price: 100 },
      { name: "Non-Veg Starter Platter", quantity: 60, price: 120 },
      { name: "Main Course Veg", quantity: 40, price: 150 },
      { name: "Main Course Non-Veg", quantity: 60, price: 180 },
      { name: "Dessert Assortment", quantity: 100, price: 60 },
      { name: "Soft Drinks", quantity: 100, price: 20 },
    ],
    createdAt: "2025-04-25T13:40:00Z",
  },
];

const VendorBulkOrders = () => {
  const [selectedCanteen, setSelectedCanteen] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showNewOrderDialog, setShowNewOrderDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const { addNotification } = useNotification();

  // Filter orders by canteen and status
  const filteredOrders = bulkOrders.filter(order => {
    const matchesCanteen = order.canteenId === selectedCanteen;
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesSearch = 
      searchQuery === "" || 
      order.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.organizer.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCanteen && matchesStatus && matchesSearch;
  });

  // Group orders by date for the upcoming tab
  const upcomingOrders = [...filteredOrders]
    .filter(order => ["confirmed", "preparing"].includes(order.status))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Handle status update
  const updateOrderStatus = (orderId: number, newStatus: string) => {
    // In a real app, this would update the database
    console.log(`Updating order ${orderId} to ${newStatus}`);
    
    addNotification({
      title: "Bulk Order Updated",
      description: `Order #${orderId} has been marked as ${newStatus}`,
      type: "success",
    });
  };

  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Handle viewing order details
  const viewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setShowDetailDialog(true);
  };

  // Count orders by status
  const statusCounts = {
    all: filteredOrders.length,
    pending: filteredOrders.filter(order => order.status === "pending").length,
    confirmed: filteredOrders.filter(order => order.status === "confirmed").length,
    preparing: filteredOrders.filter(order => order.status === "preparing").length,
    completed: filteredOrders.filter(order => order.status === "completed").length,
    cancelled: filteredOrders.filter(order => order.status === "cancelled").length,
  };

  // Calculate totals for order
  const calculateTotal = (items: any[]) => {
    return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pending</Badge>;
      case "confirmed":
        return <Badge variant="secondary">Confirmed</Badge>;
      case "preparing":
        return <Badge variant="default">Preparing</Badge>;
      case "completed":
        return <Badge variant="success">Completed</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <VendorLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Bulk Order Management</h1>
            <p className="text-muted-foreground">
              Manage group orders, events, and catering requests
            </p>
          </div>
          <div className="mt-4 md:mt-0 flex items-center gap-3">
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
            <Button onClick={() => setShowNewOrderDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Bulk Order
            </Button>
          </div>
        </div>

        {/* Search and filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by event or organizer..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs for different status filters */}
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
            <TabsTrigger value="completed">
              Completed {statusCounts.completed > 0 && `(${statusCounts.completed})`}
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled {statusCounts.cancelled > 0 && `(${statusCounts.cancelled})`}
            </TabsTrigger>
          </TabsList>

          {/* All orders tab */}
          <TabsContent value={statusFilter}>
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <div className="rounded-full bg-muted p-3 mb-4">
                      <Search className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No bulk orders found</h3>
                    <p className="text-muted-foreground text-center mt-1">
                      {searchQuery 
                        ? "Try adjusting your search query or filters." 
                        : statusFilter !== "all" 
                        ? `No ${statusFilter} bulk orders at the moment.` 
                        : "No bulk orders have been placed yet."}
                    </p>
                    {statusFilter !== "all" && (
                      <Button variant="link" onClick={() => setStatusFilter("all")}>
                        View all orders
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                filteredOrders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {/* Order information */}
                        <div className="p-4 flex-1">
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2">
                            <div>
                              <h3 className="font-medium">{order.name}</h3>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                <span>{formatDate(order.date)}, {order.time}</span>
                                <span className="mx-2">•</span>
                                <Users className="h-3.5 w-3.5 mr-1" />
                                <span>{order.numberOfPeople} people</span>
                              </div>
                            </div>
                            <div className="mt-2 sm:mt-0 flex items-center">
                              {getStatusBadge(order.status)}
                              <Badge variant="outline" className="ml-2">₹{order.totalAmount}</Badge>
                              <Badge 
                                variant={
                                  order.paymentStatus === "Paid" 
                                    ? "success" 
                                    : order.paymentStatus === "Partial" 
                                    ? "warning" 
                                    : "destructive"
                                } 
                                className="ml-2"
                              >
                                {order.paymentStatus}
                              </Badge>
                            </div>
                          </div>
                          
                          <Separator className="my-3" />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div>
                              <p className="text-sm font-medium">Organizer:</p>
                              <div className="flex items-center text-sm">
                                <User className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                <span>{order.organizer}</span>
                              </div>
                              <div className="flex items-center text-sm mt-1">
                                <Building className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                                <span>{canteens.find(c => c.id === order.canteenId)?.name || 'Unknown Canteen'}</span>
                              </div>
                            </div>
                            
                            <div>
                              <p className="text-sm font-medium">Items Summary:</p>
                              <ul className="text-sm">
                                {order.items.slice(0, 3).map((item: any, index: number) => (
                                  <li key={index} className="flex justify-between">
                                    <span>{item.quantity} × {item.name}</span>
                                    <span>₹{item.price * item.quantity}</span>
                                  </li>
                                ))}
                                {order.items.length > 3 && (
                                  <li className="text-xs text-muted-foreground">
                                    + {order.items.length - 3} more items
                                  </li>
                                )}
                              </ul>
                            </div>
                          </div>
                          
                          {order.specialInstructions && (
                            <div className="bg-muted p-2 rounded-md text-sm mb-3">
                              <p className="font-medium">Special Instructions:</p>
                              <p className="text-muted-foreground">
                                {order.specialInstructions.length > 100 
                                  ? `${order.specialInstructions.substring(0, 100)}...` 
                                  : order.specialInstructions}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        {/* Actions sidebar */}
                        <div className="bg-gray-50 p-4 md:w-56 flex flex-row md:flex-col items-center justify-end md:justify-start gap-2 border-t md:border-t-0 md:border-l">
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => viewOrderDetails(order)}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            View Details
                          </Button>
                          
                          {order.status === "pending" && (
                            <>
                              <Button 
                                variant="default" 
                                className="w-full"
                                onClick={() => updateOrderStatus(order.id, "confirmed")}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirm
                              </Button>
                              <Button 
                                variant="destructive" 
                                className="w-full"
                                onClick={() => updateOrderStatus(order.id, "cancelled")}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </>
                          )}
                          
                          {order.status === "confirmed" && (
                            <Button 
                              variant="default" 
                              className="w-full"
                              onClick={() => updateOrderStatus(order.id, "preparing")}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Start Preparing
                            </Button>
                          )}
                          
                          {order.status === "preparing" && (
                            <Button 
                              variant="default" 
                              className="w-full"
                              onClick={() => updateOrderStatus(order.id, "completed")}
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark Completed
                            </Button>
                          )}
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

      {/* New Bulk Order Dialog */}
      <Dialog open={showNewOrderDialog} onOpenChange={setShowNewOrderDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Create New Bulk Order</DialogTitle>
            <DialogDescription>
              Enter the details for the new bulk order or catering request.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="event-name">Event Name</Label>
                <Input id="event-name" placeholder="e.g., Department Meeting" />
              </div>
              
              <div>
                <Label htmlFor="organizer">Organizer/Department</Label>
                <Input id="organizer" placeholder="e.g., Computer Science Dept." />
              </div>
              
              <div>
                <Label htmlFor="people-count">Number of People</Label>
                <Input id="people-count" type="number" min="1" />
              </div>
              
              <div>
                <Label htmlFor="event-date">Event Date</Label>
                <Input id="event-date" type="date" />
              </div>
              
              <div>
                <Label htmlFor="event-time">Event Time</Label>
                <Input id="event-time" type="time" />
              </div>
              
              <div>
                <Label htmlFor="contact-name">Contact Person</Label>
                <Input id="contact-name" placeholder="Full Name" />
              </div>
              
              <div>
                <Label htmlFor="contact-phone">Contact Phone</Label>
                <Input id="contact-phone" placeholder="Phone Number" />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="items">Food Items (add details)</Label>
                <Textarea 
                  id="items" 
                  placeholder="List items and quantities, e.g., 20 Veg Sandwiches, 30 bottles of water, etc."
                  rows={3}
                />
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="special-instructions">Special Instructions</Label>
                <Textarea 
                  id="special-instructions" 
                  placeholder="Any dietary requirements, delivery instructions, or other special requests"
                  rows={3}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewOrderDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              addNotification({
                title: "Bulk Order Created",
                description: "The new bulk order has been created successfully.",
                type: "success",
              });
              setShowNewOrderDialog(false);
            }}>
              Create Order
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Order Details Dialog */}
      {selectedOrder && (
        <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Bulk Order Details</DialogTitle>
              <DialogDescription>
                Complete information for bulk order #{selectedOrder.id}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto pr-2">
              {/* Order header */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-lg">{selectedOrder.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    <span>{formatDate(selectedOrder.date)}, {selectedOrder.time}</span>
                  </div>
                </div>
                <div>
                  {getStatusBadge(selectedOrder.status)}
                </div>
              </div>
              
              <Separator />
              
              {/* Order details in grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Organizer</p>
                  <p>{selectedOrder.organizer}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Number of People</p>
                  <p>{selectedOrder.numberOfPeople}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Contact Email</p>
                  <p>{selectedOrder.contactEmail}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Contact Phone</p>
                  <p>{selectedOrder.contactPhone}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Canteen</p>
                  <p>{canteens.find(c => c.id === selectedOrder.canteenId)?.name || 'Unknown Canteen'}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Created On</p>
                  <p>{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              
              <Separator />
              
              {/* Order items */}
              <div>
                <h4 className="font-medium mb-2">Order Items</h4>
                <div className="bg-muted rounded-md overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-muted-foreground/10">
                        <th className="text-left p-2">Item</th>
                        <th className="text-center p-2">Qty</th>
                        <th className="text-right p-2">Price</th>
                        <th className="text-right p-2">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items.map((item: any, index: number) => (
                        <tr key={index} className="border-t border-border">
                          <td className="p-2">{item.name}</td>
                          <td className="text-center p-2">{item.quantity}</td>
                          <td className="text-right p-2">₹{item.price}</td>
                          <td className="text-right p-2">₹{item.price * item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-border font-medium">
                        <td colSpan={3} className="text-right p-2">Total</td>
                        <td className="text-right p-2">₹{selectedOrder.totalAmount}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              
              {/* Payment information */}
              <div>
                <h4 className="font-medium mb-2">Payment Information</h4>
                <div className="bg-muted p-3 rounded-md">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm font-medium">Payment Status</p>
                      <p>{selectedOrder.paymentStatus}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Payment Method</p>
                      <p>{selectedOrder.paymentMethod}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total Amount</p>
                      <p>₹{selectedOrder.totalAmount}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Advance Payment</p>
                      <p>₹{selectedOrder.advancePayment}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Balance Due</p>
                      <p>₹{selectedOrder.totalAmount - selectedOrder.advancePayment}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Special instructions */}
              {selectedOrder.specialInstructions && (
                <div>
                  <h4 className="font-medium mb-2">Special Instructions</h4>
                  <div className="bg-muted p-3 rounded-md">
                    <p>{selectedOrder.specialInstructions}</p>
                  </div>
                </div>
              )}
              
              {/* Cancellation reason if cancelled */}
              {selectedOrder.status === "cancelled" && selectedOrder.cancellationReason && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Cancellation Reason</AlertTitle>
                  <AlertDescription>
                    {selectedOrder.cancellationReason}
                  </AlertDescription>
                </Alert>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDetailDialog(false)}>
                Close
              </Button>
              {selectedOrder.status === "pending" && (
                <>
                  <Button 
                    variant="default"
                    onClick={() => {
                      updateOrderStatus(selectedOrder.id, "confirmed");
                      setShowDetailDialog(false);
                    }}
                  >
                    Confirm Order
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </VendorLayout>
  );
};

export default VendorBulkOrders;
