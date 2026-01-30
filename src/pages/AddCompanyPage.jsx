import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanyContext } from '../hooks/useCompanyContext';
import { 
  BuildingOfficeIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  GlobeAltIcon, 
  MapPinIcon, 
  UserIcon,
  BriefcaseIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  PlusIcon,
  XCircleIcon,
  PaperClipIcon,
  TagIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import { companyAPI } from '../services/api';

// Custom Searchable Dropdown Component
const CustomCategoryDropdown = ({ 
  availableCategories, 
  selectedCategory, 
  onSelectCategory, 
  onAddNewCategory 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Filter categories based on search term
  const filteredCategories = availableCategories.filter(category =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Check if the typed term doesn't match any existing category
  const showCreateOption = searchTerm && 
    !availableCategories.some(cat => 
      cat.toLowerCase() === searchTerm.toLowerCase()
    );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setIsCreating(false);
        setSearchTerm(selectedCategory || '');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedCategory]);

  const handleInputFocus = () => {
    setIsOpen(true);
    setIsCreating(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    // Only close dropdown if value is empty AND we're not in creation mode
    if (!value && !isCreating) {
      setIsOpen(false);
      // Clear the selected category if user deletes all text
      if (selectedCategory) {
        onSelectCategory('');
      }
    } else if (value) {
      setIsOpen(true);
    }
    
    setIsCreating(false);
  };

  const handleCategorySelect = (category) => {
    onSelectCategory(category);
    setIsOpen(false);
    setSearchTerm(category);
    inputRef.current?.blur();
  };

  const handleCreateNew = () => {
    if (searchTerm.trim()) {
      onAddNewCategory(searchTerm.trim());
      setIsOpen(false);
      setSearchTerm(searchTerm.trim());
      setIsCreating(false);
      inputRef.current?.blur();
    }
  };

  const handleInputKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (showCreateOption) {
        handleCreateNew();
      } else if (filteredCategories.length > 0) {
        handleCategorySelect(filteredCategories[0]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchTerm(selectedCategory || '');
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <TagIcon className="h-5 w-5 text-gray-400" />
      </div>
      
      {/* Dropdown Trigger Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={isCreating || isOpen ? searchTerm : (selectedCategory || '')}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyPress={handleInputKeyPress}
          placeholder="Select or create a category"
          className="w-full pl-10 pr-12 py-3 text-gray-900 border border-gray-300 rounded-lg
                   bg-white appearance-none
                   transition duration-200 ease-in-out
                   focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                   hover:border-gray-400
                   placeholder-gray-500"
        />
        
        {/* Dropdown Arrow */}
        <button
          type="button"
          onClick={() => {
            if (isOpen) {
              setIsOpen(false);
              setSearchTerm(selectedCategory || '');
            } else {
              setIsOpen(true);
              inputRef.current?.focus();
            }
          }}
          className="absolute inset-y-0 right-0 flex items-center px-3
                   text-gray-400 hover:text-gray-600
                   transition-colors duration-150
                   focus:outline-none"
        >
          <svg 
            className={`h-5 w-5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg
                     max-h-60 overflow-hidden
                     transition-all duration-200 ease-in-out">
          
          {/* Search Input */}
          {isCreating ? (
            <div className="p-3 border-b border-gray-100">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCreateNew();
                  }
                }}
                placeholder="Enter new category name"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                autoFocus
              />
              <div className="flex justify-between mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreating(false);
                    setSearchTerm(selectedCategory || '');
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700 px-2 py-1"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateNew}
                  disabled={!searchTerm.trim()}
                  className="text-sm bg-blue-600 text-white px-3 py-1 rounded
                           hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed
                           transition-colors duration-150"
                >
                  Create
                </button>
              </div>
            </div>
          ) : (
            <div className="max-h-52 overflow-y-auto">
              {/* Create New Option */}
              {showCreateOption && (
                <button
                  type="button"
                  onClick={() => setIsCreating(true)}
                  className="w-full text-left px-4 py-3 text-sm text-blue-600 hover:bg-blue-50
                           border-b border-gray-100 last:border-b-0
                           transition-colors duration-150
                           flex items-center"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create "{searchTerm}"
                </button>
              )}

              {/* Category List */}
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    onClick={() => handleCategorySelect(category)}
                    className={`w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-gray-50
                             border-b border-gray-100 last:border-b-0
                             transition-colors duration-150
                             ${category === selectedCategory ? 'bg-blue-50 text-blue-700 font-medium' : ''}`}
                  >
                    {category}
                  </button>
                ))
              ) : (
                !showCreateOption && (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">
                    No categories found
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const AddCompanyPage = () => {
  const navigate = useNavigate();
  const { addCompanyAPI } = useCompanyContext();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    website: '',
    status: 'New',
    personName: '',
    phoneNumber: '',
    alternatePhoneNumber: '',
    gstNumber: '',
    panNumber: '',
    categories: []
  });
  const [attachments, setAttachments] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [availableCategories, setAvailableCategories] = useState([]);
  const fileInputRef = useRef(null);

  // Fetch available categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        // Check if user is authenticated
        if (!token) {
          console.warn('No auth token found, cannot fetch categories');
          return;
        }
        
        const response = await companyAPI.getCompanyCategories();
        
        console.log('Categories API response:', response.data);
        
        if (response.data && response.data.success && response.data.data) {
          setAvailableCategories(response.data.data);
          console.log('Available categories set:', response.data.data);
        } else {
          console.warn('Unexpected categories response format:', response.data);
          // Set some default categories if the API response is unexpected
          setAvailableCategories(['Technology', 'Healthcare', 'Finance', 'Education', 'Retail']);
        }
      } catch (error) {
        console.error('Error fetching categories:', error);
        console.error('Categories error response:', error.response?.data);
        console.error('Categories error status:', error.response?.status);
        
        // Provide fallback categories if API call fails
        console.warn('Using fallback categories due to API error');
        setAvailableCategories(['Technology', 'Healthcare', 'Finance', 'Education', 'Retail']);
      }
    };

    fetchCategories();
  }, []);

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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Validate that only PDF files are accepted
    const validFiles = files.filter(file => {
      const fileType = file.type.toLowerCase();
      const fileName = file.name.toLowerCase();
      
      if (!fileType.includes('pdf') && !fileName.endsWith('.pdf')) {
        alert('Only PDF files are allowed for document uploads.');
        return false;
      }
      return true;
    });
    
    if (validFiles.length === 0) return; // Exit if no valid files
    
    const newAttachments = validFiles.map(file => ({
      id: Date.now() + Math.random(),
      file: file,
      name: file.name,
      size: file.size,
      type: file.type
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const removeAttachment = (id) => {
    setAttachments(prev => prev.filter(attachment => attachment.id !== id));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Company name is required';
    if (!formData.website.trim()) newErrors.website = 'Website is required';
    // Validate category - it's required
    if (!formData.categories || formData.categories.length === 0 || !formData.categories[0]?.trim()) {
      newErrors.category = 'Category is required';
    }
    // Validate email if provided
    if (formData.email.trim() && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    // Validate attachments if present
    if (attachments.length > 0) {
      const invalidFiles = attachments.some(attachment => {
        const fileType = attachment.file.type.toLowerCase();
        const fileName = attachment.file.name.toLowerCase();
        return !fileType.includes('pdf') && !fileName.endsWith('.pdf');
      });
      
      if (invalidFiles) {
        newErrors.attachments = 'Only PDF files are allowed';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    // Validate file types before submitting
    if (attachments.length > 0) {
      const invalidFiles = attachments.filter(attachment => {
        const fileType = attachment.file.type.toLowerCase();
        const fileName = attachment.file.name.toLowerCase();
        return !fileType.includes('pdf') && !fileName.endsWith('.pdf');
      });
      
      if (invalidFiles.length > 0) {
        setErrors({ submit: 'Only PDF files are allowed for document uploads.' });
        return;
      }
    }
    
    setLoading(true);
    try {
      // Prepare company data
      // Format according to backend expectations
      const companyData = {
        companyName: formData.name || '',
        companyEmail: formData.email || '',
        contactPerson: formData.personName || 'N/A', // Backend requires this field
        websiteUrl: formData.website || '',
        status: formData.status || 'New',
        industry: 'Technology', // Required field by backend
        tags: '', // Optional field
        categories: formData.categories && formData.categories.length > 0 && formData.categories[0] ? [formData.categories[0]] : [], // Send as array with single category
        personName: formData.personName || '',
        phoneNumber: formData.phoneNumber || '',
        alternatePhoneNumber: formData.alternatePhoneNumber || '',
        gstNumber: formData.gstNumber || '',
        panNumber: formData.panNumber || ''
      };
      
      // Only add uploadDocument if there are actual files to upload
      // Always use FormData for Add Company API - required by backend
      const formDataToSend = new FormData();
      
      // Add all text fields to FormData
      formDataToSend.append('companyName', companyData.companyName);
      formDataToSend.append('companyEmail', companyData.companyEmail);
      formDataToSend.append('contactPerson', companyData.contactPerson);
      formDataToSend.append('websiteUrl', companyData.websiteUrl);
      formDataToSend.append('industry', companyData.industry);
      formDataToSend.append('tags', companyData.tags);
      formDataToSend.append('status', companyData.status);
      
      // Append categories field as array - field-by-field as required
      if (companyData.categories && Array.isArray(companyData.categories)) {
        companyData.categories.forEach(category => {
          formDataToSend.append('categories', category);
        });
      }
      
      // Add additional company fields
      formDataToSend.append('personName', companyData.personName);
      formDataToSend.append('phoneNumber', companyData.phoneNumber);
      formDataToSend.append('alternatePhoneNumber', companyData.alternatePhoneNumber);
      formDataToSend.append('gstNumber', companyData.gstNumber);
      formDataToSend.append('panNumber', companyData.panNumber);
      
      // Add document uploads if any - as File objects under uploadDocument key
      attachments.forEach((attachment) => {
        if (attachment.file instanceof File) {
          formDataToSend.append('uploadDocument', attachment.file, attachment.name);
        }
      });
      
      // Runtime check: ensure we're passing a real FormData instance
      console.log('FormData check - instanceof FormData:', formDataToSend instanceof FormData);
      console.log('FormData check - constructor name:', formDataToSend.constructor.name);
      console.log('FormData entries:', Array.from(formDataToSend.entries()));
      
      if (!(formDataToSend instanceof FormData)) {
        throw new Error(`Expected FormData instance, got ${typeof formDataToSend} (${formDataToSend.constructor.name})`);
      }
      
      // Always send FormData - never JSON
      await addCompanyAPI(formDataToSend);
      
      // If there are attachments, we might need to handle them separately
      // For now, just navigate to companies list
      navigate('/companies');
    } catch (error) {
      console.error('Error adding company:', error);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      // Extract error message from response if available
      const errorMessage = error.response?.data?.message || error.message || 'Failed to add company. Please try again.';
      setErrors({ submit: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Company</h1>
          <p className="text-gray-600 mt-1">Fill in the details for the new company</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Company Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Company Name 
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter company name"
                />
              </div>
              {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
            </div>



            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter email address"
                />
              </div>
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <GlobeAltIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.website ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://example.com"
                />
              </div>
              {errors.website && <p className="mt-1 text-sm text-red-600">{errors.website}</p>}
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="block w-full pl-3 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Responded">Responded</option>
                <option value="Shortlisted">Shortlisted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Categories - Modern Searchable Dropdown */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <CustomCategoryDropdown
                availableCategories={availableCategories}
                selectedCategory={formData.categories[0] || ''}
                onSelectCategory={(category) => {
                  setFormData(prev => ({
                    ...prev,
                    categories: category ? [category] : []
                  }));
                }}
                onAddNewCategory={(category) => {
                  setFormData(prev => ({
                    ...prev,
                    categories: [category]
                  }));
                  setAvailableCategories(prev => [...prev, category]);
                }}
              />
              {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
            </div>

            {/* Person Name */}
            <div>
              <label htmlFor="personName" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Person Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="personName"
                  name="personName"
                  value={formData.personName}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter contact person name"
                />
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Primary Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="string"
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter primary phone number"
                />
              </div>
            </div>

            {/* Alternate Phone Number */}
            <div>
              <label htmlFor="alternatePhoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Alternate Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="string"
                  id="alternatePhoneNumber"
                  name="alternatePhoneNumber"
                  value={formData.alternatePhoneNumber}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter alternate phone number"
                />
              </div>
            </div>

            {/* GST Number */}
            <div>
              <label htmlFor="gstNumber" className="block text-sm font-medium text-gray-700 mb-2">
                GST Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <BriefcaseIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="gstNumber"
                  name="gstNumber"
                  value={formData.gstNumber}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter GST number"
                />
              </div>
            </div>

            {/* PAN Number */}
            <div>
              <label htmlFor="panNumber" className="block text-sm font-medium text-gray-700 mb-2">
                PAN Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="panNumber"
                  name="panNumber"
                  value={formData.panNumber}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter PAN number"
                />
              </div>
            </div>
          </div>



          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attachments
            </label>
            <div className="border border-gray-300 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <PaperClipIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Add company documents</span>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Browse Files
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  multiple
                />
              </div>

              {/* Attachment List */}
              {attachments.length > 0 && (
                <div className="space-y-2">
                  {attachments.map(attachment => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <DocumentTextIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(attachment.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                      >
                        <XCircleIcon className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {errors.submit && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <XCircleIcon className="h-5 w-5 text-red-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{errors.submit}</h3>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={() => navigate('/companies')}
              className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Adding...
                </>
              ) : (
                <>
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Company
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