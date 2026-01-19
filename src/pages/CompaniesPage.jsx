import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCompanyContext } from '../hooks/useCompanyContext';
import { useAuth } from '../hooks/useAuth';
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
  XCircleIcon,
  HeartIcon
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

const CompaniesPage = () => {
  const { companies, loading, fetchCompanies } = useCompanyContext();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [sortField, setSortField] = useState('name');

  const [sortDirection, setSortDirection] = useState('asc');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const filteredCompanies = useMemo(() => {
    let filtered = companies || [];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (filterStatus !== 'All') {
      filtered = filtered.filter(company => company.status === filterStatus);
    }

    // Apply sorting - create a copy to avoid mutating the original array
    const sortedFiltered = [...filtered];
    
    // Sort by createdAt date (newest first) by default, but respect user's sort selection
    if (sortField === 'name' && sortDirection === 'asc') {
      // Sort by createdAt (newest first) when in default state
      sortedFiltered.sort((a, b) => {
        const aDate = new Date(a.createdAt || a.dateAdded || a._id?.substring(0, 8) || 0);
        const bDate = new Date(b.createdAt || b.dateAdded || b._id?.substring(0, 8) || 0);
        return bDate - aDate; // Descending order (newest first)
      });
    } else {
      // Use the normal sort logic
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
    }

    return sortedFiltered;
  }, [companies, searchTerm, filterStatus, sortField, sortDirection]);

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
          <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600 mt-1">Manage and track all your company contacts</p>
        </div>
        {user?.role !== 'developer' && (
          <button
            onClick={() => navigate('/add-company')}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Company
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-blue-100">
              <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Companies</p>
              <p className="text-2xl font-bold text-gray-900">{companies?.length || 0}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-green-100">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Responded</p>
              <p className="text-2xl font-bold text-gray-900">
                {companies?.filter(c => c.status === 'Responded' || c.status === 'Shortlisted').length || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-yellow-100">
              <EnvelopeIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Contacted</p>
              <p className="text-2xl font-bold text-gray-900">
                {companies?.filter(c => c.status !== 'New').length || 0}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-lg bg-indigo-100">
              <UserGroupIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Shortlisted</p>
              <p className="text-2xl font-bold text-gray-900">
                {companies?.filter(c => c.status === 'Shortlisted').length || 0}
              </p>
            </div>
          </div>
        </div>
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
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex gap-3">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="All">All Status</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Responded">Responded</option>
              <option value="Shortlisted">Shortlisted</option>
              <option value="Rejected">Rejected</option>
            </select>
            
            <button className="flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200">
              <FunnelIcon className="h-5 w-5 text-gray-600 mr-2" />
              Filter
            </button>
          </div>
        </div>
      </div>

      {/* Companies Table */}
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
                      <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        <BuildingOfficeIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-2">
                        <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{company.name}</div>
                        <div className="text-xs text-gray-500 truncate max-w-xs">{company.website}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 truncate max-w-xs">{company.contactPerson}</div>
                    <div className="text-xs text-gray-500 truncate max-w-xs">{company.position}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <div className="flex items-center text-xs text-gray-600">
                        <PhoneIcon className="h-3 w-3 mr-1 text-gray-400" />
                        {company.phone}
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <EnvelopeIcon className="h-3 w-3 mr-1 text-gray-400" />
                        {company.email}
                      </div>
                      <div className="flex items-center text-xs text-gray-600">
                        <MapPinIcon className="h-3 w-3 mr-1 text-gray-400" />
                        {company.location}
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(company.status)}`}>
                      {getStatusIcon(company.status)}
                      <span className="ml-1">{company.status}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => navigate(`/companies/${company.id}`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {filteredCompanies.length === 0 && (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No companies</h3>
            <p className="mt-1 text-sm text-gray-500">
              {user?.role === 'developer' 
                ? 'No companies found matching your search criteria.' 
                : 'Get started by creating a new company.'
              }
            </p>
            {user?.role !== 'developer' && (
              <div className="mt-6">
                <button
                  onClick={() => navigate('/add-company')}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add Company
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompaniesPage;