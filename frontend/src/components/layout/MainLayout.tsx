/** Public site shell: header, content, footer. */
import { useEffect, useState } from "react";
import { useQuery } from "@apollo/client";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, ShoppingBag, X } from "lucide-react";

import { AdkDevAttribution, CanteenXLogo } from "@/components/brand/Logo";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserMenu } from "@/components/layout/UserMenu";
import { CART } from "@/graphql/operations";
import { useSession } from "@/stores/session";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/canteens", label: "Canteens" },
  { to: "/menu", label: "Menu" },
  { to: "/pre-order", label: "Pre-order" },
  { to: "/how-it-works", label: "How it works" },
];

function CartButton() {
  const { user } = useSession();
  const { data } = useQuery(CART, { skip: !user });
  const count = data?.cart.itemCount ?? 0;

  return (
    <Link
      to="/cart"
      aria-label={count > 0 ? `Cart, ${count} items` : "Cart"}
      className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      <ShoppingBag className="h-5 w-5" aria-hidden />
      {count > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[0.625rem] font-bold text-accent-foreground">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}

function Header() {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setMenuOpen(false), [location.pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" aria-label="CanteenX home">
          <CanteenXLogo />
        </Link>

        <nav
          className="ml-4 hidden items-center gap-1 md:flex"
          aria-label="Main navigation"
        >
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <CartButton />
          <NotificationBell />
          <ThemeToggle className="hidden sm:flex" />
          <UserMenu />
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label="Toggle navigation"
            aria-expanded={isMenuOpen}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground md:hidden"
          >
            {isMenuOpen ? (
              <X className="h-5 w-5" aria-hidden />
            ) : (
              <Menu className="h-5 w-5" aria-hidden />
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav
          className="animate-fade-in border-t border-border bg-background px-4 py-3 md:hidden"
          aria-label="Mobile navigation"
        >
          {NAV.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "block rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-secondary text-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                )
              }
            >
              {label}
            </NavLink>
          ))}
          <div className="mt-3 border-t border-border pt-3 sm:hidden">
            <ThemeToggle />
          </div>
        </nav>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="mt-16 border-t border-border bg-card/50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col gap-8 sm:flex-row sm:justify-between">
          <div className="max-w-xs">
            <CanteenXLogo showTagline />
            <p className="mt-3 text-sm text-muted-foreground">
              Order ahead from your campus canteens, pay digitally, and pick up
              without the queue.
            </p>
          </div>

          <nav className="grid grid-cols-2 gap-x-10 gap-y-2 text-sm sm:gap-x-16">
            <div className="space-y-2">
              <p className="font-semibold">Explore</p>
              {NAV.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="block text-muted-foreground transition-colors hover:text-foreground"
                >
                  {label}
                </Link>
              ))}
            </div>
            <div className="space-y-2">
              <p className="font-semibold">Account</p>
              <Link
                to="/orders"
                className="block text-muted-foreground transition-colors hover:text-foreground"
              >
                My orders
              </Link>
              <Link
                to="/wallet"
                className="block text-muted-foreground transition-colors hover:text-foreground"
              >
                Wallet
              </Link>
              <Link
                to="/feedback"
                className="block text-muted-foreground transition-colors hover:text-foreground"
              >
                Feedback
              </Link>
            </div>
          </nav>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} CanteenX
          </p>
          <AdkDevAttribution />
        </div>
      </div>
    </footer>
  );
}

export function MainLayout() {
  const location = useLocation();

  // Restore scroll on navigation - without this, moving from a long menu to a
  // short page leaves you halfway down the new one.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname]);

  return (
    <div className="grain flex min-h-dvh flex-col bg-background">
      <Header />
      <main className="relative z-[2] mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
