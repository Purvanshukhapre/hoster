import { useState, useEffect } from 'react';
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
  UserCircleIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { selectedCompany, setSelectedCompany, companies } = useCompanyContext();
  const location = useLocation();
  const navigate = useNavigate();
  
  // Handle window resize separately
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    
    handleResize(); // Check on mount
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
  // Close sidebar on location change for large screens
  useEffect(() => {
    if (window.innerWidth >= 1024) {
      Promise.resolve().then(() => {
        setSidebarOpen(false);
      });
    }
  }, [location]);

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
          { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
          { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
          { name: 'Manage Users', href: '/manage-users', icon: UserGroupIcon },
        ] 
      : []),
    { name: 'Companies', href: '/companies', icon: BuildingOfficeIcon },
    { name: 'Add Company', href: '/add-company', icon: PlusCircleIcon },
    { name: 'Compose Email', href: '/compose-email', icon: EnvelopeIcon },
    { name: 'Email Tracker', href: '/email-tracker', icon: ClipboardDocumentListIcon },
    { name: 'Shortlist', href: '/shortlist', icon: UserGroupIcon },
    { name: 'Profile', href: '/profile', icon: UserCircleIcon },
  ];

  const bottomNavigation = [
    { name: 'Logout', href: '#', onClick: handleLogout, icon: ArrowLeftOnRectangleIcon },
  ];

  const getRoleColor = (role) => {
    switch(role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'employee': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 z-50 w-64 bg-white border-r border-gray-200 shadow-lg transform transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">EO</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Elite Hoster</h1>
                <p className="text-xs text-gray-500">Professional Suite</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <XMarkIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* User profile */}
          {user && (
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">{user.name?.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                  <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                    {user.role}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={item.onClick}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Bottom navigation */}
          <div className="p-4 border-t border-gray-100">
            {bottomNavigation.map((item) => (
              <button
                key={item.name}
                onClick={item.onClick}
                className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-all duration-200"
              >
                <item.icon className="w-5 h-5 mr-3 text-gray-500" />
                <span>{item.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              >
                <Bars3Icon className="h-6 w-6 text-gray-600" />
              </button>
              
              {/* Page title */}
              <div>
                {location.pathname !== '/dashboard' && location.pathname !== '/companies' && location.pathname !== '/add-company' && location.pathname !== '/compose-email' && location.pathname !== '/email-tracker' && location.pathname !== '/shortlist' && location.pathname !== '/analytics' && location.pathname !== '/manage-users' && location.pathname !== '/profile' && !location.pathname.startsWith('/companies/') && (
                  <h1 className="text-2xl font-bold text-gray-900 capitalize">
                    {location.pathname.split('/').pop().replace(/-/g, ' ') || 'Dashboard'}
                  </h1>
                )}
              </div>
            </div>

            {/* Right side controls */}
            <div className="flex items-center space-x-4">
              {/* Company selector */}
              <div className="relative hidden md:block">
                <select
                  value={selectedCompany?.id || ''}
                  onChange={(e) => {
                    const company = companies.find(c => c.id === parseInt(e.target.value));
                    if (company) handleCompanySelect(company);
                  }}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg"
                >
                  <option value="">All Companies</option>
                  {companies.map((company) => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* User menu */}
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">{user.name?.charAt(0)}</span>
                  </div>
                  <div className="hidden md:block">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;