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
import { Loader2 } from "lucide-react";
import { LOGIN_MUTATION, INITIATE_CAS_LOGIN_MUTATION, SIGNUP_MUTATION } from "@/gql/mutations/auth_mutations";
import { useMutation } from "@apollo/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCASLoading, setIsCASLoading] = useState(false);

  const { toast } = useToast();
  const { login } = useUserStore();
  const navigate = useNavigate();

  const [loginMutation] = useMutation(LOGIN_MUTATION);
  const [signupMutation] = useMutation(SIGNUP_MUTATION);
  const [initiateCasLogin] = useMutation(INITIATE_CAS_LOGIN_MUTATION);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await loginMutation({
        variables: {
          username: email,
          password,
        },
      });

      if (data?.login?.user) {
        const u = data.login.user;
        login(u);
        toast({
          title: "Login Successful",
          description: `Welcome back, ${u.name}!`,
        });
        // Role-aware redirect: vendor -> vendor dashboard, admin -> admin dashboard, others -> home
        if (u.role === 'vendor') {
          navigate('/vendor/dashboard');
        } else if (u.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        toast({
          title: "Login Failed",
          description: data?.login?.message || "Invalid credentials",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await signupMutation({
        variables: {
          name,
          email,
          password,
        },
      });

      if (data?.signup?.user) {
        const u = data.signup.user;
        login(u);
        toast({
          title: "Signup Successful",
          description: `Welcome, ${u.name}!`,
        });
        // New signups are typically non-admin/vendors; route defensively
        if (u.role === 'vendor') navigate('/vendor/dashboard');
        else if (u.role === 'admin') navigate('/admin/dashboard');
        else navigate('/');
      } else {
        toast({
          title: "Signup Failed",
          description: data?.signup?.message || "Could not create account.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCASLogin = async () => {
    setIsCASLoading(true);
    try {
      const { data } = await initiateCasLogin();
      if (data?.initiateCasLogin) {
        window.location.href = data.initiateCasLogin;
      } else {
        throw new Error("Could not get CAS login URL");
      }
    } catch (error) {
      toast({
        title: "CAS Login Failed",
        description: "Could not redirect to CAS. Please try again.",
        variant: "destructive",
      });
      setIsCASLoading(false);
    }
  };

  const handleVendorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data } = await loginMutation({
        variables: {
          username: email,
          password,
        },
      });

      if (data?.login?.user && data?.login?.user.role === 'vendor') {
        login(data.login.user);
        toast({
          title: "Vendor Login Successful",
          description: "Welcome to your dashboard!",
        });
        navigate("/vendor/dashboard");
      } else {
        toast({
          title: "Vendor Login Failed",
          description: "Invalid vendor credentials.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
  <div className="min-h-screen bg-muted/10 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Link to="/" className="inline-block">
            <div className="flex items-center justify-center">
              <span className="text-3xl font-bold text-primary">Smart</span>
              <span className="text-3xl font-bold text-muted-foreground">Canteen</span>
            </div>
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Welcome</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in or create an account
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
            <TabsTrigger value="vendor">Vendor</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Student / Faculty Login</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading || isCASLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || isCASLoading}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button onClick={handleLogin} disabled={isLoading || isCASLoading} className="w-full">
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Sign in"}
                </Button>
                <div className="relative flex items-center w-full">
                  <div className="flex-1 border-t"></div>
                  <div className="px-3 text-xs text-muted-foreground">OR</div>
                  <div className="flex-1 border-t"></div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleCASLogin}
                  disabled={isLoading || isCASLoading}
                  className="w-full"
                >
                  {isCASLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Sign in with Campus CAS"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create an Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your.name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleSignup} disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Sign Up"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="vendor">
            <Card>
              <CardHeader>
                <CardTitle>Vendor Login</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="vendor-email">Email</Label>
                  <Input
                    id="vendor-email"
                    type="email"
                    placeholder="vendor@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vendor-password">Password</Label>
                  <Input
                    id="vendor-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={handleVendorLogin} disabled={isLoading} className="w-full">
                  {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : "Sign in as Vendor"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Login;