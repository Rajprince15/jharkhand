import api from './api';

// Payment API endpoints
export const paymentsAPI = {
  // Create a new payment request
  create: async (paymentData) => {
    try {
      const response = await api.post('/payments/create', paymentData);
      return response.data;
    } catch (error) {
      console.error('Payment creation error:', error);
      throw error;
    }
  },

  // Generate UPI QR Code
  generateQR: async (qrData) => {
    try {
      const response = await api.post('/payments/generate-qr', qrData);
      return response.data;
    } catch (error) {
      console.error('QR generation error:', error);
      throw error;
    }
  },

  // Verify payment with transaction ID
  verify: async (verificationData) => {
    try {
      const response = await api.post('/payments/verify', verificationData);
      return response.data;
    } catch (error) {
      console.error('Payment verification error:', error);
      throw error;
    }
  },

  // Get payment details by ID
  getById: async (paymentId) => {
    try {
      const response = await api.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Get payment error:', error);
      throw error;
    }
  },

  // Get payments for a specific booking
  getByBooking: async (bookingId) => {
    try {
      const response = await api.get(`/payments/booking/${bookingId}`);
      return response.data;
    } catch (error) {
      console.error('Get booking payments error:', error);
      throw error;
    }
  },

  // Admin functions
  admin: {
    // Get all payments for admin
    getAll: async (status = null, limit = 50) => {
      try {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        params.append('limit', limit.toString());
        
        const response = await api.get(`/admin/payments?${params}`);
        return response.data;
      } catch (error) {
        console.error('Admin get all payments error:', error);
        throw error;
      }
    },

    // Get pending payments for approval
    getPending: async () => {
      try {
        const response = await api.get('/admin/payments/pending');
        return response.data;
      } catch (error) {
        console.error('Admin get pending payments error:', error);
        throw error;
      }
    },

    // Approve or reject payment
    approve: async (approvalData) => {
      try {
        const response = await api.post('/admin/payments/approve', approvalData);
        return response.data;
      } catch (error) {
        console.error('Admin payment approval error:', error);
        throw error;
      }
    }
  }
};

export default paymentsAPI;