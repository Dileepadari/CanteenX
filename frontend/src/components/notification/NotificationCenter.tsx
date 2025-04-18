
import React, { useState } from "react";
import { Bell, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Notification } from "@/components/ui/notification";
import { Separator } from "@/components/ui/separator";
import { useNotification } from "@/contexts/NotificationContext";
import { formatDistanceToNow } from "date-fns";

export const NotificationCenter = () => {
  const [open, setOpen] = useState(false);
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
  } = useNotification();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              variant="default" 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="sm:max-w-md">
        <SheetHeader className="flex flex-row items-center justify-between">
          <SheetTitle>Notifications</SheetTitle>
          <div className="flex space-x-2">
            {unreadCount > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={markAllAsRead}
              >
                <Check className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Mark all as read</span>
              </Button>
            )}
            {notifications.length > 0 && (
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={clearAll}
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only sm:not-sr-only">Clear all</span>
              </Button>
            )}
          </div>
        </SheetHeader>
        <div className="mt-6 space-y-4 overflow-y-auto max-h-[calc(100vh-10rem)]">
          {notifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div key={notification.id} className="relative">
                <Notification
                  variant={notification.type}
                  title={notification.title}
                  description={notification.description}
                  className={notification.read ? "opacity-70" : ""}
                  onClose={() => removeNotification(notification.id)}
                  action={
                    !notification.read ? (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => markAsRead(notification.id)}
                      >
                        Mark as read
                      </Button>
                    ) : undefined
                  }
                />
                <p className="text-xs text-muted-foreground ml-7 mt-1">
                  {formatDistanceToNow(notification.date, { addSuffix: true })}
                </p>
                <Separator className="mt-4" />
              </div>
            ))
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
