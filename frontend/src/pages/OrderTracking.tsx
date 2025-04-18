
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { orders, canteens, menuItems } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import OrderStatusBadge from '@/components/order/OrderStatusBadge';
import { Separator } from '@/components/ui/separator';
import { useNotification } from '@/contexts/NotificationContext';
import {
  ArrowLeft,
  Clock,
  ChefHat,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  PhoneCall,
  Calendar,
  MapPin,
} from 'lucide-react';

const OrderTracking = () => {
  const { id } = useParams<{ id: string }>();
  const { addNotification } = useNotification();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Convert string ID to number for comparison
  const numericId = id ? parseInt(id, 10) : 0;
  
  // Find the order by id
  const order = orders.find(o => o.id === numericId);
  
  // Find canteen for this order
  const canteen = order ? canteens.find(c => c.id === order.canteenId) : null;
  
  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Calculate estimated time remaining
  const getEstimatedTime = () => {
    if (!order) return null;
    
    // In a real app, this would be based on the order status and preparation time
    switch (order.status) {
      case "pending":
        return "10-15 minutes";
      case "confirmed":
        return "8-12 minutes";
      case "preparing":
        return "5-8 minutes";
      case "ready":
        return "Ready for pickup";
      case "delivered":
        return "Completed";
      case "cancelled":
        return "Cancelled";
      default:
        return "Unknown";
    }
  };
  
  // Format time function
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
  // Function to contact canteen
  const handleContactCanteen = () => {
    // In a real app, this might initiate a call or chat
    addNotification({
      title: "Contact Initiated",
      description: `You're contacting ${canteen?.name}. Please wait for a response.`,
      type: "info",
    });
  };
  
  if (!order) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Order Not Found</h1>
          <p className="text-gray-500 mb-6">The order you're looking for doesn't exist or may have been deleted.</p>
          <Button asChild>
            <Link to="/orders">Back to Orders</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link to="/orders">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Track Order #{order.id}</h1>
          <OrderStatusBadge status={order.status} className="ml-4" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order status and tracking */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Order Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-500">Order Placed</p>
                  <p className="font-medium">{formatTime(order.orderTime)}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Current Status</p>
                  <OrderStatusBadge status={order.status} />
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Estimated Time</p>
                  <p className="font-medium">{getEstimatedTime()}</p>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Current Time</p>
                  <p className="font-medium">
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
              
              {/* Progress tracker */}
              <div className="space-y-8 mt-8">
                <div className="relative">
                  {/* Progress line */}
                  <div className="absolute left-[15px] top-0 h-full w-[2px] bg-gray-200" />
                  
                  {/* Order placed */}
                  <div className="flex relative mb-8">
                    <div className="rounded-full h-8 w-8 flex items-center justify-center bg-green-500 z-10">
                      <CheckCircle className="h-5 w-5 text-white" />
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium">Order Placed</h3>
                      <p className="text-sm text-gray-500">{formatTime(order.orderTime)}</p>
                      <p className="text-sm mt-1">Your order has been received by the canteen.</p>
                    </div>
                  </div>
                  
                  {/* Order confirmed */}
                  <div className="flex relative mb-8">
                    <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                      ["confirmed", "preparing", "ready", "delivered"].includes(order.status) 
                        ? "bg-green-500" 
                        : order.status === "cancelled" 
                        ? "bg-red-500" 
                        : "bg-gray-200"
                    } z-10`}>
                      {order.status === "cancelled" ? (
                        <XCircle className="h-5 w-5 text-white" />
                      ) : ["confirmed", "preparing", "ready", "delivered"].includes(order.status) ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium">
                        {order.status === "cancelled" ? "Order Cancelled" : "Order Confirmed"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {order.confirmedTime ? formatTime(order.confirmedTime) : "Awaiting confirmation"}
                      </p>
                      <p className="text-sm mt-1">
                        {order.status === "cancelled" 
                          ? order.cancellationReason || "Your order has been cancelled."
                          : ["confirmed", "preparing", "ready", "delivered"].includes(order.status)
                          ? "Your order has been confirmed and is being processed."
                          : "The canteen is reviewing your order."}
                      </p>
                    </div>
                  </div>
                  
                  {/* Preparing */}
                  {order.status !== "cancelled" && (
                    <div className="flex relative mb-8">
                      <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                        ["preparing", "ready", "delivered"].includes(order.status) 
                          ? "bg-green-500" 
                          : "bg-gray-200"
                      } z-10`}>
                        {["preparing", "ready", "delivered"].includes(order.status) ? (
                          <ChefHat className="h-5 w-5 text-white" />
                        ) : (
                          <ChefHat className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium">Preparing Your Order</h3>
                        <p className="text-sm text-gray-500">
                          {order.preparingTime ? formatTime(order.preparingTime) : "Not started yet"}
                        </p>
                        <p className="text-sm mt-1">
                          {["preparing", "ready", "delivered"].includes(order.status)
                            ? "Your food is being prepared in the kitchen."
                            : "Waiting to start preparation."}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Ready for pickup */}
                  {order.status !== "cancelled" && (
                    <div className="flex relative mb-8">
                      <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                        ["ready", "delivered"].includes(order.status) ? "bg-green-500" : "bg-gray-200"
                      } z-10`}>
                        {["ready", "delivered"].includes(order.status) ? (
                          <Package className="h-5 w-5 text-white" />
                        ) : (
                          <Package className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium">Ready for Pickup</h3>
                        <p className="text-sm text-gray-500">
                          {order.readyTime ? formatTime(order.readyTime) : "Not ready yet"}
                        </p>
                        <p className="text-sm mt-1">
                          {["ready", "delivered"].includes(order.status)
                            ? "Your order is ready! Please proceed to the pickup counter."
                            : "Your order is still being prepared."}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {/* Delivered */}
                  {order.status !== "cancelled" && (
                    <div className="flex relative">
                      <div className={`rounded-full h-8 w-8 flex items-center justify-center ${
                        order.status === "delivered" ? "bg-green-500" : "bg-gray-200"
                      } z-10`}>
                        {order.status === "delivered" ? (
                          <CheckCircle className="h-5 w-5 text-white" />
                        ) : (
                          <Truck className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium">Order Completed</h3>
                        <p className="text-sm text-gray-500">
                          {order.deliveryTime ? formatTime(order.deliveryTime) : "Pending delivery"}
                        </p>
                        <p className="text-sm mt-1">
                          {order.status === "delivered"
                            ? "You have received your order. Enjoy your meal!"
                            : "Waiting for you to pick up your order."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Order summary and actions */}
          <div className="space-y-6">
            {/* Order summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Order items (limited to 3 for display) */}
                  <div>
                    {order.items.slice(0, 3).map((item, index) => {
                      const menuItem = menuItems.find(m => m.id === item.itemId);
                      return (
                        <div key={index} className="flex justify-between py-1">
                          <span>
                            {item.quantity} × {menuItem?.name || `Item #${item.itemId}`}
                          </span>
                          <span>₹{menuItem ? item.quantity * menuItem.price : 0}</span>
                        </div>
                      );
                    })}
                    
                    {order.items.length > 3 && (
                      <div className="text-sm text-gray-500 mt-1">
                        +{order.items.length - 3} more items
                      </div>
                    )}
                  </div>
                  
                  <Separator />
                  
                  {/* Order total */}
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>₹{order.totalAmount}</span>
                  </div>
                  
                  {/* Payment info */}
                  <div className="text-sm bg-gray-50 p-2 rounded">
                    <div className="flex justify-between">
                      <span>Payment Method</span>
                      <span>{order.paymentMethod || "Cash"}</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Payment Status</span>
                      <Badge variant={order.paymentStatus === "Paid" ? "success" : "outline"}>
                        {order.paymentStatus || "Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <Link to={`/orders/${order.id}`}>
                      View Order Details
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Canteen information */}
            <Card>
              <CardHeader>
                <CardTitle>Pickup Location</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <MapPin className="h-4 w-4 mr-2 mt-1 text-gray-500" />
                    <div>
                      <p className="font-medium">{canteen?.name || "Unknown Canteen"}</p>
                      <p className="text-sm text-gray-500">
                        {canteen?.location || "No location information"}
                      </p>
                    </div>
                  </div>
                  
                  {order.pickupTime && (
                    <div className="flex items-start">
                      <Calendar className="h-4 w-4 mr-2 mt-1 text-gray-500" />
                      <div>
                        <p className="font-medium">Scheduled Pickup</p>
                        <p className="text-sm text-gray-500">
                          {new Date(order.pickupTime).toLocaleString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-2" 
                    onClick={handleContactCanteen}
                  >
                    <PhoneCall className="h-4 w-4 mr-2" />
                    Contact Canteen
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default OrderTracking;
