import { gql } from "graphql-tag";

export const CREATE_CANTEEN = gql`
  mutation CreateCanteen(
    $currUserId: Int!,
    $userId: Int!,
    $name: String!,
    $location: String!,
    $phone: String!,
    $openTime: String!,
    $closeTime: String!,
    $description: String,
    $image: String,
    $email: String,
    $schedule: ScheduleInput,
    $tags: [String!]
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
      image: $image,
      email: $email,
      schedule: $schedule,
      tags: $tags
    ) {
      success
      message
      canteenId
    }
  }
`;

export const UPDATE_CANTEEN = gql`
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
    $isOpen: Boolean,
    $email: String,
    $schedule: ScheduleInput,
    $tags: [String!]
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
      isOpen: $isOpen,
      email: $email,
      schedule: $schedule,
      tags: $tags
    ) {
      success
      message
      canteenId
    }
  }
`;

export const DELETE_CANTEEN = gql`
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

export const UPDATE_CANTEEN_STATUS = gql`
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

// Define ScheduleInput input type for schedule object
export const SCHEDULE_INPUT = gql`
  input ScheduleInput {
    breakfast: String
    lunch: String
    dinner: String
    regular: String
    evening: String
    night: String
    weekday: String
    weekend: String
  }
`;
