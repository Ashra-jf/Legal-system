import axiosInstance from './axiosConfig';

export const profileService = {
  getLawyers: async () => {
    const response = await axiosInstance.get('/profile/lawyers');
    return response.data;
  },
  
  getLawyerProfile: async (id) => {
    const response = await axiosInstance.get(id ? `/profile/lawyer/${id}` : '/profile/lawyer/me'); // Assuming 'me' or just handle ID dynamically
    return response.data;
  },

  updateLawyerProfile: async (id, data) => {
    const response = await axiosInstance.patch(`/profile/lawyer/${id}`, data);
    return response.data;
  },

  getClientProfile: async (id) => {
    const response = await axiosInstance.get(id ? `/profile/client/${id}` : '/profile/client/me');
    return response.data;
  },

  updateClientProfile: async (id, data) => {
    const response = await axiosInstance.patch(`/profile/client/${id}`, data);
    return response.data;
  }
};
