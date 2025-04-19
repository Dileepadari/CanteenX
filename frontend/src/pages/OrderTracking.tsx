import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import {
  Clock,
  CheckCircle,
  XCircle,
  ChefHat,
  Package,
  Truck,
  Phone,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useQuery } from '@apollo/client';
import { GET_ORDER_BY_ID } from '@/gql/queries/orders';

// Order status badge component
const OrderStatusBadge = ({ status, className = '' }) => {
  let bgColor = 'bg-gray-200';
  let textColor = 'text-gray-700';

  switch (status) {
    case 'pending':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      break;
    case 'confirmed':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      break;
    case 'preparing':
      bgColor = 'bg-orange-100';
      textColor = 'text-orange-800';
      break;
    case 'ready':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'delivered':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'cancelled':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor} ${className}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const OrderTracking = () => {
  const { id } = useParams<{ id: string }>();
  const orderId = id;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  // Load order data from GraphQL query
  const { loading, error, data } = useQuery(GET_ORDER_BY_ID, {
    variables: { orderId: parseInt(orderId) },
    fetchPolicy: "network-only",
  });

  useEffect(() => {
    if (data && data.getOrderById) {
      setOrder(data.getOrderById);
    } else if (data && !data.getOrderById) {
      toast({
        title: 'Order Not Found',
        description: 'The requested order could not be found.',
        variant: 'destructive',
      });
    }
  }, [data, toast]);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Format time function
  const formatTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Calculate estimated time remaining
  const getEstimatedTime = () => {
    if (!order) return null;

    switch (order.status) {
      case 'pending':
        return '15-20 min';
      case 'confirmed':
        return '10-15 min';
      case 'preparing':
        return '5-10 min';
      case 'ready':
        return 'Ready now';
      case 'delivered':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Unknown';
    }
  };

  // Handle contact canteen
  const handleContactCanteen = () => {
    toast({
      title: 'Contacting Canteen',
      description: 'This feature is not available in the demo.',
    });
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 text-orange-500 animate-spin mr-2" />
            <span>Loading order details...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">Error Loading Order</h2>
              <p className="text-gray-500 mb-6">{error.message}</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!order) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
              <h2 className="text-xl font-bold mb-2">Order Not Found</h2>
              <p className="text-gray-500 mb-6">We couldn't find the order you're looking for.</p>
              <Button onClick={() => navigate('/menu')}>Browse Menu</Button>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Order #{order.id}</h1>
          <OrderStatusBadge status={order.status} className="ml-4" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Order status and tracking */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
                <div className="space-y-8">
                  {/* Order confirmation / Cancellation */}
                  <div className="flex relative">
                    <div
                      className={`rounded-full h-8 w-8 flex items-center justify-center ${
                        order.status === 'cancelled'
                          ? 'bg-red-500'
                          : ['confirmed', 'preparing', 'ready', 'delivered'].includes(order.status)
                          ? 'bg-green-500'
                          : 'bg-gray-200'
                      } z-10`}
                    >
                      {order.status === 'cancelled' ? (
                        <XCircle className="h-5 w-5 text-white" />
                      ) : ['confirmed', 'preparing', 'ready', 'delivered'].includes(order.status) ? (
                        <CheckCircle className="h-5 w-5 text-white" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div className="ml-4">
                      <h3 className="font-medium">
                        {order.status === 'cancelled' ? 'Order Cancelled' : 'Order Confirmed'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {order.confirmedTime ? formatTime(order.confirmedTime) : 'Awaiting confirmation'}
                      </p>
                      <p className="text-sm mt-1">
                        {order.status === 'cancelled'
                          ? order.cancellationReason || 'Your order has been cancelled.'
                          : ['confirmed', 'preparing', 'ready', 'delivered'].includes(order.status)
                          ? 'Your order has been confirmed and is being processed.'
                          : 'The canteen is reviewing your order.'}
                      </p>
                    </div>
                  </div>

                  {/* Preparing */}
                  {order.status !== 'cancelled' && (
                    <div className="flex relative">
                      <div
                        className={`rounded-full h-8 w-8 flex items-center justify-center ${
                          ['preparing', 'ready', 'delivered'].includes(order.status)
                            ? 'bg-green-500'
                            : 'bg-gray-200'
                        } z-10`}
                      >
                        <ChefHat
                          className={`h-5 w-5 ${
                            ['preparing', 'ready', 'delivered'].includes(order.status)
                              ? 'text-white'
                              : 'text-gray-500'
                          }`}
                        />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium">Preparing Your Order</h3>
                        <p className="text-sm text-gray-500">
                          {order.preparingTime ? formatTime(order.preparingTime) : 'Not started yet'}
                        </p>
                        <p className="text-sm mt-1">
                          {['preparing', 'ready', 'delivered'].includes(order.status)
                            ? 'Your food is being prepared in the kitchen.'
                            : 'Waiting to start preparation.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Ready for pickup */}
                  {order.status !== 'cancelled' && (
                    <div className="flex relative">
                      <div
                        className={`rounded-full h-8 w-8 flex items-center justify-center ${
                          ['ready', 'delivered'].includes(order.status) ? 'bg-green-500' : 'bg-gray-200'
                        } z-10`}
                      >
                        <Package
                          className={`h-5 w-5 ${
                            ['ready', 'delivered'].includes(order.status) ? 'text-white' : 'text-gray-500'
                          }`}
                        />
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium">Ready for Pickup</h3>
                        <p className="text-sm text-gray-500">
                          {order.readyTime ? formatTime(order.readyTime) : 'Not ready yet'}
                        </p>
                        <p className="text-sm mt-1">
                          {['ready', 'delivered'].includes(order.status)
                            ? 'Your order is ready! Please proceed to the pickup counter.'
                            : 'Your order is still being prepared.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Delivered */}
                  {order.status !== 'cancelled' && (
                    <div className="flex relative">
                      <div
                        className={`rounded-full h-8 w-8 flex items-center justify-center ${
                          order.status === 'delivered' ? 'bg-green-500' : 'bg-gray-200'
                        } z-10`}
                      >
                        {order.status === 'delivered' ? (
                          <CheckCircle className="h-5 w-5 text-white" />
                        ) : (
                          <Truck className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div className="ml-4">
                        <h3 className="font-medium">Order Completed</h3>
                        <p className="text-sm text-gray-500">
                          {order.deliveryTime ? formatTime(order.deliveryTime) : 'Pending pickup'}
                        </p>
                        <p className="text-sm mt-1">
                          {order.status === 'delivered'
                            ? 'You have received your order. Enjoy your meal!'
                            : 'Waiting for you to pick up your order.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Order Items</h3>
                  <div className="space-y-2 mt-2">
                    {console.log(order.items)}
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between py-2 border-b last:border-b-0">
                        <div>
                          <p className="font-medium">
                            {item.quantity}x {item.name}
                          </p>
                          {item.customizations && (
                            <div className="text-xs text-gray-500">
                              {item.customizations.size && <span>Size: {item.customizations.size} </span>}
                              {item.customizations.additions?.length > 0 && (
                                <span>
                                  Additions: {item.customizations.additions.join(', ')}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <p>₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex justify-between mb-1">
                    <span>Subtotal</span>
                    <span>₹{order.subtotal?.toFixed(2) || (order.totalAmount * 0.95).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>Tax (5%)</span>
                    <span>₹{order.tax?.toFixed(2) || (order.totalAmount * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span>₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Payment Information</h3>
                  <div className="flex justify-between mb-1">
                    <span>Payment Method</span>
                    <span>{order.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Payment Status</span>
                    <span
                      className={
                        order.paymentStatus === 'Paid'
                          ? 'text-green-600 font-medium'
                          : 'text-orange-600 font-medium'
                      }
                    >
                      {order.paymentStatus}
                    </span>
                  </div>
                </div>

                {order.customerNote && (
                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Order Notes</h3>
                    <p className="text-sm bg-gray-50 p-2 rounded">{order.customerNote}</p>
                  </div>
                )}

                <div className="pt-4">
                  <Button className="w-full" onClick={handleContactCanteen}>
                    <Phone className="mr-2 h-4 w-4" /> Contact Canteen
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
