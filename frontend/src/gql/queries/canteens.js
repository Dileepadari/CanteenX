/*
query to get all the canteens
*/

export const GET_ALL_CANTEENS = 
`
query {
  getCanteens {
    id
    name
    location
    email
    contactNumber
    breakfastStart
    breakfastEnd
    lunchStart
    lunchEnd
    dinnerStart
    dinnerEnd
    rating
    ratingCount
    description
    supportsVegetarian
    supportsNonVegetarian
    supportsThali
  }
}
`


/*
query to get canteen using canteen_id
*/

export const GET_CANTEEN_By_ID = `
query GetCanteenById($canteenId: Int!) {
  getCanteenById(canteenId: $canteenId) {
    id
    name
    location
    email
    contactNumber
    breakfastStart
    breakfastEnd
    lunchStart
    lunchEnd
    dinnerStart
    dinnerEnd
    rating
    ratingCount
    description
    supportsVegetarian
    supportsNonVegetarian
    supportsThali
  }
}
`



/*
this query returns featured items corresponding to specific canteen:
*/

export const GET_FEATURED_ITEMS = `
query GetFeaturedMenuItems($canteenId : Int!){
  getFeaturedMenuItems(canteenId: $canteenId) {
    id
    name
    description
    price
    category
    isFeatured
    canteenId
  }
}
`