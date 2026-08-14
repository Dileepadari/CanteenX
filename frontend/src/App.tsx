/**
 * Routing.
 *
 * Every page is code-split. The previous build shipped all 35 pages in one
 * bundle with no `React.lazy`, no `Suspense`, and no error boundary.
 */
import { Suspense, lazy, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { PageLoader } from "@/components/common";
import { ConsoleLayout } from "@/components/layout/ConsoleLayout";
import { MainLayout } from "@/components/layout/MainLayout";
import { RequireAdmin, RequireAuth, RequireVendor } from "@/components/layout/guards";
import { ADMIN_NAV, VENDOR_NAV } from "@/routes/navigation";
import { useSession } from "@/stores/session";

/* ------------------------------------------------------------------ public */
const Home = lazy(() => import("@/pages/Home"));
const Canteens = lazy(() => import("@/pages/Canteens"));
const CanteenDetail = lazy(() => import("@/pages/CanteenDetail"));
const Menu = lazy(() => import("@/pages/Menu"));
const HowItWorks = lazy(() => import("@/pages/HowItWorks"));
const SignIn = lazy(() => import("@/pages/SignIn"));
const CasCallback = lazy(() => import("@/pages/CasCallback"));
const NotFound = lazy(() => import("@/pages/NotFound"));

/* --------------------------------------------------------------- customer */
const Cart = lazy(() => import("@/pages/Cart"));
const Checkout = lazy(() => import("@/pages/Checkout"));
const Orders = lazy(() => import("@/pages/Orders"));
const OrderDetail = lazy(() => import("@/pages/OrderDetail"));
const OrderTracking = lazy(() => import("@/pages/OrderTracking"));
const PreOrder = lazy(() => import("@/pages/PreOrder"));
const Profile = lazy(() => import("@/pages/Profile"));
const WalletPage = lazy(() => import("@/pages/Wallet"));
const Feedback = lazy(() => import("@/pages/Feedback"));

/* ----------------------------------------------------------------- vendor */
const VendorDashboard = lazy(() => import("@/pages/vendor/Dashboard"));
const VendorOrders = lazy(() => import("@/pages/vendor/Orders"));
const VendorMenu = lazy(() => import("@/pages/vendor/Menu"));
const VendorInventory = lazy(() => import("@/pages/vendor/Inventory"));
const VendorPromotions = lazy(() => import("@/pages/vendor/Promotions"));
const VendorBulkOrders = lazy(() => import("@/pages/vendor/BulkOrders"));
const VendorAnalytics = lazy(() => import("@/pages/vendor/Analytics"));
const VendorSettings = lazy(() => import("@/pages/vendor/Settings"));

/* ------------------------------------------------------------------ admin */
const AdminDashboard = lazy(() => import("@/pages/admin/Dashboard"));
const AdminCanteens = lazy(() => import("@/pages/admin/Canteens"));
const AdminUsers = lazy(() => import("@/pages/admin/Users"));
const AdminComplaints = lazy(() => import("@/pages/admin/Complaints"));
const AdminReports = lazy(() => import("@/pages/admin/Reports"));

export default function App() {
  const { refresh } = useSession();
  const navigate = useNavigate();

  // Confirm the session against the server on mount. Persisted state renders
  // immediately; this corrects it in the background.
  useEffect(() => {
    void refresh();
  }, [refresh]);

  // The Apollo error link raises this when a refresh attempt fails outright.
  useEffect(() => {
    const onExpired = () => {
      useSession.setState({ user: null });
      toast.error("Your session expired. Please sign in again.");
      navigate("/signin");
    };
    window.addEventListener("canteenx:session-expired", onExpired);
    return () => window.removeEventListener("canteenx:session-expired", onExpired);
  }, [navigate]);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* --- public + customer, inside the public shell --- */}
        <Route element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="canteens" element={<Canteens />} />
          <Route path="canteens/:id" element={<CanteenDetail />} />
          <Route path="menu" element={<Menu />} />
          <Route path="how-it-works" element={<HowItWorks />} />
          <Route path="feedback" element={<Feedback />} />

          <Route element={<RequireAuth />}>
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders" element={<Orders />} />
            <Route path="orders/:id" element={<OrderDetail />} />
            <Route path="orders/track/:id" element={<OrderTracking />} />
            <Route path="pre-order" element={<PreOrder />} />
            <Route path="profile" element={<Profile />} />
            <Route path="wallet" element={<WalletPage />} />
          </Route>
        </Route>

        {/* --- auth, outside the shell --- */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/cas" element={<CasCallback />} />

        {/* --- vendor console --- */}
        <Route element={<RequireVendor />}>
          <Route
            path="/vendor"
            element={<ConsoleLayout items={VENDOR_NAV} title="Vendor" homeTo="/vendor" />}
          >
            <Route index element={<VendorDashboard />} />
            <Route path="orders" element={<VendorOrders />} />
            <Route path="menu" element={<VendorMenu />} />
            <Route path="inventory" element={<VendorInventory />} />
            <Route path="promotions" element={<VendorPromotions />} />
            <Route path="bulk-orders" element={<VendorBulkOrders />} />
            <Route path="analytics" element={<VendorAnalytics />} />
            <Route path="settings" element={<VendorSettings />} />
          </Route>
        </Route>

        {/* --- admin console --- */}
        <Route element={<RequireAdmin />}>
          <Route
            path="/admin"
            element={<ConsoleLayout items={ADMIN_NAV} title="Admin" homeTo="/admin" />}
          >
            <Route index element={<AdminDashboard />} />
            <Route path="canteens" element={<AdminCanteens />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="complaints" element={<AdminComplaints />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
