/*

this query is for updating the price of an item by the vendor :
*/

import { gql } from "graphql-tag";

export const UPDATE_PRICE = gql`
mutation UpdateMenuItemPrice($itemId:Int!, $price: Float!, $currentUserId:Int!){
  updateMenuItemPrice(
    itemId: $itemId, 
    price: $price,
    currentUserId: $currentUserId
  ) {
    success
    message
  }
}
`;



/**
 
this query is to update the availability of an item 
 */

export const UPDATE_AVAILABILITY = gql`
mutation UpdateAvailability($itemId:Int!, $isAvailable:Boolean!, $currentUserId:Int!){
  updateMenuItemAvailability(itemId: $itemId, isAvailable: $isAvailable, currentUserId: $currentUserId) {
    success
    message
  }
}
`;

export const CREATE_MENU_ITEM = gql`
  mutation CreateMenuItem(
    $name: String!,
    $price: Float!,
    $canteenId: Int!,
    $canteenName: String!,
    $currentUserId: Int!,
    $description: String,
    $image: String,
    $category: String,
    $tags: [String],
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
    $currentUserId: Int!,
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
  mutation DeleteMenuItem($itemId: Int!, $currentUserId: Int!) {
    deleteMenuItem(itemId: $itemId, currentUserId: $currentUserId) {
      success
      message
      itemId
    }
  }
`;

export const TOGGLE_FEATURED_STATUS = gql`
mutation ToggleFeaturedStatus($itemId: Int!, $currentUserId: Int!) {
  toggleFeaturedStatus(itemId: $itemId, currentUserId: $currentUserId) {
    success
    message
  }
}
`;

export const UPDATE_PREPARATION_TIME = gql`
mutation UpdatePreparationTime($itemId: Int!, $preparationTime: Int!, $currentUserId: Int!) {
  updatePreparationTime(itemId: $itemId, preparationTime: $preparationTime, currentUserId: $currentUserId) {
    success
    message
  }
}
`;

export const UPDATE_CUSTOMIZATION_OPTIONS = gql`
mutation UpdateCustomizationOptions($itemId: Int!, $customizationOptions: String!, $currentUserId: Int!) {
  updateCustomizationOptions(itemId: $itemId, customizationOptions: $customizationOptions, currentUserId: $currentUserId) {
    success
    message
  }
}
`;

export const UPDATE_SIZE_VARIATIONS = gql`
mutation UpdateSizeVariations($itemId: Int!, $sizeVariations: String!, $currentUserId: Int!) {
  updateSizeVariations(itemId: $itemId, sizeVariations: $sizeVariations, currentUserId: $currentUserId) {
    success
    message
  }
}
`;


