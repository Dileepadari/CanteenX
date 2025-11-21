// src/pages/Payment.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, AlertCircle, Check, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';
// checkoutService removed; using server mutations where possible
import { useCart } from '@/contexts/CartContext';
import { useQuery, useMutation } from '@apollo/client';
import { GET_ORDER_BY_ID } from '@/gql/queries/orders';
import { MARK_ORDER_PAID, CANCEL_ORDER } from '@/gql/mutations/orders';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const TEST_RAZORPAY_KEY = 'rzp_test_1DP5mmOlF5G5ag'; // Replace with your test key

const Payment = () => {
  // Route uses /payment/:id — map `id` to `orderId` for clarity in this component
  const { id: orderId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { clearCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'failed'>('idle');
  const [canCancel, setCanCancel] = useState<boolean>(false);
  const processingTimer = React.useRef<number | null>(null);
  const currentProcessorOrder = React.useRef<string | null>(null);
  const processingActive = React.useRef<boolean>(false);
  
  // Load order details from server
  const { data: orderQueryData, loading: orderQueryLoading, error: orderQueryError } = useQuery(GET_ORDER_BY_ID, {
    variables: { orderId: orderId ? parseInt(orderId, 10) : -1 },
    skip: !orderId,
    fetchPolicy: 'network-only',
  });

  useEffect(() => {
    if (orderQueryLoading) return;
    if (orderQueryError) {
      setError('Failed to load order details');
      setLoading(false);
      return;
    }
    // Prefer order passed via navigation state (avoids a refetch race).
    const navOrder = (location && (location.state as any)?.order) || null;
    if (navOrder) {
      setOrder(navOrder);
      setLoading(false);
      return;
    }

    if (orderQueryData?.getOrderById) {
      setOrder(orderQueryData.getOrderById);
    } else {
      setError('Order not found');
    }
    setLoading(false);
  }, [orderQueryData, orderQueryLoading, orderQueryError]);

  // Determine whether cancellation is allowed client-side (mirror server policy)
  useEffect(() => {
    if (!order) {
      setCanCancel(false);
      return;
    }

    try {
      const orderTimeStr = order.orderTime || order.order_time;
      if (!orderTimeStr) {
        setCanCancel(false);
        return;
      }
      const created = new Date(orderTimeStr).getTime();
      const now = Date.now();
      const withinWindow = now - created <= 5 * 60 * 1000; // 5 minutes
      // also only allow cancel if not already delivered/cancelled/paid
      const notFinal = !(order.status === 'delivered' || order.status === 'cancelled' || (order.paymentStatus || order.payment_status) === 'Paid');
      setCanCancel(Boolean(withinWindow && notFinal));
    } catch (e) {
      setCanCancel(false);
    }
  }, [order]);

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

  const [markOrderPaid] = useMutation(MARK_ORDER_PAID);
  const [cancelOrderMutation] = useMutation(/* GraphQL */ CANCEL_ORDER, { onError: (e) => console.error('Cancel order error', e) });

  const handlePayment = async () => {
    if (!order) return;

    setProcessing(true);

    try {
      // Create a payment record / processor order on the server first
      const methodToUse = (order.paymentMethod || 'upi').toString().toLowerCase();
      const initResp = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: parseInt(order.id, 10), payment_method: methodToUse }),
      });

      if (!initResp.ok) {
        let detailText = null;
        try {
          const json = await initResp.json();
          detailText = json?.detail || json?.message || JSON.stringify(json);
        } catch (e) {
          detailText = await initResp.text();
        }
        // Surface server reason to the UI
        setError(`Failed to initiate payment: ${detailText}`);
        setProcessing(false);
        return;
      }

      const initData = await initResp.json();

      // initData.processor_order_id is expected (Razorpay order id)
      const processorOrderId = initData.processor_order_id || initData.processorOrderId || initData.processor_order_id;

      // For demo flow: simulate the checkout locally instead of opening Razorpay.
      // Show a processing state for 4 seconds, then call verify to mark payment success.
      // If the user cancels during processing, we abort the simulated flow.
      currentProcessorOrder.current = processorOrderId || `mock_order_${Date.now()}`;
      // Clear any previous timer
      if (processingTimer.current) {
        window.clearTimeout(processingTimer.current);
        processingTimer.current = null;
      }
      processingActive.current = true;

      processingTimer.current = window.setTimeout(async () => {
        // If user cancelled in the meantime, processingActive will be false and we skip verify
        if (!processingActive.current) return;

        try {
          const verifyResp = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: currentProcessorOrder.current,
              razorpay_payment_id: `mock_payment_${Date.now()}`,
              razorpay_signature: 'sig',
              order_id: parseInt(order.id, 10),
            }),
          });

          if (verifyResp.ok) {
            try { clearCart(); } catch (e) { /* ignore */ }
            setPaymentStatus('success');
          } else {
            // Fallback: attempt GraphQL markOrderPaid
            try {
              await markOrderPaid({ variables: { orderId: parseInt(order.id, 10), paymentReference: null } });
              try { clearCart(); } catch (e) { /* ignore */ }
              setPaymentStatus('success');
            } catch (err) {
              console.error('Fallback markOrderPaid failed', err);
              setPaymentStatus('failed');
            }
          }
        } catch (err) {
          console.error('Payment verification failed:', err);
          try {
            await markOrderPaid({ variables: { orderId: parseInt(order.id, 10), paymentReference: null } });
            try { clearCart(); } catch (e) { /* ignore */ }
            setPaymentStatus('success');
          } catch (e) {
            setPaymentStatus('failed');
          }
        } finally {
          setProcessing(false);
          processingActive.current = false;
          processingTimer.current = null;
        }
      }, 4000);

      return; // don't open Razorpay in demo mode

      // Set up Razorpay options with server-provided order id
      const primaryColor = typeof window !== 'undefined' ? `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--primary')})` : '#F97316';
      const options = {
        key: TEST_RAZORPAY_KEY,
        amount: Math.round(order.totalAmount * 100), // Convert to paisa
        currency: 'INR',
        name: 'CanteenX',
        description: `Order #${order.id}`,
        order_id: processorOrderId || undefined,
        prefill: {
          name: 'Customer',
          email: 'customer@example.com',
          contact: order.phone,
        },
        notes: {
          order_id: order.id,
        },
        theme: {
          color: primaryColor,
        },
        handler: function (response: any) {
          // After successful checkout, verify with server-side endpoint
          (async () => {
            try {
              const verifyResp = await fetch('/api/payment/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  order_id: parseInt(order.id, 10),
                }),
              });

              if (verifyResp.ok) {
                // Server verified and updated payment/order state
                try { clearCart(); } catch (e) { /* ignore */ }
                setPaymentStatus('success');
              } else {
                // Fallback: still attempt to mark order paid via GraphQL mutation
                try {
                  await markOrderPaid({ variables: { orderId: parseInt(order.id, 10), paymentReference: response.razorpay_payment_id || null } });
                  try { clearCart(); } catch (e) { /* ignore */ }
                  setPaymentStatus('success');
                } catch (err) {
                  console.error('Fallback markOrderPaid failed', err);
                  setPaymentStatus('failed');
                }
              }
            } catch (err) {
              console.error('Payment verification failed:', err);
              // best-effort fallback to GraphQL mark
              try {
                await markOrderPaid({ variables: { orderId: parseInt(order.id, 10), paymentReference: response.razorpay_payment_id || null } });
                try { clearCart(); } catch (e) { /* ignore */ }
                setPaymentStatus('success');
              } catch (e) {
                setPaymentStatus('failed');
              }
            } finally {
              setProcessing(false);
            }
          })();
        },
        modal: {
          ondismiss: function () {
            console.log('Payment dismissed');
            setProcessing(false);
          },
        },
      };

      // Initialize and open Razorpay checkout
      const razorpay = new window.Razorpay(options as any);
      razorpay.open();
    } catch (error) {
      console.error('Payment error:', error);
      setError('Failed to initialize payment');
      setProcessing(false);
    }
  };

  const handleCancel = () => {
    // Ask backend to cancel the order (best-effort). Backend enforces permissions.
    (async () => {
      try {
        // If a simulated processing timer is active, cancel it so we don't verify afterwards
        if (processingTimer.current) {
          window.clearTimeout(processingTimer.current);
          processingTimer.current = null;
        }
        processingActive.current = false;
        setProcessing(false);

        const variables = { userId: order?.userId || '', orderId: parseInt(order?.id || '0', 10), reason: 'Cancelled by user during payment' };
        const { data } = await cancelOrderMutation({ variables });

        if (data?.cancelOrder?.success) {
          toast({ title: 'Order Cancelled', description: 'Your order has been cancelled.' });
        } else {
          toast({ title: 'Cancel Failed', description: data?.cancelOrder?.message || 'Failed to cancel order', variant: 'destructive' });
        }
      } catch (err) {
        console.error('Cancel order failed:', err);
        toast({ title: 'Error', description: 'Failed to cancel order. Please contact support.', variant: 'destructive' });
      }

      navigate('/menu');
    })();
  };

  const createDemoOrder = async () => {
    try {
      setProcessing(true);
      const resp = await fetch('/api/dev/create_demo_order', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
      if (!resp.ok) {
        const txt = await resp.text();
        toast({ title: 'Demo order failed', description: txt, variant: 'destructive' });
        setProcessing(false);
        return;
      }
      const json = await resp.json();
      const newId = json?.order_id;
      if (newId) {
        toast({ title: 'Demo order created', description: `Order ${newId} created for demo.` });
        navigate(`/payment/${newId}`);
      }
    } catch (err) {
      console.error('Create demo order failed', err);
      toast({ title: 'Error', description: 'Failed to create demo order', variant: 'destructive' });
    } finally {
      setProcessing(false);
    }
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
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
                <AlertCircle className="h-12 w-12 text-destructive mb-4" />
                <p className="mb-4 text-center">{error}</p>
              </CardContent>
              <CardFooter className="flex justify-center">
                <div className="flex gap-2">
                  <Button onClick={() => navigate('/cart')}>Return to Cart</Button>
                  {error?.toLowerCase().includes('not found for this user') && (
                    <Button variant="ghost" onClick={createDemoOrder}>Create Demo Order</Button>
                  )}
                </div>
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
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-primary" />
                </div>
                <h2 className="text-xl font-semibold mb-2">Thank You for Your Order!</h2>
                <p className="text-center mb-4">
                  Your payment was successful and your order has been placed.
                </p>
                <div className="bg-muted/10 p-4 rounded-md w-full mb-4">
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
                    <p className="text-3xl font-bold text-primary">₹{order.totalAmount.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">Order #{order.id}</p>
                  </div>

                  <div className="bg-muted/10 p-4 rounded-md">
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
                      <div className="flex justify-between font-semibold pt-2 border-t border-border">
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
                      className="flex-1 bg-primary hover:bg-primary/90"
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
                      className="flex-1 border-border text-destructive hover:bg-destructive/10"
                      onClick={handleCancel}
                      disabled={processing || !canCancel}
                      title={canCancel ? 'Cancel order' : 'Cancellation window expired or order already finalized'}
                    >
                      <X className="mr-2 h-4 w-4" /> {canCancel ? 'Cancel' : 'Cannot Cancel'}
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