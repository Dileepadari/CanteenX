/**
 * GraphQL mutations related to shopping cart
 */

import { gql } from "graphql-tag";

/**
 * Mutation to add a menu item to the user's cart
 */
export const ADD_TO_CART = gql`
mutation AddToCart($input: AddToCartInput!) {
  addToCart(input: $input) {
    success
    message
    cartItem {
      id
      name
      price
      quantity
      customizations {
        size
        additions
        removals
        notes
      }
    }
  }
}
`;


/**
 * Mutation to update a cart item's details (quantity, size, extras, etc.)
 */
export const UPDATE_CART_ITEM = gql`
mutation UpdateCartItemQuantity(
  $cartItemId: Int!,
  $quantity: Int!
) {
  updateCartItemQuantity(
    cartItemId: $cartItemId,
    quantity: $quantity
  ) {
    success
    message
  }
}
`;

/**
 * Mutation to remove an item from the cart
 */
export const REMOVE_FROM_CART = gql`
mutation RemoveFromCart(
  $cartItemId: Int!
) {
  removeFromCart(
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
export const CLEAR_CART = gql`
mutation ClearCart {
  clearCart {
    success
    message
  }
}
`;