import { gql } from "graphql-tag";

export const GET_MENU_ITEMS = gql`
  query GetMenuItems {
    getMenuItems {
      id
      canteenId
      canteenName
      name
      description
      price
      category
      image
      tags
      rating
      ratingCount
      isAvailable
      isVegetarian
      isFeatured
      isPopular
      preparationTime
      customizationOptions {
        sizes {
          name
          price
        }
        additions {
          name
          price
        }
        removals
      }
    }
  }
`;

export const GET_MENU_ITEMS_BY_CANTEEN = gql`
  query GetMenuItemsByCanteen($canteenId: Int!) {
    getMenuItemsByCanteen(canteenId: $canteenId) {
      id
      canteenId
      canteenName
      name
      description
      price
      category
      image
      tags
      rating
      ratingCount
      isAvailable
      isVegetarian
      isFeatured
      isPopular
      preparationTime
      customizationOptions {
        sizes {
          name
          price
        }
        additions {
          name
          price
        }
        removals
      }
    }
  }
`;

export const SEARCH_MENU_ITEMS = gql`
  query SearchMenuItems($query: String!) {
    searchMenuItems(query: $query) {
      id
      canteenId
      canteenName
      name
      description
      price
      category
      image
      tags
      rating
      ratingCount
      isAvailable
      isVegetarian
      isFeatured
      isPopular
      preparationTime
      customizationOptions {
        sizes {
          name
          price
        }
        additions {
          name
          price
        }
        removals
      }
    }
  }
`;
