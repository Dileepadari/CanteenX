import { gql } from "graphql-tag";

// Query to get all canteens with basic info including new fields
export const GET_CANTEENS = gql`
   query GetCanteens {
    getAllCanteens {
      id
      name
      location
      image
      rating
      openTime
      closeTime
      isOpen
      description
      phone
      email
      schedule {
        breakfast
        lunch
        dinner
        regular
        evening
        night
        weekday
        weekend
      }
      tags
      userId
    }
  }
`;

// Query to get a specific canteen by ID with full details including new fields
export const GET_CANTEEN_BY_ID = gql`
  query GetCanteenById($id: Int!) {
    getCanteenById(id: $id) {
      id
      name
      location
      image
      rating
      openTime
      closeTime
      isOpen
      description
      phone
      email
      schedule {
        breakfast
        lunch
        dinner
        regular
        evening
        night
        weekday
        weekend
      }
      tags
      userId
    }
  }
`;

// Query to get currently open canteens including new fields
export const GET_OPEN_CANTEENS = gql`
  query GetOpenCanteens {
    getOpenCanteens {
      id
      name
      location
      rating
      openTime
      closeTime
      email
      schedule {
        breakfast
        lunch
        dinner
        regular
        evening
        night
        weekday
        weekend
      }
      tags
      userId
    }
  }
`;

// Admin: Get canteen detail with menu, complaints and owner/staff info
export const GET_CANTEEN_DETAIL = gql`
  query GetCanteenDetail($id: Int!) {
    getCanteenDetail(canteenId: $id) {
      id
      name
      location
      image
      rating
      openTime
      closeTime
      isOpen
      description
      phone
      email
      tags
      owner {
        id
        name
        email
        role
      }
      menuItems {
        id
        name
        price
        stockCount
        isAvailable
        customizationOptions {
          sizes { name price }
          additions { name price }
          removals
        }
      }
      complaints {
        id
        heading
        complaintText
        status
        isEscalated
        responseText
        createdAt
        user {
          id
          name
          email
        }
      }
    }
  }
`;
