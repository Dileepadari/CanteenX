
import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { toast } from "sonner";

type NotificationType = "default" | "success" | "warning" | "error" | "info";

interface Notification {
  id: string;
  title: string;
  description?: string;
  type: NotificationType;
  read: boolean;
  date: Date;
  action?: {
    text: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, "id" | "read" | "date">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Local storage key for persistent notifications
const STORAGE_KEY = "smart_canteen_notifications";

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load notifications from local storage on initial render
  const loadSavedNotifications = (): Notification[] => {
    try {
      const savedNotifications = localStorage.getItem(STORAGE_KEY);
      if (savedNotifications) {
        const parsed = JSON.parse(savedNotifications);
        // Convert string dates back to Date objects
        return parsed.map((notification: any) => ({
          ...notification,
          date: new Date(notification.date)
        }));
      }
    } catch (error) {
      console.error("Error loading notifications from storage:", error);
    }
    return [];
  };

  const [notifications, setNotifications] = useState<Notification[]>(loadSavedNotifications());

  // Save notifications to local storage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications));
    } catch (error) {
      console.error("Error saving notifications to storage:", error);
    }
  }, [notifications]);

  const unreadCount = notifications.filter(notification => !notification.read).length;

  const addNotification = useCallback((notification: Omit<Notification, "id" | "read" | "date">) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      date: new Date(),
    };

    setNotifications(prev => [newNotification, ...prev]);
    
    // Show toast notification
    toast[notification.type || "default"](notification.title, {
      description: notification.description,
      action: notification.action ? {
        label: notification.action.text,
        onClick: notification.action.onClick,
      } : undefined,
    });
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
