import axiosInstance from './axiosConfig';

export const serviceService = {
  getServices: async () => {
    const response = await axiosInstance.get('/services');
    return response.data;
  },
  
  getCategories: async () => {
    const response = await axiosInstance.get('/services/categories');
    return response.data;
  },
  
  createService: async (serviceData) => {
    const response = await axiosInstance.post('/services', serviceData);
    return response.data;
  },
  
  updateService: async (id, serviceData) => {
    const response = await axiosInstance.put(`/services/${id}`, serviceData);
    return response.data;
  },
  
  deleteService: async (id) => {
    const response = await axiosInstance.delete(`/services/${id}`);
    return response.data;
  }
};
