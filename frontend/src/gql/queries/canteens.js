// Query to get all canteens with basic info
export const GET_CANTEENS = `
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
      userId
    }
  }
`;

// Query to get a specific canteen by ID with full details
export const GET_CANTEEN_BY_ID = `
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
      userId
    }
  }
`;

// Query to get currently open canteens
export const GET_OPEN_CANTEENS = `
  query GetOpenCanteens {
    getOpenCanteens {
      id
      name
      location
      rating
      openTime
      closeTime
      userId
    }
  }
`;


/*
this query returns featured items corresponding to specific canteen:
*/

// export const GET_FEATURED_ITEMS = `
// query GetFeaturedMenuItems($canteenId : Int!){
//   getFeaturedMenuItems(canteenId: $canteenId) {
//     id
//     name
//     description
//     price
//     category
//     isFeatured
//     canteenId
//   }
// }
// `