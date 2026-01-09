import React, { useMemo, useState, useEffect } from 'react';
import { useCompanyContext } from '../hooks/useCompanyContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  ArrowLeftIcon, 
  ChatBubbleLeftRightIcon, 
  EnvelopeIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ChevronDownIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  UserIcon,
  CalendarIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

const EmailTrackerPage = () => {
  const { user } = useAuth();
  const { getMails, getMailById, loading, companies } = useCompanyContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [emails, setEmails] = useState([]);
  const [emailsLoading, setEmailsLoading] = useState(false);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState(null);

  // Fetch actual sent emails from the backend
  useEffect(() => {
    const fetchEmails = async () => {
      try {
        setEmailsLoading(true);
        const response = await getMails(1, 100); // Fetch 100 emails, page 1
        
        // Handle different possible response structures
        let emailsData = response;
        if (response && typeof response === 'object' && response.data !== undefined) {
          emailsData = response.data;
        }
        
        // Handle the API response format from backend
        // The API returns { success: true, mails: [...], totalPages, currentPage, totalMails }
        let allEmails = [];
        if (emailsData && emailsData.mails !== undefined) {
          allEmails = emailsData.mails;
        } else if (Array.isArray(emailsData)) {
          // Fallback to array if direct array is returned
          allEmails = emailsData;
        }
        
        // Filter emails for employees to only show emails related to companies they created
        if (user?.role === 'employee' && companies) {
          const userCompanyIds = companies
            .filter(company => 
              company.creatorId === user.id || 
              company.createdBy === user.id || 
              company.creator === user.id
            )
            .map(company => company.id || company._id);
            
          const filteredEmails = allEmails.filter(email => {
            if (!email.companyIds || !Array.isArray(email.companyIds)) return false;
            
            // Check if any of the company IDs in the email match the user's companies
            return email.companyIds.some(company => 
              userCompanyIds.includes(company._id || company.id)
            );
          });
          
          setEmails(filteredEmails);
        } else {
          // For admins, show all emails
          setEmails(allEmails);
        }
      } catch (error) {
        console.error('Error fetching emails:', error);
        setEmails([]);
      } finally {
        setEmailsLoading(false);
      }
    };

    fetchEmails();
  }, [getMails, user, companies]);

  // Process emails for display
  const allEmails = useMemo(() => {
    if (!emails || !Array.isArray(emails)) {
      return [];
    }
    
    return emails.map(email => ({
      id: email._id || email.id,
      type: email.recipientType || 'sent',
      subject: email.subject,
      company: email.companyIds && email.companyIds.length > 0 ? email.companyIds[0].companyName : 'Unknown Company',
      email: email.recipients && email.recipients.length > 0 ? email.recipients[0] : 'N/A',
      date: email.sentAt || email.createdAt || email.date || new Date().toISOString().split('T')[0],
      status: 'sent', // All emails in this list are sent emails
      sender: email.senderEmail,
      messageId: email.messageId,
      companyId: email.companyIds && email.companyIds.length > 0 ? email.companyIds[0]._id : null
    }));
  }, [emails]);

  // Filter and search emails
  const filteredEmails = useMemo(() => {
    let filtered = allEmails;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(email =>
        email.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        email.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(() => true); // All emails in this tracker are sent emails
    }

    // Apply date filter
    if (dateFilter !== 'All') {
      const now = new Date();
      const filterDate = new Date();
      
      switch (dateFilter) {
        case 'Today':
          filterDate.setDate(now.getDate());
          break;
        case 'This Week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'This Month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        default:
          break;
      }
      
      filtered = filtered.filter(email => {
        const emailDate = new Date(email.date);
        return emailDate >= filterDate;
      });
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    return filtered;
  }, [allEmails, searchTerm, statusFilter, dateFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'received':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <PaperAirplaneIcon className="h-4 w-4 text-blue-600" />;
      case 'received':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      default:
        return <EnvelopeIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const emailStats = useMemo(() => {
    const totalEmails = allEmails.length;
    const sentEmails = allEmails.length; // All emails in this list are sent emails
    const receivedEmails = 0; // This email tracker only shows sent emails
    const responseRate = 0; // Response rate cannot be calculated from this view

    return {
      totalEmails,
      sentEmails,
      receivedEmails,
      responseRate
    };
  }, [allEmails]);

  const statusOptions = ['All', 'Sent'];
  const dateOptions = ['All', 'Today', 'This Week', 'This Month'];

  const openEmailModal = async (emailId) => {
    try {
      setModalLoading(true);
      setModalError(null);
      
      const response = await getMailById(emailId);
      
      // Handle different possible response structures
      let emailData = response;
      if (response && typeof response === 'object') {
        // If response has data property (Axios response)
        if (response.data !== undefined) {
          emailData = response.data;
        }
        // If response has success and mail properties (our API format)
        if (response.success === true && response.mail) {
          emailData = response.mail;
        } else if (response.success === true && response.data) {
          emailData = response.data;
        }
      }
      
      setSelectedEmail(emailData);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching email details:', error);
      setModalError('Failed to load email details');
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedEmail(null);
    setModalError(null);
  };

  // Show loading state while data is being fetched
  if (loading || emailsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading email tracker...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Email Tracker</h1>
          <p className="mt-1 text-sm text-gray-500">Track all email communications and responses</p>
        </div>
        <button
          onClick={() => navigate('/companies')}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Companies
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <EnvelopeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Communications</p>
              <p className="text-3xl font-bold text-gray-900">{emailStats.totalEmails}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-indigo-100 rounded-lg">
              <PaperAirplaneIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Emails Sent</p>
              <p className="text-3xl font-bold text-gray-900">{emailStats.sentEmails}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Responses Received</p>
              <p className="text-3xl font-bold text-gray-900">{emailStats.receivedEmails}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <ArrowPathIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-3xl font-bold text-gray-900">{emailStats.responseRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200"
              placeholder="Search emails..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              {statusOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <ClockIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              {dateOptions.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Email Communications Table */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmails.length > 0 ? (
                filteredEmails.map((email) => (
                  <tr key={email.id} className="hover:bg-gray-50 transition-colors duration-150 cursor-pointer" onClick={() => openEmailModal(email.id)}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-xs">{email.company.charAt(0)}</span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{email.company}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 truncate max-w-xs">{email.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {email.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getStatusIcon(email.status)}
                        <span className="ml-2 text-sm text-gray-900 capitalize">{email.type}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {email.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(email.status)}`}>
                        {email.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <ChatBubbleLeftRightIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No email communications found</h3>
                      <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity Preview */}
      {filteredEmails.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Communications</h3>
          <div className="space-y-4">
            {filteredEmails.slice(0, 5).map((email) => (
              <div key={email.id} className="flex items-start p-4 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  email.status === 'sent' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                }`}>
                  {getStatusIcon(email.status)}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium text-gray-900">{email.company}</h4>
                    <span className="text-xs text-gray-500">{email.date}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{email.subject}</p>
                  <div className="mt-2 flex items-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(email.status)}`}>
                      {email.status}
                    </span>
                    <span className="ml-2 text-xs text-gray-500 capitalize">{email.type}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {/* Email Detail Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeModal}></div>
            </div>
              
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl leading-6 font-bold text-gray-900 mb-4">
                        Email Details
                      </h3>
                      <button
                        onClick={closeModal}
                        className="text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>
                      
                    {modalLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                      </div>
                    ) : modalError ? (
                      <div className="rounded-md bg-red-50 p-4">
                        <div className="flex">
                          <div className="flex-shrink-0">
                            <XCircleIcon className="h-5 w-5 text-red-400" />
                          </div>
                          <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">{modalError}</h3>
                          </div>
                        </div>
                      </div>
                    ) : selectedEmail ? (
                      <div className="space-y-6">
                        {/* Email Header */}
                        <div className="border-b border-gray-200 pb-4">
                          <h4 className="text-lg font-semibold text-gray-900">{selectedEmail.subject}</h4>
                          <div className="mt-2 flex items-center text-sm text-gray-500">
                            <UserIcon className="w-4 h-4 mr-2" />
                            <span>From: {selectedEmail.senderEmail} ({selectedEmail.senderRole})</span>
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            <span>Sent: {new Date(selectedEmail.sentAt).toLocaleString()}</span>
                          </div>
                        </div>
                                          
                        {/* Recipients */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Recipients</h5>
                          <div className="bg-gray-50 rounded-lg p-3">
                            {selectedEmail.recipients && selectedEmail.recipients.map((recipient, index) => (
                              <div key={index} className="flex items-center">
                                <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
                                <span className="text-sm text-gray-700">{recipient}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                                          
                        {/* Company Information */}
                        {selectedEmail.companyIds && selectedEmail.companyIds.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Company</h5>
                            <div className="space-y-2">
                              {selectedEmail.companyIds.map((company, index) => (
                                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <span className="text-white font-bold text-xs">{company.companyName?.charAt(0)}</span>
                                  </div>
                                  <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-900">{company.companyName}</p>
                                    <p className="text-xs text-gray-500">{company.companyEmail}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                                          
                        {/* Email Content */}
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Message</h5>
                          <div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
                            <p className="text-gray-700 whitespace-pre-wrap">
                              {selectedEmail.message || selectedEmail.content || selectedEmail.text || 'No email content available.'}
                            </p>
                          </div>
                        </div>
                        
                        {/* Attachments */}
                        {selectedEmail.attachments && selectedEmail.attachments.length > 0 && (
                          <div>
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Attachments</h5>
                            <div className="space-y-2">
                              {selectedEmail.attachments.map((attachment, index) => (
                                <div key={index} className="flex items-center p-3 border border-gray-200 rounded-lg">
                                  <PaperClipIcon className="w-5 h-5 text-gray-500 mr-3" />
                                  <div className="flex-1">
                                    <p className="font-medium text-gray-900 text-sm">{attachment.filename}</p>
                                    <p className="text-xs text-gray-500">{(attachment.size || attachment.fileSize) ? ((attachment.size || attachment.fileSize) / 1024).toFixed(2) : 'N/A'} KB</p>
                                  </div>
                                  <a 
                                    href={attachment.url || attachment.path || attachment.downloadUrl || '#'} 
                                    download
                                    className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    Download
                                  </a>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                                          
                        {/* Additional Information */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="font-medium text-gray-900">Type:</span>
                            <p className="text-gray-600 capitalize">{selectedEmail.recipientType}</p>
                          </div>
                          <div>
                            <span className="font-medium text-gray-900">Message ID:</span>
                            <p className="text-gray-600 break-all text-xs">{selectedEmail.messageId}</p>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={closeModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

  );
};

export default EmailTrackerPage;