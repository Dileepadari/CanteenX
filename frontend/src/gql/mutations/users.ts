/**
 * GraphQL mutations related to users
 */

import { gql } from "graphql-tag";

/**
 * Mutation to update a user's profile
 */

export const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      message
      user {
        id
        name
        role
      }
    }
  }
`;

export const UPDATE_USER_PROFILE = gql`
  mutation UpdateUserProfile(
    $userId: String!,
    $name: String,
    $email: String
  ) {
    updateUserProfile(
      userId: $userId,
      name: $name,
      email: $email
    ) {
      success
      message
      userId
    }
  }
`;

/**
 * Mutation to update a user's favorite canteens
 */
export const UPDATE_FAVORITE_CANTEENS = gql`
  mutation UpdateFavoriteCanteens(
    $userId: String!,
    $canteenIds: [Int!]!
  ) {
    updateFavoriteCanteens(
      userId: $userId,
      canteenIds: $canteenIds
    ) {
      success
      message
      userId
    }
  }
`;

/**
 * Mutation to deactivate a user (admin only)
 */
export const DEACTIVATE_USER = gql`
  mutation DeactivateUser(
    $userId: String!,
    $adminId: Int!
  ) {
    deactivateUser(
      userId: $userId,
      adminId: $adminId
    ) {
      success
      message
      userId
    }
  }
`;
