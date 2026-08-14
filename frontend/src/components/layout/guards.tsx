/**
 * Route guards.
 *
 * Two fixes over the previous three near-identical guards: roles are compared
 * case-insensitively through `hasRole` (the old exact comparison bounced a user
 * whose role was stored as "Admin"), and an unauthenticated visit carries the
 * attempted path so sign-in can return them there instead of always landing
 * on the home page.
 */
import { Navigate, Outlet, useLocation } from "react-router-dom";

import { PageLoader } from "@/components/common";
import { isAdminRole, isVendorRole, useSession } from "@/stores/session";

function useAuthGate() {
  const { user, isLoading, hasHydrated } = useSession();
  // Only block on the very first load, before persisted state is available.
  const isResolving = isLoading && !hasHydrated;
  return { user, isResolving };
}

export function RequireAuth() {
  const { user, isResolving } = useAuthGate();
  const location = useLocation();

  if (isResolving) return <PageLoader label="Checking your session" />;

  if (!user) {
    return (
      <Navigate
        to={`/signin?next=${encodeURIComponent(location.pathname + location.search)}`}
        replace
      />
    );
  }
  return <Outlet />;
}

export function RequireVendor() {
  const { user, isResolving } = useAuthGate();
  const location = useLocation();

  if (isResolving) return <PageLoader label="Checking your access" />;
  if (!user) {
    return (
      <Navigate
        to={`/signin?next=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }
  return isVendorRole(user) ? <Outlet /> : <Navigate to="/" replace />;
}

export function RequireAdmin() {
  const { user, isResolving } = useAuthGate();
  const location = useLocation();

  if (isResolving) return <PageLoader label="Checking your access" />;
  if (!user) {
    return (
      <Navigate
        to={`/signin?next=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }
  return isAdminRole(user) ? <Outlet /> : <Navigate to="/" replace />;
}
