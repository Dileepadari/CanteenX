// src/pages/Checkout.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import { useApolloClient, useMutation } from '@apollo/client';
import { UPDATE_CART_ITEM, REMOVE_FROM_CART } from '@/gql/mutations/cart';
import { GET_CART_ITEMS } from '@/gql/queries/cart';
import { GET_CURRENT_USER } from '@/gql/queries/user';
import { CREATE_ORDER } from '@/gql/mutations/orders';
import { Loader2, CreditCard, Banknote } from 'lucide-react';

const PaymentMethods = {
  UPI: 'UPI',
  CASH: 'CASH',
};

const Checkout = () => {
  const navigate = useNavigate();
  const client = useApolloClient();
  const { toast } = useToast();
  const [cartItems, setCartItems] = useState([]);
  const location = useLocation();
  const initialScheduled = location?.state?.scheduledPickup || null;
  const initialPayment = location?.state?.selectedPaymentMethod || PaymentMethods.UPI;

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(initialPayment);
  const [scheduledPickup, setScheduledPickup] = useState(initialScheduled);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [userId, setUserId] = useState("");
  const [canteenId, setCanteenId] = useState(null);
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    note: '',
  });

  // GraphQL mutation for creating orders
  const [createOrder, { loading: orderLoading }] = useMutation(CREATE_ORDER);
  const [updateCartItem] = useMutation(UPDATE_CART_ITEM);
  const [removeFromCart] = useMutation(REMOVE_FROM_CART);

  const [stockIssues, setStockIssues] = useState<Array<{ cartItemId?: number; name?: string; available?: number; message: string }>>([]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data } = await client.query({
          query: GET_CURRENT_USER,
        });
        if (data?.getCurrentUser) {
          setUserId(data.getCurrentUser.id);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch user data. Please try again.',
          variant: 'destructive',
        });
      }
    };

    fetchUserData();
  }, [client, toast]);

  // Fetch cart items
  useEffect(() => {
    const fetchCartItems = async () => {
      if (!userId) return;

      try {
        const { data } = await client.query({
          query: GET_CART_ITEMS,
          variables: { userId },
          fetchPolicy: 'network-only',
        });

        if (data?.getCartByUserId) {
          const items = data.getCartByUserId.items || [];
          setCartItems(items);
          console.log(items);
          // Guard against empty items array
          if (items.length > 0 && items[0] && (items[0].canteenId || items[0].canteen_id)) {
            // support both camelCase and snake_case keys depending on backend shape
            setCanteenId(items[0].canteenId || items[0].canteen_id);
          } else {
            setCanteenId(null);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching cart items:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch cart items. Please try again.',
          variant: 'destructive',
        });
        setLoading(false);
      }
    };

    if (userId) {
      fetchCartItems();
    }
  }, [userId, client, toast]);

  // Calculate order totals
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05; // 5% tax
  const total = subtotal + tax;

  const handlePhoneChange = (e) => {
    setContactInfo({ ...contactInfo, phone: e.target.value });
  };

  const handleNoteChange = (e) => {
    setContactInfo({ ...contactInfo, note: e.target.value });
  };

  const handlePaymentMethodChange = (method) => {
    setSelectedPaymentMethod(method);
  };

  const handlePlaceOrder = async () => {
    if (!contactInfo.phone) {
      toast({
        title: 'Phone Required',
        description: 'Please provide your phone number for order updates.',
        variant: 'destructive',
      });
      return;
    }

    if (!canteenId) {
      toast({
        title: 'Error',
        description: 'Canteen information missing. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);

    try {
      // Format items for order creation in a format that matches OrderItemInput from the backend
      const orderItems = cartItems.map(item => ({
        itemId: parseInt(item.menuItemId || item.id, 10),
        quantity: item.quantity,
        customizations: {
          size: item.customizations?.size || null,
          additions: item.customizations?.additions || null,
          removals: item.customizations?.removals || null,
          notes: item.customizations?.notes || null
        },
        note: item.specialInstructions || ""
      }));

      console.log("Sending order items:", JSON.stringify(orderItems));

      // Create order using GraphQL mutation
      // Build the input expected by the backend CreateOrderInput
      const pickupTimeValue = scheduledPickup ? `${scheduledPickup.date}T${scheduledPickup.time}` : null;

      const input = {
        userId,
        canteenId,
        items: orderItems,
        totalAmount: total,
        paymentMethod: selectedPaymentMethod,
        phone: contactInfo.phone,
        customerNote: contactInfo.note,
        isPreOrder: false,
        pickupTime: pickupTimeValue,
      };

      const { data } = await createOrder({ variables: { input } });

      setProcessing(false);

      // Backend returns an OrderType. Check for returned id to confirm success.
        if (data?.createOrder?.id) {
        const orderId = data.createOrder.id;

        if (selectedPaymentMethod === PaymentMethods.CASH) {
          toast({
            title: 'Order Placed Successfully',
            description: 'Your order has been placed with cash payment.',
          });
          navigate(`/orders/track/${orderId}`);
        } else {
          // For UPI payments, redirect to payment page.
          // Pass the created order in navigation state to avoid a
          // race where the payment page fetches before the order is
          // visible due to timing or auth differences.
          navigate(`/payment/${orderId}`, { state: { order: data.createOrder } });
        }
      } else {
        // Unexpected response shape
        throw new Error('Failed to create order. Invalid server response.');
      }
    } catch (error: any) {
      setProcessing(false);
      console.error('Error creating order:', error);

      // Reset previous stock issues
      setStockIssues([]);

      // Apollo GraphQL errors may appear in graphQLErrors
      const gqlErrors = error?.graphQLErrors || [];
      let handled = false;

      for (const ge of gqlErrors) {
        const msg = ge?.message || '';

        // Parse messages like: Insufficient stock for item 'NAME'. Available: X, requested: Y
        const m = msg.match(/Insufficient stock for item '(.*?)'\. Available: (\d+), requested: (\d+)/i);
        if (m) {
          const [, name, availableStr] = m;
          const available = parseInt(availableStr, 10);

          // Try to map to a cart item by name
          const cartMatch = cartItems.find((c) => (c.name || '').trim() === name.trim());
          const cartItemId = cartMatch ? cartMatch.id : undefined;

          setStockIssues((s) => [...s, { cartItemId, name, available, message: msg }]);
          handled = true;
        }
      }

      if (handled) {
        toast({
          title: 'Stock Problem',
          description: 'Some items in your cart have insufficient stock. Please adjust quantities or remove items.',
          variant: 'destructive',
        });
        // refresh cart from server to get canonical state
        try {
          const { data: refreshed } = await client.query({ query: GET_CART_ITEMS, variables: { userId }, fetchPolicy: 'network-only' });
          if (refreshed?.getCartByUserId) {
            setCartItems(refreshed.getCartByUserId.items || []);
          }
        } catch (e) {
          console.warn('Failed to refresh cart after stock error', e);
        }
        return;
      }

      // Fallback: use server message or generic
      const fallbackMsg = error?.message || (error?.graphQLErrors && error.graphQLErrors[0]?.message) || 'There was a problem placing your order. Please try again.';
      toast({
        title: 'Order Creation Failed',
        description: fallbackMsg,
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading checkout...</span>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (cartItems.length === 0) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <Card>
            <CardContent className="flex flex-col items-center justify-center p-8">
              <h2 className="text-xl font-semibold mb-4">Your cart is empty</h2>
              <p className="text-gray-500 mb-6">Add items to your cart before proceeding to checkout.</p>
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
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>

        {/* Show selected pickup & payment summary (if provided from Cart) */}
        {(scheduledPickup || selectedPaymentMethod) && (
          <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {scheduledPickup && (
              <Card>
                <CardHeader>
                  <CardTitle>Pickup Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <div className="font-medium">Date</div>
                    <div className="text-muted-foreground">{scheduledPickup?.date}</div>
                    <div className="font-medium mt-2">Time</div>
                    <div className="text-muted-foreground">{scheduledPickup?.time}</div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Payment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <div className="font-medium">Selected Method</div>
                  <div className="text-muted-foreground">{selectedPaymentMethod === PaymentMethods.CASH ? 'Cash on Pickup' : 'UPI / Online'}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Show stock issues if any */}
        {stockIssues.length > 0 && (
          <div className="mb-4">
            <Card>
              <CardHeader>
                <CardTitle>Stock issues found</CardTitle>
                <CardDescription>Please fix the following items before placing the order.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stockIssues.map((si, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{si.name || 'Unknown item'}</p>
                        <p className="text-sm text-muted-foreground">{si.message}</p>
                      </div>
                      <div className="flex gap-2">
                        {si.cartItemId && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={async () => {
                              try {
                                await removeFromCart({ variables: { cartItemId: si.cartItemId } });
                                const { data: refreshed } = await client.query({ query: GET_CART_ITEMS, variables: { userId }, fetchPolicy: 'network-only' });
                                if (refreshed?.getCartByUserId) setCartItems(refreshed.getCartByUserId.items || []);
                                setStockIssues((s) => s.filter((x) => x.cartItemId !== si.cartItemId));
                              } catch (e) {
                                console.error('Failed to remove cart item', e);
                                toast({ title: 'Error', description: 'Failed to remove item from cart', variant: 'destructive' });
                              }
                            }}
                          >
                            Remove
                          </Button>
                        )}
                        {si.cartItemId && si.available !== undefined && (
                          <Button
                            size="sm"
                            onClick={async () => {
                              try {
                                await updateCartItem({ variables: { cartItemId: si.cartItemId, quantity: si.available } });
                                const { data: refreshed } = await client.query({ query: GET_CART_ITEMS, variables: { userId }, fetchPolicy: 'network-only' });
                                if (refreshed?.getCartByUserId) setCartItems(refreshed.getCartByUserId.items || []);
                                setStockIssues((s) => s.filter((x) => x.cartItemId !== si.cartItemId));
                              } catch (e) {
                                console.error('Failed to update cart item', e);
                                toast({ title: 'Error', description: 'Failed to update item quantity', variant: 'destructive' });
                              }
                            }}
                          >
                            Set to available ({si.available})
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {/* Left column - Order details */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{item.name} × {item.quantity}</p>
                        {item.customizations && (
                          <div className="text-sm text-gray-500">
                            {item.customizations.size && <span>Size: {item.customizations.size} </span>}
                            {item.customizations.additions?.length > 0 && (
                              <span>Additions: {item.customizations.additions.join(", ")} </span>
                            )}
                            {item.customizations.removals?.length > 0 && (
                              <span>Removals: {item.customizations.removals.join(", ")} </span>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">
                      Phone Number *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      className="w-full p-2 border rounded-md"
                      placeholder="Enter your phone number"
                      value={contactInfo.phone}
                      onChange={handlePhoneChange}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="note" className="block text-sm font-medium mb-1">
                      Order Notes (Optional)
                    </label>
                    <textarea
                      id="note"
                      className="w-full p-2 border rounded-md"
                      placeholder="Special instructions for your order"
                      rows={3}
                      value={contactInfo.note}
                      onChange={handleNoteChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right column - Payment & Checkout */}
          <div>
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle>Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Tax (5%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total</span>
                    <span className="text-primary">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="font-medium">Payment Method</p>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      aria-pressed={selectedPaymentMethod === PaymentMethods.UPI}
                      className={`w-full text-left border rounded-md p-3 focus:outline-none transition-colors ${selectedPaymentMethod === PaymentMethods.UPI ? 'bg-primary text-white border-primary shadow' : 'bg-white border-gray-200'}`}
                      onClick={() => handlePaymentMethodChange(PaymentMethods.UPI)}
                    >
                      <div className="flex flex-col items-center">
                        <CreditCard className={`h-6 w-6 mb-1 ${selectedPaymentMethod === PaymentMethods.UPI ? 'text-white' : 'text-primary'}`} />
                        <span className={`${selectedPaymentMethod === PaymentMethods.UPI ? 'text-white' : ''}`}>UPI / Online</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      aria-pressed={selectedPaymentMethod === PaymentMethods.CASH}
                      className={`w-full text-left border rounded-md p-3 focus:outline-none transition-colors ${selectedPaymentMethod === PaymentMethods.CASH ? 'bg-primary text-white border-primary shadow' : 'bg-white border-gray-200'}`}
                      onClick={() => handlePaymentMethodChange(PaymentMethods.CASH)}
                    >
                      <div className="flex flex-col items-center">
                        <Banknote className={`h-6 w-6 mb-1 ${selectedPaymentMethod === PaymentMethods.CASH ? 'text-white' : 'text-primary'}`} />
                        <span className={`${selectedPaymentMethod === PaymentMethods.CASH ? 'text-white' : ''}`}>Cash on Pickup</span>
                      </div>
                    </button>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={processing || stockIssues.length > 0}
                  onClick={handlePlaceOrder}
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    `Place Order • ₹${total.toFixed(2)}`
                  )}
                </Button>
                {stockIssues.length > 0 && (
                  <p className="mt-2 text-sm text-destructive">Please resolve the stock issues above before placing your order.</p>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Checkout;