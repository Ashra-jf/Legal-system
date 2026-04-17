import axiosInstance from './axiosConfig';

export const dashboardService = {
  getAdminStats: async () => {
    const response = await axiosInstance.get('/dashboard/admin');
    return response.data;
  },
  
  getLawyerStats: async () => {
    const response = await axiosInstance.get('/dashboard/lawyer');
    return response.data;
  },

  getClientStats: async () => {
    const response = await axiosInstance.get('/dashboard/client');
    return response.data;
  }
};
