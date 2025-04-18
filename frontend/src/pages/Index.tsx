
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import HeroSection from "@/components/home/HeroSection";
import CanteenCard from "@/components/canteen/CanteenCard";
import CategoryList from "@/components/home/CategoryList";
import { canteens, categories, menuItems } from "@/data/mockData";
import MenuItemCard from "@/components/food/MenuItemCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import MenuItemWithCustomization from "@/components/food/MenuItemWithCustomization";


const Index = () => {
  
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { toast } = useToast();

  // Filter menu items based on selected category
  const filteredItems = selectedCategory
    ? menuItems.filter(
        (item) =>
          item.category.toLowerCase() ===
          categories.find((c) => c.id === selectedCategory)?.name.toLowerCase()
      )
    : menuItems.filter((item) => item.isPopular).slice(0, 8);
  return (
    <MainLayout>
      <HeroSection />

      <div className="container mx-auto px-4 py-12">
        {/* Featured Canteens */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Campus Canteens</h2>
            <a href="/canteens" className="text-canteen-orange hover:underline">
              View All
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {canteens.map((canteen) => (
              <CanteenCard key={canteen.id} canteen={canteen} />
            ))}
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
                categories={categories}
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

        {/* How It Works */}
        <div className="bg-gray-50 rounded-xl p-8 mb-12" id="how-it-works">
          <h2 className="text-2xl font-bold mb-6 text-center">How Smart Canteen Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-canteen-blue/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-canteen-blue text-2xl font-bold">1</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Browse & Order</h3>
              <p className="text-gray-600">
                Browse menus from various canteens, customize your order, and schedule pickup.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-canteen-orange/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-canteen-orange text-2xl font-bold">2</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Track Preparation</h3>
              <p className="text-gray-600">
                Get real-time updates as your food is being prepared and ready for pickup.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-green-600 text-2xl font-bold">3</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">Skip the Queue</h3>
              <p className="text-gray-600">
                Bypass the line and pick up your food directly from the dedicated counter.
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
