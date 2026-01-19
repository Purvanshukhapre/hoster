import React, { createContext, useReducer, useEffect, useCallback } from 'react';
import { companyAPI, emailAPI, developerAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const CompanyContext = createContext();

// Helper function to normalize company data from API response
const normalizeCompany = (company) => {
  // Map API field names to expected field names
  return {
    ...company,
    // Map API field 'companyName' to expected field 'name'
    name: company.companyName || company.name || company.title || company.company_name || 'Unnamed Company',
    // Map API field 'websiteUrl' to expected field 'website'
    website: company.websiteUrl || company.website || company.url || '#',
    // Map API field 'companyEmail' to expected field 'email'
    email: company.companyEmail || company.email || company.company_email || 'N/A',
    // Use the API ID field (_id) if id is not present
    id: company.id || company._id || Date.now() + Math.random(), // Generate fallback ID if none exists
    // Extract creator information
    creatorId: company.createdBy?._id || company.creatorId || company.createdBy,
    creatorName: company.createdBy?.name || company.creatorName,
    creatorEmail: company.createdBy?.email || company.creatorEmail,
    // Ensure other expected fields exist
    responses: company.responses || [],
    requirements: company.requirements || null,
    isShortlisted: company.isShortlisted || false,
    contactPerson: company.contactPerson || company.contact_person || company.person || 'N/A',
    personName: company.personName || company.contactPerson || company.name || 'N/A',
    phoneNumber: company.phoneNumber || company.phone || company.primaryPhone || '',
    alternatePhoneNumber: company.alternatePhoneNumber || company.alternatePhone || '',
    gstNumber: company.gstNumber || company.gst_number || '',
    panNumber: company.panNumber || company.pan_number || '',
    dateAdded: company.dateAdded || company.createdAt || company.created_at || new Date().toISOString().split('T')[0],
    industry: company.industry || company.company_industry || 'N/A',
    status: company.status || company.state || company.company_status || 'Unknown',
    description: company.description || 'No description'
  };
};

// Normalize array of companies
const normalizeCompanies = (companies) => {
  return companies.map(normalizeCompany);
};

const companyReducer = (state, action) => {
  switch (action.type) {
    case 'SET_COMPANIES':
      // Normalize the companies data before storing
      return { ...state, companies: normalizeCompanies(action.payload), loading: false };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'ADD_COMPANY':
      return { 
        ...state, 
        companies: [...state.companies, normalizeCompany({
          ...action.payload, 
          id: Date.now(),
          responses: [],
          requirements: null,
          isShortlisted: false
        })] 
      };
    
    case 'UPDATE_COMPANY':
      return {
        ...state,
        companies: state.companies.map(company => 
          company.id === action.payload.id ? normalizeCompany(action.payload) : company
        )
      };
    
    case 'DELETE_COMPANY':
      return {
        ...state,
        companies: state.companies.filter(company => company.id !== action.payload)
      };
    
    case 'ADD_RESPONSE':
      return {
        ...state,
        companies: state.companies.map(company => {
          if (company.id === action.payload.companyId) {
            return {
              ...normalizeCompany(company),
              status: 'Responded',
              responses: [...company.responses, action.payload.response]
            };
          }
          return normalizeCompany(company);
        })
      };
    
    case 'ADD_REQUIREMENTS':
      return {
        ...state,
        companies: state.companies.map(company => {
          if (company.id === action.payload.companyId) {
            return {
              ...normalizeCompany(company),
              requirements: action.payload.requirements
            };
          }
          return normalizeCompany(company);
        })
      };
    
    case 'TOGGLE_SHORTLIST':
      return {
        ...state,
        companies: state.companies.map(company => {
          if (company.id === action.payload.companyId) {
            return {
              ...normalizeCompany(company),
              isShortlisted: action.payload.isShortlisted
            };
          }
          return normalizeCompany(company);
        })
      };
    
    default:
      return state;
  }
};

export const CompanyProvider = ({ children }) => {
  const [state, dispatch] = useReducer(companyReducer, {
    companies: [],
    loading: true
  });
  
  const { user } = useAuth();
  
  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      // Only fetch data if user is authenticated
      if (user) {
        dispatch({ type: 'SET_LOADING', payload: true });
        try {
          // Try to fetch data from API first
          const response = await companyAPI.getCompanies();
          
          // Handle different possible response structures
          let companiesData = response.data;
          
          // If response.data is an object with a data property containing companies array, use that
          if (response.data && typeof response.data === 'object' && Array.isArray(response.data.data)) {
            companiesData = response.data.data;
          } else if (Array.isArray(response.data)) {
            // If response.data is already an array
            companiesData = response.data;
          } else {
            // Use empty array if response format is unexpected
            console.warn('Unexpected API response format');
            companiesData = [];
          }
          
          dispatch({ type: 'SET_COMPANIES', payload: companiesData });
        } catch (error) {
          console.error('Error initializing data:', error);
          // Use empty array
          dispatch({ type: 'SET_COMPANIES', payload: [] });
        }
      } else {
        // If user is not authenticated, set loading to false
        dispatch({ type: 'SET_LOADING', payload: false });
        dispatch({ type: 'SET_COMPANIES', payload: [] });
      }
    };
    
    initializeData();
  }, [user]);

  const addCompany = (companyData) => {
    dispatch({ type: 'ADD_COMPANY', payload: companyData });
  };

  const updateCompany = (companyData) => {
    dispatch({ type: 'UPDATE_COMPANY', payload: companyData });
  };

  const deleteCompany = (companyId) => {
    dispatch({ type: 'DELETE_COMPANY', payload: companyId });
  };

  const addResponse = (companyId, response) => {
    dispatch({ 
      type: 'ADD_RESPONSE', 
      payload: { 
        companyId, 
        response: { ...response, id: Date.now() } 
      } 
    });
  };

  const addRequirements = (companyId, requirements) => {
    dispatch({ 
      type: 'ADD_REQUIREMENTS', 
      payload: { 
        companyId, 
        requirements 
      } 
    });
  };

  const toggleShortlist = (companyId, isShortlisted) => {
    dispatch({ 
      type: 'TOGGLE_SHORTLIST', 
      payload: { 
        companyId, 
        isShortlisted 
      } 
    });
  };

  // Async functions that can use API
  const fetchCompanies = useCallback(async () => {
    // Only fetch data if user is authenticated
    if (!user) {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_COMPANIES', payload: [] });
      return;
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      let response;
      
      // Different API endpoints based on user role
      if (user.role === 'developer') {
        // Developers use a different endpoint
        response = await developerAPI.getCompanies();
      } else {
        // For employees and admins, use the standard endpoint
        response = await companyAPI.getCompanies();
      }
      
      // Handle different possible response structures
      let companiesData = response.data;
      
      // If response.data is an object with a data property containing companies array, use that
      if (response.data && typeof response.data === 'object' && Array.isArray(response.data.data)) {
        companiesData = response.data.data;
      } else if (Array.isArray(response.data)) {
        // If response.data is already an array
        companiesData = response.data;
      } else {
        // Use empty array if response format is unexpected
        console.warn('Unexpected API response format');
        companiesData = [];
      }
          
      // For employee users, filter to only show their companies
      if (user.role === 'employee') {
        companiesData = companiesData.filter(company => 
          (typeof company.createdBy === 'object' ? company.createdBy._id === user.id : false) ||
          company.createdBy === user.id ||
          company.creatorId === user.id || 
          company.creator === user.id
        );
      }
          
      // Normalize the companies data before storing
      const normalizedCompanies = normalizeCompanies(companiesData);
      dispatch({ type: 'SET_COMPANIES', payload: normalizedCompanies });
    } catch (error) {
      console.error('Error fetching companies:', error);
      // Use empty array
      dispatch({ type: 'SET_COMPANIES', payload: [] });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user]);

  const addCompanyAPI = useCallback(async (companyData) => {
    // Only allow API calls if user is authenticated
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Automatically set the creator when adding a company
      const companyDataWithCreator = {
        ...companyData,
        creatorId: user.id,
        createdBy: user.id,
        creator: user.id
      };
      
      const response = await companyAPI.addCompany(companyDataWithCreator);
      
      // Refetch companies to update the list
      const updatedResponse = await companyAPI.getCompanies();
      
      // Handle different possible response structures for getCompanies
      let companiesData = updatedResponse.data;
      
      // If response.data is an object with a data property containing companies array, use that
      if (updatedResponse.data && typeof updatedResponse.data === 'object' && updatedResponse.data.data !== undefined) {
        companiesData = updatedResponse.data.data;
      } else if (Array.isArray(updatedResponse.data)) {
        // If response.data is already an array
        companiesData = updatedResponse.data;
      } else {
        // Use empty array if response format is unexpected
        console.warn('Unexpected API response format for getCompanies');
        companiesData = [];
      }
          
      // For employee users, filter to only show their companies
      if (user.role === 'employee') {
        companiesData = companiesData.filter(company => 
          (typeof company.createdBy === 'object' ? company.createdBy._id === user.id : false) ||
          company.createdBy === user.id ||
          company.creatorId === user.id || 
          company.creator === user.id
        );
      }
          
      // Normalize the companies data before storing
      const normalizedCompanies = normalizeCompanies(companiesData);
      dispatch({ type: 'SET_COMPANIES', payload: normalizedCompanies });
      
      // Return the newly created company data
      return response.data;
    } catch (error) {
      console.error('Error adding company:', error);
      // Check if the error has response data with specific message
      if (error.response?.data?.message) {
        error.message = error.response.data.message;
      }
      // Re-throw the error to be handled by the calling component
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user]);

  const updateCompanyAPI = useCallback(async (id, companyData) => {
    // Only allow API calls if user is authenticated
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await companyAPI.updateCompany(id, companyData);
      
      // Refetch companies to update the list
      let updatedResponse;
      
      // Different API endpoints based on user role
      if (user.role === 'developer') {
        // Developers use a different endpoint
        updatedResponse = await developerAPI.getCompanies();
      } else {
        // For employees and admins, use the standard endpoint
        updatedResponse = await companyAPI.getCompanies();
      }
      
      // Handle different possible response structures for getCompanies
      let companiesData = updatedResponse.data;
      
      // If response.data is an object with a data property containing companies array, use that
      if (updatedResponse.data && typeof updatedResponse.data === 'object' && updatedResponse.data.data !== undefined) {
        companiesData = updatedResponse.data.data;
      } else if (Array.isArray(updatedResponse.data)) {
        // If response.data is already an array
        companiesData = updatedResponse.data;
      } else {
        // Use empty array if response format is unexpected
        console.warn('Unexpected API response format for getCompanies');
        companiesData = [];
      }
      
      // For employee users, filter to only show their companies
      if (user.role === 'employee') {
        companiesData = companiesData.filter(company => 
          (typeof company.createdBy === 'object' ? company.createdBy._id === user.id : false) ||
          company.createdBy === user.id ||
          company.creatorId === user.id || 
          company.creator === user.id
        );
      }
      
      // Developers have their own access rules, which are handled by the backend
      // We don't apply client-side filtering for developers as their access is controlled server-side
      
      // Normalize the companies data before storing
      const normalizedCompanies = normalizeCompanies(companiesData);
      dispatch({ type: 'SET_COMPANIES', payload: normalizedCompanies });
      
      // Return the updated company data
      return response.data;
    } catch (error) {
      console.error('Error updating company:', error);
      // Check if the error has response data with specific message
      if (error.response?.data?.message) {
        error.message = error.response.data.message;
      }
      // Re-throw the error to be handled by the calling component
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user]);

  const deleteCompanyAPI = useCallback(async (id) => {
    // Only allow API calls if user is authenticated
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await companyAPI.deleteCompany(id);
      
      // Refetch companies to update the list
      let updatedResponse;
      
      // Different API endpoints based on user role
      if (user.role === 'developer') {
        // Developers use a different endpoint
        updatedResponse = await developerAPI.getCompanies();
      } else {
        // For employees and admins, use the standard endpoint
        updatedResponse = await companyAPI.getCompanies();
      }
      
      // Handle different possible response structures for getCompanies
      let companiesData = updatedResponse.data;
      
      // If response.data is an object with a data property containing companies array, use that
      if (updatedResponse.data && typeof updatedResponse.data === 'object' && updatedResponse.data.data !== undefined) {
        companiesData = updatedResponse.data.data;
      } else if (Array.isArray(updatedResponse.data)) {
        // If response.data is already an array
        companiesData = updatedResponse.data;
      } else {
        // Use empty array if response format is unexpected
        console.warn('Unexpected API response format for getCompanies');
        companiesData = [];
      }
      
      // For employee users, filter to only show their companies
      if (user.role === 'employee') {
        companiesData = companiesData.filter(company => 
          (typeof company.createdBy === 'object' ? company.createdBy._id === user.id : false) ||
          company.createdBy === user.id ||
          company.creatorId === user.id || 
          company.creator === user.id
        );
      }
      
      // Developers have their own access rules, which are handled by the backend
      // We don't apply client-side filtering for developers as their access is controlled server-side
      
      // Normalize the companies data before storing
      const normalizedCompanies = normalizeCompanies(companiesData);
      dispatch({ type: 'SET_COMPANIES', payload: normalizedCompanies });
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user]);

  const addResponseAPI = useCallback(async (companyId, response) => {
    // Only allow API calls if user is authenticated
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const apiResponse = await companyAPI.addResponse(companyId, response);
      dispatch({ 
        type: 'ADD_RESPONSE', 
        payload: { 
          companyId, 
          response: apiResponse.data 
        } 
      });
      return apiResponse.data;
    } catch (error) {
      console.error('Error adding response:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user]);

  const addRequirementsAPI = useCallback(async (companyId, requirements) => {
    // Only allow API calls if user is authenticated
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const apiResponse = await companyAPI.addRequirements(companyId, requirements);
      dispatch({ 
        type: 'ADD_REQUIREMENTS', 
        payload: { 
          companyId, 
          requirements: apiResponse.data 
        } 
      });
      return apiResponse.data;
    } catch (error) {
      console.error('Error adding requirements:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user]);

  const toggleShortlistAPI = useCallback(async (companyId, isShortlisted) => {
    // Only allow API calls if user is authenticated
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const apiResponse = await companyAPI.toggleShortlist(companyId, isShortlisted);
      dispatch({ 
        type: 'TOGGLE_SHORTLIST', 
        payload: { 
          companyId, 
          isShortlisted 
        } 
      });
      return apiResponse.data;
    } catch (error) {
      console.error('Error toggling shortlist:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user]);

  // Get a single company by ID
  const getCompanyById = useCallback(async (id) => {
    // Only allow API calls if user is authenticated
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      let response;
      
      // Different API endpoints based on user role
      if (user.role === 'developer') {
        // Developers use a different endpoint
        response = await developerAPI.getCompanyById(id);
      } else {
        // For employees and admins, use the standard endpoint
        response = await companyAPI.getCompanyById(id);
      }
      
      // Handle the response structure - API returns { success: true, data: company }
      let companyData = response.data;
      
      if (response.data && typeof response.data === 'object' && response.data.data !== undefined) {
        companyData = response.data.data;
      }
      
      // Normalize the company data before returning
      const normalizedCompany = normalizeCompany(companyData);
      return normalizedCompany;
    } catch (error) {
      console.error('Error fetching company by ID:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user]);

  // Send a single email
  const sendSingleEmailAPI = useCallback(async (emailData) => {
    // Only allow API calls if user is authenticated
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await emailAPI.sendSingleEmail(emailData);
      
      // After sending an email, update the company status to 'Contacted'
      if (emailData.companyId) {
        try {
          // Get the current company to update its status
          const companyResponse = await companyAPI.getCompanyById(emailData.companyId);
          
          // Handle the response structure - API returns { success: true, data: company }
          let companyData = companyResponse.data;
          
          if (companyResponse.data && typeof companyResponse.data === 'object' && companyResponse.data.data !== undefined) {
            companyData = companyResponse.data.data;
          }
          
          // Update the company status to 'Contacted'
          const updatedCompanyData = {
            ...companyData,
            status: 'Contacted'
          };
          
          // Update the company via API
          await companyAPI.updateCompany(emailData.companyId, updatedCompanyData);
          
          // Update local state
          dispatch({ 
            type: 'UPDATE_COMPANY', 
            payload: normalizeCompany({
              ...companyData,
              status: 'Contacted'
            }) 
          });
        } catch (updateError) {
          console.error('Error updating company status after email:', updateError);
          // Still return the email response even if status update fails
        }
      }
      
      return response.data;
    } catch (error) {
      console.error('Error sending single email:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user]);
  
  // Send a group email
  const sendGroupEmailAPI = useCallback(async (emailData) => {
    // Only allow API calls if user is authenticated
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await emailAPI.sendGroupEmail(emailData);
      return response.data;
    } catch (error) {
      console.error('Error sending group email:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user]);
  
  // Get all sent emails
  const getMailsAPI = useCallback(async (page = 1, limit = 10) => {
    // Only allow API calls if user is authenticated
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await emailAPI.getMails(page, limit);
      return response.data;
    } catch (error) {
      console.error('Error fetching emails:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user]);
  
  // Get a specific sent email by ID
  const getMailByIdAPI = useCallback(async (id) => {
    // Only allow API calls if user is authenticated
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await emailAPI.getMailById(id);
      return response.data;
    } catch (error) {
      console.error('Error fetching email by ID:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, [user]);

  return (
    <CompanyContext.Provider value={{
      companies: state.companies,
      loading: state.loading,
      addCompany,
      updateCompany,
      deleteCompany,
      addResponse,
      addRequirements,
      toggleShortlist,
      // API functions
      fetchCompanies,
      getCompanyById,
      addCompanyAPI,
      updateCompanyAPI,
      deleteCompanyAPI,
      addResponseAPI,
      addRequirementsAPI,
      toggleShortlistAPI,
      // Email API functions
      sendSingleEmail: sendSingleEmailAPI,
      sendGroupEmail: sendGroupEmailAPI,
      getMails: getMailsAPI,
      getMailById: getMailByIdAPI
    }}>
      {children}
    </CompanyContext.Provider>
  );
};

export { CompanyContext };