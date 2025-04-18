
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useNotification } from "@/contexts/NotificationContext";
import { User, Settings, Bell, CreditCard, Shield, LogOut } from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addNotification } = useNotification();
  
  // Mock user data
  const [userData, setUserData] = useState({
    name: "John Doe",
    email: "john.doe@example.edu",
    phone: "+91 9876543210",
    department: "Computer Science",
    role: "Student",
    bio: "Computer Science student passionate about technology and good food!",
    studentId: "CS2023001",
    notifications: {
      orderUpdates: true,
      promotions: false,
      newItems: true,
      reviews: false,
    },
    preferences: {
      vegetarian: true,
      vegan: false,
      glutenFree: false,
      spicyFood: true,
    },
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "Profile saved successfully",
      description: "Your profile information has been updated.",
    });
    
    addNotification({
      title: "Profile Updated",
      description: "Your profile information has been successfully updated.",
      type: "success",
    });
  };

  const handleUpdateNotifications = (key: keyof typeof userData.notifications, value: boolean) => {
    setUserData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value,
      }
    }));
  };

  const handleUpdatePreferences = (key: keyof typeof userData.preferences, value: boolean) => {
    setUserData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      }
    }));
  };

  const handleLogout = () => {
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account.",
    });
    navigate("/login");
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <div className="h-20 w-20 rounded-full bg-canteen-orange/10 flex items-center justify-center mr-6">
              <User className="h-10 w-10 text-canteen-orange" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">{userData.name}</h1>
              <p className="text-gray-600">{userData.role} | {userData.department}</p>
            </div>
          </div>

          <Tabs defaultValue="profile">
            <TabsList className="mb-8">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="notifications" className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notifications
              </TabsTrigger>
              <TabsTrigger value="preferences" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Preferences
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Payment
              </TabsTrigger>
              <TabsTrigger value="security" className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold">Personal Information</h2>
                  <p className="text-sm text-gray-500">Update your personal details</p>
                </div>
                
                <form onSubmit={handleSaveProfile} className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input 
                        id="name" 
                        value={userData.name} 
                        onChange={(e) => setUserData({...userData, name: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={userData.email}
                        readOnly
                        disabled
                      />
                      <p className="text-xs text-muted-foreground">Campus email cannot be changed</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input 
                        id="phone" 
                        value={userData.phone} 
                        onChange={(e) => setUserData({...userData, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="studentId">Student ID</Label>
                      <Input 
                        id="studentId" 
                        value={userData.studentId}
                        readOnly
                        disabled
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea 
                        id="bio" 
                        value={userData.bio} 
                        onChange={(e) => setUserData({...userData, bio: e.target.value})}
                        placeholder="Tell us a little about yourself"
                        rows={3}
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 text-right">
                    <Button type="submit">Save Changes</Button>
                  </div>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="notifications">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold">Notification Preferences</h2>
                  <p className="text-sm text-gray-500">Manage how you receive notifications</p>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Order Updates</h3>
                      <p className="text-sm text-gray-500">Receive updates about your order status</p>
                    </div>
                    <Switch 
                      checked={userData.notifications.orderUpdates}
                      onCheckedChange={(checked) => handleUpdateNotifications("orderUpdates", checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Promotions and Offers</h3>
                      <p className="text-sm text-gray-500">Get notifications about special deals</p>
                    </div>
                    <Switch 
                      checked={userData.notifications.promotions}
                      onCheckedChange={(checked) => handleUpdateNotifications("promotions", checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">New Menu Items</h3>
                      <p className="text-sm text-gray-500">Be notified when new items are added</p>
                    </div>
                    <Switch 
                      checked={userData.notifications.newItems}
                      onCheckedChange={(checked) => handleUpdateNotifications("newItems", checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Review Requests</h3>
                      <p className="text-sm text-gray-500">Prompt to review after completing an order</p>
                    </div>
                    <Switch 
                      checked={userData.notifications.reviews}
                      onCheckedChange={(checked) => handleUpdateNotifications("reviews", checked)}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preferences">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold">Dietary Preferences</h2>
                  <p className="text-sm text-gray-500">Customize your food preferences</p>
                </div>
                
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Vegetarian</h3>
                      <p className="text-sm text-gray-500">Show only vegetarian food options</p>
                    </div>
                    <Switch 
                      checked={userData.preferences.vegetarian}
                      onCheckedChange={(checked) => handleUpdatePreferences("vegetarian", checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Vegan</h3>
                      <p className="text-sm text-gray-500">Show only vegan food options</p>
                    </div>
                    <Switch 
                      checked={userData.preferences.vegan}
                      onCheckedChange={(checked) => handleUpdatePreferences("vegan", checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Gluten-Free</h3>
                      <p className="text-sm text-gray-500">Show only gluten-free food options</p>
                    </div>
                    <Switch 
                      checked={userData.preferences.glutenFree}
                      onCheckedChange={(checked) => handleUpdatePreferences("glutenFree", checked)}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium">Spicy Food</h3>
                      <p className="text-sm text-gray-500">Include spicy food in recommendations</p>
                    </div>
                    <Switch 
                      checked={userData.preferences.spicyFood}
                      onCheckedChange={(checked) => handleUpdatePreferences("spicyFood", checked)}
                    />
                  </div>
                </div>
                
                <div className="px-6 py-4 bg-gray-50 text-right">
                  <Button onClick={() => {
                    toast({
                      title: "Preferences saved",
                      description: "Your dietary preferences have been updated.",
                    });
                  }}>
                    Save Preferences
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="payment">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold">Payment Methods</h2>
                  <p className="text-sm text-gray-500">Manage your payment options</p>
                </div>
                
                <div className="p-6">
                  <div className="text-center py-8">
                    <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">No payment methods added yet</h3>
                    <p className="text-gray-500 mb-4">Add your preferred payment method for faster checkout</p>
                    <Button>Add Payment Method</Button>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="security">
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b">
                  <h2 className="text-lg font-semibold">Account Security</h2>
                  <p className="text-sm text-gray-500">Manage your password and account security</p>
                </div>
                
                <div className="p-6 space-y-6">
                  <div>
                    <h3 className="font-medium mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" />
                      </div>
                    </div>
                    <Button className="mt-4">Update Password</Button>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <h3 className="font-medium mb-2">Account Actions</h3>
                    <p className="text-sm text-gray-500 mb-4">These actions can affect your account</p>
                    
                    <div className="space-y-4">
                      <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out from All Devices
                      </Button>
                      
                      <Button variant="destructive" className="w-full justify-start">
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
