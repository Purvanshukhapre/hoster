import React, { useMemo, useState } from 'react';
import { useCompanyContext } from '../hooks/useCompanyContext';
import { useNavigate } from 'react-router-dom';
import { 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  ChevronDownIcon,
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  XMarkIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  CheckCircleIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  StarIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const ShortlistedPage = () => {
  const { companies, toggleShortlist } = useCompanyContext();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  // Filter shortlisted companies
  const shortlistedCompanies = useMemo(() => {
    let filtered = companies.filter(company => company.isShortlisted);

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
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
  }, [companies, searchTerm, sortConfig]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleRemoveFromShortlist = (companyId) => {
    toggleShortlist(companyId, false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Shortlisted Companies</h1>
          <p className="mt-1 text-sm text-gray-500">Companies that have been shortlisted for partnerships</p>
        </div>
        <button
          onClick={() => navigate('/companies')}
          className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-all duration-200"
        >
          View All Companies
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg p-3 text-white shadow-lg">
          <div className="flex items-center">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <UserGroupIcon className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-purple-100">Total</p>
              <p className="text-lg font-bold">{shortlistedCompanies.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg p-3 text-white shadow-lg">
          <div className="flex items-center">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <CheckCircleIcon className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-green-100">With Responses</p>
              <p className="text-lg font-bold">
                {shortlistedCompanies.filter(c => c.responses.length > 0).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-blue-500 to-sky-600 rounded-lg p-3 text-white shadow-lg">
          <div className="flex items-center">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <DocumentTextIcon className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-blue-100">With Requirements</p>
              <p className="text-lg font-bold">
                {shortlistedCompanies.filter(c => c.requirements).length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-amber-600 rounded-lg p-3 text-white shadow-lg">
          <div className="flex items-center">
            <div className="p-1.5 bg-white/20 rounded-lg">
              <EnvelopeIcon className="h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-xs font-medium text-yellow-100">Contacted</p>
              <p className="text-lg font-bold">
                {shortlistedCompanies.filter(c => c.status !== 'New').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Search */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm transition-all duration-200"
              placeholder="Search shortlisted companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Sort */}
          <div className="relative">
            <select
              className="block w-full pl-3 pr-10 py-2 border border-gray-300 rounded-lg leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent sm:text-sm transition-all duration-200"
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
              {shortlistedCompanies.length > 0 ? (
                shortlistedCompanies.map((company) => (
                  <tr key={company.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-xs">{company.name.charAt(0)}</span>
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900 truncate max-w-[100px]">{company.name}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[100px]">{company.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 truncate max-w-[80px]">{company.industry}</div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        {company.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[0.7rem] font-medium bg-purple-100 text-purple-800">
                            {tag}
                          </span>
                        ))}
                        {company.tags.length > 2 && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[0.7rem] font-medium bg-gray-100 text-gray-800">
                            +{company.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <a 
                        href={company.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-purple-600 hover:text-purple-800 font-medium flex items-center transition-colors duration-200 truncate max-w-[80px]"
                      >
                        <ArrowUpIcon className="w-2.5 h-2.5 mr-1 rotate-45" />
                        {company.website.replace('https://', '').replace('http://', '').substring(0, 15)}{company.website.length > 15 ? '...' : ''}
                      </a>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500 truncate max-w-[100px]">
                      {company.email}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-xs text-gray-500">
                      {company.dateAdded}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 inline-flex text-[0.7rem] leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        {company.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-1">
                        <button
                          onClick={() => navigate(`/compose-email?companyId=${company.id}`)}
                          className="p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors duration-200"
                          title="Compose Email"
                        >
                          <PencilSquareIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/responses?companyId=${company.id}`)}
                          className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors duration-200"
                          title="View Responses"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/requirements?companyId=${company.id}`)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                          title="View Requirements"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleRemoveFromShortlist(company.id)}
                          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Remove from Shortlist"
                        >
                          <XMarkIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <StarIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No shortlisted companies found</h3>
                      <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comparison Summary */}
      {shortlistedCompanies.length > 0 && (
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
          <h3 className="text-md font-semibold text-gray-900 mb-3 flex items-center">
            <StarIcon className="h-4 w-4 text-yellow-500 mr-2" />
            Shortlisted Companies Summary
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {shortlistedCompanies.map((company) => (
              <div key={company.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow duration-200">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-gray-900 text-sm truncate">{company.name}</h4>
                  <span className="text-[0.7rem] px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded-full font-medium">
                    {company.status}
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1 truncate">{company.industry}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {company.tags.slice(0, 3).map((tag, index) => (
                    <span key={index} className="inline-flex items-center px-1 py-0.5 rounded-full text-[0.7rem] font-medium bg-purple-100 text-purple-800">
                      {tag}
                    </span>
                  ))}
                  {company.tags.length > 3 && (
                    <span className="inline-flex items-center px-1 py-0.5 rounded-full text-[0.7rem] font-medium bg-gray-100 text-gray-800">
                      +{company.tags.length - 3}
                    </span>
                  )}
                </div>
                <div className="mt-3 pt-2 border-t border-gray-100 text-[0.7rem] text-gray-500 flex justify-between">
                  <div>Resp: {company.responses.length}</div>
                  <div>Req: {company.requirements ? 'Y' : 'N'}</div>
                  <div>{company.dateAdded}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ShortlistedPage;