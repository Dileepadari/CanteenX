/**
 * GraphQL mutations related to orders
 */

import { gql } from "@apollo/client";

export const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      id
      userId
      canteenId
      totalAmount
      status
      orderTime
      paymentMethod
      paymentStatus
      phone
      pickupTime
      isPreOrder
    }
  }
`;

/**
 * Update order status
 * Can only be performed by the canteen vendor (where canteen.userId matches the authenticated user)
 */
export const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus(
    $orderId: Int!,
    $status: String!,
    $currentUserId: String!
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
 * Create a scheduled order for future pickup
 */
export const PLACE_SCHEDULED_ORDER = gql`
  mutation PlaceScheduledOrder($input: CreateOrderInput!) {
    placeScheduledOrder(input: $input) {
      id
      userId
      canteenId
      totalAmount
      status
      orderTime
      paymentMethod
      paymentStatus
      phone
      pickupTime
      isPreOrder
    }
  }
`;

/**
 * Update an existing order
 */
export const UPDATE_ORDER = gql`
  mutation UpdateOrder(
    $orderId: Int!,
    $status: String,
    $paymentStatus: String,
    $paymentMethod: String,
    $pickupTime: String,
    $customerNote: String
  ) {
    updateOrder(
      orderId: $orderId,
      status: $status,
      paymentStatus: $paymentStatus,
      paymentMethod: $paymentMethod,
      pickupTime: $pickupTime,
      customerNote: $customerNote
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
 */
export const CANCEL_ORDER = gql`
  mutation CancelOrder(
    $userId: String!,
    $orderId: Int!,
    $reason: String
  ) {
    cancelOrder(
      userId: $userId,
      orderId: $orderId,
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
 * Can only be performed by the canteen vendor or admin
 */
export const UPDATE_PAYMENT_STATUS = gql`
  mutation UpdatePaymentStatus(
    $orderId: Int!,
    $paymentStatus: String!,
    $currentUserId: String!
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

export const UPDATE_ORDER_PREPARATION_TIME = gql`
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

export const MARK_ORDER_PAID = gql`
  mutation MarkOrderPaid($orderId: Int!, $paymentReference: String) {
    markOrderPaid(orderId: $orderId, paymentReference: $paymentReference) {
      id
      status
      paymentStatus
    }
  }
`;

// Fix queries to use String type for userId
export const GET_ALL_ORDERS_OF_USER = gql`
query GetAllOrders($userId: String!) {
  getAllOrders(userId: $userId) {
    id
    userId
    canteenId
    items
    totalAmount
    status
    orderTime
    paymentMethod
    paymentStatus
    customerNote
    phone
    pickupTime
    isPreOrder
  }
}
`;

export const GET_ACTIVE_ORDERS_OF_USER = gql`
query GetActiveOrders($userId: String!) {
    getActiveOrders(userId: $userId) {
      id
      userId
      canteenId
      items
      totalAmount
      status
      orderTime
      paymentMethod
      paymentStatus
      customerNote
      phone
      pickupTime
      isPreOrder
    }
}
`;

export const GET_ORDER_BY_ID = gql`
query GetOrderById($orderId: Int!) {
  getOrderById(orderId: $orderId) {
    id
    userId
    canteenId
    items
    totalAmount
    status
    orderTime
    paymentMethod
    paymentStatus
    customerNote
    phone
    pickupTime
    isPreOrder
  }
}
`;