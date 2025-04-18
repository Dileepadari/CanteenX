/**
 * GraphQL mutations related to shopping cart
 */

/**
 * Mutation to add a menu item to the user's cart
 */
export const ADD_TO_CART = `
mutation AddToCart(
  $userId: Int!,
  $menuItemId: Int!,
  $quantity: Int,
  $selectedSize: String,
  $selectedExtras: String,
  $specialInstructions: String,
  $location: String
) {
  addToCart(
    userId: $userId,
    menuItemId: $menuItemId,
    quantity: $quantity,
    selectedSize: $selectedSize,
    selectedExtras: $selectedExtras,
    specialInstructions: $specialInstructions,
    location: $location
  ) {
    success
    message
  }
}
`;

/**
 * Mutation to update a cart item's details (quantity, size, extras, etc.)
 */
export const UPDATE_CART_ITEM = `
mutation UpdateCartItem(
  $cartItemId: Int!,
  $quantity: Int,
  $selectedSize: String,
  $selectedExtras: String,
  $specialInstructions: String,
  $location: String
) {
  updateCartItem(
    cartItemId: $cartItemId,
    quantity: $quantity,
    selectedSize: $selectedSize,
    selectedExtras: $selectedExtras,
    specialInstructions: $specialInstructions,
    location: $location
  ) {
    success
    message
  }
}
`;

/**
 * Mutation to remove an item from the cart
 */
export const REMOVE_FROM_CART = `
mutation RemoveFromCart(
  $userId: Int!,
  $cartItemId: Int!
) {
  removeFromCart(
    userId: $userId,
    cartItemId: $cartItemId
  ) {
    success
    message
  }
}
`;

/**
 * Mutation to clear the user's entire cart
 */
export const CLEAR_CART = `
mutation ClearCart($userId: Int!) {
  clearCart(
    userId: $userId
  ) {
    success
    message
  }
}
`;