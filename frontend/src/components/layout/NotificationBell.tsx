/**
 * Notification bell, driven by a live subscription.
 *
 * Replaces a client-only system where notifications lived in React state and
 * `localStorage`, created by whichever tab performed the action - so a student
 * was never told their order was ready, because the vendor's tab is what
 * changed the status. It also shipped a "generate mock notifications" button
 * in the live vendor console; that is gone.
 */
import { useEffect, useState } from "react";
import { useMutation, useQuery, useSubscription } from "@apollo/client";
import { Link } from "react-router-dom";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";

import { Spinner } from "@/components/common";
import {
  MARK_ALL_NOTIFICATIONS_READ,
  MARK_NOTIFICATION_READ,
  NOTIFICATIONS,
  NOTIFICATIONS_SUBSCRIPTION,
} from "@/graphql/operations";
import { useSession } from "@/stores/session";
import { formatRelative } from "@/lib/datetime";
import { cn } from "@/lib/utils";

export function NotificationBell({ className }: { className?: string }) {
  const { user } = useSession();
  const [isOpen, setOpen] = useState(false);

  const { data, loading, refetch } = useQuery(NOTIFICATIONS, {
    variables: { limit: 15 },
    skip: !user,
  });

  // Live push. On any event we refetch rather than splicing the incoming
  // payload into the cache, so the unread counter and the list stay consistent
  // with the server in one round-trip.
  useSubscription(NOTIFICATIONS_SUBSCRIPTION, {
    skip: !user,
    onData: ({ data: payload }) => {
      const incoming = payload.data?.notifications;
      if (!incoming) return;
      toast(incoming.title, { description: incoming.body ?? undefined });
      void refetch();
    },
  });

  const [markRead] = useMutation(MARK_NOTIFICATION_READ);
  const [markAllRead] = useMutation(MARK_ALL_NOTIFICATIONS_READ, {
    onCompleted: () => void refetch(),
  });

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  if (!user) return null;

  const notifications = data?.notifications ?? [];
  const unread = data?.unreadNotificationCount ?? 0;

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((open) => !open)}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-label={
          unread > 0 ? `Notifications, ${unread} unread` : "Notifications"
        }
        className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
      >
        <Bell className="h-5 w-5" aria-hidden />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[0.625rem] font-bold text-accent-foreground">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <button
            type="button"
            aria-hidden
            tabIndex={-1}
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-label="Notifications"
            className="animate-scale-in absolute right-0 z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] origin-top-right overflow-hidden rounded-xl border border-border bg-popover shadow-lg"
          >
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="font-display text-sm font-semibold">Notifications</h2>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={() => void markAllRead()}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                >
                  <CheckCheck className="h-3.5 w-3.5" aria-hidden />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto" aria-live="polite">
              {loading && notifications.length === 0 ? (
                <div className="flex justify-center py-10">
                  <Spinner className="text-primary" />
                </div>
              ) : notifications.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-muted-foreground">
                  Nothing yet. Order updates will appear here.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {notifications.map((notification) => {
                    const body = (
                      <>
                        <div className="flex items-start gap-2">
                          {!notification.isRead && (
                            <span
                              aria-hidden
                              className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent"
                            />
                          )}
                          <div className={cn("min-w-0", notification.isRead && "pl-4")}>
                            <p className="truncate text-sm font-medium">
                              {notification.title}
                            </p>
                            {notification.body && (
                              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                                {notification.body}
                              </p>
                            )}
                            <p className="mt-1 text-[0.6875rem] text-muted-foreground">
                              {formatRelative(notification.createdAt)}
                            </p>
                          </div>
                        </div>
                      </>
                    );

                    const onSelect = () => {
                      if (!notification.isRead) {
                        void markRead({
                          variables: { notificationId: notification.id },
                        });
                      }
                      setOpen(false);
                    };

                    return (
                      <li key={notification.id}>
                        {notification.link ? (
                          <Link
                            to={notification.link}
                            onClick={onSelect}
                            className="block px-4 py-3 transition-colors hover:bg-secondary"
                          >
                            {body}
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={onSelect}
                            className="block w-full px-4 py-3 text-left transition-colors hover:bg-secondary"
                          >
                            {body}
                          </button>
                        )}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
