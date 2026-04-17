import axiosInstance from './axiosConfig';

export const paymentService = {
  getPayments: async () => {
    const response = await axiosInstance.get('/payments');
    return response.data;
  },
  
  createPayment: async (paymentData) => {
    const response = await axiosInstance.post('/payments', paymentData);
    return response.data;
  },

  uploadReceipt: async (paymentId, formData) => {
    const response = await axiosInstance.post(`/payments/${paymentId}/receipt`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  verifyPayment: async (paymentId, status) => {
    const response = await axiosInstance.patch(`/payments/${paymentId}/verify`, { status });
    return response.data;
  },

  getInvoices: async () => {
    const response = await axiosInstance.get('/payments/invoices');
    return response.data;
  },

  createInvoice: async (invoiceData) => {
    const response = await axiosInstance.post('/payments/invoices', invoiceData);
    return response.data;
  }
};
