import axiosInstance from './axiosConfig';

export const notificationService = {
  getNotifications: async (params = {}) => {
    const response = await axiosInstance.get('/notifications', { params });
    return response.data;
  },
  
  getUnreadCount: async () => {
    const response = await axiosInstance.get('/notifications/live-unread-count');
    return response.data;
  },
  
  markAsRead: async (id) => {
    const response = await axiosInstance.patch(`/notifications/${id}/read`);
    return response.data;
  },
  
  broadcastNotification: async (payload) => {
    const response = await axiosInstance.post('/notifications/broadcast', payload);
    return response.data;
  }
};
