import React, { useState, useMemo } from 'react';
import { useCompanyContext } from '../hooks/useCompanyContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeftIcon, PlusIcon, MinusIcon, DocumentTextIcon, UserIcon, BriefcaseIcon, CurrencyDollarIcon, InformationCircleIcon } from '@heroicons/react/24/outline';

const RequirementsPage = () => {
  const { companies, addRequirements, loading } = useCompanyContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get('companyId');
  
  const company = useMemo(() => {
    if (companyId) {
      return companies.find(c => c.id === parseInt(companyId));
    }
    return null;
  }, [companyId, companies]);
  
  const [formData, setFormData] = useState({
    roles: company?.requirements?.roles || [''],
    techStack: company?.requirements?.techStack || [''],
    hiringType: company?.requirements?.hiringType || 'Full-time',
    budget: company?.requirements?.budget || '',
    notes: company?.requirements?.notes || ''
  });
  
  const [isEditing, setIsEditing] = useState(!company?.requirements);
  const [errors, setErrors] = useState({});

  const handleAddField = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], '']
    }));
  };

  const handleRemoveField = (field, index) => {
    if (formData[field].length > 1) {
      setFormData(prev => ({
        ...prev,
        [field]: prev[field].filter((_, i) => i !== index)
      }));
    }
  };

  const handleFieldChange = (field, index, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item)
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

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

  const validateForm = () => {
    const newErrors = {};
    
    if (formData.roles.length === 0 || formData.roles.every(role => !role.trim())) {
      newErrors.roles = 'At least one role is required';
    }
    
    if (formData.techStack.length === 0 || formData.techStack.every(tech => !tech.trim())) {
      newErrors.techStack = 'At least one technology is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Filter out empty values
      const requirements = {
        ...formData,
        roles: formData.roles.filter(role => role.trim()),
        techStack: formData.techStack.filter(tech => tech.trim())
      };
      
      if (companyId) {
        addRequirements(parseInt(companyId), requirements);
      }
      
      setIsEditing(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    if (company?.requirements) {
      setFormData({
        roles: company.requirements.roles || [''],
        techStack: company.requirements.techStack || [''],
        hiringType: company.requirements.hiringType || 'Full-time',
        budget: company.requirements.budget || '',
        notes: company.requirements.notes || ''
      });
    } else {
      setFormData({
        roles: [''],
        techStack: [''],
        hiringType: 'Full-time',
        budget: '',
        notes: ''
      });
    }
    setIsEditing(false);
  };

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading requirements...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors duration-200"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Companies
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5">
          <div className="flex items-center">
            <div className="p-2 bg-white/20 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
            <div className="ml-4">
              <h2 className="text-xl font-bold text-white">Company Requirements</h2>
              {company && (
                <p className="mt-1 text-sm text-purple-100">
                  Requirements for: <span className="font-medium">{company.name}</span>
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-6">
          {company?.requirements && !isEditing ? (
            // Display mode
            <div className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center mb-4">
                  <UserIcon className="h-5 w-5 text-blue-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Required Roles</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {company.requirements.roles.map((role, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <div className="flex items-center mb-4">
                  <BriefcaseIcon className="h-5 w-5 text-green-500 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900">Tech Stack</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {company.requirements.techStack.map((tech, index) => (
                    <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <BriefcaseIcon className="h-4 w-4 text-gray-500 mr-2" />
                    <h3 className="text-sm font-medium text-gray-900">Hiring Type</h3>
                  </div>
                  <p className="text-gray-700 font-medium">{company.requirements.hiringType}</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center mb-2">
                    <CurrencyDollarIcon className="h-4 w-4 text-gray-500 mr-2" />
                    <h3 className="text-sm font-medium text-gray-900">Budget/Salary Range</h3>
                  </div>
                  <p className="text-gray-700 font-medium">{company.requirements.budget || 'Not specified'}</p>
                </div>
              </div>
              
              {company.requirements.notes && (
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <div className="flex items-center mb-4">
                    <InformationCircleIcon className="h-5 w-5 text-gray-500 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900">Additional Notes</h3>
                  </div>
                  <p className="text-gray-700">{company.requirements.notes}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  onClick={handleEdit}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  Edit Requirements
                </button>
              </div>
            </div>
          ) : (
            // Edit mode
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Required Roles */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <label className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <UserIcon className="h-4 w-4 text-blue-500 mr-2" />
                  Required Roles *
                </label>
                <div className="space-y-3">
                  {formData.roles.map((role, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="text"
                        value={role}
                        onChange={(e) => handleFieldChange('roles', index, e.target.value)}
                        className={`flex-1 rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm transition-all duration-200 ${
                          errors.roles ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder={`Role ${index + 1}`}
                      />
                      {formData.roles.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveField('roles', index)}
                          className="ml-2 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <MinusIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {errors.roles && (
                    <div className="mt-2 flex items-center text-sm text-red-600">
                      <InformationCircleIcon className="h-4 w-4 mr-1" />
                      <span>{errors.roles}</span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleAddField('roles')}
                  className="mt-3 inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Role
                </button>
              </div>
              
              {/* Tech Stack */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <label className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <BriefcaseIcon className="h-4 w-4 text-green-500 mr-2" />
                  Tech Stack *
                </label>
                <div className="space-y-3">
                  {formData.techStack.map((tech, index) => (
                    <div key={index} className="flex items-center">
                      <input
                        type="text"
                        value={tech}
                        onChange={(e) => handleFieldChange('techStack', index, e.target.value)}
                        className={`flex-1 rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm transition-all duration-200 ${
                          errors.techStack ? 'border-red-300 bg-red-50' : 'border-gray-300'
                        }`}
                        placeholder={`Technology ${index + 1}`}
                      />
                      {formData.techStack.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveField('techStack', index)}
                          className="ml-2 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <MinusIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {errors.techStack && (
                    <div className="mt-2 flex items-center text-sm text-red-600">
                      <InformationCircleIcon className="h-4 w-4 mr-1" />
                      <span>{errors.techStack}</span>
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => handleAddField('techStack')}
                  className="mt-3 inline-flex items-center px-3 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 transition-colors duration-200"
                >
                  <PlusIcon className="h-4 w-4 mr-1" />
                  Add Technology
                </button>
              </div>
              
              {/* Hiring Type and Budget */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <label htmlFor="hiringType" className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <BriefcaseIcon className="h-4 w-4 text-gray-500 mr-2" />
                    Hiring Type
                  </label>
                  <select
                    id="hiringType"
                    name="hiringType"
                    value={formData.hiringType}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm transition-all duration-200"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                  <label htmlFor="budget" className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                    <CurrencyDollarIcon className="h-4 w-4 text-gray-500 mr-2" />
                    Budget/Salary Range
                  </label>
                  <input
                    type="text"
                    name="budget"
                    id="budget"
                    value={formData.budget}
                    onChange={handleChange}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm transition-all duration-200"
                    placeholder="$50k - $80k"
                  />
                </div>
              </div>
              
              {/* Additional Notes */}
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                <label htmlFor="notes" className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                  <InformationCircleIcon className="h-4 w-4 text-gray-500 mr-2" />
                  Additional Notes
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm transition-all duration-200"
                  placeholder="Any additional requirements or notes..."
                />
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                {company?.requirements && (
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200 shadow-md"
                >
                  <DocumentTextIcon className="h-4 w-4 mr-2" />
                  Save Requirements
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequirementsPage;