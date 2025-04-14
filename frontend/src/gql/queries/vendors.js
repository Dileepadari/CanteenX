export const GET_CANTEENS = `
  query GetCanteens {
    getCanteens {
      id
      name
      location
      openingTime
      closingTime
    }
  }
`;

export const GET_MENU_ITEMS = `
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
    }
  }
`;

export const GET_FEATURED_MENU_ITEMS = `
  query GetFeaturedMenuItems {
    getFeaturedMenuItems {
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
    }
  }
`;

export const GET_MENU_ITEMS_BY_CANTEEN = `
  query GetMenuItemsByCanteen($canteenId: Int!) {
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
    }
  }
`;