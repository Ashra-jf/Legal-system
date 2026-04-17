import axiosInstance from './axiosConfig';

export const caseService = {
  getCases: async () => {
    const response = await axiosInstance.get('/cases');
    return response.data;
  },
  
  getCaseById: async (id) => {
    const response = await axiosInstance.get(`/cases/${id}`);
    return response.data;
  },

  createCase: async (caseData) => {
    const response = await axiosInstance.post('/cases', caseData);
    return response.data;
  },

  updateCase: async (id, data) => {
    const response = await axiosInstance.patch(`/cases/${id}`, data);
    return response.data;
  },

  getCaseUpdates: async (id) => {
    const response = await axiosInstance.get(`/cases/${id}/updates`);
    return response.data;
  },

  addCaseUpdate: async (id, data) => {
    const response = await axiosInstance.post(`/cases/${id}/updates`, data);
    return response.data;
  }
};
