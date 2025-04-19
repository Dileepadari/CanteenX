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
import { categories } from '@/data/mockData';
import { useUserStore } from '@/stores/userStore';
import { useApolloClient, useMutation, useQuery } from '@apollo/client';
import { GET_MENU_ITEMS_BY_CANTEEN } from '@/gql/queries/menuItems';
import { CREATE_MENU_ITEM, UPDATE_MENU_ITEM, DELETE_MENU_ITEM } from '@/gql/mutations/menuitems';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

// Interface for menu item
interface MenuItem {
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

// Interface for new menu item
interface NewMenuItem {
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  tags: string[];
  isPopular: boolean;
  preparationTime: number;
}

const VendorMenu = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name-asc');
  const [isAvailableOnly, setIsAvailableOnly] = useState(false);
  const [isAddMenuItemOpen, setIsAddMenuItemOpen] = useState(false);
  const [isEditMenuItemOpen, setIsEditMenuItemOpen] = useState(false);
  const [currentMenuItem, setCurrentMenuItem] = useState<MenuItem | null>(null);
  
  // New menu item form state
  const [newMenuItem, setNewMenuItem] = useState<NewMenuItem>({
    name: '',
    price: 0,
    description: '',
    category: 'main',
    image: 'https://placehold.co/600x400',
    tags: [],
    isPopular: false,
    preparationTime: 15,
  });
  
  // Get user from store
  const { user } = useUserStore();
  const currentUserId = user?.id || '';
  
  // Default canteen ID (should be fetched from user context in a real app)
  const [selectedCanteenId, setSelectedCanteenId] = useState<number>(1);
  const [selectedCanteenName, setSelectedCanteenName] = useState<string>('Main Canteen');
  
  // Apollo client
  const client = useApolloClient();
  
  // Query menu items
  const { loading, error, data, refetch } = useQuery(GET_MENU_ITEMS_BY_CANTEEN, {
    variables: { canteenId: selectedCanteenId },
    fetchPolicy: 'network-only',
  });
  
  // Mutations
  const [createMenuItem] = useMutation(CREATE_MENU_ITEM);
  const [updateMenuItem] = useMutation(UPDATE_MENU_ITEM);
  const [deleteMenuItem] = useMutation(DELETE_MENU_ITEM);
  
  // Enhance menu items with stock count (this would come from the backend in a real application)
  const [enhancedMenuItems, setEnhancedMenuItems] = useState<MenuItem[]>([]);
  
  // Initialize enhancedMenuItems with data from GraphQL
  useEffect(() => {
    if (data?.getMenuItemsByCanteen) {
      const items = data.getMenuItemsByCanteen.map((item: any) => ({
        ...item,
        id: String(item.id),
        canteenId: String(item.canteenId),
        stockCount: Math.floor(Math.random() * 100), // Simulated stock count
        orderCount: Math.floor(Math.random() * 1000), // Simulated order count
      }));
      setEnhancedMenuItems(items);
    }
  }, [data]);
  
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
  const toggleItemAvailability = async (itemId: string | number) => {
    const item = enhancedMenuItems.find(item => String(item.id) === String(itemId));
    if (!item) return;
    
    try {
      const newAvailability = !item.isAvailable;
      const { data } = await updateMenuItem({
        variables: {
          itemId: parseInt(String(itemId)),
          currentUserId,
          isAvailable: newAvailability
        }
      });
      
      if (data?.updateMenuItem?.success) {
        setEnhancedMenuItems(prev => 
          prev.map(item => 
            String(item.id) === String(itemId) 
              ? { ...item, isAvailable: newAvailability }
              : item
          )
        );
        
        toast.success(`${item.name} is now ${newAvailability ? 'available' : 'unavailable'}`);
      } else {
        toast.error(data?.updateMenuItem?.message || 'Failed to update item availability');
      }
    } catch (error) {
      console.error('Error updating item availability:', error);
      toast.error('An error occurred while updating item availability');
    }
  };

  // Handler for updating stock count
  const updateStockCount = async (itemId: string | number, newCount: number) => {
    // In a real app, this would update a stockCount field in the database
    // For now, we'll just update it locally
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
  
  // Handler for deleting an item
  const handleDeleteItem = async (itemId: string | number) => {
    try {
      const { data } = await deleteMenuItem({
        variables: {
          itemId: parseInt(String(itemId)),
          currentUserId
        }
      });
      
      if (data?.deleteMenuItem?.success) {
        setEnhancedMenuItems(prev => prev.filter(item => String(item.id) !== String(itemId)));
        toast.success('Menu item deleted successfully');
      } else {
        toast.error(data?.deleteMenuItem?.message || 'Failed to delete menu item');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      toast.error('An error occurred while deleting the menu item');
    }
  };
  
  // Handler for creating a new menu item
  const handleCreateMenuItem = async () => {
    try {
      const { data } = await createMenuItem({
        variables: {
          name: newMenuItem.name,
          price: parseFloat(String(newMenuItem.price)),
          canteenId: selectedCanteenId,
          canteenName: selectedCanteenName,
          currentUserId,
          description: newMenuItem.description,
          image: newMenuItem.image,
          category: newMenuItem.category,
          tags: newMenuItem.tags,
          isPopular: newMenuItem.isPopular,
          preparationTime: parseInt(String(newMenuItem.preparationTime))
        }
      });
      
      if (data?.createMenuItem?.success) {
        // Refetch menu items to get the new item
        refetch();
        setIsAddMenuItemOpen(false);
        toast.success('Menu item created successfully');
        
        // Reset the form
        setNewMenuItem({
          name: '',
          price: 0,
          description: '',
          category: 'main',
          image: 'https://placehold.co/600x400',
          tags: [],
          isPopular: false,
          preparationTime: 15,
        });
      } else {
        toast.error(data?.createMenuItem?.message || 'Failed to create menu item');
      }
    } catch (error) {
      console.error('Error creating menu item:', error);
      toast.error('An error occurred while creating the menu item');
    }
  };
  
  // Handler for updating a menu item
  const handleUpdateMenuItem = async () => {
    if (!currentMenuItem) return;
    
    try {
      const { data } = await updateMenuItem({
        variables: {
          itemId: parseInt(String(currentMenuItem.id)),
          currentUserId,
          name: currentMenuItem.name,
          price: parseFloat(String(currentMenuItem.price)),
          description: currentMenuItem.description,
          image: currentMenuItem.image,
          category: currentMenuItem.category,
          isAvailable: currentMenuItem.isAvailable,
          isPopular: currentMenuItem.isPopular,
          preparationTime: parseInt(String(currentMenuItem.preparationTime))
        }
      });
      
      if (data?.updateMenuItem?.success) {
        // Update the local state
        setEnhancedMenuItems(prev => 
          prev.map(item => 
            String(item.id) === String(currentMenuItem.id) 
              ? { ...currentMenuItem }
              : item
          )
        );
        
        setIsEditMenuItemOpen(false);
        toast.success('Menu item updated successfully');
      } else {
        toast.error(data?.updateMenuItem?.message || 'Failed to update menu item');
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
      toast.error('An error occurred while updating the menu item');
    }
  };

  return (
    <VendorLayout>
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Menu Management</h1>
          <Button onClick={() => setIsAddMenuItemOpen(true)}>
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
            {loading ? (
              <div className="text-center py-10 bg-white rounded-lg shadow">
                <p className="text-gray-500">Loading menu items...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10 bg-white rounded-lg shadow">
                <p className="text-red-500">Error loading menu items. Please try again.</p>
              </div>
            ) : (
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
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setCurrentMenuItem(item);
                                  setIsEditMenuItemOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => toggleItemAvailability(item.id)}
                              >
                                {item.isAvailable ? "Disable" : "Enable"}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteItem(item.id)}
                              >
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
            )}
          </TabsContent>
          
          <TabsContent value="popular">
            {loading ? (
              <div className="text-center py-10 bg-white rounded-lg shadow">
                <p className="text-gray-500">Loading popular items...</p>
              </div>
            ) : sortedItems.filter(item => item.isPopular).length > 0 ? (
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
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setCurrentMenuItem(item);
                                setIsEditMenuItemOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              onClick={() => toggleItemAvailability(item.id)}
                            >
                              {item.isAvailable ? "Disable" : "Enable"}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDeleteItem(item.id)}
                            >
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
            {loading ? (
              <div className="text-center py-10 bg-white rounded-lg shadow">
                <p className="text-gray-500">Loading low stock items...</p>
              </div>
            ) : sortedItems.filter(item => (item.stockCount || 0) < 10).length > 0 ? (
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
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => {
                                  setCurrentMenuItem(item);
                                  setIsEditMenuItemOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => toggleItemAvailability(item.id)}
                              >
                                {item.isAvailable ? "Disable" : "Enable"}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDeleteItem(item.id)}
                              >
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
        
        {/* Add Menu Item Dialog */}
        <Dialog open={isAddMenuItemOpen} onOpenChange={setIsAddMenuItemOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Menu Item</DialogTitle>
              <DialogDescription>
                Create a new menu item for your canteen.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={newMenuItem.name}
                    onChange={(e) => setNewMenuItem({...newMenuItem, name: e.target.value})}
                    placeholder="e.g. Butter Chicken"
                  />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newMenuItem.description}
                    onChange={(e) => setNewMenuItem({...newMenuItem, description: e.target.value})}
                    placeholder="A short description of the dish"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input
                    id="price"
                    type="number"
                    value={newMenuItem.price}
                    onChange={(e) => setNewMenuItem({...newMenuItem, price: parseFloat(e.target.value)})}
                    placeholder="150"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={newMenuItem.category}
                    onValueChange={(value) => setNewMenuItem({...newMenuItem, category: value})}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.name.toLowerCase()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="preparationTime">Preparation Time (mins)</Label>
                  <Input
                    id="preparationTime"
                    type="number"
                    value={newMenuItem.preparationTime}
                    onChange={(e) => setNewMenuItem({...newMenuItem, preparationTime: parseInt(e.target.value)})}
                    placeholder="15"
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="isPopular">Popular Item</Label>
                  <div className="flex items-center space-x-2 mt-2">
                    <input
                      type="checkbox"
                      id="isPopular"
                      checked={newMenuItem.isPopular}
                      onChange={(e) => setNewMenuItem({...newMenuItem, isPopular: e.target.checked})}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="isPopular">Mark as popular</Label>
                  </div>
                </div>
              </div>
              <div>
                <Label htmlFor="image">Image URL</Label>
                <Input
                  id="image"
                  value={newMenuItem.image}
                  onChange={(e) => setNewMenuItem({...newMenuItem, image: e.target.value})}
                  placeholder="https://example.com/image.jpg"
                />
                {newMenuItem.image && (
                  <div className="mt-2">
                    <img
                      src={newMenuItem.image}
                      alt="Preview"
                      className="h-24 w-auto object-cover rounded-md"
                    />
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddMenuItemOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleCreateMenuItem}>
                Create Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        {/* Edit Menu Item Dialog */}
        <Dialog open={isEditMenuItemOpen} onOpenChange={setIsEditMenuItemOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Edit Menu Item</DialogTitle>
              <DialogDescription>
                Update information for this menu item.
              </DialogDescription>
            </DialogHeader>
            {currentMenuItem && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="edit-name">Name</Label>
                    <Input
                      id="edit-name"
                      value={currentMenuItem.name}
                      onChange={(e) => setCurrentMenuItem({...currentMenuItem, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-description">Description</Label>
                    <Textarea
                      id="edit-description"
                      value={currentMenuItem.description}
                      onChange={(e) => setCurrentMenuItem({...currentMenuItem, description: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-price">Price (₹)</Label>
                    <Input
                      id="edit-price"
                      type="number"
                      value={currentMenuItem.price}
                      onChange={(e) => setCurrentMenuItem({...currentMenuItem, price: parseFloat(e.target.value)})}
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-category">Category</Label>
                    <Select
                      value={currentMenuItem.category}
                      onValueChange={(value) => setCurrentMenuItem({...currentMenuItem, category: value})}
                    >
                      <SelectTrigger id="edit-category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name.toLowerCase()}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="edit-preparationTime">Preparation Time (mins)</Label>
                    <Input
                      id="edit-preparationTime"
                      type="number"
                      value={currentMenuItem.preparationTime}
                      onChange={(e) => setCurrentMenuItem({...currentMenuItem, preparationTime: parseInt(e.target.value)})}
                      min="1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-isPopular">Popular Item</Label>
                    <div className="flex items-center space-x-2 mt-2">
                      <input
                        type="checkbox"
                        id="edit-isPopular"
                        checked={currentMenuItem.isPopular}
                        onChange={(e) => setCurrentMenuItem({...currentMenuItem, isPopular: e.target.checked})}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="edit-isPopular">Mark as popular</Label>
                    </div>
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-image">Image URL</Label>
                  <Input
                    id="edit-image"
                    value={currentMenuItem.image}
                    onChange={(e) => setCurrentMenuItem({...currentMenuItem, image: e.target.value})}
                  />
                  {currentMenuItem.image && (
                    <div className="mt-2">
                      <img
                        src={currentMenuItem.image}
                        alt="Preview"
                        className="h-24 w-auto object-cover rounded-md"
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditMenuItemOpen(false)}>
                Cancel
              </Button>
              <Button type="button" onClick={handleUpdateMenuItem}>
                Update Item
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </VendorLayout>
  );
};

export default VendorMenu;
