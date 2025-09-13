import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'http://localhost:8000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('jharkhandTourismUser');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const deepseekAPI = {
  // Generate AI itinerary
  generateItinerary: async (preferences) => {
    try {
      const response = await api.post('/planner', preferences);
      return response.data;
    } catch (error) {
      console.error('Error generating itinerary:', error);
      throw new Error(error.response?.data?.detail || 'Failed to generate itinerary');
    }
  },

  // Send chatbot message
  sendChatMessage: async (message, sessionId = null) => {
    try {
      const response = await api.post('/chatbot', {
        message,
        session_id: sessionId
      });
      return response.data;
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw new Error(error.response?.data?.detail || 'Failed to send message');
    }
  },

  // Get chat history
  getChatHistory: async (sessionId) => {
    try {
      const response = await api.get(`/chatbot/history/${sessionId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }
};

export default deepseekAPI;