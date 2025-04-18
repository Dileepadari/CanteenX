
import React, { useState } from "react";
import VendorLayout from "@/components/layout/VendorLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useNotification } from "@/contexts/NotificationContext";
import { canteens } from "@/data/mockData";
import {
  User,
  Building,
  Clock,
  Bell,
  Settings,
  FileText,
  CreditCard,
  Lock,
  AlertTriangle,
  Upload,
  Camera,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Check,
  Trash,
  Save,
} from "lucide-react";

const VendorSettings = () => {
  const [selectedCanteen, setSelectedCanteen] = useState<number>(1);
  const { addNotification } = useNotification();
  
  // Form states
  const [profileForm, setProfileForm] = useState({
    name: "Sharma Canteen Services",
    email: "sharma@example.com",
    phone: "+91 9876543210",
    address: "Block C, Near Engineering Department",
    description: "Serving authentic North Indian and South Indian cuisine to students and faculty since 2010.",
    openingTime: "08:00",
    closingTime: "20:00",
    operatingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
  });
  
  const [notificationSettings, setNotificationSettings] = useState({
    newOrders: true,
    orderUpdates: true,
    lowStock: true,
    reviews: true,
    dailySummary: false,
    emailNotifications: true,
    pushNotifications: true,
  });
  
  const [paymentSettings, setPaymentSettings] = useState({
    acceptOnlinePayments: true,
    acceptCash: true,
    acceptUPI: true,
    acceptCards: true,
    bankName: "State Bank of India",
    accountNumber: "XXXX XXXX XXXX 5678",
    ifscCode: "SBIN0012345",
    upiId: "sharma@upi",
  });
  
  // Handle profile form update
  const handleProfileUpdate = () => {
    // In a real app, this would update the database
    console.log("Updating profile:", profileForm);
    
    addNotification({
      title: "Profile Updated",
      description: "Your vendor profile has been updated successfully.",
      type: "success",
    });
  };
  
  // Handle notification settings update
  const handleNotificationSettingsUpdate = () => {
    // In a real app, this would update the database
    console.log("Updating notification settings:", notificationSettings);
    
    addNotification({
      title: "Notification Settings Updated",
      description: "Your notification preferences have been saved.",
      type: "success",
    });
  };
  
  // Handle payment settings update
  const handlePaymentSettingsUpdate = () => {
    // In a real app, this would update the database
    console.log("Updating payment settings:", paymentSettings);
    
    addNotification({
      title: "Payment Settings Updated",
      description: "Your payment settings have been saved successfully.",
      type: "success",
    });
  };
  
  return (
    <VendorLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account preferences, canteen profile, and payment options
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <Select value={selectedCanteen.toString()} onValueChange={(value) => setSelectedCanteen(Number(value))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Canteen" />
              </SelectTrigger>
              <SelectContent>
                {canteens.map((canteen) => (
                  <SelectItem key={canteen.id} value={canteen.id.toString()}>
                    {canteen.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">
              <User className="h-4 w-4 mr-2" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="h-4 w-4 mr-2" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="payment">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="h-4 w-4 mr-2" />
              Security
            </TabsTrigger>
          </TabsList>
          
          {/* Profile Tab */}
          <TabsContent value="profile">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Canteen Profile</CardTitle>
                  <CardDescription>
                    Update your canteen information and business details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="canteen-name">Canteen Name</Label>
                        <Input 
                          id="canteen-name" 
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="canteen-email">Email Address</Label>
                        <Input 
                          id="canteen-email" 
                          type="email"
                          value={profileForm.email}
                          onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="canteen-phone">Phone Number</Label>
                        <Input 
                          id="canteen-phone" 
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="canteen-address">Address</Label>
                        <Input 
                          id="canteen-address" 
                          value={profileForm.address}
                          onChange={(e) => setProfileForm({...profileForm, address: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="canteen-description">Description</Label>
                      <Textarea 
                        id="canteen-description" 
                        rows={4}
                        value={profileForm.description}
                        onChange={(e) => setProfileForm({...profileForm, description: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Operating Hours */}
                  <div>
                    <h3 className="font-medium mb-4">Operating Hours</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="opening-time">Opening Time</Label>
                        <Input 
                          id="opening-time" 
                          type="time"
                          value={profileForm.openingTime}
                          onChange={(e) => setProfileForm({...profileForm, openingTime: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="closing-time">Closing Time</Label>
                        <Input 
                          id="closing-time" 
                          type="time"
                          value={profileForm.closingTime}
                          onChange={(e) => setProfileForm({...profileForm, closingTime: e.target.value})}
                        />
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <Label className="mb-2 block">Operating Days</Label>
                      <div className="flex flex-wrap gap-2">
                        {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                          <Badge 
                            key={day}
                            variant={profileForm.operatingDays.includes(day) ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => {
                              if (profileForm.operatingDays.includes(day)) {
                                setProfileForm({
                                  ...profileForm,
                                  operatingDays: profileForm.operatingDays.filter(d => d !== day)
                                });
                              } else {
                                setProfileForm({
                                  ...profileForm,
                                  operatingDays: [...profileForm.operatingDays, day]
                                });
                              }
                            }}
                          >
                            {day}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={handleProfileUpdate}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Profile Sidebar */}
              <div className="space-y-6">
                {/* Profile Picture */}
                <Card>
                  <CardHeader>
                    <CardTitle>Canteen Photo</CardTitle>
                    <CardDescription>
                      Update your canteen's display picture
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center">
                    <div className="relative mb-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src="https://placehold.co/200" alt="Canteen" />
                        <AvatarFallback>{profileForm.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                        <Camera className="h-4 w-4 text-primary-foreground" />
                      </div>
                    </div>
                    <Button variant="outline" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload New Photo
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, GIF or PNG. 1MB max.
                    </p>
                  </CardContent>
                </Card>
                
                {/* Additional Actions */}
                <Card>
                  <CardHeader>
                    <CardTitle>Account Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Settings className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>Temporarily Close Canteen</span>
                      </div>
                      <Switch />
                    </div>
                    <Separator />
                    <Button variant="destructive" className="w-full">
                      <Trash className="h-4 w-4 mr-2" />
                      Delete Canteen
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Notifications Tab */}
          <TabsContent value="notifications">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Manage how and when you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Order Notifications */}
                  <div>
                    <h3 className="font-medium mb-4">Order Notifications</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">New Orders</p>
                          <p className="text-sm text-muted-foreground">
                            Get notified when a new order is placed
                          </p>
                        </div>
                        <Switch 
                          checked={notificationSettings.newOrders}
                          onCheckedChange={(checked) => 
                            setNotificationSettings({...notificationSettings, newOrders: checked})
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Order Status Updates</p>
                          <p className="text-sm text-muted-foreground">
                            Get notified when orders are modified or cancelled
                          </p>
                        </div>
                        <Switch 
                          checked={notificationSettings.orderUpdates}
                          onCheckedChange={(checked) => 
                            setNotificationSettings({...notificationSettings, orderUpdates: checked})
                          }
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Inventory & Reviews */}
                  <div>
                    <h3 className="font-medium mb-4">Inventory & Feedback</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Low Stock Alerts</p>
                          <p className="text-sm text-muted-foreground">
                            Get notified when menu items are running low
                          </p>
                        </div>
                        <Switch 
                          checked={notificationSettings.lowStock}
                          onCheckedChange={(checked) => 
                            setNotificationSettings({...notificationSettings, lowStock: checked})
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Reviews & Ratings</p>
                          <p className="text-sm text-muted-foreground">
                            Get notified when customers leave reviews
                          </p>
                        </div>
                        <Switch 
                          checked={notificationSettings.reviews}
                          onCheckedChange={(checked) => 
                            setNotificationSettings({...notificationSettings, reviews: checked})
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Daily Summary</p>
                          <p className="text-sm text-muted-foreground">
                            Receive a daily summary of orders and sales
                          </p>
                        </div>
                        <Switch 
                          checked={notificationSettings.dailySummary}
                          onCheckedChange={(checked) => 
                            setNotificationSettings({...notificationSettings, dailySummary: checked})
                          }
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Notification Channels */}
                  <div>
                    <h3 className="font-medium mb-4">Notification Channels</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Email Notifications</p>
                          <p className="text-sm text-muted-foreground">
                            Receive notifications via email
                          </p>
                        </div>
                        <Switch 
                          checked={notificationSettings.emailNotifications}
                          onCheckedChange={(checked) => 
                            setNotificationSettings({...notificationSettings, emailNotifications: checked})
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Push Notifications</p>
                          <p className="text-sm text-muted-foreground">
                            Receive push notifications in the browser or app
                          </p>
                        </div>
                        <Switch 
                          checked={notificationSettings.pushNotifications}
                          onCheckedChange={(checked) => 
                            setNotificationSettings({...notificationSettings, pushNotifications: checked})
                          }
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline">Reset to Default</Button>
                  <Button onClick={handleNotificationSettingsUpdate}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Notification Examples */}
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preview</CardTitle>
                  <CardDescription>
                    Example notifications you'll receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 border rounded-md">
                    <div className="flex items-start">
                      <div className="bg-primary/10 p-2 rounded-full mr-3">
                        <Bell className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">New Order #1234</p>
                        <p className="text-sm text-muted-foreground">
                          A new order has been placed for ₹580.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          2 minutes ago
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-md">
                    <div className="flex items-start">
                      <div className="bg-amber-100 p-2 rounded-full mr-3">
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      </div>
                      <div>
                        <p className="font-medium">Low Stock Alert</p>
                        <p className="text-sm text-muted-foreground">
                          Butter Chicken is running low (3 servings left).
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          45 minutes ago
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 border rounded-md">
                    <div className="flex items-start">
                      <div className="bg-green-100 p-2 rounded-full mr-3">
                        <Star className="h-4 w-4 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">New 5★ Review</p>
                        <p className="text-sm text-muted-foreground">
                          "Amazing food, quick service!" - Rahul S.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          1 day ago
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* Payment Tab */}
          <TabsContent value="payment">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Payment Settings</CardTitle>
                  <CardDescription>
                    Manage your payment methods and account details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Payment Options */}
                  <div>
                    <h3 className="font-medium mb-4">Payment Options</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Accept Online Payments</p>
                          <p className="text-sm text-muted-foreground">
                            Allow customers to pay online for orders
                          </p>
                        </div>
                        <Switch 
                          checked={paymentSettings.acceptOnlinePayments}
                          onCheckedChange={(checked) => 
                            setPaymentSettings({...paymentSettings, acceptOnlinePayments: checked})
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Accept Cash Payments</p>
                          <p className="text-sm text-muted-foreground">
                            Allow customers to pay with cash on pickup
                          </p>
                        </div>
                        <Switch 
                          checked={paymentSettings.acceptCash}
                          onCheckedChange={(checked) => 
                            setPaymentSettings({...paymentSettings, acceptCash: checked})
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Accept UPI Payments</p>
                          <p className="text-sm text-muted-foreground">
                            Allow customers to pay using UPI apps
                          </p>
                        </div>
                        <Switch 
                          checked={paymentSettings.acceptUPI}
                          onCheckedChange={(checked) => 
                            setPaymentSettings({...paymentSettings, acceptUPI: checked})
                          }
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Accept Card Payments</p>
                          <p className="text-sm text-muted-foreground">
                            Allow customers to pay using credit/debit cards
                          </p>
                        </div>
                        <Switch 
                          checked={paymentSettings.acceptCards}
                          onCheckedChange={(checked) => 
                            setPaymentSettings({...paymentSettings, acceptCards: checked})
                          }
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Bank Details */}
                  <div>
                    <h3 className="font-medium mb-4">Bank Account Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="bank-name">Bank Name</Label>
                        <Input 
                          id="bank-name" 
                          value={paymentSettings.bankName}
                          onChange={(e) => setPaymentSettings({...paymentSettings, bankName: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="account-number">Account Number</Label>
                        <Input 
                          id="account-number" 
                          value={paymentSettings.accountNumber}
                          onChange={(e) => setPaymentSettings({...paymentSettings, accountNumber: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="ifsc-code">IFSC Code</Label>
                        <Input 
                          id="ifsc-code" 
                          value={paymentSettings.ifscCode}
                          onChange={(e) => setPaymentSettings({...paymentSettings, ifscCode: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="upi-id">UPI ID</Label>
                        <Input 
                          id="upi-id" 
                          value={paymentSettings.upiId}
                          onChange={(e) => setPaymentSettings({...paymentSettings, upiId: e.target.value})}
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Your bank details are secure and only used for processing payments.
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline">Cancel</Button>
                  <Button onClick={handlePaymentSettingsUpdate}>
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
              
              {/* Additional Info */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Payment Information</CardTitle>
                    <CardDescription>
                      How payments work on our platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 border border-dashed rounded-md">
                      <h4 className="font-medium flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                        Payment Cycles
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Payments are processed and transferred to your bank account every 7 days.
                      </p>
                    </div>
                    
                    <div className="p-3 border border-dashed rounded-md">
                      <h4 className="font-medium flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        Transaction Fees
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        A 2.5% transaction fee is applied to all online payments processed through the platform.
                      </p>
                    </div>
                    
                    <Alert className="mt-6">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertTitle>Important Note</AlertTitle>
                      <AlertDescription>
                        Make sure your bank details are accurate to avoid payment delays.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          
          {/* Security Tab */}
          <TabsContent value="security">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your account security and authentication preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Password */}
                  <div>
                    <h3 className="font-medium mb-4">Change Password</h3>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                      </div>
                      <div>
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                      </div>
                      <div>
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" />
                      </div>
                      <Button>
                        <Lock className="h-4 w-4 mr-2" />
                        Update Password
                      </Button>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  {/* Two-Factor Authentication */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium">Two-Factor Authentication</h3>
                      <Switch />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account by enabling two-factor authentication.
                      When enabled, you'll be required to provide a verification code in addition to your password when logging in.
                    </p>
                  </div>
                  
                  <Separator />
                  
                  {/* Login History */}
                  <div>
                    <h3 className="font-medium mb-4">Recent Login Activity</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                        <div>
                          <p className="font-medium">Chrome on Windows</p>
                          <p className="text-xs text-muted-foreground">New Delhi, India • April 18, 2025 at 10:20 AM</p>
                        </div>
                        <Badge>Current</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                        <div>
                          <p className="font-medium">Safari on iPhone</p>
                          <p className="text-xs text-muted-foreground">New Delhi, India • April 17, 2025 at 3:45 PM</p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                        <div>
                          <p className="font-medium">Chrome on Windows</p>
                          <p className="text-xs text-muted-foreground">New Delhi, India • April 16, 2025 at 9:15 AM</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Security Tips */}
              <Card>
                <CardHeader>
                  <CardTitle>Security Tips</CardTitle>
                  <CardDescription>
                    Best practices to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-2 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <p className="text-sm">Use a strong, unique password that you don't use for other accounts.</p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-2 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <p className="text-sm">Enable two-factor authentication for an extra layer of security.</p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-2 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <p className="text-sm">Regularly monitor your login history for any suspicious activity.</p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-2 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <p className="text-sm">Never share your account credentials with anyone.</p>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mt-0.5 mr-2 h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                    <p className="text-sm">Log out when using shared or public computers.</p>
                  </div>
                  
                  <Alert className="mt-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Important</AlertTitle>
                    <AlertDescription>
                      We will never ask for your password via email or phone.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </VendorLayout>
  );
};

// Star component for reviews
const Star = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);

export default VendorSettings;
