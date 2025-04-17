/*

this query is for updating the price of an item by the vendor :
*/

export const UPDATE_PRICE = `

mutation UpdateMenuItemPrice($itemId:Int!, $price: Float! , $userEmail :String!){
  updateMenuItemPrice(
    itemId: $itemId, 
    price: $price,
    userEmail: $userEmail
  ) {
    success
    message
  }
}

`



/**
 
this query is to update the availability of an item 
 */

export const UPDATE_AVAILABILITY = 
`
mutation UpdateAvailability($itemId:Int! , $isAvailable :Boolean!,$userEmail :String!){
  updateMenuItemAvailability(itemId: $itemId, isAvailable: $isAvailable, userEmail: $userEmail) {
    success
    message
  }
}
`


