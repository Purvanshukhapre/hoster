import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CompanyProvider } from './contexts/CompanyContext';
import { AuthProvider } from './contexts/AuthContext';
import MainLayout from './layouts/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import CompanyDetailsPage from './pages/CompanyDetailsPage';
import DashboardPage from './pages/DashboardPage';
import CompaniesPage from './pages/CompaniesPage';
import AddCompanyPage from './pages/AddCompanyPage';
import ComposeEmailPage from './pages/ComposeEmailPage';

import ShortlistedPage from './pages/ShortlistedPage';
import AnalyticsPage from './pages/AnalyticsPage';
import EmailTrackerPage from './pages/EmailTrackerPage';
import UserProfilePage from './pages/UserProfilePage';
import ManageUsersPage from './pages/ManageUsersPage';

function App() {
  return (
    <AuthProvider>
      <CompanyProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <MainLayout><DashboardPage /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <MainLayout><DashboardPage /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/companies" element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <MainLayout><CompaniesPage /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/companies/:id" element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <MainLayout><CompanyDetailsPage /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/add-company" element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <MainLayout><AddCompanyPage /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/edit-company/:id" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MainLayout><AddCompanyPage isEdit={true} /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/compose-email" element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <MainLayout><ComposeEmailPage /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/email-tracker" element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <MainLayout><EmailTrackerPage /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <MainLayout><AnalyticsPage /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/shortlisted" element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <MainLayout><ShortlistedPage /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute allowedRoles={['admin', 'employee']}>
                <MainLayout><UserProfilePage /></MainLayout>
              </ProtectedRoute>
            } />
            <Route path="/manage-users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <MainLayout><ManageUsersPage /></MainLayout>
              </ProtectedRoute>
            } />
          </Routes>
        </Router>
      </CompanyProvider>
    </AuthProvider>
  );
}

export default App;