

/*

this query returns all the items:

*/

export const GET_ALL_ITEMS = `

query GetMenuItems {
  getMenuItems {
    id
    name
    description
    price
    imageUrl
    category
    canteenId
    isAvailable
    isVegetarian
    isFeatured
    hasSizeVariations
    sizeOptions
    minQuantity
    maxQuantity
    preparationTime
    isVegan
    isGlutenFree
    allowsSpecialInstructions
    specialInstructionsPrompt
    calories
    spiceLevel
    popularityScore
    averageRating
    totalRatings
  }
}
`

/*
this query returns items specific to particular canteen
 */

export const GET_CANTEEN_ITEMS = `
query  GetMenuItemsByCanteen($canteenId: Int!){
  getMenuItemsByCanteen(canteenId: $canteenId) {
    id
    name
    description
    price
    imageUrl
    category
    canteenId
    isAvailable
    isVegetarian
    isFeatured
    hasSizeVariations
    sizeOptions
    minQuantity
    maxQuantity
    preparationTime
    isVegan
    isGlutenFree
    allowsSpecialInstructions
    specialInstructionsPrompt
    calories
    spiceLevel
    popularityScore
    averageRating
    totalRatings
  }
}
`



export const GET_CATEGORY_ITEMS = `
query GetMenuItemsByCategory($category :String!){
  getMenuItemsByCategory(category: $category) {
    id
    name
    description
    price
    imageUrl
    category
    canteenId
    isAvailable
    isVegetarian
    isFeatured
    hasSizeVariations
    sizeOptions
    minQuantity
    maxQuantity
    preparationTime
    isVegan
    isGlutenFree
    allowsSpecialInstructions
    specialInstructionsPrompt
    calories
    spiceLevel
    popularityScore
    averageRating
    totalRatings
  }
}
`

