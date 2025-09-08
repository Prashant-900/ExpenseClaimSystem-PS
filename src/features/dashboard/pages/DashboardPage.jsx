import { useAuthStore } from '../../authentication/authStore';
import Layout from '../../../shared/layout/Layout';
import StudentDashboard from '../components/StudentDashboard';

import FacultyDashboard from '../components/FacultyDashboard';
import FacultySubmissionsDashboard from '../components/FacultySubmissionsDashboard';
import FacultyPendingDashboard from '../components/FacultyPendingDashboard';
import FacultyReviewedDashboard from '../components/FacultyReviewedDashboard';

import AuditDashboard from '../components/AuditDashboard';
import AuditAllRequestsDashboard from '../components/AuditAllRequestsDashboard';
import AuditAllDashboard from '../components/AuditAllDashboard';
import ManagerDashboard from '../components/ManagerDashboard';
import ManagerPendingDashboard from '../components/ManagerPendingDashboard';
import ManagerReviewedDashboard from '../components/ManagerReviewedDashboard';
import FinanceDashboard from '../components/FinanceDashboard';
import FinanceApprovalsDashboard from '../components/FinanceApprovalsDashboard';
import FinanceProcessedDashboard from '../components/FinanceProcessedDashboard';
import AdminDashboard from '../../admin/components/AdminDashboard';
import UserManagementDashboard from '../../admin/components/UserManagementDashboard';
import SystemLogsDashboard from '../../admin/components/SystemLogsDashboard';
import ReimbursementForm from '../../reimbursements/forms/ReimbursementForm';
import DraftsDashboard from '../components/DraftsDashboard';
import ExpenseReportDashboard from '../../expense-reports/components/ExpenseReportDashboard';
import ExpenseReportApprovalDashboard from '../../expense-reports/components/ExpenseReportApprovalDashboard';
import { useLocation } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  const renderContent = () => {
    // Student routes
    if (location.pathname === '/submit') {
      return <ReimbursementForm onSuccess={() => window.location.href = '/drafts'} />;
    }
    if (location.pathname === '/drafts') {
      return <DraftsDashboard />;
    }

    // Faculty routes
    if (location.pathname === '/pending') {
      return <FacultyPendingDashboard />;
    }
    if (location.pathname === '/reviewed') {
      return <FacultyReviewedDashboard />;
    }
    
    // Audit routes
    if (location.pathname === '/audit') {
      return <ExpenseReportApprovalDashboard />;
    }
    if (location.pathname === '/audit-all') {
      return <AuditAllDashboard />;
    }
    
    // Faculty submissions route
    if (location.pathname === '/faculty-submissions') {
      return <FacultySubmissionsDashboard />;
    }
    


    // Finance routes
    if (location.pathname === '/approvals') {
      return <ExpenseReportApprovalDashboard />;
    }
    if (location.pathname === '/processed') {
      return <FinanceProcessedDashboard />;
    }

    // Admin routes
    if (location.pathname === '/users') {
      return <UserManagementDashboard />;
    }
    if (location.pathname === '/logs') {
      return <SystemLogsDashboard />;
    }

    // Dashboard routes
    switch (user?.role) {
      case 'Student':
        return <ExpenseReportDashboard />;
      case 'Faculty':
        return <ExpenseReportDashboard />;
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