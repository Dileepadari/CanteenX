import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import MenuItemWithCustomization from "@/components/food/MenuItemWithCustomization";
import { canteens, menuItems, categories as foodCategories } from "@/data/mockData";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Clock, Star, Phone, Mail } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, SlidersHorizontal, Loader2, ChevronLeft, Salad, Beef, Pizza, Coffee, Info } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
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
  const getIconForTag = (tag: string) => {
    switch(tag.toLowerCase()) {
      case 'vegetarian':
        return <Salad className="w-4 h-4 text-green-500" />;
      case 'non-vegetarian':
        return <Beef className="w-4 h-4 text-red-500" />;
      case 'beverages':
        return <Coffee className="w-4 h-4 text-brown-500" />;
      case 'fast food':
        return <Pizza className="w-4 h-4 text-yellow-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  }
  return (
    <MainLayout>
      {/* Hero Banner */}
      <div className="container px-4 py-8 mx-auto">
        <Button 
          onClick={() => navigate("/")} 
          variant="ghost" 
          className="mb-4 text-orange-600 hover:text-orange-700 hover:bg-orange-50"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back to Canteens
        </Button>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden border border-orange-100">
          <div className="aspect-[3/1] overflow-hidden">
            <img 
              src={canteen.image} 
              alt={canteen.name}
              className="w-full h-full object-cover" 
            />
          </div>
          
          <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
              <h1 className="text-3xl font-bold text-orange-600 mb-2 md:mb-0">{canteen.name}</h1>
              <div className="flex items-center">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 mr-1" />
                <span className="text-lg font-medium">{canteen.rating}</span>
                <span className="text-sm text-gray-500 ml-1">({canteen?.ratingCount} ratings)</span>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">{canteen.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-orange-500 mt-1 mr-2" />
                  <div>
                    <h4 className="font-medium">Location</h4>
                    <p className="text-gray-600">{canteen.location}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Clock className="w-5 h-5 text-orange-500 mt-1 mr-2" />
                  <div>
                    <h4 className="font-medium">Opening Hours</h4>
                    <p className="text-gray-600">{canteen?.openTime} - {canteen?.closeTime}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Phone className="w-5 h-5 text-orange-500 mt-1 mr-2" />
                  <div>
                    <h4 className="font-medium">Contact</h4>
                    <p className="text-gray-600">{canteen.phone}</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-orange-500 mt-1 mr-2" />
                  <div>
                    <h4 className="font-medium">Email</h4>
                    <p className="text-gray-600">{canteen?.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-100">
                <h3 className="font-medium mb-3">Meal Schedule</h3>
                {canteen?.schedule?.breakfast && (
                  <div className="flex justify-between py-1 border-b border-orange-100">
                    <span>Breakfast</span>
                    <span className="text-gray-600">{canteen?.schedule?.breakfast}</span>
                  </div>
                )}
                {canteen?.schedule?.lunch && (
                  <div className="flex justify-between py-1 border-b border-orange-100">
                    <span>Lunch</span>
                    <span className="text-gray-600">{canteen?.schedule?.lunch}</span>
                  </div>
                )}
                {canteen?.schedule?.dinner && (
                  <div className="flex justify-between py-1 border-b border-orange-100">
                    <span>Dinner</span>
                    <span className="text-gray-600">{canteen?.schedule?.dinner}</span>
                  </div>
                )}
                {canteen?.schedule?.regular && (
                  <div className="flex justify-between py-1 border-b border-orange-100">
                    <span>Regular Hours</span>
                    <span className="text-gray-600">{canteen?.schedule?.regular}</span>
                  </div>
                )}
                {canteen?.schedule?.evening && (
                  <div className="flex justify-between py-1 border-b border-orange-100">
                    <span>Evening</span>
                    <span className="text-gray-600">{canteen?.schedule?.evening}</span>
                  </div>
                )}
                {canteen?.schedule?.night && (
                  <div className="flex justify-between py-1 border-b border-orange-100">
                    <span>Night</span>
                    <span className="text-gray-600">{canteen?.schedule?.night}</span>
                  </div>
                )}
                {canteen?.schedule?.weekday && (
                  <div className="flex justify-between py-1 border-b border-orange-100">
                    <span>Weekdays</span>
                    <span className="text-gray-600">{canteen?.schedule?.weekday}</span>
                  </div>
                )}
                {canteen?.schedule?.weekend && (
                  <div className="flex justify-between py-1">
                    <span>Weekends</span>
                    <span className="text-gray-600">{canteen?.schedule?.weekend}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-6">
              {canteen?.tags.map((tag: string) => (
                <Badge 
                  key={tag} 
                  variant="outline" 
                  className="flex items-center gap-1 bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200"
                >
                  {getIconForTag(tag)}
                  {tag}
                </Badge>
              ))}
            </div>
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
