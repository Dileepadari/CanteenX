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
 * Create a scheduled order for future pickup
 */
export const PLACE_SCHEDULED_ORDER = `
  mutation PlaceScheduledOrder(
    $userId: Int!,
    $canteenId: Int!,
    $items: [OrderItemInput!]!,
    $subtotal: Float!,
    $totalAmount: Float!,
    $paymentMethod: String,
    $pickupTime: String,
    $customerNote: String,
    $phone: String
  ) {
    placeScheduledOrder(
      userId: $userId,
      canteenId: $canteenId,
      items: $items,
      subtotal: $subtotal,
      totalAmount: $totalAmount,
      paymentMethod: $paymentMethod,
      pickupTime: $pickupTime,
      customerNote: $customerNote,
      phone: $phone
    ) {
      success
      message
      orderId
    }
  }
`;

/**
 * Update an existing order
 */
export const UPDATE_ORDER = `
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
 * Can only be performed by the canteen vendor or admin
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
  }`

export const GET_ALL_ORDERS_OF_USER = `
query GetAllOrders($userId: Int!) {
  getAllOrders(userId: $userId) {
    orderId
    userId
    orderId
    canteenId
    items {
      orderItemId
      orderId
      menuItemId
      menuItemName
      canteenId
      canteenName
      quantity
      unitPrice
      totalPrice
      size
      extras
      preparationTime
      isPrepared
      specialInstructions
      notes
    }
    subtotal
    taxAmount
    totalAmount
    status
    priority
    taxRate
    paymentStatus
    paymentMethod
    paymentId
    cancellationReason
    cancellationNotes
    pickupTime
    createdAt
    updatedAt
  }
}
`;

export const GET_ACTIVE_ORDERS_OF_USER = `
query GetActiveOrders($userId: Int!) {
    getActiveOrders(userId: $userId) {
        orderId
        userId
        orderId
        canteenId
        items {
        orderItemId
        orderId
        menuItemId
        menuItemName
        canteenId
        canteenName
        quantity
        unitPrice
        totalPrice
        size
        extras
        preparationTime
        isPrepared
        specialInstructions
        notes
        }
        subtotal
        taxAmount
        totalAmount
        status
        priority
        taxRate
        paymentStatus
        paymentMethod
        paymentId
        cancellationReason
        cancellationNotes
        pickupTime
        createdAt
        updatedAt
    }
    }
    `;

export const GET_ORDER_BY_ID = `
query GetOrderById($orderId: Int!) {
  getOrderById(orderId: $orderId) {
    orderId
    userId
    orderId
    canteenId
    items {
      orderItemId
      orderId
      menuItemId
      menuItemName
      canteenId
      canteenName
      quantity
      unitPrice
      totalPrice
      size
      extras
      preparationTime
      isPrepared
      specialInstructions
      notes
    }
    subtotal
    taxAmount
    totalAmount
    status
    priority
    taxRate
    paymentStatus
    paymentMethod
    paymentId
    cancellationReason
    cancellationNotes
    pickupTime
    createdAt
    updatedAt
  }
}
`;