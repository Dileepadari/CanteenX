// Canteen mutations
export const CREATE_CANTEEN = `
  mutation CreateCanteen(
    $currUserId: Int!,
    $userId: Int!,
    $name: String!,
    $location: String!,
    $phone: String!,
    $openTime: String!,
    $closeTime: String!,
    $description: String,
    $image: String
  ) {
    createCanteen(
      currUserId: $currUserId,
      userId: $userId,
      name: $name,
      location: $location,
      phone: $phone,
      openTime: $openTime,
      closeTime: $closeTime,
      description: $description,
      image: $image
    ) {
      success
      message
      canteenId
    }
  }
`;

export const UPDATE_CANTEEN = `
  mutation UpdateCanteen(
    $canteenId: Int!,
    $userId: Int!,
    $name: String,
    $location: String,
    $phone: String,
    $openTime: String,
    $closeTime: String,
    $description: String,
    $image: String,
    $isOpen: Boolean
  ) {
    updateCanteen(
      canteenId: $canteenId,
      userId: $userId,
      name: $name,
      location: $location,
      phone: $phone,
      openTime: $openTime,
      closeTime: $closeTime,
      description: $description,
      image: $image,
      isOpen: $isOpen
    ) {
      success
      message
      canteenId
    }
  }
`;

export const DELETE_CANTEEN = `
  mutation DeleteCanteen(
    $canteenId: Int!,
    $currUserId: Int!
  ) {
    deleteCanteen(
      canteenId: $canteenId,
      currUserId: $currUserId
    ) {
      success
      message
    }
  }
`;

export const UPDATE_CANTEEN_STATUS = `
  mutation UpdateCanteenStatus(
    $canteenId: Int!,
    $isOpen: Boolean!,
    $userId: Int!
  ) {
    updateCanteenStatus(
      canteenId: $canteenId,
      isOpen: $isOpen,
      userId: $userId
    ) {
      success
      message
      canteenId
    }
  }
`; 