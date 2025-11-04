import { useAuthStore } from '../../authentication/authStore';
import Layout from '../../../shared/layout/Layout';
import StudentDashboard from '../components/StudentDashboard';
import { useUserRole } from '../../../shared/hooks/useUserRole';

import FacultyDashboard from '../components/FacultyDashboard';
import FacultySubmissionsDashboard from '../components/FacultySubmissionsDashboard';
import FacultyPendingDashboard from '../components/FacultyPendingDashboard';
import FacultyReviewedDashboard from '../components/FacultyReviewedDashboard';
import FacultyApprovalDashboard from '../../expense-reports/pages/FacultyApprovalDashboard';
import FacultyApprovedRequests from '../../expense-reports/pages/FacultyApprovedRequests';

import AuditOverview from '../../expense-reports/pages/AuditOverview';
import AuditPendingRequests from '../components/AuditPendingRequests';
import AuditApprovalDashboard from '../../expense-reports/pages/AuditApprovalDashboard';
import AuditApprovedRequests from '../../expense-reports/pages/AuditApprovedRequests';
import AuditAllDashboard from '../components/AuditAllDashboard';
import ManagerDashboard from '../components/ManagerDashboard';
import ManagerPendingDashboard from '../components/ManagerPendingDashboard';
import ManagerReviewedDashboard from '../components/ManagerReviewedDashboard';
import FinanceDashboard from '../components/FinanceDashboard';
import FinanceApprovalsDashboard from '../components/FinanceApprovalsDashboard';
import FinanceProcessedDashboard from '../components/FinanceProcessedDashboard';
import FinanceApprovalDashboard from '../../expense-reports/pages/FinanceApprovalDashboard';
import FinanceApprovedRequests from '../../expense-reports/pages/FinanceApprovedRequests';
import AdminDashboard from '../../admin/components/AdminDashboard';
import UserManagementDashboard from '../../admin/components/UserManagementDashboard';
import SystemLogsDashboard from '../../admin/components/SystemLogsDashboard';
import DraftsDashboard from '../components/DraftsDashboard';
import ExpenseReportDashboard from '../../expense-reports/components/ExpenseReportDashboard';
import ExpenseReportApprovalDashboard from '../../expense-reports/components/ExpenseReportApprovalDashboard';
import SchoolChairDashboard from '../../expense-reports/pages/SchoolChairDashboard';
import SchoolChairOverview from '../../expense-reports/pages/SchoolChairOverview';
import SchoolChairApprovedRequests from '../../expense-reports/pages/SchoolChairApprovedRequests';
import DeanSRICDashboard from '../../expense-reports/pages/DeanSRICDashboard';
import DeanSRICOverview from '../../expense-reports/pages/DeanSRICOverview';
import DeanSRICApprovedRequests from '../../expense-reports/pages/DeanSRICApprovedRequests';
import DirectorDashboard from '../../expense-reports/pages/DirectorDashboard';
import DirectorOverview from '../../expense-reports/pages/DirectorOverview';
import DirectorApprovedRequests from '../../expense-reports/pages/DirectorApprovedRequests';
import { useLocation } from 'react-router-dom';

const DashboardPage = () => {
  const { user } = useAuthStore();
  const { role } = useUserRole();
  const location = useLocation();

  // Use role from backend, fallback to user from store
  const userRole = role || user?.role;

  const renderContent = () => {
    // Student routes
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
    if (location.pathname === '/faculty/approvals') {
      return <FacultyApprovalDashboard />;
    }
    if (location.pathname === '/faculty/approved') {
      return <FacultyApprovedRequests />;
    }
    
    // Audit routes
    if (location.pathname === '/audit') {
      return <AuditPendingRequests />;
    }
    if (location.pathname === '/audit-all') {
      return <AuditAllDashboard />;
    }
    if (location.pathname === '/audit/approvals') {
      return <AuditApprovalDashboard />;
    }
    if (location.pathname === '/audit/approved') {
      return <AuditApprovedRequests />;
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
    if (location.pathname === '/finance/approvals') {
      return <FinanceApprovalDashboard />;
    }
    if (location.pathname === '/finance/approved') {
      return <FinanceApprovedRequests />;
    }

    // Admin routes
    if (location.pathname === '/users') {
      return <UserManagementDashboard />;
    }
    if (location.pathname === '/logs') {
      return <SystemLogsDashboard />;
    }

    // Approval routes for School Chair, Dean SRIC, Director, Audit
    if (location.pathname === '/expense-reports/school-chair/approvals') {
      return <SchoolChairDashboard />;
    }
    if (location.pathname === '/expense-reports/dean-sric/approvals') {
      return <DeanSRICDashboard />;
    }
    if (location.pathname === '/expense-reports/director/approvals') {
      return <DirectorDashboard />;
    }
    if (location.pathname === '/expense-reports/audit/approvals') {
      return <AuditApprovalDashboard />;
    }

    // Approved Requests routes
    if (location.pathname === '/school-chair/approved') {
      return <SchoolChairApprovedRequests />;
    }
    if (location.pathname === '/dean-sric/approved') {
      return <DeanSRICApprovedRequests />;
    }
    if (location.pathname === '/director/approved') {
      return <DirectorApprovedRequests />;
    }

    // Dashboard routes
    switch (userRole) {
      case 'Student':
        return <ExpenseReportDashboard />;
      case 'Faculty':
        return <ExpenseReportDashboard />;
      case 'School Chair':
        return <SchoolChairOverview />;
      case 'Dean SRIC':
        return <DeanSRICOverview />;
      case 'Director':
        return <DirectorOverview />;
      case 'Audit':
        return <AuditOverview />;
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