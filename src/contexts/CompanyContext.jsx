import React, { createContext, useReducer, useEffect } from 'react';
import { companyAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const CompanyContext = createContext();

// Helper function to normalize company data from API response
const normalizeCompany = (company) => {
  // Map API field names to expected field names
  return {
    ...company,
    // Map API field 'companyName' to expected field 'name'
    name: company.companyName || company.name || 'Unnamed Company',
    // Map API field 'websiteUrl' to expected field 'website'
    website: company.websiteUrl || company.website || '#',
    // Map API field 'companyEmail' to expected field 'email'
    email: company.companyEmail || company.email || 'N/A',
    // Use the API ID field (_id) if id is not present
    id: company.id || company._id || Date.now() + Math.random(), // Generate fallback ID if none exists
    // Ensure other expected fields exist
    responses: company.responses || [],
    requirements: company.requirements || null,
    isShortlisted: company.isShortlisted || false,
    dateAdded: company.dateAdded || company.createdAt || new Date().toISOString().split('T')[0],
    industry: company.industry || 'N/A',
    status: company.status || 'Unknown',
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
  const fetchCompanies = async () => {
    // Only fetch data if user is authenticated
    if (!user) {
      dispatch({ type: 'SET_LOADING', payload: false });
      dispatch({ type: 'SET_COMPANIES', payload: [] });
      return;
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
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
  };

  const addCompanyAPI = async (companyData) => {
    // Only allow API calls if user is authenticated
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await companyAPI.addCompany(companyData);
      // Fetch the updated list of companies to ensure consistency
      const updatedResponse = await companyAPI.getCompanies();
      
      // Handle different possible response structures
      let companiesData = updatedResponse.data;
      
      // If response.data is an object with a data property containing companies array, use that
      if (updatedResponse.data && typeof updatedResponse.data === 'object' && Array.isArray(updatedResponse.data.data)) {
        companiesData = updatedResponse.data.data;
      } else if (Array.isArray(updatedResponse.data)) {
        // If response.data is already an array
        companiesData = updatedResponse.data;
      } else {
        // Use empty array if response format is unexpected
        console.warn('Unexpected API response format');
        companiesData = [];
      }
      
      // Normalize the companies data before storing
      const normalizedCompanies = normalizeCompanies(companiesData);
      dispatch({ type: 'SET_COMPANIES', payload: normalizedCompanies });
      return response.data;
    } catch (error) {
      console.error('Error adding company:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateCompanyAPI = async (id, companyData) => {
    // Only allow API calls if user is authenticated
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await companyAPI.updateCompany(id, companyData);
      // Normalize the updated company data before dispatching
      const normalizedCompany = normalizeCompany(response.data);
      dispatch({ type: 'UPDATE_COMPANY', payload: normalizedCompany });
      return normalizedCompany;
    } catch (error) {
      console.error('Error updating company:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const deleteCompanyAPI = async (id) => {
    // Only allow API calls if user is authenticated
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await companyAPI.deleteCompany(id);
      dispatch({ type: 'DELETE_COMPANY', payload: id });
    } catch (error) {
      console.error('Error deleting company:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const addResponseAPI = async (companyId, response) => {
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
  };

  const addRequirementsAPI = async (companyId, requirements) => {
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
  };

  const toggleShortlistAPI = async (companyId, isShortlisted) => {
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
  };

  // Get a single company by ID
  const getCompanyById = async (id) => {
    // Only allow API calls if user is authenticated
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await companyAPI.getCompanyById(id);
      
      // Normalize the company data before returning
      const normalizedCompany = normalizeCompany(response.data);
      return normalizedCompany;
    } catch (error) {
      console.error('Error fetching company by ID:', error);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

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
      toggleShortlistAPI
    }}>
      {children}
    </CompanyContext.Provider>
  );
};

export { CompanyContext };