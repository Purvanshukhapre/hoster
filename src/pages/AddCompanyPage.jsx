import React, { useState, useEffect } from 'react';
import { useCompanyContext } from '../hooks/useCompanyContext';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeftIcon, PlusIcon, XMarkIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

const AddCompanyPage = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams(); // Get company ID from URL params
  const { addCompanyAPI, updateCompanyAPI, getCompanyById } = useCompanyContext();
  
  const [loading, setLoading] = useState(false);
  
  // Initialize form data based on whether we're adding or editing
  const [formData, setFormData] = useState({
    name: '',
    website: '',
    email: '',
    industry: '',
    description: '',
    status: 'New',
    document: null,
    documentName: ''
  });
  
  const [errors, setErrors] = useState({});
  
  // Load company data when editing
  useEffect(() => {
    if (isEdit && id) {
      const fetchCompanyData = async () => {
        try {
          setLoading(true);
          const company = await getCompanyById(id);
          
          setFormData({
            name: company.name || '',
            website: company.website || '',
            email: company.email || '',
            industry: company.industry || '',
            description: company.description || '',
            status: company.status || 'New',
            document: null,
            documentName: ''
          });
        } catch (error) {
          console.error('Error fetching company data:', error);
          setErrors({
            fetch: 'Failed to load company data. Please try again.'
          });
          navigate('/companies'); // Redirect if unable to fetch data
        } finally {
          setLoading(false);
        }
      };
      
      fetchCompanyData();
    }
  }, [isEdit, id, navigate]);
  
  // Update form title based on mode
  const formTitle = isEdit ? 'Edit Company' : 'Add New Company';
  const formSubtitle = isEdit ? 'Update company details' : 'Add company details to start outreach';
  const submitButtonText = isEdit ? 'Update Company' : 'Add Company';
  const submitIcon = isEdit ? null : <PlusIcon className="h-4 w-4 mr-2" />;


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleDocumentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/plain'];
      
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({
          ...prev,
          document: 'Please upload a PDF, Word, Excel, or text file.'
        }));
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrors(prev => ({
          ...prev,
          document: 'File size must be less than 5MB.'
        }));
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        document: file,
        documentName: file.name
      }));
      
      // Clear document error if there was one
      if (errors.document) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.document;
          return newErrors;
        });
      }
      
      // Set preview for certain file types
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          // Preview functionality removed
        };
        reader.readAsDataURL(file);
      } else {
        // No preview for non-image files
      }
    }
  };

  const handleRemoveDocument = () => {
    setFormData(prev => ({
      ...prev,
      document: null,
      documentName: ''
    }));
    // Removed document preview functionality
    
    // Clear document error if there was one
    if (errors.document) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.document;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Company name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.website.trim()) {
      newErrors.website = 'Website is required';
    } else if (!/^https?:\/\//.test(formData.website)) {
      newErrors.website = 'Website must start with http:// or https://';
    }
    
    if (!formData.industry.trim()) {
      newErrors.industry = 'Industry is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      
      try {
        // Prepare form data for API submission
        const companyData = {
          companyName: formData.name,
          websiteUrl: formData.website,
          companyEmail: formData.email,
          industry: formData.industry,
          tags: [""], // Using empty tags array as default, can be expanded if needed
          status: formData.status
        };
        
        // Submit to API via context (add or update based on mode)
        if (isEdit && id) {
          await updateCompanyAPI(id, companyData);
        } else {
          await addCompanyAPI(companyData);
        }
        
        // Navigate to companies page
        navigate('/companies');
      } catch (error) {
        console.error(isEdit ? 'Error updating company:' : 'Error adding company:', error);
        // Set error state to show user feedback
        setErrors({
          submit: error.message || (isEdit ? 'Failed to update company. Please try again.' : 'Failed to add company. Please try again.')
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          {isEdit ? 'Back to Company Details' : 'Back to Companies'}
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
          <div className="flex items-center">
            <div className="p-2 bg-white/20 rounded-lg">
              <BuildingOfficeIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-white">{formTitle}</h2>
              <p className="mt-1 text-sm text-blue-100">{formSubtitle}</p>
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-6 sm:grid-cols-6">
            {/* Company Name */}
            <div className="sm:col-span-6">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="name"
                  id="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200 ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="Enter company name"
                />
                {errors.name && (
                  <div className="mt-1 flex items-center">
                    <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-600">{errors.name}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Website */}
            <div className="sm:col-span-6">
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Website URL *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                </div>
                <input
                  type="text"
                  name="website"
                  id="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://example.com"
                  className={`block w-full pl-10 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200 ${
                    errors.website ? 'border-red-300 bg-red-50' : ''
                  }`}
                />
                {errors.website && (
                  <div className="mt-1 flex items-center">
                    <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-600">{errors.website}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Email */}
            <div className="sm:col-span-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Company Email *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="company@example.com"
                  className={`block w-full pl-10 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200 ${
                    errors.email ? 'border-red-300 bg-red-50' : ''
                  }`}
                />
                {errors.email && (
                  <div className="mt-1 flex items-center">
                    <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-600">{errors.email}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Industry */}
            <div className="sm:col-span-3">
              <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-2">
                Industry / Website Type *
              </label>
              <div className="relative">
                <input
                  type="text"
                  name="industry"
                  id="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  placeholder="e.g., Software Development"
                  className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200 ${
                    errors.industry ? 'border-red-300 bg-red-50' : ''
                  }`}
                />
                {errors.industry && (
                  <div className="mt-1 flex items-center">
                    <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm text-red-600">{errors.industry}</p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Status */}
            <div className="sm:col-span-3">
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Responded">Responded</option>
                <option value="Shortlisted">Shortlisted</option>
              </select>
            </div>
            
            {/* Document Upload */}
            <div className="sm:col-span-6">
              <label htmlFor="document" className="block text-sm font-medium text-gray-700 mb-2">
                Company Document
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                <div className="space-y-1 text-center">
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label htmlFor="document" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                      <span>Upload a file</span>
                      <input
                        id="document"
                        name="document"
                        type="file"
                        className="sr-only"
                        onChange={handleDocumentChange}
                        accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">
                    PDF, Word, Excel, or TXT up to 5MB
                  </p>
                  
                  {formData.documentName && (
                    <div className="mt-2 flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center truncate">
                        <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm text-gray-700 truncate max-w-xs">{formData.documentName}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveDocument}
                        className="ml-2 p-1 text-red-600 hover:text-red-800 rounded-full"
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                  
                  {errors.document && (
                    <div className="mt-2 flex items-center text-sm text-red-600">
                      <svg className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span>{errors.document}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {errors.submit && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{errors.submit}</h3>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-8 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/companies')}
              className="inline-flex items-center px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-md disabled:opacity-50"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEdit ? 'Updating...' : 'Adding...'}
                </>
              ) : (
                <>
                  {submitIcon}
                  {submitButtonText}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCompanyPage;