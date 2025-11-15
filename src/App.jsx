import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './features/authentication/authStore';
import ProtectedRoute from './shared/components/ProtectedRoute';
import LoginPage from './features/authentication/pages/LoginPage';
import Register from './features/authentication/components/Register';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import ExpenseClaimPage from './features/expense-reports/pages/ExpenseClaimPage';
import ExpenseDraftEditPage from './features/expense-reports/pages/ExpenseDraftEditPage';
import ExpenseReportCreatePage from './features/expense-reports/pages/ExpenseReportCreatePage';
import ExpenseFormPage from './features/expense-reports/pages/ExpenseFormPage';
import ExpenseReportViewPage from './features/expense-reports/pages/ExpenseReportViewPage';
import ProfilePage from './features/profile/pages/ProfilePage';
import UserProfileViewPage from './features/profile/pages/UserProfileViewPage';
import SchoolChairDashboard from './features/expense-reports/pages/SchoolChairDashboard';
import DeanSRICDashboard from './features/expense-reports/pages/DeanSRICDashboard';
import DirectorDashboard from './features/expense-reports/pages/DirectorDashboard';
import SchoolAdministrationDashboard from './features/admin/components/SchoolAdministrationDashboard';

import { ROLES } from './utils/roles';

function App() {
  const { token } = useAuthStore();

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/login" 
            element={!token ? <LoginPage /> : <Navigate to="/dashboard" />} 
          />
          <Route 
            path="/register" 
            element={!token ? <Register /> : <Navigate to="/dashboard" />} 
          />
          
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/expense-claim" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.STUDENT, ROLES.FACULTY]}>
                <ExpenseClaimPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/drafts" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.STUDENT, ROLES.FACULTY]}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/edit-draft/:id" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.STUDENT, ROLES.FACULTY]}>
                <ExpenseDraftEditPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/create-report" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.STUDENT, ROLES.FACULTY]}>
                <ExpenseFormPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/expense-report/:id" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.STUDENT, ROLES.FACULTY, ROLES.SCHOOL_CHAIR, ROLES.DEAN_SRIC, ROLES.DIRECTOR, ROLES.AUDIT, ROLES.FINANCE]}>
                <ExpenseReportViewPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/users" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/logs" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/pending" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.FACULTY]}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/reviewed" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.FACULTY]}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/faculty/approvals" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.FACULTY]}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/faculty/approved" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.FACULTY]}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/audit" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.AUDIT]}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/audit-all" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.AUDIT]}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/audit/approvals" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.AUDIT]}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/expense-reports/audit/approvals" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.AUDIT]}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/audit/approved" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.AUDIT]}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/approvals" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.FINANCE]}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/processed" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.FINANCE]}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/finance/approvals" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.FINANCE]}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/finance/approved" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.FINANCE]}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/faculty-submissions" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.FACULTY]}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/profile/:userId" 
            element={
              <ProtectedRoute>
                <UserProfileViewPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/school-chair" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.SCHOOL_CHAIR]}>
                <SchoolChairDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/expense-reports/school-chair/approvals" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.SCHOOL_CHAIR]}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/school-chair/approved" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.SCHOOL_CHAIR]}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/dean-sric" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.DEAN_SRIC]}>
                <DeanSRICDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/expense-reports/dean-sric/approvals" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.DEAN_SRIC]}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/dean-sric/approved" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.DEAN_SRIC]}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/director" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.DIRECTOR]}>
                <DirectorDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/expense-reports/director/approvals" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.DIRECTOR]}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/director/approved" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.DIRECTOR]}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/admin/school-administration" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.ADMIN]}>
                <SchoolAdministrationDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;