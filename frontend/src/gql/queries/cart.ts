import { gql } from "graphql-tag";

export const GET_CART_ITEMS = gql`
  query GetCartByUserId($userId: String!) {
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
        name
        price
        quantity
        canteenId
        canteenName
        customizations {
          size
          additions
          removals
          notes
        }
        specialInstructions
        location
      }
    }
  }
`;

export const GET_CART_SUMMARY = gql`
  query GetCartByUserId($userId: String!) {
    getCartByUserId(userId: $userId) {
      id
      userId
      items {
        id
        menuItemId
        name
        price
        quantity
        canteenId
        canteenName
      }
    }
  }
`;

export const GET_CART_FOR_CHECKOUT = gql`
  query GetCartByUserId($userId: String!) {
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
        name
        price
        quantity
        canteenId
        canteenName
        customizations {
          size
          additions
          removals
          notes
        }
        specialInstructions
        location
      }
    }
  }
`;
