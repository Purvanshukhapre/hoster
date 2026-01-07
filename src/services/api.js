import axios from 'axios';

// Base API URL
const API_BASE_URL = 'https://elitehoster-backend-production.up.railway.app/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiration, etc.
api.interceptors.response.use(
  (response) => {
    // Ensure response data exists
    if (response && response.data !== undefined) {
      return response;
    } else {
      // Return a default response structure if no data
      return {
        ...response,
        data: {}
      };
    }
  },
  (error) => {
    console.error('API Error:', error);
    
    if (error.response?.status === 401) {
      // Clear auth data if unauthorized
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
    }
    
    // Return a more descriptive error
    return Promise.reject({
      ...error,
      message: error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status,
      data: error.response?.data
    });
  }
);

export default api;

// Auth API endpoints
export const authAPI = {
  // Admin login
  adminLogin: (credentials) => api.post('/auth/admin/login', credentials),
  
  // Employee login
  employeeLogin: (credentials) => api.post('/auth/login', credentials),
  
  // Alternative employee login using fetch
  employeeLoginFetch: async (credentials) => {
    console.log('Making fetch request to:', `${API_BASE_URL}/auth/login`, 'with data:', credentials);
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    console.log('Fetch response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Fetch error response:', errorData);
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log('Fetch response data:', data);
    return data;
  },
  
  // User registration
  registerUser: (userData) => api.post('/auth/register', userData),
  
  // User management endpoints
  getUsers: () => api.get('/auth/profile'), // Endpoint that returns all users
  getAllUsers: () => api.get('/users'), // New endpoint for getting all users
  addUser: (userData) => api.post('/auth/users', userData),
  updateUser: (userId, userData) => api.put(`/users/${userId}`, userData),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
  getCurrentUser: () => api.get('/auth/me'),
  updateCurrentUser: (userData) => api.put('/auth/me', userData),
  getUserProfile: () => api.get('/auth/profile'), // New endpoint for user profile
  
  // Other auth endpoints can be added here
};

// Additional API endpoints
export const userAPI = {
  // Get current user profile
  getProfile: () => api.get('/auth/profile'),
};

// Company API endpoints
export const companyAPI = {
  // Get all companies
  getCompanies: () => api.get('/companies'),
  
  // Get company by ID
  getCompanyById: (id) => api.get(`/companies/${id}`),
  
  // Add a new company
  addCompany: (companyData) => api.post('/companies', companyData),
  
  // Update a company
  updateCompany: (id, companyData) => api.put(`/companies/${id}`, companyData),
  
  // Delete a company
  deleteCompany: (id) => api.delete(`/companies/${id}`),
  
  // Add response to a company
  addResponse: (companyId, response) => api.post(`/companies/${companyId}/responses`, response),
  
  // Add requirements to a company
  addRequirements: (companyId, requirements) => api.post(`/companies/${companyId}/requirements`, requirements),
  
  // Toggle shortlist status
  toggleShortlist: (companyId, isShortlisted) => api.patch(`/companies/${companyId}/shortlist`, { isShortlisted }),
};

// Export base API instance for custom calls
export { API_BASE_URL };