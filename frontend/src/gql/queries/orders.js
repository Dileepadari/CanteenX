/**
 * GraphQL queries related to orders
 */

/**
 * Query to fetch active orders for the current user
 * Active orders are those with status other than "Completed" or "Cancelled"
 */
export const GET_ACTIVE_ORDERS = `
  query GetActiveOrders($userId: Int!) {
    getActiveOrders(userId: $userId) {
      id
      date
      total
      status
      canteenName
      vendorName
      estimatedDeliveryTime
      currentStatus
      steps {
        status
        description
        time
        completed
        current
      }
      items {
        id
        name
        price
        quantity
        customizations
        vendorName
      }
    }
  }
`;

/**
 * Query to fetch order history for the current user
 * Order history includes all past orders (completed or cancelled)
 */
export const GET_ORDER_HISTORY = `
  query GetOrderHistory($userId: Int!, $limit: Int, $offset: Int) {
    getOrderHistory(userId: $userId, limit: $limit, offset: $offset) {
      id
      date
      total
      status
      canteenName
      vendorName
      items {
        id
        name
        price
        quantity
        customizations
        vendorName
      }
    }
  }
`;

/**
 * Query to fetch a specific order by ID
 */
export const GET_ORDER_BY_ID = `
  query GetOrderById($orderId: String!) {
    getOrderById(orderId: $orderId) {
      id
      date
      total
      status
      canteenName
      vendorName
      estimatedDeliveryTime
      currentStatus
      steps {
        status
        description
        time
        completed
        current
      }
      items {
        id
        name
        price
        quantity
        customizations
        vendorName
      }
    }
  }
`;