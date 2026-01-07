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
  const { companies, loading } = useCompanyContext();
  
  const stats = useMemo(() => {
    const totalCompanies = companies.length;
    const newCompanies = companies.filter(company => 
      company.status === 'New'
    ).length;
    const contactedCompanies = companies.filter(company => 
      company.status === 'Contacted'
    ).length;
    const respondedCompanies = companies.filter(company => 
      company.status === 'Responded'
    ).length;
    const shortlistedCompanies = companies.filter(company => 
      company.status === 'Shortlisted' || company.isShortlisted
    ).length;
    
    // Calculate response rate
    const contactedCount = companies.filter(company => 
      company.status !== 'New'
    ).length;
    const respondedCount = companies.filter(company => 
      company.status === 'Responded' || company.status === 'Shortlisted'
    ).length;
    const responseRate = contactedCount > 0 ? Math.round((respondedCount / contactedCount) * 100) : 0;

    return {
      totalCompanies,
      newCompanies,
      contactedCompanies,
      respondedCompanies,
      shortlistedCompanies,
      responseRate
    };
  }, [companies]);

  // Calculate industry distribution
  const industryDistribution = useMemo(() => {
    const distribution = {};
    companies.forEach(company => {
      distribution[company.industry] = (distribution[company.industry] || 0) + 1;
    });
    return Object.entries(distribution).slice(0, 5).map(([industry, count]) => ({
      name: industry,
      value: count
    }));
  }, [companies]);

  // Calculate status distribution
  const statusDistribution = useMemo(() => {
    const distribution = {};
    companies.forEach(company => {
      distribution[company.status] = (distribution[company.status] || 0) + 1;
    });
    return Object.entries(distribution).map(([status, count]) => ({
      name: status,
      value: count
    }));
  }, [companies]);

  // Calculate weekly activity
  const weeklyActivity = useMemo(() => {
    const weeks = {};
    const today = new Date();
    
    // Initialize weeks for the last 4 weeks
    for (let i = 3; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - (i * 7));
      const weekKey = `Week ${i + 1}`;
      weeks[weekKey] = 0;
    }
    
    companies.forEach(company => {
      const companyDate = new Date(company.dateAdded);
      const daysDiff = Math.floor((today - companyDate) / (1000 * 60 * 60 * 24));
      const weekDiff = Math.floor(daysDiff / 7);
      
      if (weekDiff < 4) {
        const weekKey = `Week ${4 - weekDiff}`;
        weeks[weekKey] = (weeks[weekKey] || 0) + 1;
      }
    });
    
    return Object.entries(weeks).map(([week, count]) => ({
      name: week,
      value: count
    }));
  }, [companies]);

  // Calculate response trends
  const responseTrends = useMemo(() => {
    const trend = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const companiesAdded = companies.filter(company => 
        company.dateAdded === dateStr
      ).length;
      
      const responded = companies.filter(company => 
        company.status === 'Responded' && company.dateAdded === dateStr
      ).length;
      
      trend.push({
        date: dateStr,
        added: companiesAdded,
        responded: responded
      });
    }
    
    return trend;
  }, [companies]);

  // Recent activity data
  const recentActivity = useMemo(() => {
    const activities = [];
    companies.forEach(company => {
      if (company.status !== 'New') {
        activities.push({
          id: company.id,
          action: `Status updated to ${company.status}`,
          company: company.name,
          time: company.dateAdded,
          type: 'status'
        });
      }
      if (company.responses && company.responses.length > 0) {
        company.responses.forEach(response => {
          activities.push({
            id: `${company.id}-${response.id}`,
            action: 'Received response',
            company: company.name,
            time: response.date,
            type: 'response'
          });
        });
      }
    });
    
    // Sort by date and take last 5
    return activities
      .sort((a, b) => new Date(b.time) - new Date(a.time))
      .slice(0, 5);
  }, [companies]);

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }
  
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
              <p className="text-green-100 text-sm font-medium">Contacted</p>
              <p className="text-3xl font-bold mt-1">{stats.contactedCompanies}</p>
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
              <p className="text-yellow-100 text-sm font-medium">Response Rate</p>
              <p className="text-3xl font-bold mt-1">{stats.responseRate}%</p>
              <div className="flex items-center mt-2">
                <ArrowUpIcon className="w-4 h-4 text-yellow-200" />
                <span className="text-yellow-200 text-xs ml-1">+5% from last week</span>
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
        {/* Industry Distribution Chart */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Industry Distribution</h2>
            <div className="flex items-center text-sm text-gray-500">
              <ChartBarIcon className="w-4 h-4 mr-1" />
              <span>Top 5 industries</span>
            </div>
          </div>
          <div className="space-y-4">
            {industryDistribution.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-24 text-sm text-gray-600 truncate">{item.name}</div>
                <div className="flex-1 ml-2">
                  <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                      style={{ width: `${(item.value / Math.max(...industryDistribution.map(i => i.value), 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-10 text-right text-sm text-gray-900 font-medium">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Status Distribution Chart */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Status Distribution</h2>
            <div className="flex items-center text-sm text-gray-500">
              <ChartBarIcon className="w-4 h-4 mr-1" />
              <span>Companies by status</span>
            </div>
          </div>
          <div className="space-y-4">
            {statusDistribution.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-24 text-sm text-gray-600 truncate">{item.name}</div>
                <div className="flex-1 ml-2">
                  <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                      style={{ width: `${(item.value / Math.max(...statusDistribution.map(i => i.value), 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-10 text-right text-sm text-gray-900 font-medium">{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Activity and Response Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Activity */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Weekly Activity</h2>
            <div className="flex items-center text-sm text-gray-500">
              <ChartBarIcon className="w-4 h-4 mr-1" />
              <span>Last 4 weeks</span>
            </div>
          </div>
          <div className="space-y-4">
            {weeklyActivity.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-24 text-sm text-gray-600 truncate">{item.name}</div>
                <div className="flex-1 ml-2">
                  <div className="h-6 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full"
                      style={{ width: `${(item.value / Math.max(...weeklyActivity.map(i => i.value), 1)) * 100}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-10 text-right text-sm text-gray-900 font-medium">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Response Trends */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Response Trends</h2>
            <div className="flex items-center text-sm text-gray-500">
              <ChartBarIcon className="w-4 h-4 mr-1" />
              <span>Last 7 days</span>
            </div>
          </div>
          <div className="space-y-4">
            {responseTrends.map((item, index) => (
              <div key={index} className="flex items-center">
                <div className="w-16 text-xs text-gray-600 truncate">{item.date.split('-')[2]}/{item.date.split('-')[1]}</div>
                <div className="w-20 text-xs text-gray-700">
                  <span className="text-blue-600">Added: {item.added}</span>
                </div>
                <div className="flex-1 ml-2">
                  <div className="h-6 bg-gray-200 rounded-full overflow-hidden flex items-center">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-400 rounded-full flex items-center justify-center text-xs text-white"
                      style={{ width: `${item.added > 0 ? 50 : 0}%` }}
                    >
                      {item.added}
                    </div>
                    <div 
                      className="h-full bg-gradient-to-r from-green-500 rounded-full flex items-center justify-center text-xs text-white"
                      style={{ width: `${item.responded > 0 ? 50 : 0}%` }}
                    >
                      {item.responded}
                    </div>
                  </div>
                </div>
                <div className="w-16 text-right text-xs text-gray-700">
                  <span className="text-green-600">Resp: {item.responded}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activity.type === 'status' ? 'bg-blue-100 text-blue-600' :
                activity.type === 'response' ? 'bg-green-100 text-green-600' :
                'bg-purple-100 text-purple-600'
              }`}>
                {activity.type === 'status' && <ChartBarIcon className="w-4 h-4" />}
                {activity.type === 'response' && <CheckCircleIcon className="w-4 h-4" />}
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