import React, { useState, useMemo } from 'react';
import { useCompanyContext } from '../hooks/useCompanyContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeftIcon, PaperAirplaneIcon, DocumentTextIcon, TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

const ComposeEmailPage = () => {
  const { companies, addResponse } = useCompanyContext();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const companyId = searchParams.get('companyId');
  
  // Mock email templates
  const emailTemplates = [
    {
      id: 1,
      name: 'Initial Outreach',
      subject: 'Partnership Opportunity with [Company Name]',
      body: `Hi [Company Name] Team,

I hope this email finds you well. I'm reaching out from [Your Company] to explore potential partnership opportunities. We specialize in [Your Services] and believe there might be synergies between our organizations.

Would you be interested in a brief call to discuss how we might collaborate?

Best regards,
[Your Name]`
    },
    {
      id: 2,
      name: 'Follow-up',
      subject: 'Follow-up: Partnership Opportunity',
      body: `Hi [Company Name] Team,

I wanted to follow up on my previous email about potential partnership opportunities. I understand you might be busy, but I'd appreciate any thoughts on our proposal.

Looking forward to hearing from you.

Best regards,
[Your Name]`
    },
    {
      id: 3,
      name: 'Technical Discussion',
      subject: 'Technical Collaboration Opportunity',
      body: `Hi [Company Name] Team,

I hope this email finds you well. I've been following your work in [Industry] and am impressed by your recent projects.

We're currently looking for partners with technical expertise in [Tech Stack] and believe your team might be a great fit for a potential collaboration.

Would you be available for a technical discussion?

Best regards,
[Your Name]`
    }
  ];

  // Find the selected company based on URL parameter
  const selectedCompanyFromParams = useMemo(() => {
    if (companyId) {
      return companies.find(c => c.id === parseInt(companyId));
    }
    return null;
  }, [companyId, companies]);

  // Initialize form data with company email if available
  const initialFormData = useMemo(() => ({
    to: selectedCompanyFromParams?.email || '',
    subject: '',
    body: ''
  }), [selectedCompanyFromParams]);

  const [formData, setFormData] = useState(initialFormData);
  
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [errors, setErrors] = useState({});
  const [isSending, setIsSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template.id);
    setFormData(prev => ({
      ...prev,
      subject: template.subject.replace('[Company Name]', selectedCompanyFromParams?.name || ''),
      body: template.body.replace('[Company Name]', selectedCompanyFromParams?.name || '')
        .replace('[Your Company]', 'Elite Outreach')
        .replace('[Your Services]', 'software development and partnership opportunities')
        .replace('[Your Name]', 'Elite Outreach Team')
        .replace('[Industry]', selectedCompanyFromParams?.industry || 'your industry')
        .replace('[Tech Stack]', selectedCompanyFromParams?.tags.join(', ') || 'relevant technologies')
    }));
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
    
    if (!formData.to.trim()) {
      newErrors.to = 'Recipient email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.to)) {
      newErrors.to = 'Recipient email is invalid';
    }
    
    if (!formData.subject.trim()) {
      newErrors.subject = 'Subject is required';
    }
    
    if (!formData.body.trim()) {
      newErrors.body = 'Email body is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSending(true);
    
    // Simulate email sending
    setTimeout(() => {
      if (companyId) {
        const response = {
          id: Date.now(),
          date: new Date().toISOString().split('T')[0],
          subject: formData.subject,
          content: formData.body
        };
        
        addResponse(parseInt(companyId), response);
      }
      
      setIsSending(false);
      setSuccessMessage('Email sent successfully!');
      
      // Reset form after successful send
      setTimeout(() => {
        setFormData({
          to: selectedCompanyFromParams?.email || '',
          subject: '',
          body: ''
        });
        setSuccessMessage('');
      }, 3000);
    }, 1500);
  };

  const resetForm = () => {
    setFormData({
      to: selectedCompanyFromParams?.email || '',
      subject: '',
      body: ''
    });
    setSelectedTemplate('');
    setErrors({});
  };

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
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Compose Email</h2>
              {selectedCompanyFromParams && (
                <p className="mt-1 text-sm text-blue-100">
                  Sending to: <span className="font-medium">{selectedCompanyFromParams.name}</span> ({selectedCompanyFromParams.email})
                </p>
              )}
            </div>
            <div className="p-2 bg-white/20 rounded-lg">
              <PaperAirplaneIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          {/* Template Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Use Email Template
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {emailTemplates.map(template => (
                <div
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    selectedTemplate === template.id
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <DocumentTextIcon className="h-5 w-5 text-blue-500 mr-2" />
                    <div className="font-medium text-gray-900">{template.name}</div>
                  </div>
                  <div className="mt-2 text-sm text-gray-600 truncate">{template.subject}</div>
                </div>
              ))}
            </div>
          </div>
          
          {/* To Field */}
          <div className="mb-5">
            <label htmlFor="to" className="block text-sm font-medium text-gray-700 mb-2">
              To *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="email"
                name="to"
                id="to"
                value={formData.to}
                onChange={handleChange}
                className={`block w-full pl-10 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200 ${
                  errors.to ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="recipient@example.com"
              />
              {errors.to && (
                <div className="mt-1 flex items-center">
                  <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-600">{errors.to}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Subject Field */}
          <div className="mb-5">
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <input
                type="text"
                name="subject"
                id="subject"
                value={formData.subject}
                onChange={handleChange}
                className={`block w-full pl-10 rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200 ${
                  errors.subject ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Email subject"
              />
              {errors.subject && (
                <div className="mt-1 flex items-center">
                  <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-600">{errors.subject}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Body Field */}
          <div className="mb-6">
            <label htmlFor="body" className="block text-sm font-medium text-gray-700 mb-2">
              Message *
            </label>
            <div className="relative">
              <textarea
                id="body"
                name="body"
                rows={12}
                value={formData.body}
                onChange={handleChange}
                className={`block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-all duration-200 ${
                  errors.body ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Write your email message here..."
              />
              {errors.body && (
                <div className="mt-1 flex items-center">
                  <svg className="h-5 w-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm text-red-600">{errors.body}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Success Message */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {successMessage}
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <ArrowPathIcon className="h-4 w-4 mr-2" />
              Reset
            </button>
            
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="inline-flex items-center px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200 shadow-md"
              >
                {isSending ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    <PaperAirplaneIcon className="h-4 w-4 mr-2" />
                    Send Email
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ComposeEmailPage;