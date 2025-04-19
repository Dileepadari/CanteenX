/**
 * GraphQL queries for orders
 */

import { gql } from "graphql-tag";

/**
 * Query to fetch orders for a user
 */
export const GET_USER_ORDERS = gql`
  query GetUserOrders($userId: String!) {
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
        itemId
        quantity
        customizations{
          additions
          notes
          removals
          size
        }
        note
      }
    }
  }
`;

/**
 * Query to fetch all orders for a user
 */
export const GET_ALL_ORDERS = gql`
  query GetAllOrders($userId: String!) {
    getAllOrders(userId: $userId) {
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
        itemId
        quantity
        customizations{
          additions
          notes
          removals
          size
        }
        note
      }
    }
  }
`;

/**
 * Query to fetch active orders for a user
 */
export const GET_ACTIVE_ORDERS = gql`
  query GetActiveOrders($userId: String!) {
    getActiveOrders(userId: $userId) {
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
        itemId
        quantity
        customizations{
          additions
          notes
          removals
          size
        }
        note
      }
    }
  }
`;

/**
 * Query to fetch orders for a canteen
 */
export const GET_CANTEEN_ORDERS = gql`
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
        itemId
        quantity
        customizations{
          additions
          notes
          removals
          size
        }
        note
      }
    }
  }
`;

/**
 * Query to fetch a specific order by ID
 */
export const GET_ORDER_BY_ID = gql`
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
        itemId
        quantity
        customizations{
          additions
          notes
          removals
          size
        }
        note
      }
    }
  }
`;

/**
 * Query to fetch orders by status
 */
export const GET_ORDERS_BY_STATUS = gql`
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
        itemId
        quantity
        customizations{
          additions
          notes
          removals
          size
        }
        note
      }
    }
  }
`;