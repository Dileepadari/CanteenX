
import React from 'react';
import VendorLayout from '@/components/layout/VendorLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { orders, menuItems } from '@/data/mockData';
import { useToast } from '@/hooks/use-toast';
import OrderStatusBadge from '@/components/order/OrderStatusBadge';
import { Clock } from 'lucide-react';

const VendorOrders = () => {
  const { toast } = useToast();

  // Filter orders by status
  const pendingOrders = orders.filter(order => order.status === 'pending');
  const preparingOrders = orders.filter(order => order.status === 'preparing');
  const completedOrders = orders.filter(order => 
    order.status === 'ready' || order.status === 'delivered'
  );

  const handleUpdateStatus = (orderId: number, newStatus: string) => {
    toast({
      title: "Order Status Updated",
      description: `Order #${orderId} is now ${newStatus}`,
    });
  };

  const findMenuItem = (itemId: number) => {
    return menuItems.find(item => item.id === itemId);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <VendorLayout>
      <Tabs defaultValue="pending" className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">Orders</h2>
          <TabsList>
            <TabsTrigger value="pending">
              Pending ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="preparing">
              Preparing ({preparingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedOrders.length})
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Pending Orders */}
        <TabsContent value="pending">
          <div className="space-y-4">
            {pendingOrders.map(order => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Order #{order.id}</h3>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatTime(order.orderTime)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Items</h4>
                      <ul className="space-y-2">
                        {order.items.map(item => {
                          const menuItem = findMenuItem(item.itemId);
                          return (
                            <li key={item.itemId} className="text-sm flex justify-between">
                              <span>
                                {item.quantity} × {menuItem?.name}
                                {item.customizations?.length > 0 && (
                                  <span className="text-gray-500">
                                    {" "}({item.customizations.join(", ")})
                                  </span>
                                )}
                              </span>
                              <span>₹{menuItem?.price || 0}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex justify-between mb-4">
                        <span className="font-medium">Total Amount</span>
                        <span className="font-semibold">₹{order.totalAmount}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          className="flex-1"
                          onClick={() => handleUpdateStatus(order.id, 'preparing')}
                        >
                          Accept & Start Preparing
                        </Button>
                        <Button 
                          variant="destructive"
                          onClick={() => handleUpdateStatus(order.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Preparing Orders */}
        <TabsContent value="preparing">
          <div className="space-y-4">
            {preparingOrders.map(order => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  {/* Similar structure to pending orders */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Order #{order.id}</h3>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatTime(order.orderTime)}
                      </div>
                    </div>
                  </div>

                  {/* Order items and actions */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Items</h4>
                      <ul className="space-y-2">
                        {order.items.map(item => {
                          const menuItem = findMenuItem(item.itemId);
                          return (
                            <li key={item.itemId} className="text-sm flex justify-between">
                              <span>{item.quantity} × {menuItem?.name}</span>
                              <span>₹{menuItem?.price || 0}</span>
                            </li>
                          );
                        })}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-gray-100">
                      <div className="flex justify-between mb-4">
                        <span className="font-medium">Total Amount</span>
                        <span className="font-semibold">₹{order.totalAmount}</span>
                      </div>
                      <Button 
                        className="w-full"
                        onClick={() => handleUpdateStatus(order.id, 'ready')}
                      >
                        Mark as Ready
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Completed Orders */}
        <TabsContent value="completed">
          <div className="space-y-4">
            {completedOrders.map(order => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Order #{order.id}</h3>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {formatTime(order.orderTime)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">Total Amount</div>
                      <div className="text-lg font-semibold">₹{order.totalAmount}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </VendorLayout>
  );
};

export default VendorOrders;
