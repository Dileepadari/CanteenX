import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Store,
  LayoutDashboard,
  ClipboardList,
  MenuSquare,
  Tags,
  BarChart,
  Settings,
  PackageOpen,
  User
} from 'lucide-react';

interface NavLinksProps {
  role?: string;
  isVendor?: boolean;
  isMobile?: boolean;
  onItemClick?: () => void;
}

const NavLinks: React.FC<NavLinksProps> = ({ role, isVendor = false, isMobile = false, onItemClick = () => {} }) => {
  const linkClasses = "flex items-center py-2 px-4 text-gray-700 hover:bg-muted rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40";
  const activeLinkClasses = "bg-muted text-primary font-medium";
  const iconClasses = "h-5 w-5 mr-3";

  const userLinks = [
    { path: "/", label: "Home", icon: <Home aria-hidden className={iconClasses} /> },
    { path: "/canteens", label: "Canteens", icon: <Store aria-hidden className={iconClasses} /> },
    { path: "/menu", label: "Menu", icon: <MenuSquare aria-hidden className={iconClasses} /> },
  ];

  const adminLinks = [
    { path: "/admin/dashboard", label: "Admin", icon: <LayoutDashboard aria-hidden className={iconClasses} /> },
    { path: "/admin/canteens", label: "Canteens", icon: <Store aria-hidden className={iconClasses} /> },
    { path: "/admin/vendors", label: "Vendors", icon: <User aria-hidden className={iconClasses} /> },
    { path: "/admin/complaints", label: "Complaints", icon: <ClipboardList aria-hidden className={iconClasses} /> },
  ];

  const vendorLinks = [
    { path: "/vendor/dashboard", label: "Dashboard", icon: <LayoutDashboard aria-hidden className={iconClasses} /> },
    { path: "/vendor/orders", label: "Orders", icon: <ClipboardList aria-hidden className={iconClasses} /> },
    { path: "/vendor/menu", label: "Menu", icon: <MenuSquare aria-hidden className={iconClasses} /> },
    { path: "/vendor/promotions", label: "Promotions", icon: <Tags aria-hidden className={iconClasses} /> },
    { path: "/vendor/analytics", label: "Analytics", icon: <BarChart aria-hidden className={iconClasses} /> },
    { path: "/vendor/bulk-orders", label: "Bulk Orders", icon: <PackageOpen aria-hidden className={iconClasses} /> },
    { path: "/vendor/settings", label: "Settings", icon: <Settings aria-hidden className={iconClasses} /> },
  ];

  const roleLower = role?.toLowerCase?.() || '';
  const resolvedIsVendor = isVendor || roleLower === 'vendor';
  const resolvedIsAdmin = roleLower === 'admin' || roleLower === 'administrator';

  let links = userLinks;
  if (resolvedIsAdmin) links = adminLinks;
  else if (resolvedIsVendor) links = vendorLinks;

  return (
    <nav
      aria-label={isMobile ? "Mobile primary navigation" : "Primary navigation"}
      className={
        `${isMobile ? "flex flex-col space-y-1" : "flex items-center space-x-2"} ${isMobile ? 'py-2' : ''}`
      }
    >
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className={({ isActive }) =>
            `${linkClasses} ${isActive ? activeLinkClasses : ""}`
          }
          onClick={onItemClick}
          end={link.path === "/"}
        >
          {link.icon}
          <span>{link.label}</span>
        </NavLink>
      ))}
    </nav>
  );
};

export default NavLinks;
