/**
 * GraphQL mutations related to orders
 */

export const CREATE_ORDER = `
  mutation CreateOrder(
    $userId: Int!,
    $canteenId: Int!,
    $items: [OrderItemInput!]!,
    $paymentMethod: String!,
    $phone: String!,
    $customerNote: String,
    $isPreOrder: Boolean,
    $pickupTime: String
  ) {
    createOrder(
      userId: $userId,
      canteenId: $canteenId,
      items: $items,
      paymentMethod: $paymentMethod,
      phone: $phone,
      customerNote: $customerNote,
      isPreOrder: $isPreOrder,
      pickupTime: $pickupTime
    ) {
      success
      message
      orderId
    }
  }
`;

/**
 * Update order status
 * Can only be performed by the canteen vendor (where canteen.userId matches the authenticated user)
 */
export const UPDATE_ORDER_STATUS = `
  mutation UpdateOrderStatus(
    $orderId: Int!,
    $status: String!,
    $currentUserId: Int!
  ) {
    updateOrderStatus(
      orderId: $orderId,
      status: $status,
      currentUserId: $currentUserId
    ) {
      success
      message
      orderId
    }
  }
`;

/**
 * Cancel an order
 * For customers: Can only be performed if userId matches the order's userId
 * For vendors: Can be performed if userId matches the canteen's userId
 */
export const CANCEL_ORDER = `
  mutation CancelOrder(
    $orderId: Int!,
    $userId: Int!,
    $reason: String!
  ) {
    cancelOrder(
      orderId: $orderId,
      userId: $userId,
      reason: $reason
    ) {
      success
      message
      orderId
    }
  }
`;

/**
 * Update payment status
 * Can only be performed by the canteen vendor (where canteen.userId matches the authenticated user)
 */
export const UPDATE_PAYMENT_STATUS = `
  mutation UpdatePaymentStatus(
    $orderId: Int!,
    $paymentStatus: String!,
    $currentUserId: Int!
  ) {
    updatePaymentStatus(
      orderId: $orderId,
      paymentStatus: $paymentStatus,
      currentUserId: $currentUserId
    ) {
      success
      message
      orderId
    }
  }
`;

export const UPDATE_ORDER_PREPARATION_TIME = `
  mutation UpdateOrderPreparationTime(
    $orderId: Int!,
    $preparationTime: Int!,
    $userEmail: String!
  ) {
    updateOrderPreparationTime(
      orderId: $orderId,
      preparationTime: $preparationTime,
      userEmail: $userEmail
    ) {
      success
      message
    }
  }
`;