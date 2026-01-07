import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useCompanyContext } from '../hooks/useCompanyContext';
import { 
  HomeIcon, 
  BuildingOfficeIcon, 
  PlusCircleIcon, 
  EnvelopeIcon, 
  ClipboardDocumentListIcon,
  DocumentTextIcon,
  TableCellsIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  ArrowLeftOnRectangleIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { selectedCompany, setSelectedCompany } = useCompanyContext();
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  
  const handleCompanySelect = (company) => {
    setSelectedCompany(company);
    navigate(`/companies/${company.id}`);
  };

  // Navigation items based on user role
  const navigation = [
    ...(user?.role === 'admin' 
      ? [
          { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
          { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
          { name: 'Manage Users', href: '/manage-users', icon: UserGroupIcon },
        ] 
      : []),
    { name: 'Companies', href: '/companies', icon: BuildingOfficeIcon },
    { name: 'Add Company', href: '/add-company', icon: PlusCircleIcon },
    { name: 'Compose Email', href: '/compose-email', icon: EnvelopeIcon },
    { name: 'Email Tracker', href: '/email-tracker', icon: ClipboardDocumentListIcon },
    { name: 'Shortlisted', href: '/shortlisted', icon: UserGroupIcon },
    { name: 'Profile', href: '/profile', icon: UserCircleIcon },

    // Logout button appears for both admin and user
    { name: 'Logout', href: '#', onClick: handleLogout, icon: ArrowLeftOnRectangleIcon },
  ];

  const userNavigation = navigation;

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div className={`hidden lg:block fixed inset-y-0 z-50 w-64 bg-gradient-to-b from-blue-800 to-blue-900 shadow-xl`}>
        <div className="flex items-center justify-between h-16 px-6 bg-blue-900">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EO</span>
            </div>
            <h1 className="text-xl font-bold text-white">EliteOutreach</h1>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-1">
            {userNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  {item.onClick ? (
                    <button
                      onClick={item.onClick}
                      className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group text-blue-100 hover:bg-blue-700 hover:text-white hover:shadow-md"
                    >
                      <item.icon className="w-5 h-5 mr-3 transition-colors duration-200 text-blue-300 group-hover:text-white" />
                      <span className="truncate">{item.name}</span>
                    </button>
                  ) : (
                    <Link
                      to={item.href}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                        isActive
                          ? 'bg-blue-700 text-white shadow-md'
                          : 'text-blue-100 hover:bg-blue-700 hover:text-white hover:shadow-md'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 mr-3 transition-colors duration-200 ${isActive ? 'text-white' : 'text-blue-300 group-hover:text-white'}`} />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 z-50 w-64 bg-gradient-to-b from-blue-800 to-blue-900 shadow-xl transition-all duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:hidden`}>
        <div className="flex items-center justify-between h-16 px-6 bg-blue-900">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EO</span>
            </div>
            <h1 className="text-xl font-bold text-white">EliteOutreach</h1>
          </div>
          <button
            type="button"
            className="text-gray-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-6 overflow-y-auto">
          <ul className="space-y-1">
            {userNavigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  {item.onClick ? (
                    <button
                      onClick={item.onClick}
                      className="flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group text-blue-100 hover:bg-blue-700 hover:text-white hover:shadow-md"
                    >
                      <item.icon className="w-5 h-5 mr-3 transition-colors duration-200 text-blue-300 group-hover:text-white" />
                      <span className="truncate">{item.name}</span>
                    </button>
                  ) : (
                    <Link
                      to={item.href}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 group ${
                        isActive
                          ? 'bg-blue-700 text-white shadow-md'
                          : 'text-blue-100 hover:bg-blue-700 hover:text-white hover:shadow-md'
                      }`}
                    >
                      <item.icon className={`w-5 h-5 mr-3 transition-colors duration-200 ${isActive ? 'text-white' : 'text-blue-300 group-hover:text-white'}`} />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-64 min-h-0">
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 bg-white/90 backdrop-blur-sm border-b border-gray-200 shadow-sm lg:hidden">
          <div className="flex items-center space-x-4">
            <button
              type="button"
              className="text-gray-500"
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="text-lg font-semibold text-gray-900">EliteOutreach</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                value={selectedCompany?.id || ''}
                onChange={(e) => {
                  const company = JSON.parse(e.target.value);
                  handleCompanySelect(company);
                }}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="">Select Company</option>
                {useCompanyContext().companies.map((company) => (
                  <option key={company.id} value={JSON.stringify(company)}>
                    {company.name}
                  </option>
                ))}
              </select>
            </div>
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs font-bold">{user.name.charAt(0)}</span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  title="Logout"
                >
                  <ArrowLeftOnRectangleIcon className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">U</span>
                </div>
            )}
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1 p-6 bg-gradient-to-br from-gray-50 to-gray-100 overflow-y-auto">
          <div className="w-full max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;