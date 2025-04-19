import { gql } from "graphql-tag";

export const CREATE_MENU_ITEM = gql`
  mutation CreateMenuItem(
    $name: String!,
    $price: Float!,
    $canteenId: Int!,
    $canteenName: String!,
    $currentUserId: String!,
    $description: String,
    $image: String,
    $category: String,
    $tags: [String!],
    $isPopular: Boolean,
    $preparationTime: Int,
    $customizationOptions: CustomizationOptionsInput
  ) {
    createMenuItem(
      name: $name,
      price: $price,
      canteenId: $canteenId,
      canteenName: $canteenName,
      currentUserId: $currentUserId,
      description: $description,
      image: $image,
      category: $category,
      tags: $tags,
      isPopular: $isPopular,
      preparationTime: $preparationTime,
      customizationOptions: $customizationOptions
    ) {
      success
      message
      itemId
    }
  }
`;

export const UPDATE_MENU_ITEM = gql`
  mutation UpdateMenuItem(
    $itemId: Int!,
    $currentUserId: String!,
    $name: String,
    $price: Float,
    $description: String,
    $image: String,
    $category: String,
    $isAvailable: Boolean,
    $isPopular: Boolean,
    $preparationTime: Int,
    $customizationOptions: CustomizationOptionsInput
  ) {
    updateMenuItem(
      itemId: $itemId,
      currentUserId: $currentUserId,
      name: $name,
      price: $price,
      description: $description,
      image: $image,
      category: $category,
      isAvailable: $isAvailable,
      isPopular: $isPopular,
      preparationTime: $preparationTime,
      customizationOptions: $customizationOptions
    ) {
      success
      message
      itemId
    }
  }
`;

export const DELETE_MENU_ITEM = gql`
  mutation DeleteMenuItem(
    $itemId: Int!,
    $currentUserId: String!
  ) {
    deleteMenuItem(
      itemId: $itemId,
      currentUserId: $currentUserId
    ) {
      success
      message
    }
  }
`;

// Input types for customization options
export const CUSTOMIZATION_OPTIONS_INPUT = gql`
  input SizeOptionInput {
    name: String!
    price: Float!
  }

  input AdditionOptionInput {
    name: String!
    price: Float!
  }

  input CustomizationOptionsInput {
    sizes: [SizeOptionInput!]
    additions: [AdditionOptionInput!]
    removals: [String!]
  }
`;
