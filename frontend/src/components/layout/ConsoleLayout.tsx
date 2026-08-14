/**
 * Shared shell for the vendor and admin consoles.
 *
 * Both previously used fixed sidebars with no mobile navigation at all - the
 * entire back office was desktop-only. This provides one responsive shell:
 * a persistent sidebar from `lg`, and a slide-over drawer below it.
 */
import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, X, type LucideIcon } from "lucide-react";

import { CanteenXLogo } from "@/components/brand/Logo";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { UserMenu } from "@/components/layout/UserMenu";
import { cn } from "@/lib/utils";

export interface ConsoleNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

function NavItems({
  items,
  onNavigate,
}: {
  items: ConsoleNavItem[];
  onNavigate?: () => void;
}) {
  return (
    <nav className="space-y-1" aria-label="Console sections">
      {items.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground shadow-xs"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )
          }
        >
          <Icon className="h-4 w-4 shrink-0" aria-hidden />
          <span className="truncate">{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export function ConsoleLayout({
  items,
  title,
  homeTo,
}: {
  items: ConsoleNavItem[];
  title: string;
  homeTo: string;
}) {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // Close the drawer on navigation, or it stays open over the new page.
  useEffect(() => setDrawerOpen(false), [location.pathname]);

  // Lock body scroll while the drawer is open so the page behind cannot move.
  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <div className="grain min-h-dvh bg-background">
      {/* --- top bar --- */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            aria-label="Open navigation"
            aria-expanded={isDrawerOpen}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground lg:hidden"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>

          <Link to={homeTo} className="flex items-center gap-2.5">
            <CanteenXLogo markClassName="h-7 w-7" />
            <span className="hidden rounded-md bg-accent-soft px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-accent sm:inline">
              {title}
            </span>
          </Link>

          <div className="ml-auto flex items-center gap-1.5">
            <NotificationBell />
            <ThemeToggle />
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="flex">
        {/* --- persistent sidebar --- */}
        <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-64 shrink-0 overflow-y-auto border-r border-border p-4 lg:block">
          <NavItems items={items} />
        </aside>

        {/* --- mobile drawer --- */}
        {isDrawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button
              type="button"
              aria-label="Close navigation"
              onClick={() => setDrawerOpen(false)}
              className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
            />
            <div className="animate-slide-up absolute inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-border bg-card p-4 shadow-lg">
              <div className="mb-5 flex items-center justify-between">
                <CanteenXLogo markClassName="h-7 w-7" />
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close navigation"
                  className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
              <NavItems items={items} onNavigate={() => setDrawerOpen(false)} />
            </div>
          </div>
        )}

        <main className="relative z-[2] min-w-0 flex-1 px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
