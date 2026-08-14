/**
 * Console navigation.
 *
 * Single source of truth for both consoles. Previously the nav lists and the
 * route table disagreed - `/vendor/inventory` and four admin routes existed but
 * appeared in no menu, so they were reachable only by typing the URL.
 */
import {
  BarChart3,
  Boxes,
  Building2,
  ClipboardList,
  LayoutDashboard,
  MessageSquareWarning,
  Settings,
  Tags,
  UsersRound,
  UtensilsCrossed,
} from "lucide-react";

import type { ConsoleNavItem } from "@/components/layout/ConsoleLayout";

export const VENDOR_NAV: ConsoleNavItem[] = [
  { to: "/vendor", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/vendor/orders", label: "Orders", icon: ClipboardList },
  { to: "/vendor/menu", label: "Menu", icon: UtensilsCrossed },
  { to: "/vendor/inventory", label: "Inventory", icon: Boxes },
  { to: "/vendor/promotions", label: "Promotions", icon: Tags },
  { to: "/vendor/bulk-orders", label: "Bulk orders", icon: UsersRound },
  { to: "/vendor/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/vendor/settings", label: "Settings", icon: Settings },
];

export const ADMIN_NAV: ConsoleNavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/canteens", label: "Canteens", icon: Building2 },
  { to: "/admin/users", label: "Users", icon: UsersRound },
  { to: "/admin/complaints", label: "Complaints", icon: MessageSquareWarning },
  { to: "/admin/reports", label: "Reports", icon: BarChart3 },
];
