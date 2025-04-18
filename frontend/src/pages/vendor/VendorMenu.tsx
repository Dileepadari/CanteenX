import React, { useState, useEffect } from 'react';
import VendorLayout from '@/components/layout/VendorLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Search, Plus, Edit, Trash2, ArrowUpDown, AlertTriangle, MenuSquare, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { menuItems, categories } from '@/data/mockData';

// Add necessary properties to menu items
interface EnhancedMenuItem {
  id: string | number;
  canteenId: string | number;
  canteenName: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  tags: string[];
  rating: number;
  ratingCount: number;
  isAvailable: boolean;
  preparationTime: number;
  isPopular: boolean;
  customizationOptions: any;
  stockCount?: number;
  orderCount?: number;
}

const VendorMenu = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [isAvailableOnly, setIsAvailableOnly] = useState(false);
  
  // Enhancement: add stock count and order count to menu items for better inventory management
  const [enhancedMenuItems, setEnhancedMenuItems] = useState<EnhancedMenuItem[]>([]);

  // Initialize enhancedMenuItems with mock data
  useEffect(() => {
    const initialItems = menuItems.map(item => ({
      ...item,
      id: String(item.id),  // Ensure id is string
      canteenId: String(item.canteenId), // Ensure canteenId is string
      stockCount: Math.floor(Math.random() * 100),
      orderCount: Math.floor(Math.random() * 1000)
    }));
    setEnhancedMenuItems(initialItems);
  }, []);

  // Filter menu items based on search query, category, and availability
  const filteredItems = enhancedMenuItems.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    
    const matchesAvailability = !isAvailableOnly || item.isAvailable;
    
    return matchesSearch && matchesCategory && matchesAvailability;
  });

  // Sort menu items
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortBy) {
      case 'name-asc':
        return a.name.localeCompare(b.name);
      case 'name-desc':
        return b.name.localeCompare(a.name);
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'popularity':
        return (b.orderCount || 0) - (a.orderCount || 0);
      case 'stock-asc':
        return (a.stockCount || 0) - (b.stockCount || 0);
      case 'stock-desc':
        return (b.stockCount || 0) - (a.stockCount || 0);
      default:
        return 0;
    }
  });

  // Handler for toggling item availability
  const toggleItemAvailability = (itemId: string | number) => {
    setEnhancedMenuItems(prev => 
      prev.map(item => 
        String(item.id) === String(itemId) 
          ? { ...item, isAvailable: !item.isAvailable }
          : item
      )
    );
    
    const item = enhancedMenuItems.find(item => String(item.id) === String(itemId));
    if (item) {
      toast.success(`${item.name} is now ${!item.isAvailable ? 'available' : 'unavailable'}`);
    }
  };

  // Handler for updating stock count
  const updateStockCount = (itemId: string | number, newCount: number) => {
    setEnhancedMenuItems(prev => 
      prev.map(item => 
        String(item.id) === String(itemId) 
          ? { ...item, stockCount: newCount }
          : item
      )
    );
    
    const item = enhancedMenuItems.find(item => String(item.id) === String(itemId));
    if (item) {
      toast.success(`Updated stock for ${item.name} to ${newCount}`);
    }
  };

  return (
    <VendorLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Menu Management</h1>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Item
          </Button>
        </div>
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search menu items..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name-asc">Name (A-Z)</SelectItem>
                  <SelectItem value="name-desc">Name (Z-A)</SelectItem>
                  <SelectItem value="price-asc">Price (Low to High)</SelectItem>
                  <SelectItem value="price-desc">Price (High to Low)</SelectItem>
                  <SelectItem value="popularity">Popularity</SelectItem>
                  <SelectItem value="stock-asc">Stock (Low to High)</SelectItem>
                  <SelectItem value="stock-desc">Stock (High to Low)</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                variant="outline" 
                className={isAvailableOnly ? "bg-orange-100" : ""}
                onClick={() => setIsAvailableOnly(!isAvailableOnly)}
              >
                Available Only
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Item Stats Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Total Items</p>
                    <p className="text-2xl font-bold">{enhancedMenuItems.length}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-full">
                    <MenuSquare className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Available Items</p>
                    <p className="text-2xl font-bold">
                      {enhancedMenuItems.filter(item => item.isAvailable).length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-full">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Low Stock Items</p>
                    <p className="text-2xl font-bold">
                      {enhancedMenuItems.filter(item => (item.stockCount || 0) < 10).length}
                    </p>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-full">
                    <AlertTriangle className="h-6 w-6 text-orange-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Items</TabsTrigger>
            <TabsTrigger value="popular">Popular Items</TabsTrigger>
            <TabsTrigger value="low-stock">Low Stock</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all">
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedItems.length > 0 ? (
                      sortedItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                <div className="text-sm text-gray-500 truncate w-48">{item.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline">{item.category}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">₹{item.price.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <input
                                type="number"
                                className="w-16 p-1 text-sm border rounded"
                                value={item.stockCount || 0}
                                onChange={(e) => updateStockCount(item.id, parseInt(e.target.value))}
                                min="0"
                              />
                              {(item.stockCount || 0) < 10 && (
                                <AlertTriangle className="h-4 w-4 text-orange-500 ml-2" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={item.isAvailable ? "success" : "secondary"} className={!item.isAvailable ? "bg-gray-200" : ""}>
                              {item.isAvailable ? "Available" : "Unavailable"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => toggleItemAvailability(item.id)}>
                              {item.isAvailable ? "Disable" : "Enable"}
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                          No items found. Try adjusting your search or filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="popular">
            {sortedItems.filter(item => item.isPopular).length > 0 ? (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {sortedItems.filter(item => item.isPopular).map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                <div className="text-sm text-gray-500 truncate w-48">{item.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant="outline">{item.category}</Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">₹{item.price.toFixed(2)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <input
                                type="number"
                                className="w-16 p-1 text-sm border rounded"
                                value={item.stockCount || 0}
                                onChange={(e) => updateStockCount(item.id, parseInt(e.target.value))}
                                min="0"
                              />
                              {(item.stockCount || 0) < 10 && (
                                <AlertTriangle className="h-4 w-4 text-orange-500 ml-2" />
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={item.isAvailable ? "success" : "secondary"} className={!item.isAvailable ? "bg-gray-200" : ""}>
                              {item.isAvailable ? "Available" : "Unavailable"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => toggleItemAvailability(item.id)}>
                              {item.isAvailable ? "Disable" : "Enable"}
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 bg-white rounded-lg shadow">
                <p className="text-gray-500">No popular items found.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="low-stock">
            {sortedItems.filter(item => (item.stockCount || 0) < 10).length > 0 ? (
              <div className="space-y-4">
                <Alert variant="destructive">
                  <AlertTitle>Low Stock Warning</AlertTitle>
                  <AlertDescription>
                    You have {sortedItems.filter(item => (item.stockCount || 0) < 10).length} items with low stock.
                    Please update your inventory soon.
                  </AlertDescription>
                </Alert>
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {sortedItems.filter(item => (item.stockCount || 0) < 10).map((item) => (
                          <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
                                  <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{item.name}</div>
                                  <div className="text-sm text-gray-500 truncate w-48">{item.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant="outline">{item.category}</Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">₹{item.price.toFixed(2)}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <input
                                  type="number"
                                  className="w-16 p-1 text-sm border rounded"
                                  value={item.stockCount || 0}
                                  onChange={(e) => updateStockCount(item.id, parseInt(e.target.value))}
                                  min="0"
                                />
                                {(item.stockCount || 0) < 10 && (
                                  <AlertTriangle className="h-4 w-4 text-orange-500 ml-2" />
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <Badge variant={item.isAvailable ? "success" : "secondary"} className={!item.isAvailable ? "bg-gray-200" : ""}>
                                {item.isAvailable ? "Available" : "Unavailable"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 space-x-2">
                              <Button variant="outline" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => toggleItemAvailability(item.id)}>
                                {item.isAvailable ? "Disable" : "Enable"}
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 bg-white rounded-lg shadow">
                <p className="text-gray-500">No low stock items found.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </VendorLayout>
  );
};

export default VendorMenu;
