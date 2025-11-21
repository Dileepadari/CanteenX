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
import { useApolloClient } from "@apollo/client"; // Import Apollo Client
import { GET_MENU_ITEMS } from "@/gql/queries/menuItems"; // Added import for th
import { GET_CANTEENS } from "@/gql/queries/canteens"; // Added import for the query
// import { Console } from "console"; // Removed unused Console import


const Menu = () => {
  const [mockFoodItems, setMenuItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState(mockFoodItems);
  const [mockCanteens, setCanteens] = useState([]);
  const [selectedCanteen, setSelectedCanteen] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<string>("popularity");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const client = useApolloClient(); // Get Apollo Client instance
  
    useEffect(() => {
      const fetchCanteens = async () => {
        try {
          setLoading(true);
          const { data } = await client.query({ query: GET_CANTEENS });
          setCanteens(data?.getAllCanteens || []);
        } catch (err) {
          setError(err);
          toast({
            title: "Error",
            description: "Failed to fetch canteens.",
          });
        } finally {
          setLoading(false);
        }
      };
  
      fetchCanteens();
    }, [client, toast]);
  
  
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        setLoading(true);
        const { data } = await client.query({ query: GET_MENU_ITEMS });
        setMenuItems(data?.getMenuItems || []);
        setFilteredItems(data?.getMenuItems || []);
      } catch (err) {
        setError(err);
        toast({
          title: "Error",
          description: "Failed to fetch menu items.",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchMenuItems();
  }, [client, toast]);

  const navigate = useNavigate();

  // derive unique categories from fetched menu items
  const derivedCategories = Array.from(
    new Map(
      mockFoodItems
        .map((m: any, idx: number) => ({ id: idx + 1, name: m.category || "Uncategorized", icon: "coffee" }))
        .map((c) => [c.name, c])
    ).values()
  );

  // Apply filters when dependencies change
  useEffect(() => {
    let result = [...mockFoodItems];

    // Filter by canteen
    if (selectedCanteen !== "all") {
      // canteenId from backend might be string or number, compare as string
      result = result.filter((item) => String(item.canteenId) === String(selectedCanteen));
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
      <div className="min-h-screen">
        <div className="container px-4 py-8 mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <h1 className="text-3xl font-bold text-primary">Menu</h1>

            <div className="flex items-center gap-2">
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
                <Input
                  placeholder="Search for food..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-border focus:border-primary"
                />
              </div>

              <Button
                onClick={() => navigate("/cart")}
                className="bg-primary text-primary-foreground hover:bg-primary/95"
              >
                <ShoppingCart className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="bg-card rounded-lg p-4 mb-6 border border-border shadow-sm">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-sm font-medium text-muted-foreground">Canteen:</span>
                <Select value={selectedCanteen} onValueChange={setSelectedCanteen}>
                  <SelectTrigger className="w-[180px] h-9 border-border">
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

                <span className="text-sm font-medium text-muted-foreground ml-2">Category:</span>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-[180px] h-9 border-border">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Categories</SelectItem>
                    {derivedCategories.map((category) => (
                        <SelectItem key={category.id} value={category.name}>
                          {category.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="h-9 border-border">
                        <Filter className="w-4 h-4 mr-2" />
                        Tags
                        {selectedTags.length > 0 && (
                          <Badge className="ml-2 bg-muted text-muted-foreground" variant="secondary">
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
                            className="border-border text-primary"
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
                  <SlidersHorizontal className="w-4 h-4 mr-2 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Sort by:</span>
                </div>
                <Select value={sortOption} onValueChange={setSortOption}>
                    <SelectTrigger className="w-[150px] h-9 border-border">
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
                    className="h-9 text-primary hover:text-primary/90 hover:bg-muted"
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
              <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
              <p className="text-lg text-muted-foreground">Loading menu...</p>
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in">
              {filteredItems.map((item) => (
                <MenuItemWithCustomization key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
              <div className="p-8 mb-6 text-8xl bg-muted rounded-full">
                <Search className="w-16 h-16 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">No items found</h2>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                We couldn't find any food items matching your criteria. Try adjusting your filters or search term.
              </p>
              <Button onClick={clearFilters} className="bg-primary text-primary-foreground hover:bg-primary/95">
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
