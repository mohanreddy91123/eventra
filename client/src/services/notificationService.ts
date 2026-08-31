import api from './api.js';
import { Notification } from '../types/index.js';

export const notificationService = {
  async getNotifications(): Promise<{ success: boolean; unreadCount: number; notifications: Notification[] }> {
    const res = await api.get('/notifications');
    return res.data;
  },

  async markAsRead(id: number | string | 'all'): Promise<{ success: boolean; message: string }> {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },
};
