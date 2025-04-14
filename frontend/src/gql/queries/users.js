export const GET_USERS = `
  query GetUsers {
    getUsers {
      id
      name
      email
      profilePicture
      preferredPayment
    }
  }
`;

export const GET_USER_BY_ID = `
  query GetUserById($userId: Int!) {
    getUserById(userId: $userId) {
      id
      name
      email
      profilePicture
      preferredPayment
    }
  }
`;

export const GET_USER_PROFILE = `
  query GetUserProfile($userId: Int!) {
    getUserProfile(userId: $userId) {
      user {
        id
        name
        email
        profilePicture
        preferredPayment
      }
      favoriteCanteenId
      dietaryPreferences
      recentOrders
    }
  }
`;