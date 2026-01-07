import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanyContext } from '../hooks/useCompanyContext';
import { 
  BuildingOfficeIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  GlobeAltIcon, 
  MapPinIcon, 
  CheckCircleIcon, 
  ClockIcon, 
  UserGroupIcon,
  PlusIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  FunnelIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const SortIndicator = ({ sortField, currentField, sortDirection }) => {
  if (sortField !== currentField) return null;
  return (
    <ChevronDownIcon
      className={`h-4 w-4 ml-1 transition-transform duration-200 ${
        sortDirection === 'desc' ? 'rotate-180' : ''
      }`}
    />
  );
};

const ShortlistPage = () => {
  const { companies, loading, fetchCompanies, toggleShortlist } = useCompanyContext();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const shortlistedCompanies = useMemo(() => {
    return (companies || []).filter(company => company.status === 'Shortlisted');
  }, [companies]);

  const filteredCompanies = useMemo(() => {
    let filtered = shortlistedCompanies;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply sorting - create a copy to avoid mutating the original array
    const sortedFiltered = [...filtered];
    sortedFiltered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return sortedFiltered;
  }, [shortlistedCompanies, searchTerm, sortField, sortDirection]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'New': return 'bg-gray-100 text-gray-800';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800';
      case 'Responded': return 'bg-green-100 text-green-800';
      case 'Shortlisted': return 'bg-blue-100 text-blue-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'New':
        return <ClockIcon className="h-4 w-4 text-gray-600" />;
      case 'Contacted':
        return <EnvelopeIcon className="h-4 w-4 text-yellow-600" />;
      case 'Responded':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'Shortlisted':
        return <UserGroupIcon className="h-4 w-4 text-blue-600" />;
      case 'Rejected':
        return <XCircleIcon className="h-4 w-4 text-red-600" />;
      default:
        return <ClockIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleToggleShortlist = async (company) => {
    try {
      // Toggle the shortlist status
      await toggleShortlist(company.id, !company.isShortlisted);
    } catch (error) {
      console.error('Error toggling shortlist:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shortlisted Companies</h1>
          <p className="text-gray-600 mt-1">Companies that have been shortlisted for further consideration</p>
        </div>
        <button
          onClick={() => navigate('/companies')}
          className="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
        >
          <BuildingOfficeIcon className="h-5 w-5 mr-2" />
          All Companies
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search shortlisted companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex gap-3">
            <div className="flex items-center px-3 py-2 border border-gray-300 rounded-lg">
              <UserGroupIcon className="h-5 w-5 text-indigo-600 mr-2" />
              <span className="text-sm font-medium">{filteredCompanies.length} Shortlisted</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shortlisted Companies Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Company
                    <SortIndicator sortField={sortField} currentField="name" sortDirection={sortDirection} />
                  </div>
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('contactPerson')}
                >
                  <div className="flex items-center">
                    Contact
                    <SortIndicator sortField={sortField} currentField="contactPerson" sortDirection={sortDirection} />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact Info
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort('status')}
                >
                  <div className="flex items-center">
                    Status
                    <SortIndicator sortField={sortField} currentField="status" sortDirection={sortDirection} />
                  </div>
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCompanies.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <BuildingOfficeIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{company.name}</div>
                        <div className="text-sm text-gray-500">{company.website}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{company.contactPerson}</div>
                    <div className="text-sm text-gray-500">{company.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-sm text-gray-600">
                        <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {company.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {company.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPinIcon className="h-4 w-4 mr-2 text-gray-400" />
                        {company.location}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>
                      {getStatusIcon(company.status)}
                      <span className="ml-1">{company.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => navigate(`/companies/${company.id}`)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View
                    </button>
                    <button
                      onClick={() => handleToggleShortlist(company)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Unshortlist
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No shortlisted companies</h3>
            <p className="mt-1 text-sm text-gray-500">
              Companies you shortlist will appear here.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate('/companies')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <BuildingOfficeIcon className="h-5 w-5 mr-2" />
                Browse Companies
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShortlistPage;