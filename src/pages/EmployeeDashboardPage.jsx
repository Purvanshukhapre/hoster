import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useCompanyContext } from '../hooks/useCompanyContext';
import { 
  BuildingOfficeIcon, 
  EnvelopeIcon, 
  UserGroupIcon, 
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  XCircleIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon, color, change }) => {
  const IconComponent = icon;
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
          {change && (
            <p className="text-sm text-green-600 mt-1 flex items-center">
              <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
              {change} from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <IconComponent className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const EmployeeDashboardPage = () => {
  const { companies, loading } = useCompanyContext();
  const { user } = useAuth();

  // Filter companies to only show those created by the current employee
  const employeeCompanies = companies?.filter(company => 
    company.creatorId === user?.id || 
    company.createdBy === user?.id || 
    company.creator === user?.id
  ) || [];

  // Calculate stats for employee's companies only
  const stats = {
    totalCompanies: employeeCompanies.length,
    contacted: employeeCompanies.filter(c => c.status !== 'New').length,
    responded: employeeCompanies.filter(c => c.status === 'Responded' || c.status === 'Shortlisted').length,
    shortlisted: employeeCompanies.filter(c => c.status === 'Shortlisted').length
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
          <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}! Here's what's happening with your companies.</p>
        </div>
        <div className="flex items-center space-x-3">
          <a 
            href="/add-company" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors duration-200"
          >
            Add Company
          </a>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="My Companies"
          value={stats.totalCompanies}
          icon={BuildingOfficeIcon}
          color="bg-blue-500"
          change="+12%"
        />
        <StatCard
          title="Contacted"
          value={stats.contacted}
          icon={EnvelopeIcon}
          color="bg-green-500"
          change="+8%"
        />
        <StatCard
          title="Responses"
          value={stats.responded}
          icon={CheckCircleIcon}
          color="bg-purple-500"
          change="+15%"
        />
        <StatCard
          title="Shortlisted"
          value={stats.shortlisted}
          icon={UserGroupIcon}
          color="bg-indigo-500"
          change="+5%"
        />
      </div>

      {/* My Companies Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">My Companies</h3>
          <a 
            href="/compose-email" 
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors duration-200"
          >
            Compose Email
          </a>
        </div>
        
        {employeeCompanies.length === 0 ? (
          <div className="text-center py-12">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No companies</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new company.
            </p>
            <div className="mt-6">
              <a 
                href="/add-company"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Company
              </a>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employeeCompanies.slice(0, 5).map((company) => (
                  <tr key={company.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{company.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{company.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        company.status === 'New' ? 'bg-gray-100 text-gray-800' :
                        company.status === 'Contacted' ? 'bg-yellow-100 text-yellow-800' :
                        company.status === 'Responded' ? 'bg-green-100 text-green-800' :
                        company.status === 'Shortlisted' ? 'bg-blue-100 text-blue-800' :
                        company.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {company.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeDashboardPage;