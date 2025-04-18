
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { useUserStore } from "@/stores/userStore";
import { ArrowRight, Loader2 } from "lucide-react";

const simulateCASAuthentication = (email: string, password: string) => {
  return new Promise<{ success: boolean; user?: any; error?: string }>((resolve) => {
    setTimeout(() => {
      // This is just a simulation - in a real app, this would be a proper CAS integration
      if (email.includes("@campus.edu") && password.length >= 6) {
        const [username] = email.split("@");
        let role: "student" | "faculty" | "staff" = "student";
        
        if (email.includes("faculty")) {
          role = "faculty";
        } else if (email.includes("staff")) {
          role = "staff";
        }
        
        resolve({
          success: true,
          user: {
            id: `user-${Math.floor(Math.random() * 1000)}`,
            name: username.charAt(0).toUpperCase() + username.slice(1),
            email,
            role,
            department: role === "faculty" ? "Computer Science" : undefined,
            canteenCredits: 0,
          }
        });
      } else {
        resolve({
          success: false,
          error: "Invalid campus credentials"
        });
      }
    }, 1500);
  });
};

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCASOauth, setIsCASOauth] = useState(false);
  

  const { toast } = useToast();
  const { login } = useUserStore();
  const navigate = useNavigate();

  

  const handleLogin = async(e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please enter both email and password",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await simulateCASAuthentication(email, password);
      
      if (response.success && response.user) {
        login(response.user);
        
        toast({
          title: "Login successful",
          description: `Welcome back, ${response.user.name}!`,
        });
        
        // Redirect to previous page or home
        navigate(-1);
      } else {
        toast({
          title: "Authentication failed",
          description: response.error || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCASLogin = () => {
    setIsCASOauth(true);
    
    // Simulate redirecting to CAS and coming back with authentication
    setTimeout(() => {
      const mockUser = {
        id: `user-${Math.floor(Math.random() * 1000)}`,
        name: "John Doe",
        email: "johndoe@campus.edu",
        role: "student" as "student" | "faculty" | "staff",
        canteenCredits: 0,
      };
      
      login(mockUser);
      
      toast({
        title: "CAS Authentication successful",
        description: `Welcome back, ${mockUser.name}!`,
      });
      
      navigate(-1);
    }, 3000);
  };

  const handleVendorLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // In a real app, you would perform actual authentication here
    // This is just a mock for demonstration purposes
    toast({
      title: "Vendor Login Successful",
      description: "Welcome to your dashboard!",
    });
    
    navigate("/vendor/dashboard");
  };


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <div className="flex items-center justify-center">
              <span className="text-3xl font-bold text-canteen-orange">Smart</span>
              <span className="text-3xl font-bold text-canteen-blue">Canteen</span>
            </div>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome back</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in to access your account
          </p>
        </div>

        <Tabs defaultValue="student" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="student">Student / Faculty</TabsTrigger>
            <TabsTrigger value="vendor">Canteen Vendor</TabsTrigger>
          </TabsList>

          <TabsContent value="student">
            <Card className="border border-orange-100 shadow-lg animate-fade-in">
              <CardHeader className="space-y-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
                <CardDescription className="text-orange-100">
                  Enter your campus credentials to continue
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                {!isCASOauth ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.name@campus.edu"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        className="border-orange-200 focus:border-orange-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Button variant="link" className="px-0 h-auto text-xs text-orange-500">
                          Forgot password?
                        </Button>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className="border-orange-200 focus:border-orange-500"
                      />
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center py-6 space-y-4">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                    <div className="text-center">
                      <p className="font-medium">Redirecting to Campus Authentication Service...</p>
                      <p className="text-sm text-gray-500 mt-1">You will be redirected back after authentication</p>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                {!isCASOauth && (
                  <>
                    <Button 
                      className="w-full bg-orange-500 hover:bg-orange-600" 
                      onClick={handleLogin}
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Signing in...
                        </>
                      ) : (
                        <>Sign in</>
                      )}
                    </Button>
                    
                    <div className="relative flex items-center">
                      <div className="flex-1 border-t"></div>
                      <div className="px-3 text-xs text-muted-foreground">OR</div>
                      <div className="flex-1 border-t"></div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      className="w-full border-orange-200 text-orange-600 hover:bg-orange-50" 
                      onClick={handleCASLogin}
                      disabled={isLoading}
                    >
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        className="w-4 h-4 mr-2"
                      >
                        <rect width="20" height="16" x="2" y="4" rx="2"/>
                        <path d="M10 4v4"/>
                        <path d="M2 8h20"/>
                        <path d="M6 4v4"/>
                      </svg>
                      Sign in with Campus CAS
                    </Button>
                  </>
                )}
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="vendor">
            <Card>
              <CardHeader className="space-y-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-t-lg">
                <CardTitle className="text-2xl font-bold">Vendor Login</CardTitle>
                <CardDescription className="text-orange-100">
                  Sign in to manage your canteen
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <form onSubmit={handleVendorLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="vendor-email">Email</Label>
                    <Input 
                      id="vendor-email" 
                      type="email" 
                      placeholder="vendor@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="vendor-password">Password</Label>
                      <Link to="/forgot-password" className="text-sm text-canteen-blue hover:underline">
                        Forgot password?
                      </Link>
                    </div>
                    <Input 
                      id="vendor-password" 
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="vendor-remember" 
                      checked={rememberMe} 
                      onCheckedChange={() => setRememberMe(!rememberMe)} 
                    />
                    <Label htmlFor="vendor-remember" className="text-sm">Remember me</Label>
                  </div>

                  <Button type="submit" className="w-full">
                    Sign in
                  </Button>
                </form>
              </CardContent>
              <CardFooter className="flex flex-col">
                <div className="text-sm text-gray-500 text-center mt-2">
                  <span>Vendor registration is by invitation only</span>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;
