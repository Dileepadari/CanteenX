/**
 * Utility functions for filtering and sorting menu items
 */

interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: string;
  canteenId: number;
  isAvailable: boolean;
  isVegetarian: boolean;
  isFeatured: boolean;
}

interface FilterOptions {
  canteen?: string;
  category?: string;
  dietaryOptions?: string[];
  availableOnly?: boolean;
}

/**
 * Filter menu items based on filter options
 */
export function filterMenuItems(
  items: MenuItem[],
  filters: FilterOptions,
  canteens: { id: number; name: string }[]
): MenuItem[] {
  if (!items || items.length === 0) {
    return [];
  }

  return items.filter((item) => {
    // Filter by availability if specified
    if (filters.availableOnly && !item.isAvailable) {
      return false;
    }

    // Filter by canteen if specified
    if (filters.canteen) {
      const selectedCanteen = canteens.find(c => c.name === filters.canteen);
      if (selectedCanteen && item.canteenId !== selectedCanteen.id) {
        return false;
      }
    }

    // Filter by category if specified
    if (filters.category && item.category !== filters.category) {
      return false;
    }

    // Filter by dietary preferences
    if (filters.dietaryOptions && filters.dietaryOptions.length > 0) {
      // If Vegetarian is selected, only show vegetarian items
      const wantsVegetarian = filters.dietaryOptions.includes('Vegetarian');
      // If Non-Vegetarian is selected, only show non-vegetarian items
      const wantsNonVegetarian = filters.dietaryOptions.includes('Non-Vegetarian');
      
      // If both or neither are selected, show all items
      // If only one is selected, filter accordingly
      if (wantsVegetarian && !wantsNonVegetarian) {
        // Only show vegetarian items
        if (!item.isVegetarian) return false;
      } else if (wantsNonVegetarian && !wantsVegetarian) {
        // Only show non-vegetarian items
        if (item.isVegetarian) return false;
      }
      
      // For Vegan - Currently treat as strict vegetarian
      if (filters.dietaryOptions.includes('Vegan') && !item.isVegetarian) {
        return false;
      }
      
      // Note: Other dietary options (Gluten-Free, Contains Nuts, etc.) would need 
      // additional item properties to filter effectively. For now, we just pass them through.
    }

    return true;
  });
}

/**
 * Sort menu items based on sort option
 */
export function sortMenuItems(items: MenuItem[], sortOption: string): MenuItem[] {
  if (!items || items.length === 0) {
    return [];
  }

  // Create a copy to avoid mutating the original array
  const sortedItems = [...items];

  switch (sortOption) {
    case 'priceAsc':
      return sortedItems.sort((a, b) => a.price - b.price);
    case 'priceDesc':
      return sortedItems.sort((a, b) => b.price - a.price);
    case 'name':
      return sortedItems.sort((a, b) => a.name.localeCompare(b.name));
    case 'rating': // When rating is added to the item model
      // For now, this just returns the items in their current order
      return sortedItems;
    case 'popularity': // Default
    default:
      return sortedItems;
  }
}

/**
 * Filter and sort menu items in one operation
 */
export function processMenuItems(
  items: MenuItem[],
  filters: FilterOptions,
  sortOption: string,
  canteens: { id: number; name: string }[]
): MenuItem[] {
  // First filter, then sort
  const filteredItems = filterMenuItems(items, filters, canteens);
  return sortMenuItems(filteredItems, sortOption);
}