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
import { Edit2, Save, User, LogOut, Clock, CreditCard, CreditCardIcon } from "lucide-react";
import { GET_CURRENT_USER_QUERY } from "@/gql/queries/user_queries";
import { UPDATE_USER_PROFILE } from "@/gql/mutations/user_mutations";
import { useMutation } from "@apollo/client";

const Profile = () => {
  const { user, logout } = useUserStore();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [addingCredits, setAddingCredits] = useState(false);
  const [creditAmount, setCreditAmount] = useState(100);

  const [updateUserProfile, { loading }] = useMutation(UPDATE_USER_PROFILE, {
    refetchQueries: [{ query: GET_CURRENT_USER_QUERY }],
  });

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    toast({
      title: "Logged out successfully",
      description: "You have been logged out from your account",
    });
    navigate("/login");
  };

  const handleSaveProfile = async () => {
    try {
      await updateUserProfile({
        variables: {
          name,
          email,
        },
      });
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated",
      });
      setIsEditing(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  const handleAddCredits = () => {
    // This should be a mutation to the backend
    toast({
      title: "Credits added",
      description: `${creditAmount} credits have been added to your account`,
    });
    setAddingCredits(false);
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <p>Loading user profile...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
  <div className="min-h-screen bg-gradient-to-br from-muted to-white">
        <div className="container px-4 py-8 mx-auto max-w-4xl">
          <h1 className="mb-6 text-3xl font-bold text-primary">Your Profile</h1>

          <div className="flex flex-col md:flex-row gap-6">
            <Card className="md:w-1/3 border border-border shadow-md">
              <CardContent className="p-6">
                <div className="flex flex-col items-center space-y-4">
                  <Avatar className="w-24 h-24 border-2 border-border">
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`} />
                    <AvatarFallback className="text-2xl bg-muted/10 text-primary">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="text-center">
                    <h2 className="text-xl font-bold">{user.name}</h2>
                    <p className="text-gray-500">{user.email}</p>
                    <div className="mt-1 text-sm bg-muted/10 text-primary px-2 py-1 rounded-full inline-block capitalize">
                      {user.role}
                    </div>
                  </div>

                  <div className="w-full p-3 bg-muted/10 rounded-lg text-center mt-2">
                    <p className="text-sm text-gray-500">Canteen Balance</p>
                    <p className="text-2xl font-bold text-primary">₹{user.canteenCredits || 0}</p>
                  </div>

                  <Button
                    variant="outline"
                    className="w-full border-border text-primary hover:bg-muted"
                    onClick={() => setAddingCredits(true)}
                  >
                    <CreditCardIcon className="w-4 h-4 mr-2" /> Add Credits
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full border-border text-destructive hover:bg-destructive/10"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" /> Logout
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="flex-1">
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="w-full grid grid-cols-2 bg-muted/10">
                  <TabsTrigger value="details" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                    Personal Details
                  </TabsTrigger>
                  <TabsTrigger value="preferences" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                    Preferences
                  </TabsTrigger>
                  {user?.role?.toLowerCase() === 'vendor' && (
                    <TabsTrigger value="vendor" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                      Vendor
                    </TabsTrigger>
                  )}
                  {user?.role?.toLowerCase() === 'admin' && (
                    <TabsTrigger value="admin" className="data-[state=active]:bg-primary data-[state=active]:text-white">
                      Admin
                    </TabsTrigger>
                  )}
                </TabsList>

                <TabsContent value="details" className="mt-4 animate-fade-in">
                  <Card className="border border-border shadow-md">
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
                        <Edit2 className="w-4 h-4 text-primary" />
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
                              className="border-border"
                            />
                          ) : (
                            <div className="py-2 px-3 bg-gray-50 rounded-md">{user.name}</div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email">Email</Label>
                          {isEditing ? (
                            <Input
                              id="email"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="border-border"
                            />
                          ) : (
                            <div className="py-2 px-3 bg-gray-50 rounded-md">{user.email}</div>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label>Role</Label>
                          <div className="py-2 px-3 bg-gray-50 rounded-md capitalize">{user.role}</div>
                        </div>
                      </div>
                    </CardContent>
                    {isEditing && (
                      <CardFooter>
                        <Button
                          className="bg-primary hover:bg-primary/90 ml-auto"
                          onClick={handleSaveProfile}
                          disabled={loading}
                        >
                          {loading ? 'Saving...' : (
                            <>
                              <Save className="w-4 h-4 mr-2" /> Save Changes
                            </>
                          )}
                        </Button>
                      </CardFooter>
                    )}
                  </Card>
                </TabsContent>
                {user?.role?.toLowerCase() === 'vendor' && (
                  <TabsContent value="vendor" className="mt-4 animate-fade-in">
                    <Card className="border border-border shadow-md">
                      <CardHeader>
                        <CardTitle>Vendor Settings</CardTitle>
                        <CardDescription>Manage your canteen and vendor preferences</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">Link to vendor dashboard and canteen settings.</p>
                        <div className="mt-4">
                          <Button asChild>
                            <a href="/vendor/dashboard">Open Vendor Dashboard</a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}

                {user?.role?.toLowerCase() === 'admin' && (
                  <TabsContent value="admin" className="mt-4 animate-fade-in">
                    <Card className="border border-border shadow-md">
                      <CardHeader>
                        <CardTitle>Admin Tools</CardTitle>
                        <CardDescription>Access admin dashboard and moderation tools</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm">Open the admin dashboard to manage canteens, users and complaints.</p>
                        <div className="mt-4">
                          <Button asChild>
                            <a href="/admin/dashboard">Open Admin Dashboard</a>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                )}
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Profile;
