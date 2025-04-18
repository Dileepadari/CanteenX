import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import MainLayout from "@/components/layout/MainLayout";
import { Search, ShoppingCart, Filter, SlidersHorizontal, Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import MenuItemWithCustomization from "@/components/food/MenuItemWithCustomization";
import { canteens as mockCanteens, menuItems as mockFoodItems, categories as foodCategories } from "@/data/mockData";

const Menu = () => {
  const [filteredItems, setFilteredItems] = useState(mockFoodItems);
  const [selectedCanteen, setSelectedCanteen] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>("popularity");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const navigate = useNavigate();

  // Apply filters when dependencies change
  useEffect(() => {
    let result = [...mockFoodItems];

    // Filter by canteen
    if (selectedCanteen !== "all") {
      result = result.filter((item) => item.canteenId === selectedCanteen);
    }

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
  }, [selectedCanteen, selectedCategory, searchQuery, selectedTags, sortOption]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSelectedCanteen("all");
    setSelectedCategory("All");
    setSearchQuery("");
    setSelectedTags([]);
    setSortOption("popularity");
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
        <div className="container px-4 py-8 mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h1 className="text-3xl font-bold text-orange-600">Menu</h1>

            <div className="flex items-center gap-2">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search for food..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-orange-200 focus:border-orange-300"
                />
              </div>

              <Button
                onClick={() => navigate("/cart")}
                className="bg-orange-500 hover:bg-orange-600"
              >
                <ShoppingCart className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-white rounded-lg p-4 mb-6 border border-orange-100 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-gray-600">Canteen:</span>
                <Select value={selectedCanteen} onValueChange={setSelectedCanteen}>
                  <SelectTrigger className="w-[180px] h-9 border-orange-200">
                    <SelectValue placeholder="All Canteens" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Canteens</SelectItem>
                    {mockCanteens.map((canteen) => (
                      <SelectItem key={canteen.id} value={String(canteen.id)}>
                        {canteen.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <span className="text-sm font-medium text-gray-600 ml-2">Category:</span>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px] h-9 border-orange-200">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
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

                {(selectedCanteen !== "all" ||
                  selectedCategory !== "All" ||
                  searchQuery ||
                  selectedTags.length > 0 ||
                  sortOption !== "popularity") && (
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
      </div>
    </MainLayout>
  );
};

export default Menu;
