import React, { useMemo, useState } from 'react';
import { useCompanyContext } from '../hooks/useCompanyContext';
import { useNavigate } from 'react-router-dom';
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
  PaperAirplaneIcon
} from '@heroicons/react/24/outline';

const EmailTrackerPage = () => {
  const { companies, loading } = useCompanyContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');

  // Flatten all email interactions from companies
  const allEmails = useMemo(() => {
    let emails = [];
    
    companies.forEach(company => {
      // Add sent emails (based on status changes)
      if (company.status !== 'New' && company.dateAdded) {
        emails.push({
          id: `sent-${company.id}`,
          type: 'sent',
          subject: `Outreach to ${company.name}`,
          company: company.name,
          email: company.email,
          date: company.dateAdded,
          status: 'sent',
          companyId: company.id
        });
      }
      
      // Add responses
      if (company.responses && company.responses.length > 0) {
        company.responses.forEach(response => {
          emails.push({
            id: `resp-${company.id}-${response.id}`,
            type: 'response',
            subject: response.subject,
            company: company.name,
            email: company.email,
            date: response.date,
            status: 'received',
            content: response.content,
            companyId: company.id
          });
        });
      }
    });
    
    return emails;
  }, [companies]);

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
      filtered = filtered.filter(email => email.status === statusFilter.toLowerCase());
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
    const sentEmails = allEmails.filter(email => email.type === 'sent').length;
    const receivedEmails = allEmails.filter(email => email.type === 'response').length;
    const responseRate = sentEmails > 0 ? Math.round((receivedEmails / sentEmails) * 100) : 0;

    return {
      totalEmails,
      sentEmails,
      receivedEmails,
      responseRate
    };
  }, [allEmails]);

  const statusOptions = ['All', 'Sent', 'Received'];
  const dateOptions = ['All', 'Today', 'This Week', 'This Month'];

  // Show loading state while data is being fetched
  if (loading) {
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
                  <tr key={email.id} className="hover:bg-gray-50 transition-colors duration-150">
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
    </div>
  );
};

export default EmailTrackerPage;