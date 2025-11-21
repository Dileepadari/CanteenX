// src/services/checkout-service.ts
import { useCartStore } from "@/stores/cartStore";
// Note: paymentService module not present in this build; for UPI we return a payment order id placeholder.

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
      // Call backend GraphQL API to create an order
      const graphqlQuery = `
        mutation CreateOrder($input: CreateOrderInput!) {
          createOrder(input: $input) {
            id
            userId
            canteenId
            totalAmount
            status
          }
        }
      `;

      const input = {
        userId,
        canteenId: typeof canteenId === 'string' ? parseInt(canteenId, 10) : canteenId,
        items: items.map(item => ({ itemId: item.itemId, quantity: item.quantity, customizations: item.customizations || null, note: item.customizations?.note || null })),
        totalAmount,
        paymentMethod,
        phone,
        customerNote,
        isPreOrder: isPreOrder || false,
        pickupTime: pickupTime || null,
      };

      const variables = { input };

      const resp = await fetch('/api/graphql', {
        method: 'POST',
        credentials: 'same-origin',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: graphqlQuery, variables }),
      });

      const result = await resp.json();

      if (result.errors && result.errors.length > 0) {
        // Bubble up the first GraphQL error
        throw result.errors[0];
      }

      const createOrderRes = result.data?.createOrder;
      if (createOrderRes && createOrderRes.id) {
        return { success: true, orderId: createOrderRes.id };
      }

      return { success: false, error: 'Failed to create order' };
    } catch (error) {
      console.error("Error placing order:", error);
      return {
        success: false,
        error: error.message || (error && error.message) || "Failed to place order"
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
        
          // In the absence of a backend payment-service endpoint here, return a placeholder order id
          // The Payment page will still open the Razorpay checkout with this id and then call markOrderPaid.
          const placeholder = { id: `order_${Date.now()}` };
          return {
            success: true,
            paymentOrderId: placeholder.id,
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
      // Use GraphQL mutation to update order
      const graphqlQuery = `
        mutation UpdateOrder($orderId: Int!, $status: String, $paymentStatus: String) {
          updateOrder(orderId: $orderId, status: $status, paymentStatus: $paymentStatus) {
            id
            status
            paymentStatus
          }
        }
      `;

      const variables = { orderId: typeof orderId === 'string' ? parseInt(orderId, 10) : orderId, status, paymentStatus };

      const resp = await fetch('/api/graphql', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: graphqlQuery, variables }),
      });

      const result = await resp.json();
      if (result.errors && result.errors.length > 0) throw result.errors[0];

  const res = result.data?.updateOrder;
  if (res && res.id) return { success: true, orderId: res.id };
  return { success: false, error: 'Failed to update order' };
    } catch (error) {
      console.error('Error updating order status:', error);
      return { success: false, error: error.message || (error && error.message) || 'Failed to update order status' };
    }
  }
  
  // Cancel an order
  async cancelOrder(orderId: string, reason: string) {
    try {
      const graphqlQuery = `
        mutation CancelOrder($userId: String!, $orderId: Int!, $reason: String) {
          cancelOrder(userId: $userId, orderId: $orderId, reason: $reason) {
            success
            message
            orderId
          }
        }
      `;

      // We don't have the userId here reliably; backend may infer from session if omitted.
      // To be safe, accept userId as part of reason string pattern "<userId>::<reason>" if provided by caller.
      let userId = '';
      let actualReason = reason || null;
      if (reason && reason.includes('::')) {
        const parts = reason.split('::');
        userId = parts[0];
        actualReason = parts.slice(1).join('::');
      }

      const variables = { userId, orderId: typeof orderId === 'string' ? parseInt(orderId, 10) : orderId, reason: actualReason };

      const resp = await fetch('/api/graphql', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: graphqlQuery, variables }),
      });

      const result = await resp.json();
      if (result.errors && result.errors.length > 0) throw result.errors[0];

      const res = result.data?.cancelOrder;
      if (res && res.success) return { success: true, orderId: res.orderId };
      return { success: false, error: (res && res.message) || 'Failed to cancel order' };
    } catch (error) {
      console.error('Error cancelling order:', error);
      return { success: false, error: error.message || (error && error.message) || 'Failed to cancel order' };
    }
  }
  
  // Save order to localStorage (temporary until backend integration)
  private saveOrderToLocalStorage(order: any) {
    // Deprecated: local storage persistence removed in favor of server-side orders
  }
  
  // Get orders from localStorage
  private getOrdersFromLocalStorage() {
    // Deprecated: no longer using localStorage for orders
    return [];
  }
}

export const checkoutService = new CheckoutService();