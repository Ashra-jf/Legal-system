import api from './axiosConfig';

export const feedbackService = {
  getFeedback: async (params = {}) => {
    try {
      // params can optionally include { client_id, lawyer_id }
      const response = await api.get('/feedback', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching feedback:', error);
      throw error;
    }
  },

  submitFeedback: async (data, videoFile = null) => {
    try {
      let payload = data;
      let headers = {};
      
      // If we have a physical File object to upload
      if (videoFile && videoFile instanceof File) {
        payload = new FormData();
        // Append all text data
        Object.keys(data).forEach(key => {
          if (data[key] !== null && data[key] !== undefined) {
             payload.append(key, data[key]);
          }
        });
        // Append the video file
        payload.append('video', videoFile);
        
        headers = { 'Content-Type': 'multipart/form-data' };
      }

      const response = await api.post('/feedback', payload, { headers });
      return response.data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  }
};
