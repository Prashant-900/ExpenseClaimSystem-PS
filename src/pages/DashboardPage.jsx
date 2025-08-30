import { useAuthStore } from '../auth/authStore';
import Layout from '../components/Layout/Layout';
import StudentDashboard from '../components/dashboards/StudentDashboard';
import EmployeeDashboard from '../components/dashboards/EmployeeDashboard';
import FacultyDashboard from '../components/dashboards/FacultyDashboard';
import FacultySubmissionsPage from '../components/dashboards/FacultySubmissionsPage';

import AuditDashboard from '../components/dashboards/AuditDashboard';
import AuditAllRequestsPage from '../components/dashboards/AuditAllRequestsPage';
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
    // Student routes
    if (location.pathname === '/submit') {
      return <ReimbursementForm onSuccess={() => window.location.href = '/dashboard'} />;
    }

    // Faculty routes
    if (location.pathname === '/pending') {
      return <ManagerPendingPage />;
    }
    if (location.pathname === '/reviewed') {
      return <ManagerReviewedPage />;
    }
    
    // Audit routes
    if (location.pathname === '/audit') {
      return <ManagerDashboard />;
    }
    if (location.pathname === '/audit-all') {
      return <AuditAllRequestsPage />;
    }
    
    // Faculty submissions route
    if (location.pathname === '/faculty-submissions') {
      return <FacultySubmissionsPage />;
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
      case 'Student':
        return <StudentDashboard />;
      case 'Faculty':
        return <FacultyDashboard />;
      case 'Audit':
        return <AuditDashboard />;
      case 'Finance':
        return <FinanceDashboard />;
      case 'Admin':
        return <AdminDashboard />;
      default:
        return <div>Access denied</div>;
    }
  };

  return (
    <Layout>
      {renderContent()}
    </Layout>
  );
};

export default DashboardPage;