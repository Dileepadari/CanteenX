import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Shield,
  User as UserIcon,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { isAdminRole, isVendorRole, useSession } from "@/stores/session";
import { cn } from "@/lib/utils";

export function UserMenu({ className }: { className?: string }) {
  const { user, signOut } = useSession();
  const [isOpen, setOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    return (
      <Button asChild size="sm" className={className}>
        <Link to="/signin">Sign in</Link>
      </Button>
    );
  }

  const initials = user.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate("/");
  };

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="Account menu"
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-primary-muted text-sm font-semibold text-primary transition-colors hover:border-border-strong"
      >
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          initials || <UserIcon className="h-4 w-4" aria-hidden />
        )}
      </button>

      {isOpen && (
        <>
          {/* Click-away catcher. Sits below the menu but above the page. */}
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="menu"
            className="animate-scale-in absolute right-0 z-50 mt-2 w-56 origin-top-right overflow-hidden rounded-xl border border-border bg-popover shadow-lg"
          >
            <div className="border-b border-border px-4 py-3">
              <p className="truncate text-sm font-semibold">{user.name}</p>
              <p className="truncate text-xs text-muted-foreground">{user.email}</p>
            </div>

            <div className="p-1.5">
              <MenuLink to="/profile" icon={UserIcon} onClick={() => setOpen(false)}>
                Profile
              </MenuLink>
              <MenuLink to="/orders" icon={ClipboardList} onClick={() => setOpen(false)}>
                My orders
              </MenuLink>
              <MenuLink to="/wallet" icon={Wallet} onClick={() => setOpen(false)}>
                Wallet
              </MenuLink>

              {isVendorRole(user) && (
                <MenuLink
                  to="/vendor"
                  icon={LayoutDashboard}
                  onClick={() => setOpen(false)}
                >
                  Vendor console
                </MenuLink>
              )}
              {isAdminRole(user) && (
                <MenuLink to="/admin" icon={Shield} onClick={() => setOpen(false)}>
                  Admin console
                </MenuLink>
              )}
            </div>

            <div className="border-t border-border p-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={handleSignOut}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive-soft"
              >
                <LogOut className="h-4 w-4" aria-hidden />
                Sign out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function MenuLink({
  to,
  icon: Icon,
  children,
  onClick,
}: {
  to: string;
  icon: typeof UserIcon;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary"
    >
      <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />
      {children}
    </Link>
  );
}
