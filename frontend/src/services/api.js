import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
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

// Authentication API
export const authAPI = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token);
    }
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('jharkhandTourismUser');
  }
};

// Destinations API
export const destinationsAPI = {
  getAll: async (category = null, limit = 50) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    params.append('limit', limit.toString());
    
    const response = await api.get(`/destinations?${params.toString()}`);
    return response.data;
  },

  getById: async (id) => {
    const response = await api.get(`/destinations/${id}`);
    return response.data;
  }
};

// Providers API
export const providersAPI = {
  getAll: async (category = null, location = null, limit = 50) => {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (location) params.append('location', location);
    params.append('limit', limit.toString());
    
    const response = await api.get(`/providers?${params.toString()}`);
    return response.data;
  }
};

// Reviews API
export const reviewsAPI = {
  getAll: async (destinationId = null, providerId = null, limit = 20) => {
    const params = new URLSearchParams();
    if (destinationId) params.append('destination_id', destinationId);
    if (providerId) params.append('provider_id', providerId);
    params.append('limit', limit.toString());
    
    const response = await api.get(`/reviews?${params.toString()}`);
    return response.data;
  }
};

// AI Services API
export const aiAPI = {
  generateItinerary: async (preferences) => {
    const response = await api.post('/planner', preferences);
    return response.data;
  },

  sendChatMessage: async (message, sessionId = null) => {
    const response = await api.post('/chatbot', {
      message,
      session_id: sessionId
    });
    return response.data;
  },

  getChatHistory: async (sessionId) => {
    const response = await api.get(`/chatbot/history/${sessionId}`);
    return response.data;
  }
};

export default api;