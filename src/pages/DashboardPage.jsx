import React, { useMemo } from 'react';
import { useCompanyContext } from '../hooks/useCompanyContext';
import { 
  BuildingOfficeIcon, 
  EnvelopeIcon, 
  CheckCircleIcon, 
  UserGroupIcon,
  ArrowTrendingUpIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const { companies } = useCompanyContext();
  
  const stats = useMemo(() => {
    const totalCompanies = companies.length;
    const emailsSent = companies.filter(company => 
      company.status !== 'New' && company.status !== 'Contacted'
    ).length;
    const responsesReceived = companies.filter(company => 
      company.status === 'Responded' || company.status === 'Shortlisted'
    ).length;
    const shortlistedCompanies = companies.filter(company => 
      company.isShortlisted
    ).length;

    return {
      totalCompanies,
      emailsSent,
      responsesReceived,
      shortlistedCompanies
    };
  }, [companies]);

  // Mock chart data for outreach progress
  const chartData = [
    { name: 'Jan 1', companies: 2 },
    { name: 'Jan 8', companies: 5 },
    { name: 'Jan 15', companies: 7 },
    { name: 'Jan 22', companies: 9 },
    { name: 'Jan 29', companies: 12 }
  ];

  // Recent activity data
  const recentActivity = [
    { id: 1, action: 'Added new company', company: 'Tech Innovations Inc.', time: '2 hours ago', type: 'add' },
    { id: 2, action: 'Sent email to', company: 'Data Systems Ltd.', time: '4 hours ago', type: 'email' },
    { id: 3, action: 'Received response from', company: 'Cloud Solutions Group', time: '1 day ago', type: 'response' },
    { id: 4, action: 'Shortlisted', company: 'Mobile First Studios', time: '2 days ago', type: 'shortlist' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <ChartBarIcon className="w-5 h-5" />
          <span>Overview</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm font-medium">Total Companies</p>
              <p className="text-3xl font-bold mt-1">{stats.totalCompanies}</p>
              <div className="flex items-center mt-2">
                <ArrowUpIcon className="w-4 h-4 text-blue-200" />
                <span className="text-blue-200 text-xs ml-1">+12% from last week</span>
              </div>
            </div>
            <div className="p-3 bg-blue-400 rounded-lg">
              <BuildingOfficeIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm font-medium">Emails Sent</p>
              <p className="text-3xl font-bold mt-1">{stats.emailsSent}</p>
              <div className="flex items-center mt-2">
                <ArrowUpIcon className="w-4 h-4 text-green-200" />
                <span className="text-green-200 text-xs ml-1">+8% from last week</span>
              </div>
            </div>
            <div className="p-3 bg-green-400 rounded-lg">
              <EnvelopeIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm font-medium">Responses</p>
              <p className="text-3xl font-bold mt-1">{stats.responsesReceived}</p>
              <div className="flex items-center mt-2">
                <ArrowUpIcon className="w-4 h-4 text-yellow-200" />
                <span className="text-yellow-200 text-xs ml-1">+15% from last week</span>
              </div>
            </div>
            <div className="p-3 bg-yellow-400 rounded-lg">
              <CheckCircleIcon className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm font-medium">Shortlisted</p>
              <p className="text-3xl font-bold mt-1">{stats.shortlistedCompanies}</p>
              <div className="flex items-center mt-2">
                <ArrowUpIcon className="w-4 h-4 text-purple-200" />
                <span className="text-purple-200 text-xs ml-1">+5% from last week</span>
              </div>
            </div>
            <div className="p-3 bg-purple-400 rounded-lg">
              <UserGroupIcon className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Outreach Progress Chart */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Outreach Progress</h2>
            <div className="flex items-center text-sm text-gray-500">
              <ArrowTrendingUpIcon className="w-4 h-4 mr-1" />
              <span>+12.5% this month</span>
            </div>
          </div>
          <div className="h-64 flex items-end space-x-2">
            {chartData.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg hover:from-blue-600 hover:to-blue-500 transition-all duration-300"
                  style={{ height: `${(item.companies / 12) * 100}%` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2 font-medium">{item.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  activity.type === 'add' ? 'bg-blue-100 text-blue-600' :
                  activity.type === 'email' ? 'bg-green-100 text-green-600' :
                  activity.type === 'response' ? 'bg-yellow-100 text-yellow-600' :
                  'bg-purple-100 text-purple-600'
                }`}>
                  {activity.type === 'add' && <BuildingOfficeIcon className="w-4 h-4" />}
                  {activity.type === 'email' && <EnvelopeIcon className="w-4 h-4" />}
                  {activity.type === 'response' && <CheckCircleIcon className="w-4 h-4" />}
                  {activity.type === 'shortlist' && <UserGroupIcon className="w-4 h-4" />}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.action}</span> <span className="font-medium text-blue-600">{activity.company}</span>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Companies */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Top Companies</h2>
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View All →
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Industry</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {companies.slice(0, 5).map((company) => (
                <tr key={company.id} className="hover:bg-gray-50 transition-colors duration-150">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{company.name}</div>
                    <div className="text-sm text-gray-500">{company.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.industry}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      company.status === 'New' ? 'bg-gray-100 text-gray-800' :
                      company.status === 'Contacted' ? 'bg-blue-100 text-blue-800' :
                      company.status === 'Responded' ? 'bg-green-100 text-green-800' :
                      'bg-purple-100 text-purple-800'
                    }`}>
                      {company.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{company.dateAdded}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                    <button className="text-gray-600 hover:text-gray-900">Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;