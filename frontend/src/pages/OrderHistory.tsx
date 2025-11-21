import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { GET_MENU_ITEMS } from "@/gql/queries/menuItems";
import { GET_CANTEENS } from "@/gql/queries/canteens";
import OrderStatusBadge from "@/components/order/OrderStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Clock, Repeat, Receipt, Loader2, AlertCircle, X, MapPin } from "lucide-react";
import { useQuery, useMutation } from "@apollo/client";
import { CANCEL_ORDER } from "@/gql/mutations/orders";
import { ADD_TO_CART, CLEAR_CART } from "@/gql/mutations/cart";
import { GET_ALL_ORDERS } from "@/gql/queries/orders";
import { GET_CURRENT_USER } from "@/gql/queries/user";
import { useToast } from "@/hooks/use-toast";
import { formatIST, toISTDateISO } from '@/lib/ist';

const OrderHistory = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [addToCartMutation] = useMutation(ADD_TO_CART);
  const [clearCartMutation] = useMutation(CLEAR_CART);
  const [userId, setUserId] = useState("");
  const [orders, setOrders] = useState([]);
  const [editingScheduleOrderId, setEditingScheduleOrderId] = useState<number | null>(null);
  const [scheduleInputs, setScheduleInputs] = useState<{ date: string; time: string }>({ date: '', time: '' });

  // get_current user from graphql
  const { loading: userLoading, error: userError, data: userData } = useQuery(GET_CURRENT_USER, {
    fetchPolicy: "network-only",
  });
  useEffect(() => {
    if (userData && userData.getCurrentUser) {
      setUserId(userData.getCurrentUser.id);
    }
  }, [userData]);


  const { loading, error, data } = useQuery(GET_ALL_ORDERS, {
    variables: { userId },
    skip: !userId,
    fetchPolicy: "network-only",
  });

  // fetch menu items and canteens for lookups
  const { data: menuData } = useQuery(GET_MENU_ITEMS, { fetchPolicy: "cache-first" });
  const { data: canteenData } = useQuery(GET_CANTEENS, { fetchPolicy: "cache-first" });

  const menuItems = menuData?.getMenuItems || [];
  const canteens = canteenData?.getAllCanteens || [];

  useEffect(() => {
    if (data && data.getAllOrders) {
      setOrders(data.getAllOrders);
    }
  }, [data]);

  // Helper: find a menu item by id (handles numeric/string ids)
  function findMenuItem(id: any) {
    if (!id) return undefined;
    return menuItems.find((m: any) => m.id === id || String(m.id) === String(id) || m._id === id || String(m._id) === String(id));
  }

  // Helper: find a canteen by id
  function findCanteen(id: any) {
    if (!id) return undefined;
    return canteens.find((c: any) => c.id === id || String(c.id) === String(id) || c._id === id || String(c._id) === String(id));
  }

  // Safe date/time formatters used in the UI
  const formatDate = (value: any) => {
    try {
      return formatIST(value, { year: 'numeric', month: 'short', day: '2-digit' });
    } catch {
      return "";
    }
  };

  const formatTime = (value: any) => {
    try {
      return formatIST(value, { hour: '2-digit', minute: '2-digit' });
    } catch {
      return "";
    }
  };

  // Core reorder performer: copies items to server cart then navigates to checkout
  const performReorder = async (order: any, scheduledPickup: { date: string; time: string } | null) => {
    try {
      // Clear server-side cart
      await clearCartMutation();

      const canteen = findCanteen(order.canteenId);

      // Add each item to server-side cart using snapshot values when available
      for (const item of order.items) {
        const menuItem = findMenuItem(item.itemId);
        const input = {
          menuItemId: item.itemId,
          name: item.name || menuItem?.name || `Item #${item.itemId}`,
          price: Number(item.price ?? (menuItem ? menuItem.price : 0)) || 0,
          quantity: item.quantity || 1,
          canteenId: order.canteenId,
          canteenName: canteen?.name || "",
          customizations: item.customizations || null,
        };

        // eslint-disable-next-line no-await-in-loop
        await addToCartMutation({ variables: { input } });
      }

      toast({ title: 'Reorder', description: 'Items copied to cart. Proceed to checkout.' });

      // Build pickup object in shape Checkout expects
      const pickupState = scheduledPickup ?? null;
      navigate('/checkout', { state: { scheduledPickup: pickupState, selectedPaymentMethod: order.paymentMethod || null } });
    } catch (e) {
      console.error('Failed to reorder into cart', e);
      toast({ title: 'Error', description: 'Failed to copy items to cart. Please try again.', variant: 'destructive' });
    }
  };

  // Open inline schedule editor for a past order before reordering
  const openScheduleEditor = (order: any) => {
    const pickupDate = parsePickup(order);
    if (pickupDate) {
      const isoDate = toISTDateISO(pickupDate) || '';
      const time = formatIST(pickupDate, { hour: '2-digit', minute: '2-digit', hour12: false });
      setScheduleInputs({ date: isoDate, time });
    } else {
      // default: today + 30 minutes
      const d = new Date(Date.now() + 30 * 60 * 1000);
      setScheduleInputs({ date: toISTDateISO(d) || '', time: formatIST(d, { hour: '2-digit', minute: '2-digit', hour12: false }) });
    }
    setEditingScheduleOrderId(order.id);
  };

  const cancelScheduleEdit = () => {
    setEditingScheduleOrderId(null);
    setScheduleInputs({ date: '', time: '' });
  };

  const confirmReorderWithSchedule = async (order: any) => {
    const { date, time } = scheduleInputs;
    const scheduledPickup = date && time ? { date, time } : null;
    await performReorder(order, scheduledPickup);
    cancelScheduleEdit();
  };

  // Handler for reordering (opens schedule editor)
  const handleReorder = (orderId: number) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) {
      toast({ title: 'Order not found', description: 'Could not locate the selected order', variant: 'destructive' });
      return;
    }

    const ok = window.confirm('Your current cart will be replaced with items from this past order. Continue?');
    if (!ok) return;

    // Open inline editor to choose a schedule before performing reorder
    openScheduleEditor(order);
  };
  
  // Helper to parse pickup time from various possible fields and return a Date or null
  const parsePickup = (order: any): Date | null => {
    const raw = order.pickupTime ?? order.pickup_time ?? order.scheduledPickup ?? order.scheduled_pickup ?? order.scheduled_at ?? order.pickup_time_str ?? null;
    if (!raw) return null;
    try {
      const s = typeof raw === 'string' ? raw : (raw.iso || raw.date || String(raw));
      const d = new Date(s);
      if (isNaN(d.getTime())) return null;
      return d;
    } catch (e) {
      return null;
    }
  };

  // Cart context is declared above (used for reordering)

  // Active orders (pending, preparing, ready)
  const activeOrders = orders.filter(
    (order) => ["pending", "confirmed", "preparing", "ready"].includes(order.status)
  );

  // Helper to determine whether an order is cancelable (client-side logic mirrors server policy)
  const isOrderCancelable = (order: any) => {
    try {
      const orderTimeStr = order.orderTime || order.order_time;
      if (!orderTimeStr) return false;
      const created = new Date(orderTimeStr).getTime();
      const now = Date.now();
      const withinWindow = now - created <= 5 * 60 * 1000; // 5 minutes
      const notFinal = !(order.status === 'delivered' || order.status === 'cancelled' || (order.paymentStatus || order.payment_status) === 'Paid');
      return Boolean(withinWindow && notFinal);
    } catch (e) {
      return false;
    }
  };

  const [cancelOrderMutation] = useMutation(CANCEL_ORDER, { onError: (e) => console.error('Cancel order error', e) });

  const handleCancelOrder = async (orderId: number) => {
    if (!userId) {
      toast({ title: 'Not signed in', description: 'You must be signed in to cancel an order.', variant: 'destructive' });
      return;
    }

    const ok = window.confirm('Are you sure you want to cancel this order? Cancellation is only allowed within 5 minutes of placing the order.');
    if (!ok) return;

    try {
      const variables = { userId, orderId, reason: 'Cancelled by user' };
      const { data } = await cancelOrderMutation({ variables });
      if (data?.cancelOrder?.success) {
        toast({ title: 'Order cancelled', description: data.cancelOrder.message || 'Your order was cancelled.' });
        // Optimistically update UI: mark order as cancelled
        setOrders((cur) => cur.map((o) => (o.id === orderId ? { ...o, status: 'cancelled' } : o)));
      } else {
        toast({ title: 'Cancel failed', description: data?.cancelOrder?.message || 'Failed to cancel order', variant: 'destructive' });
      }
    } catch (err) {
      console.error('Cancel order failed', err);
      toast({ title: 'Error', description: 'Failed to cancel order. Please contact support.', variant: 'destructive' });
    }
  };

  // Past orders (delivered, cancelled)
  const pastOrders = orders.filter(
    (order) => ["delivered", "cancelled"].includes(order.status)
  );

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 flex justify-center items-center h-[50vh]">
          <div className="flex flex-col items-center">
            <Loader2 className="h-10 w-10 text-primary animate-spin mb-4" />
            <h3 className="text-lg font-semibold">Loading orders...</h3>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-flex h-20 w-20 rounded-full bg-red-100 p-4 items-center justify-center mb-4">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Error loading orders</h3>
            <p className="text-gray-500 mb-4">{error.message}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Orders</h1>

        <Tabs defaultValue="active">
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active Orders</TabsTrigger>
            <TabsTrigger value="past">Past Orders</TabsTrigger>
          </TabsList>

          {/* Active Orders */}
          <TabsContent value="active">
            {activeOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex h-20 w-20 rounded-full bg-gray-100 p-4 items-center justify-center mb-4">
                  <Receipt className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No active orders</h3>
                <p className="text-gray-500 mb-4">Explore our canteens and place an order</p>
                <Link to="/">
                  <Button>Browse Canteens</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {activeOrders.map((order) => {
                  const canteen = findCanteen(order.canteenId);
                  return (
                    <Card key={order.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          {/* Order status and canteen info */}
                          <div className="p-4 flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold">
                                  {canteen?.name || "Unknown Canteen"}
                                </h3>
                                                <div className="flex items-center text-sm text-gray-500">
                                                  <Clock className="h-3.5 w-3.5 mr-1" />
                                                  <span>
                                                    {formatDate(order.orderTime)}, {formatTime(order.orderTime)}
                                                  </span>
                                                  {(() => {
                                                    const pickupDate = parsePickup(order);
                                                    if (pickupDate && pickupDate.getTime() > Date.now()) {
                                                      return (
                                                        <span className="ml-3 inline-flex items-center text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                                          Scheduled • {formatIST(pickupDate, { year: 'numeric', month: 'short', day: '2-digit' })} {formatIST(pickupDate, { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                      );
                                                    }
                                                    return null;
                                                  })()}
                                                </div>
                              </div>
                              <OrderStatusBadge status={order.status} />
                            </div>

                            {/* Order items summary */}
                            <div className="mt-3">
                              <h4 className="text-sm font-medium mb-2">Items</h4>
                              <ul className="space-y-1">
                                {order.items.map((item, idx) => {
                                  const menuItem = findMenuItem(item.itemId);
                                  const displayName = item.name || menuItem?.name || "Item #" + item.itemId;
                                  const displayPrice = Number(item.price ?? (menuItem ? menuItem.price : 0)) || 0;
                                  return (
                                    <li key={idx} className="text-sm flex justify-between">
                                      <span>
                                        {item.quantity} × {displayName}
                                      </span>
                                      <span className="text-gray-600">
                                        ₹{item.quantity * displayPrice}
                                      </span>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>

                            {/* Order total */}
                            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
                              <span className="font-medium">Total</span>
                              <span className="font-semibold">₹{order.totalAmount}</span>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="bg-gray-50 p-4 flex flex-row sm:flex-col justify-between items-center gap-2 sm:border-l border-gray-100">
                            <Link to={`/orders/track/${order.id}`} className="w-full">
                              <Button variant="outline" size="sm" className="w-full gap-1">
                                <MapPin className="h-4 w-4" />
                                Track
                              </Button>
                            </Link>

                            {isOrderCancelable(order) && (
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full gap-1"
                                onClick={() => handleCancelOrder(order.id)}
                              >
                                <X className="h-4 w-4" />
                                Cancel
                              </Button>
                            )}

                            <Link to={`/orders/${order.id}`} className="w-full">
                              <Button size="sm" variant="secondary" className="w-full gap-1">
                                Details
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Past Orders */}
          <TabsContent value="past">
            {pastOrders.length === 0 ? (
              <div className="text-center py-12">
                <div className="inline-flex h-20 w-20 rounded-full bg-gray-100 p-4 items-center justify-center mb-4">
                  <Receipt className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No past orders</h3>
                <p className="text-gray-500 mb-4">Explore our canteens and place an order</p>
                <Link to="/">
                  <Button>Browse Canteens</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {pastOrders.map((order) => {
                  const canteen = findCanteen(order.canteenId);
                  return (
                    <Card key={order.id} className="overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex flex-col sm:flex-row">
                          {/* Order status and canteen info */}
                          <div className="p-4 w-full">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h3 className="font-semibold">
                                  {canteen?.name || "Unknown Canteen"}
                                </h3>
                                <div className="flex items-center text-sm text-gray-500">
                                  <Clock className="h-3.5 w-3.5 mr-1" />
                                  <span>
                                    {formatDate(order.orderTime)}, {formatTime(order.orderTime)}
                                  </span>
                                  {(() => {
                                    const pickupDate = parsePickup(order);
                                    if (pickupDate && pickupDate.getTime() > Date.now()) {
                                      return (
                                        <span className="ml-3 inline-flex items-center text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                          Scheduled • {formatIST(pickupDate, { year: 'numeric', month: 'short', day: '2-digit' })} {formatIST(pickupDate, { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                      );
                                    }
                                    return null;
                                  })()}
                                </div>
                              </div>
                              <OrderStatusBadge status={order.status} />
                            </div>

                            {/* Order items summary */}
                            <div className="mt-3">
                              <h4 className="text-sm font-medium mb-2">Items</h4>
                              <ul className="space-y-1">
                                {order.items.map((item, idx) => {
                                  const menuItem = findMenuItem(item.itemId);
                                  const displayName = item.name || menuItem?.name || "Item #" + item.itemId;
                                  const displayPrice = Number(item.price ?? (menuItem ? menuItem.price : 0)) || 0;
                                  return (
                                    <li key={idx} className="text-sm flex justify-between">
                                      <span>
                                        {item.quantity} × {displayName}
                                      </span>
                                      <span className="text-gray-600">
                                        ₹{item.quantity * displayPrice}
                                      </span>
                                    </li>
                                  );
                                })}
                              </ul>
                            </div>

                            {/* Order total */}
                            <div className="mt-4 pt-3 border-t border-gray-100 flex justify-between">
                              <span className="font-medium">Total</span>
                              <span className="font-semibold">₹{order.totalAmount}</span>
                            </div>
                          </div>

                          {/* Action buttons */}
                          <div className="bg-gray-50 p-4 flex flex-row sm:flex-col justify-between items-center gap-2 sm:border-l border-gray-100 ">
                            {editingScheduleOrderId === order.id ? (
                              <div className="w-full space-y-2">
                                <div className="flex gap-2">
                                  <input
                                    type="date"
                                    value={scheduleInputs.date}
                                    onChange={(e) => setScheduleInputs((s) => ({ ...s, date: e.target.value }))}
                                    className="p-2 border rounded-md w-1/2"
                                  />
                                  <input
                                    type="time"
                                    value={scheduleInputs.time}
                                    onChange={(e) => setScheduleInputs((s) => ({ ...s, time: e.target.value }))}
                                    className="p-2 border rounded-md w-1/2"
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <Button size="sm" className="flex-1" onClick={() => confirmReorderWithSchedule(order)}>
                                    Confirm & Reorder
                                  </Button>
                                  <Button size="sm" variant="outline" className="flex-1" onClick={cancelScheduleEdit}>
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="w-full gap-1"
                                  onClick={() => handleReorder(order.id)}
                                >
                                  <Repeat className="h-4 w-4" />
                                  Reorder
                                </Button>
                              </div>
                            )}

                            <Link to={`/orders/${order.id}`} className="w-full">
                              <Button size="sm" variant="secondary" className="w-full gap-1">
                                Details
                                <ChevronRight className="h-4 w-4" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default OrderHistory;
