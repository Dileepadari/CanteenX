/**
 * GraphQL queries related to shopping cart
 */

import { gql } from "graphql-tag";

/**
 * Query to fetch all items in a user's cart
 */
export const GET_CART_ITEMS = gql`
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
export const GET_CART_SUMMARY = gql`
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
export const GET_CART_FOR_CHECKOUT = gql`
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




