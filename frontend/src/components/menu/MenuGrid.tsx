import React, { useState, useEffect, useRef } from 'react';
import MenuCard from './MenuCard';
import CustomizationModal from './CustomizationModal';

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

interface MenuGridProps {
  items: MenuItem[];
  onItemClick?: (item: MenuItem) => void;
}

// Mock customization options
const mockCustomizationOptions = {
  itemName: "",
  basePrice: 0,
  addOns: [
    { id: "addon1", name: "Extra Cheese", price: 30 },
    { id: "addon2", name: "Extra Paneer", price: 50 },
    { id: "addon3", name: "Butter", price: 15 },
  ],
  portionOptions: [
    { id: "portion1", name: "Small", priceModifier: -40 },
    { id: "portion2", name: "Regular", priceModifier: 0 },
    { id: "portion3", name: "Large", priceModifier: 60 },
  ],
  customizationOptions: [
    { 
      id: "spice", 
      name: "Spice Level", 
      options: ["Mild", "Medium", "Spicy", "Extra Spicy"] 
    },
    { 
      id: "cooking", 
      name: "Cooking Style", 
      options: ["Regular", "Less Oil", "Extra Creamy"] 
    },
  ]
};

export default function MenuGrid({ items = [], onItemClick }: MenuGridProps) {
  const [isCustomizationModalOpen, setIsCustomizationModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [customizationOptions, setCustomizationOptions] = useState(mockCustomizationOptions);
  const [visibleItems, setVisibleItems] = useState<MenuItem[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState(9);
  const [currentPage, setCurrentPage] = useState(1);
  
  const gridRef = useRef<HTMLDivElement>(null);

  // Adjust items per page based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) { // lg breakpoint
        setItemsPerPage(9); // 3x3 grid
      } else if (window.innerWidth >= 768) { // md breakpoint
        setItemsPerPage(6); // 2x3 grid
      } else {
        setItemsPerPage(4); // 1x4 grid for small screens
      }
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Update visible items when items or pagination changes
  useEffect(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    setVisibleItems(items.slice(startIndex, endIndex));
    
    // If filter changes reduce items dramatically, reset to page 1
    if (currentPage > 1 && startIndex >= items.length) {
      setCurrentPage(1);
    }
  }, [items, currentPage, itemsPerPage]);

  // Scroll to top of grid when page changes
  useEffect(() => {
    if (gridRef.current) {
      window.scrollTo({
        top: gridRef.current.offsetTop - 100, // Subtract header height
        behavior: 'smooth'
      });
    }
  }, [currentPage]);

  // Format item for MenuCard component
  const formatItemForCard = (item: MenuItem) => {
    return {
      id: item.id.toString(),
      name: item.name,
      description: item.description || '',
      price: item.price,
      imageUrl: item.imageUrl || 'https://via.placeholder.com/300x200?text=No+Image',
      category: item.category || 'Other',
      isAvailable: item.isAvailable,
      canteenName: `Canteen #${item.canteenId}`,
      vendorName: item.category || 'Unknown Vendor',
      dietaryInfo: [item.isVegetarian ? 'Vegetarian' : 'Non-Vegetarian'],
      rating: 4.5 // Default rating since we don't have this in the backend yet
    };
  };

  const handleAddToCart = (item: MenuItem) => {
    setSelectedItem(item);
    
    // Set the customization options for the selected item
    setCustomizationOptions({
      ...mockCustomizationOptions,
      itemName: item.name,
      basePrice: item.price
    });
    
    setIsCustomizationModalOpen(true);
    
    // Call the parent's click handler if provided
    if (onItemClick) {
      onItemClick(item);
    }
  };

  const handleAddCustomizedToCart = (customizedItem: any) => {
    console.log('Adding to cart:', customizedItem);
    // In a real app, this would add the item to the cart in context
    setIsCustomizationModalOpen(false);
  };

  const totalPages = Math.ceil(items.length / itemsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (!items.length) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <p className="text-gray-500 text-lg">No menu items available right now.</p>
      </div>
    );
  }

  return (
    <div>
      <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[300px]">
        {visibleItems.map(item => (
          <MenuCard 
            key={item.id} 
            {...formatItemForCard(item)} 
            onAddToCart={() => handleAddToCart(item)} 
          />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <nav className="flex items-center gap-1">
            <button
              onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded-md ${
                currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              } border border-gray-300 dark:border-gray-600`}
            >
              Previous
            </button>
            
            {[...Array(totalPages)].map((_, index) => {
              const pageNum = index + 1;
              // Show current page, first, last, and nearby pages
              if (
                pageNum === 1 ||
                pageNum === totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1) ||
                (pageNum === currentPage - 2 && currentPage > 3) ||
                (pageNum === currentPage + 2 && currentPage < totalPages - 2)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded-md ${
                      currentPage === pageNum
                        ? 'bg-indigo-600 text-white dark:bg-indigo-500'
                        : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                    } border border-gray-300 dark:border-gray-600`}
                  >
                    {pageNum}
                  </button>
                );
              }
              
              // Add ellipsis if needed
              if (
                (pageNum === currentPage - 3 && currentPage > 4) ||
                (pageNum === currentPage + 3 && currentPage < totalPages - 3)
              ) {
                return <span key={pageNum} className="px-3 py-1">...</span>;
              }
              
              return null;
            })}
            
            <button
              onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded-md ${
                currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-700 dark:text-gray-500'
                  : 'bg-white text-gray-700 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              } border border-gray-300 dark:border-gray-600`}
            >
              Next
            </button>
          </nav>
        </div>
      )}

      <CustomizationModal
        isOpen={isCustomizationModalOpen}
        onClose={() => setIsCustomizationModalOpen(false)}
        itemName={customizationOptions.itemName}
        basePrice={customizationOptions.basePrice}
        addOns={customizationOptions.addOns}
        portionOptions={customizationOptions.portionOptions}
        customizationOptions={customizationOptions.customizationOptions}
        onAddToCart={handleAddCustomizedToCart}
      />
    </div>
  );
}