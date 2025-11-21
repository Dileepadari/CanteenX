import React, { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import HeroSection from "@/components/home/HeroSection";
import CanteenCard from "@/components/canteen/CanteenCard";
import CategoryList from "@/components/home/CategoryList";
// derive categories from fetched menu items instead of static mockData
import MenuItemCard from "@/components/food/MenuItemCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import MenuItemWithCustomization from "@/components/food/MenuItemWithCustomization";
import { useApolloClient } from "@apollo/client"; // Import Apollo Client
import { GET_CANTEENS } from "@/gql/queries/canteens"; // Added import for the query
import { GET_MENU_ITEMS } from "@/gql/queries/menuItems"; // Added import for th

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [canteens, setCanteens] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
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

  // derive categories from menuItems (unique category names)
  const derivedCategories = Array.from(
    new Map(
      menuItems
        .map((m: any, idx: number) => ({ id: idx + 1, name: m.category || "Uncategorized", icon: "coffee" }))
        .map((c) => [c.name, c])
    ).values()
  );

  // Filter menu items based on selected category
  const filteredItems = selectedCategory
    ? menuItems.filter(
        (item: any) =>
          (item.category || "").toLowerCase() ===
          derivedCategories.find((c) => c.id === selectedCategory)?.name.toLowerCase()
      )
    : menuItems.filter((item: any) => item.isPopular).slice(0, 8);

  return (
    <MainLayout>
      <HeroSection />

      <div className="container mx-auto px-4 py-12">
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-primary">Campus Canteens</h2>
            <a href="/canteens" className="text-primary hover:underline">
              View All
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loading ? (
              <p>Loading...</p>
            ) : error ? (
              <p>Error loading canteens.</p>
            ) : (
              canteens.map((canteen) => (
                <CanteenCard key={canteen.id} canteen={canteen} />
              ))
            )}
          </div>
        </div>

        {/* Menu Items */}
        <div className="mb-12">
          <Tabs defaultValue="popular">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Menu</h2>
              <TabsList>
                <TabsTrigger value="popular">Popular</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="popular">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {menuItems
                  .filter((item) => item.isPopular)
                  .slice(0, 8)
                  .map((item) => (
                    <MenuItemWithCustomization key={item.id} item={item} />
                  ))}
              </div>
            </TabsContent>

            <TabsContent value="categories">
              <CategoryList
                categories={derivedCategories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {filteredItems.map((item) => (
                  <MenuItemWithCustomization key={item.id} item={item} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* How It Works teaser — move to dedicated page */}
        <div className="text-center mb-12">
          <a href="/how-it-works" className="inline-block bg-muted/10 px-6 py-4 rounded-lg hover:bg-muted transition">Learn how CanteenX works →</a>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
