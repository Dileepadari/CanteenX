
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Mail, Phone } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold">CanteenX</h3>
            <p className="text-sm text-muted-foreground">
              Your favorite campus canteen food, ordered online and ready when you are.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/canteens" className="text-muted-foreground hover:text-foreground">
                  Browse Canteens
                </Link>
              </li>
              <li>
                <Link to="/menu" className="text-muted-foreground hover:text-foreground">
                  Menu
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="text-muted-foreground hover:text-foreground">
                  Feedback
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Support</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+91 7330701217</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>canteenx@dileepadari.dev</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-lg font-semibold">Follow Us</h3>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col items-center justify-between gap-4 text-sm text-muted-foreground sm:flex-row">
          <p>&copy; 2024 CanteenX. All rights reserved.</p>
          <div className="flex gap-4">
            <Link to="/privacy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
