import { useState, useCallback } from 'react';
import type { Notification, NotificationType } from '@/types';

// The backend does not expose a notifications API.
// We keep notifications in-memory for the session only (no mock data seeding).

export function useNotifications(_userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const isLoading = false;

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'createdAt'>) => {
      const newNotification: Notification = {
        ...notification,
        id: `notif-${Date.now()}`,
        createdAt: new Date(),
      };
      setNotifications(prev => [newNotification, ...prev]);
      return newNotification;
    },
    []
  );

  const deleteNotification = useCallback((notificationId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, []);

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    addNotification,
    deleteNotification,
  };
}

export function useAllNotifications() {
  const broadcastNotification = useCallback(
    (
      _userIds: string[],
      _type: NotificationType,
      _title: string,
      _message: string,
      _link?: string
    ) => {
      // No broadcast API available; no-op
      return [];
    },
    []
  );

  const getNotifications = useCallback((): Notification[] => [], []);

  return {
    getNotifications,
    broadcastNotification,
  };
}
