/**
 * GraphQL queries related to shopping cart
 */

/**
 * Query to fetch all items in a user's cart
 */
export const GET_CART_ITEMS = `
  query GetCartByUserId($userId: Int!) {
    getCartByUserId(userId: $userId) {
      id
      userId
      createdAt
      updatedAt
      pickupDate
      pickupTime
      items {
        id
        cartId
        menuItemId
        quantity
        selectedSize
        selectedExtras
        specialInstructions
        location
      }
    }
  }
`;

/**
 * Query to fetch cart with minimal item details (for quick checks)
 */
export const GET_CART_SUMMARY = `
  query GetCartByUserId($userId: Int!) {
    getCartByUserId(userId: $userId) {
      id
      userId
      items {
        id
        menuItemId
        quantity
      }
    }
  }
`;

/**
 * Query to fetch cart with item details for checkout
 */
export const GET_CART_FOR_CHECKOUT = `
  query GetCartByUserId($userId: Int!) {
    getCartByUserId(userId: $userId) {
      id
      userId
      createdAt
      updatedAt
      pickupDate
      pickupTime
      items {
        id
        menuItemId
        quantity
        selectedSize
        selectedExtras
        specialInstructions
        location
      }
    }
  }
`;




