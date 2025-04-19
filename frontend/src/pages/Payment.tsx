// src/pages/Payment.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import { checkoutService } from '@/components/payment/CheckoutService';
import { useCart } from '@/contexts/CartContext';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const TEST_RAZORPAY_KEY = 'rzp_test_1DP5mmOlF5G5ag'; // Replace with your test key

const Payment = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  
  // Load order details
  useEffect(() => {
    if (!orderId) {
      setError('Invalid order ID');
      setLoading(false);
      return;
    }

    try {
      // Load from localStorage for demo
      const storedOrders = JSON.parse(localStorage.getItem('smartCanteenOrders') || '[]');
      const orderData = storedOrders.find((o) => o.id === orderId);

      if (!orderData) {
        setError('Order not found');
        setLoading(false);
        return;
      }

      setOrder(orderData);
      setLoading(false);
    } catch (error) {
      console.error('Error loading order:', error);
      setError('Failed to load order details');
      setLoading(false);
    }
  }, [orderId]);

  // Load Razorpay script
  useEffect(() => {
    const loadScript = () => {
      return new Promise((resolve) => {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => {
          resolve(true);
        };
        script.onerror = () => {
          console.error('Razorpay SDK failed to load');
          resolve(false);
        };
        document.body.appendChild(script);
      });
    };

    loadScript();
  }, []);

  const handlePayment = async () => {
    if (!order) return;

    setProcessing(true);

    try {
      // Normally, you would create an order on your server
      // For demo, we'll create a mock order
      const paymentOrderId = `order_${Date.now()}`;
      
      // Set up Razorpay options
      const options = {
        key: TEST_RAZORPAY_KEY,
        amount: Math.round(order.totalAmount * 100), // Convert to paisa
        currency: 'INR',
        name: 'Smart Canteen',
        description: `Order #${order.id}`,
        order_id: paymentOrderId,
        prefill: {
          name: 'Customer',
          email: 'customer@example.com',
          contact: order.phone,
        },
        notes: {
          order_id: order.id,
        },
        theme: {
          color: '#F97316', // Orange
        },
        handler: function (response) {
          // In a real app, you would verify this payment on the server
          console.log('Payment successful:', response);

          // Update order in localStorage
          const orders = JSON.parse(localStorage.getItem('smartCanteenOrders') || '[]');
          const orderIndex = orders.findIndex((o) => o.id === order.id);
          
          if (orderIndex !== -1) {
            orders[orderIndex].status = 'confirmed';
            orders[orderIndex].paymentStatus = 'Paid';
            orders[orderIndex].paymentDetails = {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            };
            localStorage.setItem('smartCanteenOrders', JSON.stringify(orders));
          }

          setPaymentStatus('success');
          setProcessing(false);
        },
        modal: {
          ondismiss: function () {
            console.log('Payment dismissed');
            setProcessing(false);
          },
        },
      };

      // Initialize Razorpay
      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      setError('Failed to initialize payment');
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    // Update order status to cancelled
    const orders = JSON.parse(localStorage.getItem('smartCanteenOrders') || '[]');
    const orderIndex = orders.findIndex((o) => o.id === order?.id);
    
    if (orderIndex !== -1) {
      orders[orderIndex].status = 'cancelled';
      orders[orderIndex].cancellationReason = 'Cancelled by user during payment';
      localStorage.setItem('smartCanteenOrders', JSON.stringify(orders));
    }

    toast({
      title: 'Order Cancelled',
      description: 'Your order has been cancelled.',
    });

    navigate('/menu');
  };

  const handleContinueToTracking = () => {
    navigate(`/orders/track/${orderId}`);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardContent className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                <span className="ml-2">Loading payment details...</span>
              </CardContent>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Payment Error</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <p className="mb-4 text-center">{error}</p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button onClick={() => navigate('/cart')}>Return to Cart</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (paymentStatus === 'success') {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Payment Successful</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Thank You for Your Order!</h2>
                <p className="text-center mb-4">
                  Your payment was successful and your order has been placed.
                </p>
                <div className="bg-orange-50 p-4 rounded-md w-full mb-4">
                  <p className="font-medium">Order #{order.id}</p>
                  <p>Amount: ₹{order.totalAmount.toFixed(2)}</p>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button onClick={handleContinueToTracking}>Track Your Order</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Complete Your Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {order && (
                <>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-orange-600">₹{order.totalAmount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Order #{order.id}</p>
                  </div>

                  <div className="bg-orange-50 p-4 rounded-md">
                    <h3 className="font-medium mb-2">Order Summary</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>₹{order.subtotal?.toFixed(2) || order.totalAmount.toFixed(2)}</span>
                      </div>
                      {order.tax && (
                        <div className="flex justify-between">
                          <span>Tax:</span>
                          <span>₹{order.tax.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold pt-2 border-t border-orange-200">
                        <span>Total:</span>
                        <span>₹{order.totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Payment Methods</h3>
                    <div className="bg-blue-50 p-3 rounded-md border border-blue-200 flex items-center mb-2">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <img
                          src="/upi-icon.png"
                          alt="UPI"
                          className="h-5 w-5"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMzMDhBRkYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMTIiIHg9IjIiIHk9IjYiIHJ4PSIyIi8+PHBhdGggZD0iTTIyIDEwSDIiLz48L3N2Zz4=';
                          }}
                        />
                      </div>
                      <div>
                        <p className="font-medium">UPI Payment</p>
                        <p className="text-xs text-gray-500">Pay using any UPI app like GPay, PhonePe, etc.</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      className="flex-1 bg-orange-500 hover:bg-orange-600"
                      onClick={handlePayment}
                      disabled={processing}
                    >
                      {processing ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                        </>
                      ) : (
                        'Pay Now'
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50"
                      onClick={handleCancel}
                      disabled={processing}
                    >
                      <X className="mr-2 h-4 w-4" /> Cancel
                    </Button>
                  </div>

                  <p className="text-xs text-center text-gray-500">
                    By clicking "Pay Now", you agree to our terms and conditions.
                    This is a secure payment processed by Razorpay.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default Payment;