import { useState, useEffect, useCallback } from 'react';
import type { Notification } from '@/types';
import { MockNotificationService } from '@/services/mockData';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(() => {
    const all = MockNotificationService.getAll();
    setNotifications(all);
    setUnreadCount(all.filter(n => !n.is_read).length);
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, [refresh]);

  const markAsRead = useCallback((id: string) => {
    MockNotificationService.markAsRead(id);
    refresh();
  }, [refresh]);

  const markAllAsRead = useCallback(() => {
    MockNotificationService.markAllAsRead();
    refresh();
  }, [refresh]);

  return { notifications, unreadCount, markAsRead, markAllAsRead, refresh };
}
