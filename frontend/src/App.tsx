import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import Index from "./pages/Index";
import Canteens from "./pages/Canteens";
import CanteenDetails from "./pages/CanteenDetails";
import Menu from "./pages/Menu";
import OrderHistory from "./pages/OrderHistory";
import OrderDetails from "./pages/OrderDetails";
import OrderTracking from "./pages/OrderTracking";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import NotFound from "./pages/NotFound";
import PreOrder from "./pages/PreOrder";
import Feedback from "./pages/Feedback";
import VendorOrders from "./pages/vendor/VendorOrders";
import VendorMenu from "./pages/vendor/VendorMenu";
import VendorPromotions from "./pages/vendor/VendorPromotions";
import VendorAnalytics from "./pages/vendor/VendorAnalytics";
import VendorSettings from "./pages/vendor/VendorSettings";
import VendorBulkOrders from "./pages/vendor/VendorBulkOrders";
import LogOut from "./pages/LogOut";

import { GqlProvider } from "./gql/client";
import useAuthMiddleware from "./middleware";

const queryClient = new QueryClient();

const AuthWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useAuthMiddleware();
  return <>{children}</>;
};

const App = () => (
  <BrowserRouter>
      <GqlProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <NotificationProvider>
              <CartProvider>
                <Toaster />
                <Sonner />
                <AuthWrapper>
                  <Routes>
                    {/* User Pages */}
                    <Route path="/" element={<Index />} />
                    <Route path="/canteens" element={<Canteens />} />
                    <Route path="/canteen/:id" element={<CanteenDetails />} />
                    <Route path="/menu" element={<Menu />} />
                    <Route path="/orders" element={<OrderHistory />} />
                    <Route path="/orders/:id" element={<OrderDetails />} />
                    <Route path="/orders/track/:id" element={<OrderTracking />} />
                    <Route path="/pre-order" element={<PreOrder />} />
                    <Route path="/feedback" element={<Feedback />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/logout" element={<LogOut />} />
                    
                    {/* Vendor Pages */}
                    <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                    <Route path="/vendor/orders" element={<VendorOrders />} />
                    <Route path="/vendor/menu" element={<VendorMenu />} />
                    <Route path="/vendor/promotions" element={<VendorPromotions />} />
                    <Route path="/vendor/analytics" element={<VendorAnalytics />} />
                    <Route path="/vendor/settings" element={<VendorSettings />} />
                    <Route path="/vendor/bulk-orders" element={<VendorBulkOrders />} />
                    
                    {/* Not Found */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AuthWrapper>
              </CartProvider>
            </NotificationProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </GqlProvider>
  </BrowserRouter>
);

export default App;
