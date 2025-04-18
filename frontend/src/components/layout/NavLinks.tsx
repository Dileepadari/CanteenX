
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Utensils, ClipboardList, MessageSquare, UserCircle } from 'lucide-react';

const NavLinks = () => {
  const links = [
    { to: '/', label: 'Home', icon: <Home size={18} /> },
    { to: '/canteens', label: 'Canteens', icon: <Utensils size={18} /> },
    { to: '/orders', label: 'Orders', icon: <ClipboardList size={18} /> },
    { to: '/feedback', label: 'Feedback', icon: <MessageSquare size={18} /> },
    { to: '/profile', label: 'Profile', icon: <UserCircle size={18} /> },
  ];

  return (
    <nav className="flex space-x-1 md:space-x-2">
      {links.map(link => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => `
            flex items-center px-2 py-2 rounded-md text-sm font-medium
            ${isActive 
              ? 'bg-canteen-orange text-white' 
              : 'text-gray-700 hover:bg-gray-100'
            }
          `}
          end={link.to === '/'}
        >
          <span className="mr-1">{link.icon}</span>
          <span className="hidden md:inline">{link.label}</span>
        </NavLink>
      ))}
      <NavLink
        to="/pre-order"
        className={({ isActive }) => `
          flex items-center px-2 py-2 rounded-md text-sm font-medium
          ${isActive 
            ? 'bg-green-600 text-white' 
            : 'bg-green-500 text-white hover:bg-green-600'
          }
        `}
      >
        <span className="hidden md:inline">Schedule Order</span>
        <span className="inline md:hidden">Schedule</span>
      </NavLink>
    </nav>
  );
};

export default NavLinks;
