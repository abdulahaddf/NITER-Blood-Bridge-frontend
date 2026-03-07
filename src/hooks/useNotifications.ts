import { useState, useEffect, useCallback } from 'react';
import type { Notification, NotificationType } from '@/types';
import { mockNotifications } from '@/data/mockData';

const NOTIFICATIONS_STORAGE_KEY = 'niter_blood_notifications';

// Initialize storage with mock data
const initializeStorage = () => {
  if (!localStorage.getItem(NOTIFICATIONS_STORAGE_KEY)) {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(mockNotifications));
  }
};

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeStorage();
  }, []);

  const getNotifications = useCallback((): Notification[] => {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }, []);

  const saveNotifications = useCallback((notifs: Notification[]) => {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
  }, []);

  // Load notifications for user
  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setIsLoading(false);
      return;
    }

    const allNotifications = getNotifications();
    const userNotifications = allNotifications
      .filter(n => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    setNotifications(userNotifications);
    setIsLoading(false);
  }, [userId, getNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((notificationId: string) => {
    const allNotifications = getNotifications();
    const updated = allNotifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    saveNotifications(updated);
    
    setNotifications(prev => 
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
  }, [getNotifications, saveNotifications]);

  const markAllAsRead = useCallback(() => {
    if (!userId) return;
    
    const allNotifications = getNotifications();
    const updated = allNotifications.map(n => 
      n.userId === userId ? { ...n, read: true } : n
    );
    saveNotifications(updated);
    
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [userId, getNotifications, saveNotifications]);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'createdAt'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}`,
      createdAt: new Date(),
    };

    const allNotifications = getNotifications();
    saveNotifications([newNotification, ...allNotifications]);
    
    if (notification.userId === userId) {
      setNotifications(prev => [newNotification, ...prev]);
    }
    
    return newNotification;
  }, [userId, getNotifications, saveNotifications]);

  const deleteNotification = useCallback((notificationId: string) => {
    const allNotifications = getNotifications();
    const updated = allNotifications.filter(n => n.id !== notificationId);
    saveNotifications(updated);
    
    setNotifications(prev => prev.filter(n => n.id !== notificationId));
  }, [getNotifications, saveNotifications]);

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
  const getNotifications = useCallback((): Notification[] => {
    const stored = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }, []);

  const saveNotifications = useCallback((notifs: Notification[]) => {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifs));
  }, []);

  const broadcastNotification = useCallback((
    userIds: string[],
    type: NotificationType,
    title: string,
    message: string,
    link?: string
  ) => {
    const allNotifications = getNotifications();
    const newNotifications: Notification[] = userIds.map(userId => ({
      id: `notif-${Date.now()}-${userId}`,
      userId,
      type,
      title,
      message,
      read: false,
      link,
      createdAt: new Date(),
    }));
    
    saveNotifications([...newNotifications, ...allNotifications]);
    return newNotifications;
  }, [getNotifications, saveNotifications]);

  return {
    getNotifications,
    broadcastNotification,
  };
}
