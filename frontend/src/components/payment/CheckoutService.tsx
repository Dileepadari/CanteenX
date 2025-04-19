// src/services/checkout-service.ts
import { useCartStore } from "@/stores/cartStore";
import { paymentService } from "./payment-service";

export interface OrderPlacementDetails {
  userId: string;
  items: Array<{
    itemId: number;
    quantity: number;
    customizations?: any;
  }>;
  totalAmount: number;
  canteenId: number | string;
  paymentMethod: string;
  phone: string;
  customerNote?: string;
  isPreOrder?: boolean;
  pickupTime?: string;
}

export class CheckoutService {
  // Create an order with the cart items
  async placeOrder(orderDetails: OrderPlacementDetails) {
    try {
      // Prepare order data
      const { userId, items, totalAmount, canteenId, paymentMethod, phone, customerNote, isPreOrder, pickupTime } = orderDetails;
      
      // Create a timestamp for order creation
      const timestamp = new Date().toISOString();
      
      // Generate a temporary orderId for local storage until proper backend integration
      const orderId = `ORD${Math.floor(100000 + Math.random() * 900000)}`;
      
      // Create an order object
      const order = {
        id: orderId,
        userId,
        canteenId,
        items: items.map(item => ({
          itemId: item.itemId,
          quantity: item.quantity,
          customizations: item.customizations,
        })),
        totalAmount,
        status: paymentMethod === "CASH" ? "pending" : "pending_payment",
        orderTime: timestamp,
        paymentMethod,
        paymentStatus: paymentMethod === "CASH" ? "Pending" : "Pending",
        customerNote,
        phone,
        isPreOrder: isPreOrder || false,
        pickupTime,
      };
      
      // For dev purposes, save to localStorage 
      this.saveOrderToLocalStorage(order);
      
      return {
        success: true,
        orderId: order.id,
        order
      };
    } catch (error) {
      console.error("Error placing order:", error);
      return {
        success: false,
        error: error.message || "Failed to place order"
      };
    }
  }
  
  // Process payment for an order
  async processPayment(orderId: string, userId: string, paymentMethod: string, amount: number) {
    if (paymentMethod === "CASH") {
      // For cash payments, just update the order status
      return this.updateOrderStatus(orderId, "confirmed", "Pending");
    } else if (paymentMethod === "UPI") {
      // For UPI, use Razorpay
      try {
        // Create payment order data
        const orderData = {
          amount: Math.round(amount * 100), // Convert to paisa
          currency: "INR",
          receipt: `receipt_${orderId}`,
          userId
        };
        
        // Call payment service to create order
        const paymentOrder = await paymentService.createPaymentOrder(orderData);
        
        return {
          success: true,
          paymentOrderId: paymentOrder.id,
          amount: amount,
        };
      } catch (error) {
        console.error("Payment processing error:", error);
        return {
          success: false,
          error: error.message || "Failed to process payment"
        };
      }
    }
  }
  
  // Update order status after payment
  async updateOrderStatus(orderId: string, status: string, paymentStatus: string) {
    try {
      // Get order from localStorage
      const orders = this.getOrdersFromLocalStorage();
      const orderIndex = orders.findIndex(order => order.id === orderId);
      
      if (orderIndex >= 0) {
        orders[orderIndex].status = status;
        orders[orderIndex].paymentStatus = paymentStatus;
        
        if (status === "confirmed") {
          orders[orderIndex].confirmedTime = new Date().toISOString();
        }
        
        localStorage.setItem("smartCanteenOrders", JSON.stringify(orders));
        
        return {
          success: true,
          order: orders[orderIndex]
        };
      }
      
      return {
        success: false,
        error: "Order not found"
      };
    } catch (error) {
      console.error("Error updating order status:", error);
      return {
        success: false,
        error: error.message || "Failed to update order status"
      };
    }
  }
  
  // Cancel an order
  async cancelOrder(orderId: string, reason: string) {
    try {
      // Get order from localStorage
      const orders = this.getOrdersFromLocalStorage();
      const orderIndex = orders.findIndex(order => order.id === orderId);
      
      if (orderIndex >= 0) {
        // Check if order can be cancelled (only pending and confirmed orders)
        const currentStatus = orders[orderIndex].status;
        if (!["pending", "confirmed"].includes(currentStatus)) {
          return {
            success: false,
            error: `Cannot cancel an order in ${currentStatus} status`
          };
        }
        
        orders[orderIndex].status = "cancelled";
        orders[orderIndex].cancellationReason = reason;
        orders[orderIndex].cancelledTime = new Date().toISOString();
        
        localStorage.setItem("smartCanteenOrders", JSON.stringify(orders));
        
        return {
          success: true,
          order: orders[orderIndex]
        };
      }
      
      return {
        success: false,
        error: "Order not found"
      };
    } catch (error) {
      console.error("Error cancelling order:", error);
      return {
        success: false,
        error: error.message || "Failed to cancel order"
      };
    }
  }
  
  // Save order to localStorage (temporary until backend integration)
  private saveOrderToLocalStorage(order: any) {
    const orders = this.getOrdersFromLocalStorage();
    orders.push(order);
    localStorage.setItem("smartCanteenOrders", JSON.stringify(orders));
  }
  
  // Get orders from localStorage
  private getOrdersFromLocalStorage() {
    return JSON.parse(localStorage.getItem("smartCanteenOrders") || "[]");
  }
}

export const checkoutService = new CheckoutService();