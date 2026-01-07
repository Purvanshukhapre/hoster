import React, { useState, useMemo, useEffect } from 'react';
import { useCompanyContext } from '../hooks/useCompanyContext';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ChevronDownIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  PlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  EllipsisVerticalIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  UserGroupIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import EditCompanyModal from '../components/EditCompanyModal';

const CompaniesPage = () => {
  const { user } = useAuth();
  const { companies, loading, deleteCompanyAPI, updateCompanyAPI } = useCompanyContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    industry: '',
    website: '',
    description: '',
    status: 'New'
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (openDropdownId) {
        setOpenDropdownId(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openDropdownId]);

  // Filter and search companies
  const filteredCompanies = useMemo(() => {
    let filtered = companies;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'All') {
      filtered = filtered.filter(company => company.status === statusFilter);
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [companies, searchTerm, statusFilter, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const statusOptions = ['All', 'New', 'Contacted', 'Responded', 'Shortlisted'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'New':
        return 'bg-gray-100 text-gray-800';
      case 'Contacted':
        return 'bg-blue-100 text-blue-800';
      case 'Responded':
        return 'bg-green-100 text-green-800';
      case 'Shortlisted':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading companies...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6 relative">
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
            <p className="mt-1 text-sm text-gray-500">Manage and track all your company contacts</p>
          </div>
          {user && (user.role === 'admin' || user.email === 'admin@elitehosters.com') && (
            <button
              onClick={() => navigate('/add-company')}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              Add Company
            </button>
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="bg-white rounded-lg p-3 shadow border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 bg-blue-100 rounded-lg">
                <BuildingOfficeIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Total</p>
                <p className="text-lg font-bold text-gray-900">{companies.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 bg-green-100 rounded-lg">
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Responded</p>
                <p className="text-lg font-bold text-gray-900">{companies.filter(c => c.status === 'Responded' || c.status === 'Shortlisted').length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 bg-purple-100 rounded-lg">
                <UserGroupIcon className="w-5 h-5 text-purple-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Shortlisted</p>
                <p className="text-lg font-bold text-gray-900">{companies.filter(c => c.isShortlisted).length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg p-3 shadow border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 bg-yellow-100 rounded-lg">
                <EnvelopeIcon className="w-5 h-5 text-yellow-600" />
              </div>
              <div className="ml-3">
                <p className="text-xs font-medium text-gray-600">Contacted</p>
                <p className="text-lg font-bold text-gray-900">{companies.filter(c => c.status !== 'New').length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            {/* Search */}
            <div className="relative md:col-span-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200"
                placeholder="Search companies..."
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

            {/* Sort */}
            <div className="relative">
              <select
                className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all duration-200"
                value={`${sortConfig.key}-${sortConfig.direction}`}
                onChange={(e) => {
                  const [key, direction] = e.target.value.split('-');
                  setSortConfig({ key, direction });
                }}
              >
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="dateAdded-asc">Date Added</option>
                <option value="dateAdded-desc">Date Added</option>
                <option value="industry-asc">Industry A-Z</option>
                <option value="industry-desc">Industry Z-A</option>
              </select>
            </div>
          </div>
        </div>

        {/* Companies Table */}
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors duration-200"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Company</span>
                      {sortConfig.key === 'name' && (
                        <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${sortConfig.direction === 'desc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors duration-200"
                    onClick={() => handleSort('industry')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Industry</span>
                      {sortConfig.key === 'industry' && (
                        <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${sortConfig.direction === 'desc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Website
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th 
                    scope="col" 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-gray-700 transition-colors duration-200"
                    onClick={() => handleSort('dateAdded')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Date</span>
                      {sortConfig.key === 'dateAdded' && (
                        <ChevronDownIcon className={`h-4 w-4 transition-transform duration-200 ${sortConfig.direction === 'desc' ? 'transform rotate-180' : ''}`} />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCompanies.length > 0 ? (
                  filteredCompanies.map((company) => (
                    <tr key={company.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xs">{(company.name || company.companyName || 'C').charAt(0)}</span>
                          </div>
                          <div className="ml-3">
                            <Link to={`/companies/${company.id}`} className="text-sm font-medium text-indigo-600 hover:text-indigo-900 truncate max-w-[100px] block">
                              {company.name || company.companyName || 'Unnamed Company'}
                            </Link>
                            <div className="text-xs text-gray-500 truncate max-w-[100px]">{company.description || 'No description'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="text-sm text-gray-900 truncate max-w-[80px]">{company.industry || 'N/A'}</div>
                        {company.document && (
                          <div className="mt-1 flex items-center text-xs text-gray-600">
                            <svg className="h-3 w-3 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            {company.document.name}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <a 
                          href={company.website || company.websiteUrl || '#'} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center transition-colors duration-200 truncate max-w-[80px]"
                        >
                          <ArrowUpIcon className="w-2.5 h-2.5 mr-1 rotate-45" />
                          {(company.website || company.websiteUrl || '').replace('https://', '').replace('http://', '').substring(0, 15)}{(company.website || company.websiteUrl || '').length > 15 ? '...' : ''}
                        </a>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 truncate max-w-[100px]">
                        {company.email || company.companyEmail || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                        {company.dateAdded || company.createdAt || 'N/A'}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-[0.7rem] leading-5 font-semibold rounded-full ${getStatusColor(company.status)}`}>
                          {company.status || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-1">
                          <Link
                            to={`/companies/${company.id}`}
                            className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                            title="View Details"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </Link>
                          {/* Dropdown menu for additional actions */}
                          <div className="relative">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenDropdownId(openDropdownId === company.id ? null : company.id);
                              }}
                              className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200"
                            >
                              <EllipsisVerticalIcon className="h-4 w-4" />
                            </button>
                            {/* Admin-only dropdown menu */}
                            {openDropdownId === company.id && (
                              <div 
                                className="absolute right-0 z-10 mt-1 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                              >
                                <div className="py-1">
                                  {user && (user.role === 'admin' || user.email === 'admin@elitehosters.com') && (
                                    <>
                                      <button
                                        onClick={() => {
                                          // Set the editing company and populate form data
                                          setEditingCompany(company);
                                          setEditFormData({
                                            name: company.name || '',
                                            email: company.email || '',
                                            industry: company.industry || '',
                                            website: company.website || '',
                                            description: company.description || '',
                                            status: company.status || 'New'
                                          });
                                          setEditModalOpen(true);
                                          setOpenDropdownId(null);
                                        }}
                                        className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                                      >
                                        Edit Company
                                      </button>
                                      <button
                                        onClick={async () => {
                                          if (window.confirm('Are you sure you want to delete this company?')) {
                                            try {
                                              await deleteCompanyAPI(company.id);
                                            } catch (error) {
                                              console.error('Error deleting company:', error);
                                            }
                                          }
                                          setOpenDropdownId(null);
                                        }}
                                        className="block w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left"
                                      >
                                        Delete Company
                                      </button>
                                    </>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                          <BuildingOfficeIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No companies found</h3>
                        <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        <div className="bg-white px-4 py-2 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between sm:justify-end">
            <button className="relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">
              Previous
            </button>
            <button className="ml-2 relative inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">
              Next
            </button>
          </div>
        </div>
      </div>

      <EditCompanyModal
        isOpen={editModalOpen}
        company={editingCompany}
        formData={editFormData}
        setFormData={setEditFormData}
        onClose={() => setEditModalOpen(false)}
        onSave={async () => {
          try {
            // Map the form data to match backend field names
            const companyDataToSend = {
              ...editFormData,
              companyName: editFormData.name,
              companyEmail: editFormData.email,
              websiteUrl: editFormData.website,
              dateAdded: editingCompany.dateAdded || new Date().toISOString().split('T')[0]
            };
            
            // Remove the name and email fields since we're using the mapped versions
            delete companyDataToSend.name;
            delete companyDataToSend.email;
            delete companyDataToSend.website;
            
            await updateCompanyAPI(editingCompany.id, companyDataToSend);
            setEditModalOpen(false);
          } catch (error) {
            console.error('Error updating company:', error);
          }
        }}
      />
    </div>
  );
};

export default CompaniesPage;