
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Store, 
  ShoppingCart, 
  Clock, 
  MessagesSquare, 
  User,
  LayoutDashboard,
  ClipboardList,
  MenuSquare,
  Tags, 
  BarChart, 
  Settings,
  PackageOpen
} from 'lucide-react';

interface NavLinksProps {
  isVendor?: boolean;
  isMobile?: boolean;
  onItemClick?: () => void;
}

const NavLinks: React.FC<NavLinksProps> = ({ isVendor = false, isMobile = false, onItemClick = () => {} }) => {
  const linkClasses = "flex items-center py-2 px-4 text-gray-700 hover:bg-orange-100 rounded-md transition-colors";
  const activeLinkClasses = "bg-orange-100 text-orange-600 font-medium";
  const iconClasses = "h-5 w-5 mr-3";
  
  const userLinks = [
    { path: "/", label: "Home", icon: <Home className={iconClasses} /> },
    { path: "/canteens", label: "Canteens", icon: <Store className={iconClasses} /> },
    { path: "/menu", label: "Menu", icon: <MenuSquare className={iconClasses} /> },
  ];

  const vendorLinks = [
    { path: "/vendor/dashboard", label: "Dashboard", icon: <LayoutDashboard className={iconClasses} /> },
    { path: "/vendor/orders", label: "Orders", icon: <ClipboardList className={iconClasses} /> },
    { path: "/vendor/menu", label: "Menu", icon: <MenuSquare className={iconClasses} /> },
    { path: "/vendor/promotions", label: "Promotions", icon: <Tags className={iconClasses} /> },
    { path: "/vendor/analytics", label: "Analytics", icon: <BarChart className={iconClasses} /> },
    { path: "/vendor/bulk-orders", label: "Bulk Orders", icon: <PackageOpen className={iconClasses} /> },
    { path: "/vendor/settings", label: "Settings", icon: <Settings className={iconClasses} /> },
  ];

  const links = isVendor ? vendorLinks : userLinks;

  return (
    // display flex
    <nav className={`flex space-y-1 space-x-1 ${isMobile ? 'py-4' : ''}`}>
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
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
};

export default NavLinks;
