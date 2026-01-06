import React, { useMemo } from 'react';
import { useCompanyContext } from '../hooks/useCompanyContext';
import { 
  ChartBarIcon, 
  UserGroupIcon, 
  EnvelopeIcon, 
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline';

const AnalyticsPage = () => {
  const { companies } = useCompanyContext();

  // Calculate analytics data
  const analyticsData = useMemo(() => {
    const totalCompanies = companies.length;
    const contactedCompanies = companies.filter(company => 
      company.status !== 'New'
    ).length;
    const respondedCompanies = companies.filter(company => 
      company.status === 'Responded' || company.status === 'Shortlisted'
    ).length;
    const shortlistedCompanies = companies.filter(company => 
      company.isShortlisted
    ).length;
    
    // Calculate response rate
    const responseRate = contactedCompanies > 0 
      ? Math.round((respondedCompanies / contactedCompanies) * 100) 
      : 0;
    
    // Calculate industry distribution
    const industryDistribution = companies.reduce((acc, company) => {
      acc[company.industry] = (acc[company.industry] || 0) + 1;
      return acc;
    }, {});
    
    // Calculate status distribution
    const statusDistribution = companies.reduce((acc, company) => {
      acc[company.status] = (acc[company.status] || 0) + 1;
      return acc;
    }, {});
    
    // Calculate monthly trends (assuming dateAdded is in format YYYY-MM-DD)
    const monthlyTrends = companies.reduce((acc, company) => {
      const month = company.dateAdded.substring(0, 7); // Extract YYYY-MM
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {});

    return {
      totalCompanies,
      contactedCompanies,
      respondedCompanies,
      shortlistedCompanies,
      responseRate,
      industryDistribution,
      statusDistribution,
      monthlyTrends
    };
  }, [companies]);

  // Get top industries
  const topIndustries = Object.entries(analyticsData.industryDistribution)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5);

  // Get status breakdown
  const statusBreakdown = Object.entries(analyticsData.statusDistribution);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Track and analyze your outreach performance</p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Companies</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.totalCompanies}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Responses</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.respondedCompanies}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Shortlisted</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.shortlistedCompanies}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <ArrowTrendingUpIcon className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Response Rate</p>
              <p className="text-3xl font-bold text-gray-900">{analyticsData.responseRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Industry Distribution */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <ChartBarIcon className="h-5 w-5 text-blue-500 mr-2" />
            Industry Distribution
          </h3>
          <div className="space-y-4">
            {topIndustries.map(([industry, count]) => (
              <div key={industry} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm font-medium text-gray-700">{industry}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
            Status Breakdown
          </h3>
          <div className="space-y-4">
            {statusBreakdown.map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-2 h-2 rounded-full mr-3 ${
                    status === 'New' ? 'bg-gray-400' :
                    status === 'Contacted' ? 'bg-blue-400' :
                    status === 'Responded' ? 'bg-green-400' :
                    status === 'Shortlisted' ? 'bg-purple-400' : 'bg-gray-400'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">{status}</span>
                </div>
                <span className="text-sm font-semibold text-gray-900">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Trends */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <ArrowTrendingUpIcon className="h-5 w-5 text-indigo-500 mr-2" />
          Monthly Activity Trends
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Month
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Companies Added
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trend
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(analyticsData.monthlyTrends)
                .sort((a, b) => a[0].localeCompare(b[0]))
                .map(([month, count]) => (
                  <tr key={month}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {month}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {count}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ArrowTrendingUpIcon className="h-4 w-4 text-green-500 mr-1" />
                        <span className="text-sm text-green-600 font-medium">+5%</span>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Insights */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white">
        <h3 className="text-lg font-semibold mb-2">Performance Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center">
              <ArrowTrendingUpIcon className="h-5 w-5 mr-2" />
              <span className="font-medium">Best Industry</span>
            </div>
            <p className="text-sm mt-1 opacity-90">
              {topIndustries[0] ? topIndustries[0][0] : 'N/A'} - {topIndustries[0] ? topIndustries[0][1] : 0} companies
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              <span className="font-medium">Success Rate</span>
            </div>
            <p className="text-sm mt-1 opacity-90">
              {analyticsData.responseRate}% response rate
            </p>
          </div>
          <div className="bg-white/10 rounded-lg p-4">
            <div className="flex items-center">
              <UserGroupIcon className="h-5 w-5 mr-2" />
              <span className="font-medium">Top Status</span>
            </div>
            <p className="text-sm mt-1 opacity-90">
              {statusBreakdown.length > 0 
                ? statusBreakdown.reduce((max, current) => 
                    current[1] > (max[1] || 0) ? current : max
                  )[0] || 'N/A'
                : 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsPage;