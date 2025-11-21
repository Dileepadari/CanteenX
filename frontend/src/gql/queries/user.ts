/**
 * GraphQL queries related to users
 */

import { gql } from "graphql-tag";

/**
 * Query to get a user by ID
 */
export const GET_USER_BY_ID = gql`
  query GetUserById($id: Int!) {
    getUserById(id: $id) {
      id
      name
      email
      role
      favoriteCanteens
      recentOrders
      isActive
    }
  }
`;

/**
 * Query to get a user by email
 */
export const GET_USER_BY_EMAIL = gql`
  query GetUserByEmail($email: String!) {
    getUserByEmail(email: $email) {
      id
      name
      email
      role
      favoriteCanteens
      recentOrders
      isActive
    }
  }
`;

/**
 * Query to get users by role
 */
export const GET_USERS_BY_ROLE = gql`
  query GetUsersByRole($role: String!) {
    getUsersByRole(role: $role) {
      id
      name
      email
      role
      isActive
    }
  }
`;

/**
 * Query to search users by name or email
 */
export const SEARCH_USERS = gql`
  query SearchUsers($query: String!) {
    searchUsers(query: $query) {
      id
      name
      email
      role
      isActive
    }
  }
`;

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    getCurrentUser {
      id
      name
      email
      role
      favoriteCanteens
      recentOrders
      profilePicture
      isVegetarian
      notifPrefs
    }
  }
`;
