import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import MenuItemWithCustomization from "@/components/food/MenuItemWithCustomization";
import { canteens, menuItems, categories as foodCategories } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, SlidersHorizontal, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";

const CanteenDetails = () => {
  const { id } = useParams<{ id: string }>();
  const canteenId = parseInt(id || "1");
  const canteen = canteens.find((c) => c.id === canteenId);

  const [filteredItems, setFilteredItems] = useState(menuItems.filter((item) => Number(item.canteenId) === canteenId));
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>("popularity");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let result = menuItems.filter((item) => Number(item.canteenId) === canteenId);

    // Filter by category
    if (selectedCategory !== "All") {
      result = result.filter((item) => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description.toLowerCase().includes(query) ||
          item.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Filter by tags
    if (selectedTags.length > 0) {
      result = result.filter((item) =>
        selectedTags.some((tag) => item.tags.includes(tag))
      );
    }

    // Apply sorting
    switch (sortOption) {
      case "price-low":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        result.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      case "preparation":
        result.sort((a, b) => a.preparationTime - b.preparationTime);
        break;
      case "popularity":
      default:
        result.sort((a, b) => b.ratingCount - a.ratingCount);
        break;
    }

    setFilteredItems(result);
  }, [selectedCategory, searchQuery, selectedTags, sortOption, canteenId]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedCategory("All");
    setSearchQuery("");
    setSelectedTags([]);
    setSortOption("popularity");
  };

  if (!canteen) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-12 text-center">
          <h2 className="text-2xl font-bold">Canteen not found</h2>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero Banner */}
      <div className="relative h-64 md:h-80">
        <img
          src={canteen.image}
          alt={canteen.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
          <div className="container mx-auto">
            <div className="flex items-center space-x-2 mb-1">
              <Badge variant={canteen.isOpen ? "success" : "destructive"}>
                {canteen.isOpen ? "Open Now" : "Closed"}
              </Badge>
              <div className="flex items-center space-x-1">
                <span className="font-medium">{canteen.rating}</span>
              </div>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">{canteen.name}</h1>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filters Section */}
        <div className="bg-white rounded-lg p-4 mb-6 border border-orange-100 shadow-sm">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-sm font-medium text-gray-600">Category:</span>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px] h-9 border-orange-200">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All</SelectItem>
                  {foodCategories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-9 border-orange-200">
                    <Filter className="w-4 h-4 mr-2" />
                    Tags
                    {selectedTags.length > 0 && (
                      <Badge className="ml-2 bg-orange-100 text-orange-700 hover:bg-orange-200" variant="secondary">
                        {selectedTags.length}
                      </Badge>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-2">
                  <div className="space-y-2">
                    {["Vegetarian", "Non-Vegetarian", "Healthy", "Quick Bite", "Premium", "South Indian"].map((tag) => (
                      <div key={tag} className="flex items-center space-x-2">
                        <Checkbox
                          id={`tag-${tag}`}
                          checked={selectedTags.includes(tag)}
                          onCheckedChange={(checked) => {
                            if (checked) handleTagToggle(tag);
                            else handleTagToggle(tag);
                          }}
                          className="border-orange-300 text-orange-500"
                        />
                        <label htmlFor={`tag-${tag}`} className="text-sm cursor-pointer">
                          {tag}
                        </label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2 items-center flex-wrap">
              <div className="flex items-center">
                <SlidersHorizontal className="w-4 h-4 mr-2 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Sort by:</span>
              </div>
              <Select value={sortOption} onValueChange={setSortOption}>
                <SelectTrigger className="w-[150px] h-9 border-orange-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="preparation">Preparation Time</SelectItem>
                </SelectContent>
              </Select>

              {(selectedCategory !== "All" || searchQuery || selectedTags.length > 0 || sortOption !== "popularity") && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearFilters}
                  className="h-9 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 animate-spin text-orange-500 mb-4" />
            <p className="text-lg text-gray-600">Loading menu...</p>
          </div>
        ) : filteredItems.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in">
            {filteredItems.map((item) => (
              <MenuItemWithCustomization key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
            <div className="p-8 mb-6 text-8xl bg-orange-100 rounded-full">
              <Search className="w-16 h-16 text-orange-500" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No items found</h2>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              We couldn't find any food items matching your criteria. Try adjusting your filters or search term.
            </p>
            <Button onClick={clearFilters} className="bg-orange-500 hover:bg-orange-600">
              Clear All Filters
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default CanteenDetails;
