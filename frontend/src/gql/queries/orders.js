/**
 * GraphQL queries related to orders
 */

/**
 * Query to fetch orders for a user
 */
export const GET_USER_ORDERS = `
  query GetUserOrders($userId: Int!) {
    getUserOrders(userId: $userId) {
      id
      userId
      canteenId
      totalAmount
      status
      orderTime
      confirmedTime
      preparingTime
      readyTime
      deliveryTime
      cancelledTime
      pickupTime
      paymentMethod
      paymentStatus
      customerNote
      cancellationReason
      discount
      phone
      isPreOrder
      items {
        id
        itemId
        quantity
        customizations
        note
      }
    }
  }
`;

/**
 * Query to fetch orders for a canteen
 */
export const GET_CANTEEN_ORDERS = `
  query GetCanteenOrders($canteenId: Int!) {
    getCanteenOrders(canteenId: $canteenId) {
      id
      userId
      canteenId
      totalAmount
      status
      orderTime
      confirmedTime
      preparingTime
      readyTime
      deliveryTime
      cancelledTime
      pickupTime
      paymentMethod
      paymentStatus
      customerNote
      cancellationReason
      discount
      phone
      isPreOrder
      items {
        id
        itemId
        quantity
        customizations
        note
      }
    }
  }
`;

/**
 * Query to fetch a specific order by ID
 */
export const GET_ORDER_BY_ID = `
  query GetOrderById($orderId: Int!) {
    getOrderById(orderId: $orderId) {
      id
      userId
      canteenId
      totalAmount
      status
      orderTime
      confirmedTime
      preparingTime
      readyTime
      deliveryTime
      cancelledTime
      pickupTime
      paymentMethod
      paymentStatus
      customerNote
      cancellationReason
      discount
      phone
      isPreOrder
      items {
        id
        itemId
        quantity
        customizations
        note
      }
    }
  }
`;

/**
 * Query to fetch orders by status
 */
export const GET_ORDERS_BY_STATUS = `
  query GetOrdersByStatus($status: String!) {
    getOrdersByStatus(status: $status) {
      id
      userId
      canteenId
      totalAmount
      status
      orderTime
      confirmedTime
      preparingTime
      readyTime
      deliveryTime
      cancelledTime
      pickupTime
      paymentMethod
      paymentStatus
      customerNote
      cancellationReason
      discount
      phone
      isPreOrder
      items {
        id
        itemId
        quantity
        customizations
        note
      }
    }
  }
`;