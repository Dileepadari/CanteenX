
import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import MainLayout from '@/components/layout/MainLayout';
import { orders, menuItems, canteens } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import OrderStatusBadge from '@/components/order/OrderStatusBadge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useNotification } from '@/contexts/NotificationContext';
import { Star } from 'lucide-react';
import {
  ArrowLeft,
  Clock,
  MapPin,
  Phone,
  User,
  Receipt,
  MessageSquare,
  AlertTriangle,
  Calendar,
  Repeat,
  CheckCircle,
  XCircle,
} from 'lucide-react';

const OrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [isComplaintDialogOpen, setIsComplaintDialogOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const { addNotification } = useNotification();
  const navigate = useNavigate();
  
  // Find the order by id - convert string ID to number
  const numericId = id ? parseInt(id, 10) : 0;
  const order = orders.find(o => o.id === numericId);
  
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
  
  // Find canteen for this order
  const canteen = canteens.find(c => c.id === order.canteenId);
  
  // Calculate order totals
  const subtotal = order.items.reduce((sum, item) => {
    const menuItem = menuItems.find(m => m.id === item.itemId);
    return sum + (menuItem ? menuItem.price * item.quantity : 0);
  }, 0);
  
  // Format date function
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };
  
  // Format time function
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
  // Handle review submission
  const handleReviewSubmit = () => {
    // In a real app, this would save the review to the database
    console.log("Submitting review:", { orderId: order.id, rating, reviewText });
    
    addNotification({
      title: "Review Submitted",
      description: `Thank you for your ${rating}-star review!`,
      type: "success",
    });
    
    setReviewText('');
    setRating(0);
    setIsReviewDialogOpen(false);
  };
  
  // Handle complaint submission
  const handleComplaintSubmit = () => {
    // In a real app, this would save the complaint to the database
    console.log("Submitting complaint:", { orderId: order.id, complaintText });
    
    addNotification({
      title: "Complaint Registered",
      description: "Your complaint has been registered. We'll get back to you soon.",
      type: "info",
    });
    
    setComplaintText('');
    setIsComplaintDialogOpen(false);
  };
  
  // Handle reorder
  const handleReorder = () => {
    // In a real implementation, this would copy the order items to the cart
    addNotification({
      title: "Order Added to Cart",
      description: "Items from this order have been added to your cart.",
      type: "success",
      action: {
        text: "View Cart",
        onClick: () => navigate("/menu")
      }
    });
  };
  
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
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
          <OrderStatusBadge status={order.status} className="ml-4" />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order details card */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Order information */}
              <div className="flex flex-col md:flex-row md:items-center justify-between">
                <div className="flex items-center text-sm text-gray-500 mb-2 md:mb-0">
                  <Clock className="h-4 w-4 mr-2" />
                  <span>{formatDate(order.orderTime)}, {formatTime(order.orderTime)}</span>
                </div>
                
                <div className="flex items-center text-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span>
                    {order.pickupTime 
                      ? `Scheduled Pickup: ${formatDate(order.pickupTime)}, ${formatTime(order.pickupTime)}` 
                      : "Regular Order"}
                  </span>
                </div>
              </div>
              
              <Separator />
              
              {/* Order items */}
              <div>
                <h3 className="font-medium mb-4">Order Items</h3>
                <div className="space-y-4">
                  {order.items.map((item) => {
                    const menuItem = menuItems.find(m => m.id === item.itemId);
                    return (
                      <div key={item.itemId} className="flex justify-between">
                        <div>
                          <div className="flex items-start">
                            <span className="font-medium mr-2">{item.quantity}×</span>
                            <div>
                              <p>{menuItem?.name || `Item #${item.itemId}`}</p>
                              {item.customizations && item.customizations.length > 0 && (
                                <div className="text-sm text-gray-500 mt-1">
                                  {item.customizations.map((customization, index) => (
                                    <p key={index}>{typeof customization === 'string' ? customization : `Option ${customization}`}</p>
                                  ))}
                                </div>
                              )}
                              {item.note && (
                                <p className="text-sm italic text-gray-500 mt-1">"{item.note}"</p>
                              )}
                            </div>
                          </div>
                        </div>
                        <span className="font-medium">
                          ₹{menuItem ? (menuItem.price * item.quantity) : 0}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
              
              <Separator />
              
              {/* Order summary */}
              <div>
                <h3 className="font-medium mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Delivery Fee</span>
                    <span>₹0.00</span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Discount</span>
                      <span>-₹{order.discount}</span>
                    </div>
                  )}
                  <Separator className="my-2" />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>₹{order.totalAmount}</span>
                  </div>
                </div>
              </div>
              
              {/* Payment information */}
              <div>
                <h3 className="font-medium mb-2">Payment Information</h3>
                <div className="bg-gray-50 p-3 rounded-md">
                  <div className="flex justify-between text-sm">
                    <span>Payment Method</span>
                    <span>{order.paymentMethod || "Cash"}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span>Payment Status</span>
                    <Badge variant={order.paymentStatus === "Paid" ? "success" : "outline"}>
                      {order.paymentStatus || "Pending"}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Special instructions if any */}
              {order.customerNote && (
                <div>
                  <h3 className="font-medium mb-2">Special Instructions</h3>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm italic">"{order.customerNote}"</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Sidebar with additional info and actions */}
          <div className="space-y-6">
            {/* Canteen information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Canteen Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500" />
                  <div>
                    <p className="font-medium">{canteen?.name || "Unknown Canteen"}</p>
                    <p className="text-sm text-gray-500">{canteen?.location || "No location information"}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <p className="text-sm">{canteen?.phone || "No contact number"}</p>
                </div>
                
                <Button variant="outline" size="sm" className="w-full" asChild>
                  <Link to={`/canteen/${canteen?.id}`}>
                    View Canteen
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            {/* Order status tracking */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="relative flex flex-col pb-5">
                    <div className={`absolute left-2.5 top-2.5 h-full w-px bg-gray-200 ${order.status !== "cancelled" ? "" : "bg-red-200"}`} />
                    
                    <div className="flex items-center mb-4 relative">
                      <div className={`rounded-full h-5 w-5 flex items-center justify-center ${order.status === "cancelled" ? "bg-red-500" : "bg-green-500"} z-10`}>
                        <Check className="h-3 w-3 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="font-medium">Order Placed</p>
                        <p className="text-xs text-gray-500">{formatDate(order.orderTime)}, {formatTime(order.orderTime)}</p>
                      </div>
                    </div>
                    
                    {order.status !== "cancelled" ? (
                      <>
                        <div className="flex items-center mb-4 relative">
                          <div className={`rounded-full h-5 w-5 flex items-center justify-center ${["confirmed", "preparing", "ready", "delivered"].includes(order.status) ? "bg-green-500" : "bg-gray-200"} z-10`}>
                            {["confirmed", "preparing", "ready", "delivered"].includes(order.status) && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <div className="ml-4">
                            <p className={`font-medium ${["confirmed", "preparing", "ready", "delivered"].includes(order.status) ? "" : "text-gray-500"}`}>
                              Order Confirmed
                            </p>
                            {order.confirmedTime && (
                              <p className="text-xs text-gray-500">{formatDate(order.confirmedTime)}, {formatTime(order.confirmedTime)}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center mb-4 relative">
                          <div className={`rounded-full h-5 w-5 flex items-center justify-center ${["preparing", "ready", "delivered"].includes(order.status) ? "bg-green-500" : "bg-gray-200"} z-10`}>
                            {["preparing", "ready", "delivered"].includes(order.status) && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <div className="ml-4">
                            <p className={`font-medium ${["preparing", "ready", "delivered"].includes(order.status) ? "" : "text-gray-500"}`}>
                              Preparing
                            </p>
                            {order.preparingTime && (
                              <p className="text-xs text-gray-500">{formatDate(order.preparingTime)}, {formatTime(order.preparingTime)}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center mb-4 relative">
                          <div className={`rounded-full h-5 w-5 flex items-center justify-center ${["ready", "delivered"].includes(order.status) ? "bg-green-500" : "bg-gray-200"} z-10`}>
                            {["ready", "delivered"].includes(order.status) && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <div className="ml-4">
                            <p className={`font-medium ${["ready", "delivered"].includes(order.status) ? "" : "text-gray-500"}`}>
                              Ready for Pickup
                            </p>
                            {order.readyTime && (
                              <p className="text-xs text-gray-500">{formatDate(order.readyTime)}, {formatTime(order.readyTime)}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center relative">
                          <div className={`rounded-full h-5 w-5 flex items-center justify-center ${order.status === "delivered" ? "bg-green-500" : "bg-gray-200"} z-10`}>
                            {order.status === "delivered" && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <div className="ml-4">
                            <p className={`font-medium ${order.status === "delivered" ? "" : "text-gray-500"}`}>
                              Delivered
                            </p>
                            {order.deliveryTime && (
                              <p className="text-xs text-gray-500">{formatDate(order.deliveryTime)}, {formatTime(order.deliveryTime)}</p>
                            )}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center relative">
                        <div className="rounded-full h-5 w-5 flex items-center justify-center bg-red-500 z-10">
                          <X className="h-3 w-3 text-white" />
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-red-600">Order Cancelled</p>
                          {order.cancelledTime && (
                            <p className="text-xs text-gray-500">{formatDate(order.cancelledTime)}, {formatTime(order.cancelledTime)}</p>
                          )}
                          {order.cancellationReason && (
                            <p className="text-xs text-red-500 mt-1">Reason: {order.cancellationReason}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Action buttons */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {order.status === "delivered" && (
                  <Button 
                    variant="outline" 
                    className="w-full flex items-center justify-center"
                    onClick={() => setIsReviewDialogOpen(true)}
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Leave Review
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center"
                  onClick={() => setIsComplaintDialogOpen(true)}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report Issue
                </Button>
                
                <Button 
                  variant="outline" 
                  className="w-full flex items-center justify-center"
                  asChild
                >
                  <Link to="/orders">
                    <Receipt className="h-4 w-4 mr-2" />
                    View All Orders
                  </Link>
                </Button>
                
                {order.status === "delivered" && (
                  <Button 
                    className="w-full flex items-center justify-center"
                    onClick={handleReorder}
                  >
                    <Repeat className="h-4 w-4 mr-2" />
                    Reorder
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Review Dialog */}
      <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              Share your experience with Order #{order.id} from {canteen?.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center justify-center mb-4">
              <div className="flex space-x-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className="focus:outline-none"
                    onClick={() => setRating(star)}
                  >
                    <Star
                      className={`h-8 w-8 ${
                        star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
            
            <Textarea
              placeholder="Tell us about your experience..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleReviewSubmit} disabled={rating === 0}>
              Submit Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Complaint Dialog */}
      <Dialog open={isComplaintDialogOpen} onOpenChange={setIsComplaintDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Report an Issue</DialogTitle>
            <DialogDescription>
              We're sorry to hear you've experienced an issue. Please let us know what went wrong.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Describe the issue you encountered..."
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsComplaintDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleComplaintSubmit} disabled={complaintText.trim() === ''}>
              Submit Complaint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

// Check component for the status timeline
const Check = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// X component for the status timeline
const X = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export default OrderDetails;
