import React, { useState } from 'react';

// Define interface for Canteen objects to match the GraphQL query response
interface Canteen {
  id: number;
  name: string;
  location?: string;
  opening_time?: string;
  closing_time?: string;
}

interface MenuFiltersProps {
  canteens?: Canteen[];
  categories?: string[];
  dietaryOptions?: string[];
  onFilterChange: (filters: any) => void;
  onSortChange: (sortOption: string) => void;
}

export default function MenuFilters({
  canteens = [],
  categories = [],
  dietaryOptions = [],
  onFilterChange,
  onSortChange,
}: MenuFiltersProps) {
  const [filters, setFilters] = useState({
    canteen: '',
    category: '',
    dietaryOptions: [],
    availableOnly: false,
  });
  const [sortOption, setSortOption] = useState('popularity');
  const [isFiltersPanelOpen, setIsFiltersPanelOpen] = useState(false);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDietaryOptionToggle = (option: string) => {
    const currentOptions = [...filters.dietaryOptions] as string[];
    const index = currentOptions.indexOf(option);
    
    if (index === -1) {
      currentOptions.push(option);
    } else {
      currentOptions.splice(index, 1);
    }
    
    handleFilterChange('dietaryOptions', currentOptions);
  };

  const handleSortChange = (value: string) => {
    setSortOption(value);
    onSortChange(value);
  };

  const handleClearFilters = () => {
    const resetFilters = {
      canteen: '',
      category: '',
      dietaryOptions: [],
      availableOnly: false,
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="mb-6">
      {/* Mobile View Toggle Button */}
      <div className="flex items-center justify-between mb-4 md:hidden">
        <h2 className="text-lg font-semibold dark:text-white">Menu</h2>
        <button 
          onClick={() => setIsFiltersPanelOpen(!isFiltersPanelOpen)}
          className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-md text-sm hover:bg-indigo-700 dark:hover:bg-indigo-600"
        >
          {isFiltersPanelOpen ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      <div className={`${isFiltersPanelOpen ? 'block' : 'hidden'} md:block`}>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
          <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
            <h3 className="text-lg font-semibold dark:text-white">Filters</h3>
            <button 
              onClick={handleClearFilters}
              className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              Clear All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Canteen Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Canteen</label>
              <select
                value={filters.canteen}
                onChange={(e) => handleFilterChange('canteen', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-700 dark:text-white"
              >
                <option value="">All Canteens</option>
                {Array.isArray(canteens) && canteens.map((canteen) => (
                  <option key={canteen.id} value={canteen.name}>{canteen.name}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
              <select
                value={filters.category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-700 dark:text-white"
              >
                <option value="">All Categories</option>
                {Array.isArray(categories) && categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {/* Sort Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sort By</label>
              <select
                value={sortOption}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 text-gray-700 dark:text-white"
              >
                <option value="popularity">Popularity</option>
                <option value="priceAsc">Price: Low to High</option>
                <option value="priceDesc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name A-Z</option>
              </select>
            </div>
          </div>

          {/* Dietary Options */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Dietary Preferences</label>
            <div className="flex flex-wrap gap-2">
              {Array.isArray(dietaryOptions) && dietaryOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => handleDietaryOptionToggle(option)}
                  className={`px-3 py-1 text-sm rounded-full ${
                    filters.dietaryOptions.includes(option)
                      ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 border-indigo-500 dark:border-indigo-400 border'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600 border'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          {/* Available Only Toggle */}
          <div className="flex items-center">
            <input
              id="available-only"
              type="checkbox"
              checked={filters.availableOnly}
              onChange={(e) => handleFilterChange('availableOnly', e.target.checked)}
              className="h-4 w-4 text-indigo-600 dark:text-indigo-500 focus:ring-indigo-500 dark:focus:ring-indigo-400 border-gray-300 dark:border-gray-600 rounded"
            />
            <label htmlFor="available-only" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Show available items only
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}