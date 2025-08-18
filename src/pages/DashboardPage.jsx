import { useAuthStore } from '../auth/authStore';
import Sidebar from '../components/Layout/Sidebar';
import Navbar from '../components/Layout/Navbar';
import EmployeeDashboard from '../components/dashboards/EmployeeDashboard';
import ManagerDashboard from '../components/dashboards/ManagerDashboard';
import ManagerPendingPage from '../components/dashboards/ManagerPendingPage';
import ManagerReviewedPage from '../components/dashboards/ManagerReviewedPage';
import FinanceDashboard from '../components/dashboards/FinanceDashboard';
import FinanceApprovalsPage from '../components/dashboards/FinanceApprovalsPage';
import FinanceProcessedPage from '../components/dashboards/FinanceProcessedPage';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import UsersPage from '../components/dashboards/UsersPage';
import SystemLogsPage from '../components/dashboards/SystemLogsPage';
import ReimbursementForm from '../components/forms/ReimbursementForm';
import { useLocation } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  const renderContent = () => {
    // Employee routes
    if (location.pathname === '/submit') {
      return <ReimbursementForm onSuccess={() => window.location.href = '/dashboard'} />;
    }

    // Manager routes
    if (location.pathname === '/pending') {
      return <ManagerPendingPage />;
    }
    if (location.pathname === '/reviewed') {
      return <ManagerReviewedPage />;
    }

    // Finance routes
    if (location.pathname === '/approvals') {
      return <FinanceApprovalsPage />;
    }
    if (location.pathname === '/processed') {
      return <FinanceProcessedPage />;
    }

    // Admin routes
    if (location.pathname === '/users') {
      return <UsersPage />;
    }
    if (location.pathname === '/logs') {
      return <SystemLogsPage />;
    }

    // Dashboard routes
    switch (user?.role) {
      case 'Employee':
        return <EmployeeDashboard />;
      case 'Manager':
        return <ManagerDashboard />;
      case 'Finance':
        return <FinanceDashboard />;
      case 'Admin':
        return <AdminDashboard />;
      default:
        return <div>Access denied</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default DashboardPage;