import { useEffect, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "./contexts/CartContext";
import { NotificationProvider } from "./contexts/NotificationContext";
import Index from "./pages/Index";
import Cart from "./pages/Cart";
import Canteens from "./pages/Canteens";
import CanteenDetails from "./pages/CanteenDetails";
import Menu from "./pages/Menu";
import OrderHistory from "./pages/OrderHistory";
import OrderDetails from "./pages/OrderDetails";
import OrderTracking from "./pages/OrderTracking";
import Checkout from "./pages/Checkout";
import Payment from "./pages/Payment";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import VendorDashboard from "./pages/vendor/VendorDashboard";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCanteens from "./pages/admin/AdminCanteens";
import AdminVendors from "./pages/admin/AdminVendors";
import AdminComplaints from "./pages/admin/AdminComplaints";
import AdminCanteenDetail from "./pages/admin/AdminCanteenDetail";
import AdminReports from "./pages/admin/AdminReports";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminMenu from "./pages/admin/AdminMenu";
import AdminSettings from "./pages/admin/AdminSettings";
import HowItWorks from './pages/HowItWorks';
import NotFound from "./pages/NotFound";
import PreOrder from "./pages/PreOrder";
import Feedback from "./pages/Feedback";
import VendorOrders from "./pages/vendor/VendorOrders";
import VendorMenu from "./pages/vendor/VendorMenu";
import VendorInventory from "./pages/vendor/VendorInventory";
import VendorPromotions from "./pages/vendor/VendorPromotions";
import VendorAnalytics from "./pages/vendor/VendorAnalytics";
import VendorSettings from "./pages/vendor/VendorSettings";
import VendorBulkOrders from "./pages/vendor/VendorBulkOrders";
import LogOut from "./pages/LogOut";
import { GqlProvider } from "./gql/client";
import Cas from "./pages/Cas";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import VendorProtectedRoute from "./components/layout/VendorProtectedRoute";
import AdminProtectedRoute from "./components/layout/AdminProtectedRoute";
import { useUserStore } from "./stores/userStore";
import { Loader2 } from "lucide-react";

const queryClient = new QueryClient();


export default function App() {
  const { init } = useUserStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initialize = async () => {
      await init();
      setLoading(false);
    };
    initialize();
  }, [init]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <GqlProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <NotificationProvider>
              <CartProvider>
                <Toaster />
                <Sonner />
                <Routes>
                  {/* Public Pages */}
                  <Route path="/" element={<Index />} />
                  <Route path="/how-it-works" element={<HowItWorks />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/cas" element={<Cas />} />
                  <Route path="/canteens" element={<Canteens />} />
                  <Route path="/canteen/:id" element={<CanteenDetails />} />
                  <Route path="/menu" element={<Menu />} />

                  {/* Protected User Pages */}
                  <Route element={<ProtectedRoute />}>
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/payment/:id" element={<Payment />} />
                    <Route path="/orders" element={<OrderHistory />} />
                    <Route path="/orders/:id" element={<OrderDetails />} />
                    <Route path="/orders/track/:id" element={<OrderTracking />} />
                    <Route path="/pre-order" element={<PreOrder />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/logout" element={<LogOut />} />
                  </Route>

                  {/* Vendor Pages */}
                  <Route element={<VendorProtectedRoute />}>
                    <Route path="/vendor/dashboard" element={<VendorDashboard />} />
                    <Route path="/vendor/orders" element={<VendorOrders />} />
                    <Route path="/vendor/menu" element={<VendorMenu />} />
                    <Route path="/vendor/inventory" element={<VendorInventory />} />
                    <Route path="/vendor/promotions" element={<VendorPromotions />} />
                    <Route path="/vendor/analytics" element={<VendorAnalytics />} />
                    <Route path="/vendor/settings" element={<VendorSettings />} />
                    <Route path="/vendor/bulk-orders" element={<VendorBulkOrders />} />
                  </Route>

                  {/* Admin Pages */}
                  <Route element={<AdminProtectedRoute />}> 
                    <Route path="/admin/dashboard" element={<AdminDashboard />} />
                    <Route path="/admin/canteens" element={<AdminCanteens />} />
                    <Route path="/admin/canteens/:id" element={<AdminCanteenDetail />} />
                    <Route path="/admin/reports" element={<AdminReports />} />
                    <Route path="/admin/staff" element={<AdminStaff />} />
                    <Route path="/admin/menu" element={<AdminMenu />} />
                    <Route path="/admin/settings" element={<AdminSettings />} />
                    <Route path="/admin/vendors" element={<AdminVendors />} />
                    <Route path="/admin/complaints" element={<AdminComplaints />} />
                  </Route>

                  <Route path="/feedback" element={<Feedback />} />
                  {/* Not Found */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </CartProvider>
            </NotificationProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </GqlProvider>
    </BrowserRouter>
  );
};
