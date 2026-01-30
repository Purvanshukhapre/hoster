import axios from 'axios';

// Base API URL
const API_BASE_URL = 'https://elitehoster-backend-production.up.railway.app/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  // Don't set Content-Type header here - let browser set it automatically for FormData
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
    console.error('Error response data:', error.response?.data);
    console.error('Error status:', error.response?.status);
    console.error('Error headers:', error.response?.headers);
    
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
  
  // Get all company categories
  getCompanyCategories: () => api.get('/companies/categories'),
  
  // Get company by ID
  getCompanyById: (id) => api.get(`/companies/${id}`),
  
  // Add a new company - always uses FormData
  addCompany: (companyData) => {
    // Always expect FormData - never JSON
    console.log('API layer FormData check - instanceof FormData:', companyData instanceof FormData);
    console.log('API layer FormData check - constructor name:', companyData.constructor.name);
    console.log('API layer FormData entries count:', Array.from(companyData.entries()).length);
    
    if (!(companyData instanceof FormData)) {
      const error = new Error(`AddCompany API requires FormData, got ${typeof companyData} (${companyData.constructor.name})`);
      console.error('FormData validation error:', error);
      throw error;
    }
    
    // Send FormData directly - let browser handle Content-Type with proper boundary
    return api.post('/companies', companyData, {
      headers: {
        // Content-Type will be automatically set by the browser with the correct boundary
      },
    });
  },
  
  // Update a company
  updateCompany: (id, companyData) => {
    // Check if companyData is FormData (when files are uploaded) or if it has attachments array
    if (companyData instanceof FormData) {
      // companyData is already a FormData object, use it directly
      return api.put(`/companies/${id}`, companyData, {
        headers: {
          // Content-Type will be automatically set by the browser with the correct boundary
        },
      });
    } else if (companyData.attachments && Array.isArray(companyData.attachments) && companyData.attachments.length > 0) {
      const formData = new FormData();
      
      // Add all fields to form data according to backend expectations
      formData.append('companyName', companyData.companyName || '');
      formData.append('companyEmail', companyData.companyEmail || '');
      formData.append('contactPerson', companyData.contactPerson || 'N/A');
      formData.append('websiteUrl', companyData.websiteUrl || '');
      formData.append('industry', companyData.industry || 'Technology');
      formData.append('tags', companyData.tags || '');
      formData.append('status', companyData.status || 'New');
      // Add new fields
      formData.append('personName', companyData.personName || '');
      formData.append('phoneNumber', companyData.phoneNumber || '');
      formData.append('alternatePhoneNumber', companyData.alternatePhoneNumber || '');
      formData.append('gstNumber', companyData.gstNumber || '');
      formData.append('panNumber', companyData.panNumber || '');
      
      // Add categories field
      if (companyData.categories && Array.isArray(companyData.categories) && companyData.categories.length > 0) {
        formData.append('categories', JSON.stringify(companyData.categories));
      }
      
      // Add document uploads - append each file individually
      companyData.attachments.forEach((document) => {
        if (document instanceof File) {
          formData.append('uploadDocument', document, document.name);
        }
      });
      
      return api.put(`/companies/${id}`, formData, {
        headers: {
          // Content-Type will be automatically set by the browser with the correct boundary
        },
      });
    } else {
      // No documents, send as regular JSON
      const backendData = {
        companyName: companyData.companyName || '',
        companyEmail: companyData.companyEmail || '',
        contactPerson: companyData.contactPerson || 'N/A',
        websiteUrl: companyData.websiteUrl || '',
        industry: companyData.industry || 'Technology',
        tags: companyData.tags || '',
        status: companyData.status || 'New',
        // Add new fields
        personName: companyData.personName || '',
        phoneNumber: companyData.phoneNumber || '',
        alternatePhoneNumber: companyData.alternatePhoneNumber || '',
        gstNumber: companyData.gstNumber || '',
        panNumber: companyData.panNumber || '',
        // Add categories field
        categories: companyData.categories || []
      };
      
      // Remove undefined values to avoid issues with backend
      Object.keys(backendData).forEach(key => {
        if (backendData[key] === undefined) {
          delete backendData[key];
        }
      });
      
      return api.put(`/companies/${id}`, backendData);
    }
  },
  
  // Delete a company
  deleteCompany: (id) => api.delete(`/companies/${id}`),
  
  // Add response to a company
  addResponse: (companyId, response) => api.post(`/companies/${companyId}/responses`, response),
  
  // Add requirements to a company
  addRequirements: (companyId, requirements) => api.post(`/companies/${companyId}/requirements`, requirements),
  
  // Toggle shortlist status
  toggleShortlist: (companyId, isShortlisted) => api.patch(`/companies/${companyId}/shortlist`, { isShortlisted }),
  
  // Get company statistics
  getCompanyStats: () => api.get(`/companies/stats`),
};

// Developer API endpoints
export const developerAPI = {
  // Get all companies for developer
  getCompanies: () => api.get('/companies'),
  
  // Get specific company for developer
  getCompanyById: (id) => api.get(`/companies/${id}`),
};

// Email API endpoints
export const emailAPI = {
  // Send a single email
  sendSingleEmail: (emailData) => {
    const formData = new FormData();
    
    // Add text fields
    formData.append('companyId', emailData.companyId);
    formData.append('subject', emailData.subject);
    formData.append('message', emailData.message);
    
    // Add attachments if any
    if (emailData.attachments && Array.isArray(emailData.attachments)) {
      emailData.attachments.forEach((attachment) => {
        formData.append('attachments', attachment); // Using exact field name from API spec without filename
      });
    }
    
    return api.post('/mails/send-single', formData, {
      headers: {
        // Content-Type will be automatically set by the browser with the correct boundary
      },
    });
  },
  
  // Send a group email
  sendGroupEmail: (emailData) => {
    const formData = new FormData();
    
    // Add text fields
    // For group emails, use companyIds[] for multiple companies
    if (emailData.companyIds && Array.isArray(emailData.companyIds)) {
      emailData.companyIds.forEach((companyId) => {
        formData.append('companyIds[]', companyId);
      });
    }
    formData.append('subject', emailData.subject);
    formData.append('message', emailData.message);
    
    // Add attachments if any
    if (emailData.attachments && Array.isArray(emailData.attachments)) {
      emailData.attachments.forEach((attachment) => {
        formData.append('attachments', attachment);
      });
    }
    
    return api.post('/mails/send-group', formData, {
      headers: {
        // Content-Type will be automatically set by the browser with the correct boundary
      },
    });
  },
  
  // Get all sent emails
  getMails: (page = 1, limit = 10) => {
    return api.get(`/mails?page=${page}&limit=${limit}`);
  },
  
  // Get a specific sent email by ID
  getMailById: (id) => {
    return api.get(`/mails/${id}`);
  },
};

