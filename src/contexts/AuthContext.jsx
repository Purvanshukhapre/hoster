import React, { createContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();
export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on initial load
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // Clear invalid stored user data
        localStorage.removeItem('user');
      }
      setLoading(false);
    };
    
    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      // Call the admin login API
      const response = await authAPI.adminLogin({ email, password });
      
      // Handle the API response - the structure may vary
      let userData, token;
      
      if (response.data && typeof response.data === 'object') {
        // If response.data has user and token properties
        if (response.data.user && response.data.token) {
          userData = response.data.user;
          token = response.data.token;
        } else {
          // If response.data is the user object itself
          userData = response.data;
          // Look for token in different possible locations
          token = response.data.token || response.data.authToken || localStorage.getItem('authToken');
        }
      } else {
        // If response.data is not an object, throw an error
        throw new Error('Invalid response format from server');
      }
      
      // Ensure userData is valid
      if (!userData || typeof userData !== 'object') {
        throw new Error('Invalid user data received from server');
      }
      
      // Store user data and token in localStorage
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      if (token) {
        localStorage.setItem('authToken', token);
      }
      
      return userData;
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle different types of errors
      if (error.status) {
        // Error from our API service
        const errorMessage = error.message || 'Login failed';
        throw new Error(errorMessage);
      } else if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Login failed';
        throw new Error(errorMessage);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Network error. Please check your connection.');
      } else {
        // Something else happened
        throw new Error(error.message || 'An error occurred during login');
      }
    }
  };

  const employeeLogin = async (email, password) => {
    try {
      // Call the employee login API using axios
      const response = await authAPI.employeeLogin({ email, password });
      
      // Handle the API response - the structure may vary
      let userData, token;
      
      if (response.data && typeof response.data === 'object') {
        // If response.data has user and token properties
        if (response.data.user && response.data.token) {
          userData = response.data.user;
          token = response.data.token;
        } else {
          // If response.data is the user object itself
          userData = response.data;
          // Look for token in different possible locations
          token = response.data.token || response.data.authToken || localStorage.getItem('authToken');
        }
      } else {
        // If response.data is not an object, throw an error
        throw new Error('Invalid response format from server');
      }
      
      // Ensure userData is valid
      if (!userData || typeof userData !== 'object') {
        throw new Error('Invalid user data received from server');
      }
      
      // Store user data and token in localStorage
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      if (token) {
        localStorage.setItem('authToken', token);
      }
      
      return userData;
    } catch (error) {
      console.error('Employee login error:', error);
      
      // Handle different types of errors
      if (error.status) {
        // Error from our API service
        const errorMessage = error.message || 'Login failed';
        throw new Error(errorMessage);
      } else if (error.response) {
        // Server responded with error status
        const errorMessage = error.response.data?.message || error.response.data?.error || 'Login failed';
        throw new Error(errorMessage);
      } else if (error.request) {
        // Request was made but no response received
        throw new Error('Network error. Please check your connection.');
      } else {
        // Something else happened
        throw new Error(error.message || 'An error occurred during login');
      }
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
  };

  const value = {
    user,
    login,
    employeeLogin,
    logout,
    loading,
    setUser  // Add setUser to the context
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};