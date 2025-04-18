
import React from "react";
import { Link } from "react-router-dom";
import { Instagram, Facebook, Twitter, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-100 pt-12 pb-8 border-t">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <h3 className="text-lg font-bold mb-4">Smart Canteen</h3>
            <p className="text-gray-600 mb-4">
              Revolutionizing campus dining with convenient online ordering, 
              real-time tracking, and faster service.
            </p>
            <div className="flex space-x-4">
              <Link to="#" className="text-gray-500 hover:text-canteen-orange">
                <Instagram size={20} />
              </Link>
              <Link to="#" className="text-gray-500 hover:text-canteen-orange">
                <Facebook size={20} />
              </Link>
              <Link to="#" className="text-gray-500 hover:text-canteen-orange">
                <Twitter size={20} />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-600 hover:text-canteen-orange">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/canteens" className="text-gray-600 hover:text-canteen-orange">
                  Canteens
                </Link>
              </li>
              <li>
                <Link to="/orders" className="text-gray-600 hover:text-canteen-orange">
                  My Orders
                </Link>
              </li>
              <li>
                <Link to="/support" className="text-gray-600 hover:text-canteen-orange">
                  Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start">
                <Mail className="h-5 w-5 mr-2 text-canteen-orange" />
                <span className="text-gray-600">support@smartcanteen.edu</span>
              </li>
              <li className="flex items-start">
                <Phone className="h-5 w-5 mr-2 text-canteen-orange" />
                <span className="text-gray-600">+91 9876543210</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-8 pt-6 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Smart Canteen. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
