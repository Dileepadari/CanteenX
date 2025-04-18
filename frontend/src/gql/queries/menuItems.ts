/*

this query returns all the items:

*/

import { gql } from "graphql-tag";

export const GET_MENU_ITEMS = gql`
  query GetMenuItems {
    getMenuItems {
      id
      name
      description
      price
      image
      category
      canteenId
      tags
      rating
      ratingCount
      isAvailable
      isVegetarian
      isFeatured
      isPopular
      preparationTime
      customizationOptions
    }
  }
`;

/*
this query returns items specific to particular canteen
 */
export const GET_MENU_ITEMS_BY_CANTEEN = gql`
  query GetMenuItemsByCanteen($canteenId: Int!) {
    getMenuItemsByCanteen(canteenId: $canteenId) {
      id
      name
      description
      price
      image
      category
      isAvailable
      isVegetarian
      isFeatured
      preparationTime
      customizationOptions
    }
  }
`;

// export const GET_FEATURED_MENU_ITEMS = gql`
//   query GetFeaturedMenuItems {
//     getFeaturedMenuItems {
//       id
//       name
//       description
//       price
//       image
//       category
//       canteenId
//       rating
//       isAvailable
//       isVegetarian
//       preparationTime
//     }
//   }
// `;

// export const GET_POPULAR_MENU_ITEMS = gql`
//   query GetPopularMenuItems {
//     getPopularMenuItems {
//       id
//       name
//       description
//       price
//       image
//       category
//       canteenId
//       rating
//       ratingCount
//       isAvailable
//     }
//   }
// `;

export const SEARCH_MENU_ITEMS = gql`
  query SearchMenuItems($query: String!) {
    searchMenuItems(query: $query) {
      id
      name
      description
      price
      category
      canteenId
      isAvailable
      isVegetarian
    }
  }
`;
