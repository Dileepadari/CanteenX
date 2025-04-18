
import React from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const UserNotifications = () => {
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  // Function to generate mock order status notifications for testing
  const generateMockNotifications = () => {
    // Order ready notification
    addNotification({
      title: "Order Ready for Pickup",
      description: "Your order #1002 is ready for pickup from Vindhya Canteen.",
      type: "success",
      action: {
        text: "Track Order",
        onClick: () => navigate("/orders/track/1002"),
      },
    });

    // Order status update notification
    addNotification({
      title: "Order Status Updated",
      description: "Your order #1003 is now being prepared. Estimated time: 15 minutes.",
      type: "info",
      action: {
        text: "View Details",
        onClick: () => navigate("/orders/1003"),
      },
    });

    // Order delay notification
    addNotification({
      title: "Order Delayed",
      description: "We apologize, but your order #1005 is taking longer than expected.",
      type: "warning",
      action: {
        text: "Track Order",
        onClick: () => navigate("/orders/track/1005"),
      },
    });

    // New promotion notification
    addNotification({
      title: "Special Discount Available",
      description: "Use code CAMPUS20 for 20% off on your next order.",
      type: "default",
      action: {
        text: "Order Now",
        onClick: () => navigate("/menu"),
      },
    });

    // Toast notification for immediate feedback
    toast.success("Notifications loaded successfully!");
  };

  return (
    <div className="flex items-center space-x-2">
      <NotificationBell variant="outline" />
      {/* {process.env.NODE_ENV === 'development' && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={generateMockNotifications}
          className="text-xs"
        >
          Test Notifications
        </Button>
      )} */}
    </div>
  );
};

export default UserNotifications;
