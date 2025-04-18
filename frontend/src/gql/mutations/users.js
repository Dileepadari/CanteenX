/**
 * GraphQL mutations related to users
 */

/**
 * Mutation to update a user's profile
 */
export const UPDATE_USER_PROFILE = `
  mutation UpdateUserProfile(
    $userId: Int!,
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
export const UPDATE_FAVORITE_CANTEENS = `
  mutation UpdateFavoriteCanteens(
    $userId: Int!,
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
export const DEACTIVATE_USER = `
  mutation DeactivateUser(
    $userId: Int!,
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
