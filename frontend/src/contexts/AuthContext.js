import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in and validate token
    const checkAuth = async () => {
      const token = localStorage.getItem('access_token');
      const savedUser = localStorage.getItem('jharkhandTourismUser');
      
      if (token && savedUser) {
        try {
          // Validate token by fetching current user
          const currentUser = await authAPI.getCurrentUser();
          setUser(currentUser);
          localStorage.setItem('jharkhandTourismUser', JSON.stringify(currentUser));
        } catch (error) {
          console.error('Token validation failed:', error);
          // Clear invalid token
          localStorage.removeItem('access_token');
          localStorage.removeItem('jharkhandTourismUser');
          setUser(null);
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login({ email, password });
      const user = response.user;
      
      setUser(user);
      localStorage.setItem('jharkhandTourismUser', JSON.stringify(user));
      
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Login failed');
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const user = response.user;
      
      setUser(user);
      localStorage.setItem('jharkhandTourismUser', JSON.stringify(user));
      
      return user;
    } catch (error) {
      throw new Error(error.response?.data?.detail || 'Registration failed');
    }
  };

  const logout = () => {
    setUser(null);
    authAPI.logout();
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};