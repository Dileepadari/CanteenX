
import React from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { Button } from '@/components/ui/button';

const VendorNotifications = () => {
  const { addNotification } = useNotification();
  const navigate = useNavigate();

  // Function to generate mock notifications for testing
  const generateMockNotifications = () => {
    // Order notification
    addNotification({
      title: "New Order Received",
      description: "Order #1234 has been placed. Please confirm.",
      type: "default",
      action: {
        text: "View Order",
        onClick: () => navigate("/vendor/orders"),
      },
    });

    // Out of stock notification
    addNotification({
      title: "Item Out of Stock",
      description: "Butter Chicken is running low. Please update inventory.",
      type: "warning",
      action: {
        text: "Update Inventory",
        onClick: () => navigate("/vendor/menu"),
      },
    });

    // Review notification
    addNotification({
      title: "New Review",
      description: "A customer left a 5-star review for your Paneer Tikka.",
      type: "success",
      action: {
        text: "View Reviews",
        onClick: () => navigate("/vendor/analytics"),
      },
    });
  };

  return (
    <div className="flex items-center space-x-2">
      <NotificationBell variant="outline" />
      {process.env.NODE_ENV === 'development' && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={generateMockNotifications}
          className="text-xs"
        >
          Test Notifications
        </Button>
      )}
    </div>
  );
};

export default VendorNotifications;
