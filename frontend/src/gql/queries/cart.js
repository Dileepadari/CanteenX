/**
 * GraphQL queries related to shopping cart
 */

/**
 * Query to fetch all items in a user's cart
 */
export const GET_CART_ITEMS = `
  query GetCartItems($userId: Int!) {
    getCartItems(userId: $userId) {
      id
      userId
      createdAt
      updatedAt
      items {
        id
        menuItemId
        name
        price
        quantity
        customizations
        image
        description
        vendorName
      }
    }
  }
`;

/**
 * Mutation to add an item to the cart
 */
export const ADD_TO_CART = `
  mutation AddToCart($userId: Int!, $menuItemId: Int!, $quantity: Int!, $customizations: String) {
    addToCart(userId: $userId, menuItemId: $menuItemId, quantity: $quantity, customizations: $customizations) {
      id
      userId
      items {
        id
        menuItemId
        name
        price
        quantity
        customizations
        image
        description
        vendorName
      }
    }
  }
`;

/**
 * Mutation to update the quantity of an item in the cart
 */
export const UPDATE_CART_ITEM = `
  mutation UpdateCartItem($userId: Int!, $cartItemId: Int!, $quantity: Int!) {
    updateCartItem(userId: $userId, cartItemId: $cartItemId, quantity: $quantity) {
      id
      userId
      items {
        id
        menuItemId
        name
        price
        quantity
        customizations
        image
        description
        vendorName
      }
    }
  }
`;

/**
 * Mutation to remove an item from the cart
 */
export const REMOVE_FROM_CART = `
  mutation RemoveFromCart($userId: Int!, $cartItemId: Int!) {
    removeFromCart(userId: $userId, cartItemId: $cartItemId) {
      id
      userId
      items {
        id
        menuItemId
        name
        price
        quantity
        customizations
      }
    }
  }
`;

/**
 * Mutation to clear the entire cart
 */
export const CLEAR_CART = `
  mutation ClearCart($userId: Int!) {
    clearCart(userId: $userId)
  }
`;