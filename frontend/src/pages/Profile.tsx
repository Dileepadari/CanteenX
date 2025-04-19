import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { useUserStore } from "@/stores/userStore";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Edit2, Save, User, LogOut, Clock, CreditCard, CreditCardIcon  } from "lucide-react";
import { GET_CURRENT_USER } from "@/gql/queries/user";
import { UPDATE_USER_PROFILE } from "@/gql/mutations/users";
import { useApolloClient } from "@apollo/client";
// const { updateUser } = useUserStore();


const Profile = () => {
  const client = useApolloClient(); // Get Apollo Client instance
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  

  const { toast } = useToast();

  useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true);
        const { data } = await client.query({ query: GET_CURRENT_USER });
        setUser(data?.getCurrentUser || []);
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
  
      getUser();
    }, [client, toast]);
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [addingCredits, setAddingCredits] = useState(false);
  const [creditAmount, setCreditAmount] = useState(100);
  const handleLogout = () => {
    toast({
      title: "Logged out successfully",
      description: "You have been logged out from your account",
    });
    navigate("/logout");
  };

  const handleSaveProfile = () => {
    if (user) {
      client.mutate({
        mutation: UPDATE_USER_PROFILE,
        variables: {
          userId: user.id,
          name,
          email,
        },
      });

      toast({
        title: "Profile updated",
        description: "Your profile information has been updated",
      });

      setIsEditing(false);
    }
  };

  const handleAddCredits = () => {
    if (user) {
      // // Simulate adding credits
      // updateUser({
      //   ...user,
      //   canteenCredits: (user.canteenCredits || 0) + creditAmount,
      // });

      toast({
        title: "Credits added",
        description: `${creditAmount} credits have been added to your account`,
      });

      setAddingCredits(false);
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
        <div className="container px-4 py-8 mx-auto max-w-4xl">
          <h1 className="mb-6 text-3xl font-bold text-orange-600">Your Profile</h1>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile sidebar */}
            <Card className="md:w-1/3 border border-orange-100 shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-24 h-24 border-2 border-orange-200">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name}`} />
                    <AvatarFallback className="text-2xl bg-orange-100 text-orange-600">
                      {user?.name?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="text-center">
                    <h2 className="text-xl font-bold">{user?.name}</h2>
                    <p className="text-gray-500">{user?.email}</p>
                    <div className="mt-1 text-sm bg-orange-100 text-orange-600 px-2 py-1 rounded-full inline-block capitalize">
                      {user?.role}
                    </div>
                  </div>

                  <div className="w-full p-3 bg-orange-50 rounded-lg text-center mt-2">
                    <p className="text-sm text-gray-500">Canteen Balance</p>
                    <p className="text-2xl font-bold text-orange-600">₹{user?.canteenCredits || 0}</p>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full border-orange-200 text-orange-600 hover:bg-orange-50"
                    onClick={() => setAddingCredits(true)}
                  >
                    <CreditCardIcon className="w-4 h-4 mr-2" /> Add Credits
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-red-200 text-red-600 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Main content */}
            <div className="flex-1">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="w-full grid grid-cols-2 bg-orange-100">
                  <TabsTrigger value="details" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                    Personal Details
                  </TabsTrigger>
                  <TabsTrigger value="preferences" className="data-[state=active]:bg-orange-500 data-[state=active]:text-white">
                    Preferences
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="mt-4 animate-fade-in">
                  <Card className="border border-orange-100 shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between">
                      <div>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Manage your personal details</CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        <Edit2 className="w-4 h-4 text-orange-600" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          {isEditing ? (
                            <Input
                              id="name"
                              value={name}
                              onChange={(e) => setName(e.target.value)}
                              className="border-orange-200"
                            />
                          ) : (
                            <div className="py-2 px-3 bg-gray-50 rounded-md">{user?.name}</div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          {isEditing ? (
                            <Input
                              id="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="border-orange-200"
                            />
                          ) : (
                            <div className="py-2 px-3 bg-gray-50 rounded-md">{user?.email}</div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Role</Label>
                          <div className="py-2 px-3 bg-gray-50 rounded-md capitalize">{user?.role}</div>
                        </div>

                        {user?.department && (
                          <div className="space-y-2">
                            <Label>Department</Label>
                            <div className="py-2 px-3 bg-gray-50 rounded-md">{user.department}</div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                    {isEditing && (
                      <CardFooter>
                        <Button
                          className="bg-orange-500 hover:bg-orange-600 ml-auto"
                          onClick={handleSaveProfile}
                        >
                          <Save className="w-4 h-4 mr-2" /> Save Changes
                        </Button>
                      </CardFooter>
                    )}
                  </Card>

                  <Card className="mt-4 border border-orange-100 shadow-md">
                    <CardHeader>
                      <CardTitle>Account Security</CardTitle>
                      <CardDescription>Manage your account security settings</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-500 mb-4">
                        Your account is secured with Campus Authentication Service (CAS).
                        For security updates, please contact your campus IT department.
                      </p>
                      <div className="bg-green-50 p-3 rounded-md text-green-600 text-sm flex items-center">
                        <div className="w-2 h-2 bg-green-600 rounded-full mr-2"></div>
                        Your account is secure with campus authentication
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="preferences" className="mt-4 animate-fade-in">
                  <Card className="border border-orange-100 shadow-md">
                    <CardHeader>
                      <CardTitle>Dietary Preferences</CardTitle>
                      <CardDescription>Set your food preferences for quick ordering</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="vegetarian" className="flex-1">Vegetarian</Label>
                          <input type="checkbox" id="vegetarian" className="w-4 h-4 accent-orange-500" />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <Label htmlFor="vegan" className="flex-1">Vegan</Label>
                          <input type="checkbox" id="vegan" className="w-4 h-4 accent-orange-500" />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <Label htmlFor="gluten-free" className="flex-1">Gluten Free</Label>
                          <input type="checkbox" id="gluten-free" className="w-4 h-4 accent-orange-500" />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <Label htmlFor="nut-allergy" className="flex-1">Nut Allergy</Label>
                          <input type="checkbox" id="nut-allergy" className="w-4 h-4 accent-orange-500" />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <Label htmlFor="spicy" className="flex-1">Prefer Spicy</Label>
                          <input type="checkbox" id="spicy" className="w-4 h-4 accent-orange-500" />
                        </div>

                        <Button className="mt-4 bg-orange-500 hover:bg-orange-600">
                          Save Preferences
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="mt-4 border border-orange-100 shadow-md">
                    <CardHeader>
                      <CardTitle>Notification Settings</CardTitle>
                      <CardDescription>Manage how you receive updates</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="order-updates" className="flex-1">Order Status Updates</Label>
                          <input type="checkbox" id="order-updates" className="w-4 h-4 accent-orange-500" defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <Label htmlFor="promotions" className="flex-1">Promotions and Offers</Label>
                          <input type="checkbox" id="promotions" className="w-4 h-4 accent-orange-500" defaultChecked />
                        </div>
                        <Separator />
                        <div className="flex items-center justify-between">
                          <Label htmlFor="menu-updates" className="flex-1">Menu Updates</Label>
                          <input type="checkbox" id="menu-updates" className="w-4 h-4 accent-orange-500" />
                        </div>

                        <Button className="mt-4 bg-orange-500 hover:bg-orange-600">
                          Save Notification Settings
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Add Credits Modal */}
        {addingCredits && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md border-orange-100 animate-fade-in">
              <CardHeader>
                <CardTitle>Add Credits</CardTitle>
                <CardDescription>Add money to your canteen account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Select Amount</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <Button
                        type="button"
                        variant={creditAmount === 50 ? "default" : "outline"}
                        className={creditAmount === 50 ? "bg-orange-500 hover:bg-orange-600" : "border-orange-200"}
                        onClick={() => setCreditAmount(50)}
                      >
                        ₹50
                      </Button>
                      <Button
                        type="button"
                        variant={creditAmount === 100 ? "default" : "outline"}
                        className={creditAmount === 100 ? "bg-orange-500 hover:bg-orange-600" : "border-orange-200"}
                        onClick={() => setCreditAmount(100)}
                      >
                        ₹100
                      </Button>
                      <Button
                        type="button"
                        variant={creditAmount === 200 ? "default" : "outline"}
                        className={creditAmount === 200 ? "bg-orange-500 hover:bg-orange-600" : "border-orange-200"}
                        onClick={() => setCreditAmount(200)}
                      >
                        ₹200
                      </Button>
                    </div>
                  </div>

                  <div className="pt-4">
                    <div className="border rounded-lg p-4 bg-gray-50">
                      <p className="text-sm text-gray-500">Payment Method</p>
                      <div className="flex items-center mt-2">
                        <CreditCard className="w-5 h-5 text-orange-500 mr-2" />
                        <span>Campus Pay</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  className="border-orange-200"
                  onClick={() => setAddingCredits(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={handleAddCredits}
                >
                  Add ₹{creditAmount}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Profile;
