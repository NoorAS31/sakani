import apiClient from '../api/apiClient';
import type { Notification } from '../types/notification';

export const notificationService = {
  async getNotifications(unreadOnly: boolean = false): Promise<Notification[]> {
    try {
      const response = await apiClient.get('/Notifications', {
        params: { unreadOnly },
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      throw error;
    }
  },

  async markAsRead(id: string): Promise<void> {
    try {
      await apiClient.put(`/notifications/${id}/read`);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      throw error;
    }
  },

  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.put('/notifications/read-all');
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      throw error;
    }
  },
};
