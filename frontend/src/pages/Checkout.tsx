// src/pages/Checkout.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import MainLayout from '@/components/layout/MainLayout';
import { useApolloClient, useMutation } from '@apollo/client';
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
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(PaymentMethods.UPI);
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
          setCartItems(data.getCartByUserId.items || []);
          console.log(data.getCartByUserId.items)
          if (data.getCartByUserId.items[0].canteenId) {
            setCanteenId(data.getCartByUserId?.items[0]?.canteenId);
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
      const { data } = await createOrder({
        variables: {
          userId,
          canteenId,
          items: orderItems,
          paymentMethod: selectedPaymentMethod,
          phone: contactInfo.phone,
          customerNote: contactInfo.note,
          isPreOrder: false
        }
      });

      setProcessing(false);

      if (data?.createOrder?.success) {
        const orderId = data.createOrder.orderId;
        
        if (selectedPaymentMethod === PaymentMethods.CASH) {
          toast({
            title: 'Order Placed Successfully',
            description: 'Your order has been placed with cash payment.',
          });
          navigate(`/orders/track/${orderId}`);
        } else {
          // For UPI payments, redirect to payment page
          navigate(`/payment/${orderId}`);
        }
      } else {
        throw new Error(data?.createOrder?.message || "Failed to create order");
      }
    } catch (error) {
      setProcessing(false);
      console.error("Error creating order:", error);
      toast({
        title: 'Order Creation Failed',
        description: error.message || 'There was a problem placing your order. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
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
                    <span className="text-orange-600">₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="font-medium">Payment Method</p>
                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className={`border rounded-md p-3 cursor-pointer ${
                        selectedPaymentMethod === PaymentMethods.UPI
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200'
                      }`}
                      onClick={() => handlePaymentMethodChange(PaymentMethods.UPI)}
                    >
                      <div className="flex flex-col items-center">
                        <CreditCard className="h-6 w-6 text-orange-500 mb-1" />
                        <span>UPI / Online</span>
                      </div>
                    </div>
                    <div
                      className={`border rounded-md p-3 cursor-pointer ${
                        selectedPaymentMethod === PaymentMethods.CASH
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200'
                      }`}
                      onClick={() => handlePaymentMethodChange(PaymentMethods.CASH)}
                    >
                      <div className="flex flex-col items-center">
                        <Banknote className="h-6 w-6 text-orange-500 mb-1" />
                        <span>Cash on Pickup</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  disabled={processing}
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
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Checkout;