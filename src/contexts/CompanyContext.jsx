import React, { createContext, useReducer } from 'react';
import { mockCompanies } from '../data/mockData';

const CompanyContext = createContext();

const companyReducer = (state, action) => {
  switch (action.type) {
    case 'SET_COMPANIES':
      return { ...state, companies: action.payload };
    
    case 'ADD_COMPANY':
      return { 
        ...state, 
        companies: [...state.companies, { ...action.payload, id: Date.now() }] 
      };
    
    case 'UPDATE_COMPANY':
      return {
        ...state,
        companies: state.companies.map(company => 
          company.id === action.payload.id ? action.payload : company
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
              ...company,
              status: 'Responded',
              responses: [...company.responses, action.payload.response]
            };
          }
          return company;
        })
      };
    
    case 'ADD_REQUIREMENTS':
      return {
        ...state,
        companies: state.companies.map(company => {
          if (company.id === action.payload.companyId) {
            return {
              ...company,
              requirements: action.payload.requirements
            };
          }
          return company;
        })
      };
    
    case 'TOGGLE_SHORTLIST':
      return {
        ...state,
        companies: state.companies.map(company => {
          if (company.id === action.payload.companyId) {
            return {
              ...company,
              isShortlisted: action.payload.isShortlisted
            };
          }
          return company;
        })
      };
    
    default:
      return state;
  }
};

export const CompanyProvider = ({ children }) => {
  const [state, dispatch] = useReducer(companyReducer, {
    companies: mockCompanies
  });

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

  return (
    <CompanyContext.Provider value={{
      companies: state.companies,
      addCompany,
      updateCompany,
      deleteCompany,
      addResponse,
      addRequirements,
      toggleShortlist
    }}>
      {children}
    </CompanyContext.Provider>
  );
};

export { CompanyContext };