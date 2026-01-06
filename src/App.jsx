import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CompanyProvider } from './contexts/CompanyContext';
import MainLayout from './layouts/MainLayout';
import DashboardPage from './pages/DashboardPage';
import CompaniesPage from './pages/CompaniesPage';
import AddCompanyPage from './pages/AddCompanyPage';
import ComposeEmailPage from './pages/ComposeEmailPage';
import ResponsesPage from './pages/ResponsesPage';
import RequirementsPage from './pages/RequirementsPage';
import ShortlistedPage from './pages/ShortlistedPage';
import AnalyticsPage from './pages/AnalyticsPage';

function App() {
  return (
    <CompanyProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout><DashboardPage /></MainLayout>} />
          <Route path="/companies" element={<MainLayout><CompaniesPage /></MainLayout>} />
          <Route path="/add-company" element={<MainLayout><AddCompanyPage /></MainLayout>} />
          <Route path="/compose-email" element={<MainLayout><ComposeEmailPage /></MainLayout>} />
          <Route path="/responses" element={<MainLayout><ResponsesPage /></MainLayout>} />
          <Route path="/requirements" element={<MainLayout><RequirementsPage /></MainLayout>} />
          <Route path="/analytics" element={<MainLayout><AnalyticsPage /></MainLayout>} />
          <Route path="/shortlisted" element={<MainLayout><ShortlistedPage /></MainLayout>} />
        </Routes>
      </Router>
    </CompanyProvider>
  );
}

export default App;