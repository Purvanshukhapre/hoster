import React, { useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanyContext } from '../hooks/useCompanyContext';
import { useAuth } from '../hooks/useAuth';

import { 
  EnvelopeIcon, 
  UserIcon, 
  DocumentTextIcon, 
  PaperClipIcon, 
  ArrowLeftIcon, 
  TrashIcon,
  DocumentIcon,
  XCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PaperAirplaneIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const ComposeEmailPage = () => {
  const navigate = useNavigate();
  const { companies, sendSingleEmail, sendGroupEmail } = useCompanyContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  
  // Individual email form state
  const [individualEmail, setIndividualEmail] = useState({
    subject: '',
    message: ''
  });
  
  // Group email form state
  const [groupEmail, setGroupEmail] = useState({
    subject: '',
    message: ''
  });
  
  const [attachments, setAttachments] = useState([]);
  const [individualErrors, setIndividualErrors] = useState({});
  const [groupErrors, setGroupErrors] = useState({});
  const [individualLoading, setIndividualLoading] = useState(false);
  const [groupLoading, setGroupLoading] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const fileInputRef = useRef(null);

  const { user } = useAuth();
  
  // Filter companies based on search term and filter
  const filteredCompanies = useMemo(() => {
    if (!companies) return [];
    
    // Filter companies for employees to only show companies they created
    const filteredCompanies = user?.role === 'employee' 
      ? companies.filter(company => 
          company.creatorId === user.id || 
          company.createdBy === user.id || 
          company.creator === user.id
        )
      : companies;
    
    return filteredCompanies.filter(company => {
      const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           company.email.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (filter === 'all') return matchesSearch;
      if (filter === 'responded') return matchesSearch && company.status === 'Responded';
      if (filter === 'not-responded') return matchesSearch && company.status !== 'Responded';
      
      return matchesSearch;
    });
  }, [companies, searchTerm, filter, user]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newAttachments = files
      .filter(file => file instanceof File)  // Only process actual File objects
      .map(file => ({
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

  const handleIndividualSubmit = async (companyId) => {
    // Set the form data for individual email
    const errors = {};
    
    if (!individualEmail.subject.trim()) errors.subject = 'Subject is required';
    if (!individualEmail.message.trim()) errors.message = 'Message is required';
    
    setIndividualErrors(errors);
    
    if (Object.keys(errors).length > 0) return;
    
    setIndividualLoading(true);
    try {
      // Prepare email data for API call
      const emailData = {
        companyId,
        subject: individualEmail.subject,
        message: individualEmail.message,
        attachments: attachments.filter(attachment => attachment.file instanceof File).map(attachment => attachment.file)
      };
      
      // Send email via API
      await sendSingleEmail(emailData);
      alert('Email sent successfully!');
      
      // Reset form
      setIndividualEmail({ subject: '', message: '' });
      setAttachments([]);
    } catch (error) {
      console.error('Error sending email:', error);
      setIndividualErrors({ submit: error.message || 'Failed to send email. Please try again.' });
    } finally {
      setIndividualLoading(false);
    }
  };

  const [individualModalOpen, setIndividualModalOpen] = useState(false);
  const [currentCompanyId, setCurrentCompanyId] = useState(null);

  const openIndividualEmailModal = (companyId) => {
    setCurrentCompanyId(companyId);
    setIndividualModalOpen(true);
  };

  const closeIndividualEmailModal = () => {
    setIndividualModalOpen(false);
    setCurrentCompanyId(null);
    setIndividualEmail({ subject: '', message: '' });
  };

  const handleGroupSubmit = async () => {
    const errors = {};
    
    if (!groupEmail.subject.trim()) errors.subject = 'Subject is required';
    if (!groupEmail.message.trim()) errors.message = 'Message is required';
    if (selectedCompanies.length === 0) errors.companies = 'Please select at least one company';
    
    setGroupErrors(errors);
    
    if (Object.keys(errors).length > 0) return;
    
    setGroupLoading(true);
    try {
      // Prepare email data for API call
      const emailData = {
        companyIds: selectedCompanies,
        subject: groupEmail.subject,
        message: groupEmail.message,
        attachments: attachments.filter(attachment => attachment.file instanceof File).map(attachment => attachment.file)
      };
      
      // Send group email via API
      await sendGroupEmail(emailData);
      alert('Group email sent successfully!');
      
      // Reset form
      setGroupEmail({ subject: '', message: '' });
      setSelectedCompanies([]);
      setAttachments([]);
      setShowGroupModal(false);
    } catch (error) {
      console.error('Error sending group email:', error);
      setGroupErrors({ submit: error.message || 'Failed to send group email. Please try again.' });
    } finally {
      setGroupLoading(false);
    }
  };

  const toggleCompanySelection = (companyId) => {
    setSelectedCompanies(prev => {
      if (prev.includes(companyId)) {
        return prev.filter(id => id !== companyId);
      } else {
        return [...prev, companyId];
      }
    });
  };

  const selectAllCompanies = () => {
    setSelectedCompanies(filteredCompanies.map(company => company.id));
  };

  const clearAllSelections = () => {
    setSelectedCompanies([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compose Email</h1>
          <p className="text-gray-600 mt-1">Send emails to your company contacts</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Companies</option>
              <option value="responded">Responded</option>
              <option value="not-responded">Not Responded</option>
            </select>
          </div>
        </div>
      </div>

      {/* Companies List */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Companies ({filteredCompanies.length})</h2>
            <p className="text-gray-600 mt-1">Select companies to send individual or group emails</p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={selectAllCompanies}
              className="px-4 py-2 text-sm bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
            >
              <UserIcon className="h-4 w-4 mr-1" />
              Select All
            </button>
            <button
              onClick={clearAllSelections}
              className="px-4 py-2 text-sm bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 rounded-lg hover:from-gray-400 hover:to-gray-500 transition-all duration-200 shadow-md hover:shadow-lg flex items-center"
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Clear All
            </button>
            <button
              onClick={() => setShowGroupModal(true)}
              disabled={selectedCompanies.length === 0}
              className="px-4 py-2 text-sm bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-md hover:shadow-lg"
            >
              <UserGroupIcon className="h-4 w-4 mr-1" />
              Send Group Email ({selectedCompanies.length})
            </button>
          </div>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {filteredCompanies.length > 0 ? (
            filteredCompanies.map(company => (
              <div key={company.id} className="flex items-center justify-between p-5 bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={selectedCompanies.includes(company.id)}
                    onChange={() => toggleCompanySelection(company.id)}
                    className="h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"
                  />
                  <div className="ml-5">
                    <h3 className="font-bold text-lg text-gray-900">{company.name}</h3>
                    <p className="text-gray-600 flex items-center mt-1">
                      <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-500" />
                      {company.email}
                    </p>
                    {company.status && (
                      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full mt-2 ${
                        company.status === 'Responded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {company.status}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => openIndividualEmailModal(company.id)}
                  disabled={individualLoading}
                  className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-base rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  <PaperAirplaneIcon className="h-5 w-5 mr-2" />
                  Compose
                </button>
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-gray-100">
                <MagnifyingGlassIcon className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No companies found</h3>
              <p className="mt-1 text-gray-500">No companies match your search criteria.</p>
            </div>
          )}
        </div>
      </div>

      {/* Individual Email Modal */}
      {individualModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeIndividualEmailModal}></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl leading-6 font-bold text-gray-900 mb-4">
                        Send Individual Email
                      </h3>
                      <button
                        onClick={closeIndividualEmailModal}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="individual-subject" className="block text-sm font-medium text-gray-700 mb-2">
                          Subject *
                        </label>
                        <input
                          id="individual-subject"
                          type="text"
                          value={individualEmail.subject}
                          onChange={(e) => setIndividualEmail(prev => ({ ...prev, subject: e.target.value }))}
                          className={`block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            individualErrors.subject ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Enter email subject"
                        />
                        {individualErrors.subject && <p className="mt-1 text-sm text-red-600">{individualErrors.subject}</p>}
                      </div>

                      <div>
                        <label htmlFor="individual-message" className="block text-sm font-medium text-gray-700 mb-2">
                          Message *
                        </label>
                        <textarea
                          id="individual-message"
                          rows={8}
                          value={individualEmail.message}
                          onChange={(e) => setIndividualEmail(prev => ({ ...prev, message: e.target.value }))}
                          className={`block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            individualErrors.message ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Type your message here..."
                        />
                        {individualErrors.message && <p className="mt-1 text-sm text-red-600">{individualErrors.message}</p>}
                      </div>

                      {/* Attachments */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Attachments
                        </label>
                        <div className="border border-gray-300 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <PaperClipIcon className="h-5 w-5 text-gray-400 mr-2" />
                              <span className="text-sm font-medium text-gray-700">Add attachments</span>
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
                                    {attachment.type.startsWith('image/') ? (
                                      <DocumentIcon className="h-5 w-5 text-blue-500 mr-3" />
                                    ) : attachment.type.startsWith('application/pdf') ? (
                                      <DocumentIcon className="h-5 w-5 text-red-500 mr-3" />
                                    ) : (
                                      <DocumentIcon className="h-5 w-5 text-gray-500 mr-3" />
                                    )}
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
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {individualErrors.submit && (
                        <div className="rounded-md bg-red-50 p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <XCircleIcon className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-red-800">{individualErrors.submit}</h3>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={() => handleIndividualSubmit(currentCompanyId)}
                  disabled={individualLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {individualLoading ? 'Sending...' : 'Send Email'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeIndividualEmailModal}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Group Email Modal */}
      {showGroupModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowGroupModal(false)}></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl leading-6 font-bold text-gray-900 mb-4">
                        Send Group Email
                      </h3>
                      <button
                        onClick={() => setShowGroupModal(false)}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="group-subject" className="block text-sm font-medium text-gray-700 mb-2">
                          Subject *
                        </label>
                        <input
                          id="group-subject"
                          type="text"
                          value={groupEmail.subject}
                          onChange={(e) => setGroupEmail(prev => ({ ...prev, subject: e.target.value }))}
                          className={`block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            groupErrors.subject ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Enter email subject"
                        />
                        {groupErrors.subject && <p className="mt-1 text-sm text-red-600">{groupErrors.subject}</p>}
                      </div>

                      <div>
                        <label htmlFor="group-message" className="block text-sm font-medium text-gray-700 mb-2">
                          Message *
                        </label>
                        <textarea
                          id="group-message"
                          rows={8}
                          value={groupEmail.message}
                          onChange={(e) => setGroupEmail(prev => ({ ...prev, message: e.target.value }))}
                          className={`block w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            groupErrors.message ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="Type your message here..."
                        />
                        {groupErrors.message && <p className="mt-1 text-sm text-red-600">{groupErrors.message}</p>}
                      </div>

                      {/* Attachments */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Attachments
                        </label>
                        <div className="border border-gray-300 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                              <PaperClipIcon className="h-5 w-5 text-gray-400 mr-2" />
                              <span className="text-sm font-medium text-gray-700">Add attachments</span>
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
                                    {attachment.type.startsWith('image/') ? (
                                      <DocumentIcon className="h-5 w-5 text-blue-500 mr-3" />
                                    ) : attachment.type.startsWith('application/pdf') ? (
                                      <DocumentIcon className="h-5 w-5 text-red-500 mr-3" />
                                    ) : (
                                      <DocumentIcon className="h-5 w-5 text-gray-500 mr-3" />
                                    )}
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
                                    <TrashIcon className="h-4 w-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Selected Companies */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Selected Companies ({selectedCompanies.length})
                        </label>
                        <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3 bg-gray-50">
                          {selectedCompanies.length > 0 ? (
                            selectedCompanies.map(companyId => {
                              const company = companies.find(c => c.id === companyId);
                              return company ? (
                                <div key={companyId} className="py-1 text-sm text-gray-700">
                                  {company.name} - {company.email}
                                </div>
                              ) : null;
                            })
                          ) : (
                            <p className="text-sm text-gray-500">No companies selected</p>
                          )}
                        </div>
                      </div>

                      {groupErrors.submit && (
                        <div className="rounded-md bg-red-50 p-4">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <XCircleIcon className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="ml-3">
                              <h3 className="text-sm font-medium text-red-800">{groupErrors.submit}</h3>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleGroupSubmit}
                  disabled={groupLoading}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {groupLoading ? 'Sending...' : 'Send Group Email'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowGroupModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComposeEmailPage;