import React, { useState } from 'react';
import VendorLayout from '@/components/layout/VendorLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { BarChart, LineChart, PieChart } from '@/components/ui/charts';
import { orders, menuItems } from '@/data/mockData';
import { ArrowUpRight, TrendingUp, TrendingDown, DollarSign, Users, ShoppingBag } from 'lucide-react';

// Helper function to generate random data for charts
const generateRandomData = (length: number, min: number, max: number) => {
  return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
};

// Helper function to get days of the week
const getDaysOfWeek = () => {
  return ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
};

// Helper function to get months
const getMonths = () => {
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
};

const VendorAnalytics = () => {
  const [timeRange, setTimeRange] = useState('week');
  const [chartType, setChartType] = useState('revenue');
  
  // Filter vendor's orders (assuming vendor ID is 1)
  const vendorOrders = orders.filter(order => String(order.canteenId) === "1");
  
  // Calculate total revenue
  const totalRevenue = vendorOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  
  // Calculate total orders
  const totalOrders = vendorOrders.length;
  
  // Calculate average order value
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // Generate random data for charts based on selected time range
  const getLabels = () => {
    switch (timeRange) {
      case 'week':
        return getDaysOfWeek();
      case 'month':
        return Array.from({ length: 30 }, (_, i) => (i + 1).toString());
      case 'year':
        return getMonths();
      default:
        return getDaysOfWeek();
    }
  };
  
  const getChartData = () => {
    const labels = getLabels();
    const length = labels.length;
    
    switch (chartType) {
      case 'revenue':
        return {
          labels,
          datasets: [
            {
              label: 'Revenue',
              data: generateRandomData(length, 500, 5000),
              borderColor: 'rgb(99, 102, 241)',
              backgroundColor: 'rgba(99, 102, 241, 0.5)',
            },
          ],
        };
      case 'orders':
        return {
          labels,
          datasets: [
            {
              label: 'Orders',
              data: generateRandomData(length, 5, 50),
              borderColor: 'rgb(34, 197, 94)',
              backgroundColor: 'rgba(34, 197, 94, 0.5)',
            },
          ],
        };
      case 'customers':
        return {
          labels,
          datasets: [
            {
              label: 'Customers',
              data: generateRandomData(length, 3, 40),
              borderColor: 'rgb(249, 115, 22)',
              backgroundColor: 'rgba(249, 115, 22, 0.5)',
            },
          ],
        };
      default:
        return {
          labels,
          datasets: [
            {
              label: 'Revenue',
              data: generateRandomData(length, 500, 5000),
              borderColor: 'rgb(99, 102, 241)',
              backgroundColor: 'rgba(99, 102, 241, 0.5)',
            },
          ],
        };
    }
  };
  
  // Generate data for pie chart (menu item categories)
  const categoryData = {
    labels: ['Breakfast', 'Lunch', 'Dinner', 'Snacks', 'Beverages'],
    datasets: [
      {
        label: 'Sales by Category',
        data: [25, 30, 20, 15, 10],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  // Generate data for bar chart (top menu items)
  const topItemsData = {
    labels: ['Masala Dosa', 'Veg Biryani', 'Paneer Butter Masala', 'Chicken Curry', 'Vada Pav'],
    datasets: [
      {
        label: 'Orders',
        data: [120, 98, 85, 75, 60],
        backgroundColor: 'rgba(54, 162, 235, 0.7)',
      },
    ],
  };
  
  return (
    <VendorLayout>
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
        
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Total Revenue</p>
                  <p className="text-2xl font-bold">₹{totalRevenue.toLocaleString()}</p>
                  <div className="flex items-center mt-1 text-green-600 text-sm">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span>12% from last month</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-50 rounded-full">
                  <DollarSign className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Total Orders</p>
                  <p className="text-2xl font-bold">{totalOrders}</p>
                  <div className="flex items-center mt-1 text-green-600 text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    <span>8% from last month</span>
                  </div>
                </div>
                <div className="p-3 bg-green-50 rounded-full">
                  <ShoppingBag className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">Average Order Value</p>
                  <p className="text-2xl font-bold">₹{averageOrderValue.toFixed(2)}</p>
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <TrendingDown className="h-4 w-4 mr-1" />
                    <span>3% from last month</span>
                  </div>
                </div>
                <div className="p-3 bg-orange-50 rounded-full">
                  <Users className="h-6 w-6 text-orange-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Main Chart */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Track your business performance over time</CardDescription>
              </div>
              <div className="flex space-x-2">
                <Select value={chartType} onValueChange={setChartType}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="revenue">Revenue</SelectItem>
                    <SelectItem value="orders">Orders</SelectItem>
                    <SelectItem value="customers">Customers</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Select time range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="year">This Year</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <LineChart data={getChartData()} />
            </div>
          </CardContent>
        </Card>
        
        {/* Detailed Analytics Tabs */}
        <Tabs defaultValue="sales">
          <TabsList className="mb-6">
            <TabsTrigger value="sales">Sales Analysis</TabsTrigger>
            <TabsTrigger value="items">Menu Items</TabsTrigger>
            <TabsTrigger value="customers">Customer Insights</TabsTrigger>
          </TabsList>
          
          <TabsContent value="sales">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Category</CardTitle>
                  <CardDescription>Distribution of sales across menu categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <PieChart data={categoryData} />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Time of Day</CardTitle>
                  <CardDescription>When your customers are ordering</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <BarChart 
                      data={{
                        labels: ['Morning', 'Afternoon', 'Evening', 'Night'],
                        datasets: [
                          {
                            label: 'Orders',
                            data: [25, 40, 30, 5],
                            backgroundColor: 'rgba(75, 192, 192, 0.7)',
                          },
                        ],
                      }} 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="items">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Selling Items</CardTitle>
                  <CardDescription>Your most popular menu items</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <BarChart data={topItemsData} />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Item Performance</CardTitle>
                  <CardDescription>Detailed analysis of menu items</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <MenuAnalyticsCard 
                      name="Masala Dosa" 
                      orders={120} 
                      revenue={7200} 
                      growth={15} 
                    />
                    <MenuAnalyticsCard 
                      name="Veg Biryani" 
                      orders={98} 
                      revenue={9800} 
                      growth={8} 
                    />
                    <MenuAnalyticsCard 
                      name="Paneer Butter Masala" 
                      orders={85} 
                      revenue={12750} 
                      growth={-3} 
                    />
                    <MenuAnalyticsCard 
                      name="Chicken Curry" 
                      orders={75} 
                      revenue={11250} 
                      growth={5} 
                    />
                    <MenuAnalyticsCard 
                      name="Vada Pav" 
                      orders={60} 
                      revenue={3000} 
                      growth={12} 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="customers">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Retention</CardTitle>
                  <CardDescription>New vs returning customers</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <PieChart 
                      data={{
                        labels: ['New Customers', 'Returning Customers'],
                        datasets: [
                          {
                            label: 'Customers',
                            data: [35, 65],
                            backgroundColor: [
                              'rgba(255, 159, 64, 0.7)',
                              'rgba(54, 162, 235, 0.7)',
                            ],
                          },
                        ],
                      }} 
                    />
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Customer Feedback</CardTitle>
                  <CardDescription>Ratings and reviews analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <BarChart 
                      data={{
                        labels: ['5 Stars', '4 Stars', '3 Stars', '2 Stars', '1 Star'],
                        datasets: [
                          {
                            label: 'Reviews',
                            data: [45, 30, 15, 7, 3],
                            backgroundColor: 'rgba(153, 102, 255, 0.7)',
                          },
                        ],
                      }} 
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Export Button */}
        <div className="mt-6 flex justify-end">
          <Button variant="outline">Export Reports</Button>
        </div>
      </div>
    </VendorLayout>
  );
};

// Menu Analytics Card Component
const MenuAnalyticsCard = ({ name, orders, revenue, growth }: { name: string, orders: number, revenue: number, growth: number }) => {
  return (
    <div className="flex items-center justify-between p-3 border rounded-lg">
      <div>
        <h3 className="font-medium">{name}</h3>
        <div className="flex space-x-4 text-sm text-gray-500">
          <span>{orders} orders</span>
          <span>₹{revenue.toLocaleString()}</span>
        </div>
      </div>
      <div className={`flex items-center ${growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
        {growth >= 0 ? (
          <TrendingUp className="h-4 w-4 mr-1" />
        ) : (
          <TrendingDown className="h-4 w-4 mr-1" />
        )}
        <span>{Math.abs(growth)}%</span>
      </div>
    </div>
  );
};

export default VendorAnalytics;
