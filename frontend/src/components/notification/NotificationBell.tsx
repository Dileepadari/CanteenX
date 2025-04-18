
import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useNotification } from '@/contexts/NotificationContext';
import { format } from 'date-fns';

interface NotificationBellProps {
  variant?: 'default' | 'outline' | 'ghost';
}

const NotificationBell = ({ variant = 'default' }: NotificationBellProps) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotification();
  const [open, setOpen] = useState(false);
  
  // Mark notification as read when clicked
  const handleNotificationClick = (id: string, action?: () => void) => {
    markAsRead(id);
    if (action) action();
    setOpen(false);
  };
  
  // Format relative time
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);
    
    if (diffSec < 60) return 'just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return format(date, 'MMM d');
  };
  
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant={variant} className="relative p-2 h-9 w-9">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center transform translate-x-1 -translate-y-1">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between bg-orange-50 p-3">
          <h3 className="font-medium">Notifications</h3>
          {notifications.some(n => !n.read) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead} 
              className="text-xs h-7 px-2"
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[300px]">
          {notifications.length > 0 ? (
            <div>
              {notifications.map((notification) => (
                <div key={notification.id} className="p-3 hover:bg-gray-50 transition-colors">
                  <div 
                    className={`flex items-start ${!notification.read ? 'bg-orange-50/50' : ''}`}
                    role="button"
                    onClick={() => handleNotificationClick(notification.id, notification.action?.onClick)}
                  >
                    <div className={`h-2 w-2 mt-1.5 rounded-full ${!notification.read ? 'bg-orange-500' : 'bg-gray-200'}`} />
                    <div className="ml-2 flex-1">
                      <div className="flex justify-between items-start">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <span className="text-xs text-gray-500">{getRelativeTime(notification.date)}</span>
                      </div>
                      {notification.description && (
                        <p className="text-xs text-gray-600 mt-1">{notification.description}</p>
                      )}
                      {notification.action && (
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="h-6 p-0 mt-1 text-xs text-orange-600"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNotificationClick(notification.id, notification.action?.onClick);
                          }}
                        >
                          {notification.action.text}
                        </Button>
                      )}
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-5 w-5 p-0 opacity-50 hover:opacity-100"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeNotification(notification.id);
                      }}
                    >
                      ×
                    </Button>
                  </div>
                  <Separator className="mt-2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <Bell className="h-8 w-8 text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">No notifications</p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell;
