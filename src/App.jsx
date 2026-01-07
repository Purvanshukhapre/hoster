import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { useAuth } from './hooks/useAuth';
import { CompanyProvider } from './contexts/CompanyContext';
import MainLayout from './layouts/MainLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CompaniesPage from './pages/CompaniesPage';
import AddCompanyPage from './pages/AddCompanyPage';
import ComposeEmailPage from './pages/ComposeEmailPage';
import EmailTrackerPage from './pages/EmailTrackerPage';

import ShortlistPage from './pages/ShortlistPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ManageUsersPage from './pages/ManageUsersPage';
import CompanyDetailPage from './pages/CompanyDetailPage';
import EditCompanyPage from './pages/EditCompanyPage';
import ProfilePage from './pages/ProfilePage';

const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

const AppContent = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<PrivateRoute allowedRoles={['admin', 'employee']}><MainLayout><DashboardPage /></MainLayout></PrivateRoute>} />
      <Route path="/companies" element={<PrivateRoute allowedRoles={['admin', 'employee']}><MainLayout><CompaniesPage /></MainLayout></PrivateRoute>} />
      <Route path="/add-company" element={<PrivateRoute allowedRoles={['admin', 'employee']}><MainLayout><AddCompanyPage /></MainLayout></PrivateRoute>} />
      <Route path="/compose-email" element={<PrivateRoute allowedRoles={['admin', 'employee']}><MainLayout><ComposeEmailPage /></MainLayout></PrivateRoute>} />
      <Route path="/email-tracker" element={<PrivateRoute allowedRoles={['admin', 'employee']}><MainLayout><EmailTrackerPage /></MainLayout></PrivateRoute>} />
      <Route path="/shortlist" element={<PrivateRoute allowedRoles={['admin', 'employee']}><MainLayout><ShortlistPage /></MainLayout></PrivateRoute>} />
      <Route path="/analytics" element={<PrivateRoute allowedRoles={['admin', 'employee']}><MainLayout><AnalyticsPage /></MainLayout></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute allowedRoles={['admin', 'employee']}><MainLayout><ProfilePage /></MainLayout></PrivateRoute>} />
      
      {/* Admin-only routes */}
      <Route
        path="/manage-users"
        element={
          <PrivateRoute allowedRoles={['admin']}>
            <MainLayout><ManageUsersPage /></MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/companies/:id"
        element={
          <PrivateRoute allowedRoles={['admin', 'employee']}>
            <MainLayout><CompanyDetailPage /></MainLayout>
          </PrivateRoute>
        }
      />
      <Route
        path="/companies/:id/edit"
        element={
          <PrivateRoute allowedRoles={['admin', 'employee']}>
            <MainLayout><EditCompanyPage /></MainLayout>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <CompanyProvider>
          <AppContent />
        </CompanyProvider>
      </AuthProvider>
    </Router>
  );
};

export default App;