import React, { useMemo } from 'react';
import { useCompanyContext } from '../hooks/useCompanyContext';
import { useAuth } from '../hooks/useAuth';
import { 
  BuildingOfficeIcon, 
  EnvelopeIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  ArrowTrendingUpIcon,
  CheckCircleIcon,
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

const RecentActivity = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
          <BuildingOfficeIcon className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Added new company</p>
          <p className="text-sm text-gray-500">Tech Innovations Inc.</p>
        </div>
        <span className="text-xs text-gray-500">2 hours ago</span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircleIcon className="h-5 w-5 text-green-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Response received</p>
          <p className="text-sm text-gray-500">Data Systems Ltd.</p>
        </div>
        <span className="text-xs text-gray-500">4 hours ago</span>
      </div>
      <div className="flex items-center space-x-4">
        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
          <UserGroupIcon className="h-5 w-5 text-purple-600" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">Shortlisted</p>
          <p className="text-sm text-gray-500">Cloud Solutions Group</p>
        </div>
        <span className="text-xs text-gray-500">1 day ago</span>
      </div>
    </div>
  </div>
);

const QuickActions = ({ user }) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
    <div className="grid grid-cols-2 gap-3">
      <a href="/add-company" className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200">
        <PlusIcon className="h-5 w-5 text-blue-600 mr-2" />
        <span className="text-sm font-medium text-gray-700">Add Company</span>
      </a>
      <a href="/compose-email" className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200">
        <EnvelopeIcon className="h-5 w-5 text-blue-600 mr-2" />
        <span className="text-sm font-medium text-gray-700">Compose Email</span>
      </a>
      <a href="/analytics" className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200">
        <ChartBarIcon className="h-5 w-5 text-blue-600 mr-2" />
        <span className="text-sm font-medium text-gray-700">View Analytics</span>
      </a>
      {user?.role === 'admin' && (
        <a href="/manage-users" className="flex items-center justify-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200">
          <UserGroupIcon className="h-5 w-5 text-blue-600 mr-2" />
          <span className="text-sm font-medium text-gray-700">Manage Users</span>
        </a>
      )}
    </div>
  </div>
);

// Add new component for employee company breakdown
const EmployeeCompanyBreakdown = ({ companies, user }) => {
  if (user?.role !== 'admin') return null;
  
  // Calculate company count per employee
  const employeeCompanyCounts = {};
  const employeeDetails = {};
  
  companies?.forEach(company => {
    const creatorId = company.creatorId || company.createdBy || company.creator;
    if (creatorId) {
      // Store employee details to use proper names if available
      if (!employeeDetails[creatorId]) {
        employeeDetails[creatorId] = {
          name: company.creatorName || company.createdByName || company.creatorInfo?.name || `Employee ${creatorId.substring(0, 8)}...`,
          email: company.creatorEmail || company.createdByEmail || company.creatorInfo?.email || ''
        };
      }
      
      if (employeeCompanyCounts[creatorId]) {
        employeeCompanyCounts[creatorId]++;
      } else {
        employeeCompanyCounts[creatorId] = 1;
      }
    }
  });
  
  // Convert to array and sort by count (descending)
  const sortedEmployeeCounts = Object.entries(employeeCompanyCounts)
    .map(([employeeId, count]) => ({ 
      employeeId, 
      count,
      name: employeeDetails[employeeId]?.name || `Employee ${employeeId.substring(0, 8)}...`
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Show top 5 employees
  
  if (sortedEmployeeCounts.length === 0) return null;
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Company Counts</h3>
      <div className="space-y-3">
        {sortedEmployeeCounts.map(({ employeeId, name, count }) => (
          <div key={employeeId} className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">{name}</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {count} {count === 1 ? 'company' : 'companies'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

const DashboardPage = () => {
  const { companies, loading } = useCompanyContext();
  const { user } = useAuth();
  
  // Calculate stats using useMemo to avoid recalculating on every render
  const stats = useMemo(() => {
    if (!companies) return { totalCompanies: 0, contacted: 0, responded: 0, shortlisted: 0 };
    
    // Filter companies based on user role
    const filteredCompanies = user?.role === 'employee' 
      ? companies.filter(c => c.creatorId === user.id || c.createdBy === user.id || c.creator === user.id)
      : companies;
    
    const total = filteredCompanies.length;
    const contacted = filteredCompanies.filter(c => c.status !== 'New').length;
    const responded = filteredCompanies.filter(c => c.status === 'Responded' || c.status === 'Shortlisted').length;
    const shortlisted = filteredCompanies.filter(c => c.status === 'Shortlisted').length;

    return {
      totalCompanies: total,
      contacted,
      responded,
      shortlisted
    };
  }, [companies, user]);

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
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, {user?.name}! Here's what's happening today.</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Companies"
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

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Outreach Progress</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <ChartBarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Chart visualization will appear here</p>
                <p className="text-sm text-gray-400 mt-1">Track your outreach metrics over time</p>
              </div>
            </div>
          </div>
        </div>
        <RecentActivity />
      </div>

      {/* Employee Company Breakdown for Admins */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EmployeeCompanyBreakdown companies={companies} user={user} />
        </div>
        <QuickActions user={user} />
      </div>
    </div>
  );
};

export default DashboardPage;