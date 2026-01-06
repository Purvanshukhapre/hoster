import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  ChartBarIcon
} from '@heroicons/react/24/outline';

const MainLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: ChartBarIcon },
    { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
    { name: 'Companies', href: '/companies', icon: BuildingOfficeIcon },
    { name: 'Add Company', href: '/add-company', icon: PlusCircleIcon },
    { name: 'Compose Email', href: '/compose-email', icon: EnvelopeIcon },
    { name: 'Responses', href: '/responses', icon: ClipboardDocumentListIcon },
    { name: 'Requirements', href: '/requirements', icon: DocumentTextIcon },
    { name: 'Shortlisted', href: '/shortlisted', icon: UserGroupIcon },
  ];

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
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
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
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
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
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">U</span>
            </div>
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