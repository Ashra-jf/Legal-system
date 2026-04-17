import axiosInstance from './axiosConfig';

// Appointment service methods
export const appointmentService = {
    // Get all appointments
    getAll: async () => {
        try {
            const response = await axiosInstance.get('/appointments');
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Get appointment by ID
    getById: async (id) => {
        try {
            const response = await axiosInstance.get(`/appointments/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Create new appointment
    create: async (appointmentData) => {
        try {
            const response = await axiosInstance.post('/appointments', appointmentData);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Update appointment status
    updateStatus: async (id, status) => {
        try {
            const response = await axiosInstance.patch(`/appointments/${id}`, { status });
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },

    // Delete appointment
    delete: async (id) => {
        try {
            const response = await axiosInstance.delete(`/appointments/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || error.message;
        }
    },
};

export default appointmentService;
