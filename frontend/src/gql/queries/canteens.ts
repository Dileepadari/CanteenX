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
