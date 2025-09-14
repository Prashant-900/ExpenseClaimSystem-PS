import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './features/authentication/authStore';
import ProtectedRoute from './shared/components/ProtectedRoute';
import LoginPage from './features/authentication/pages/LoginPage';
import Register from './features/authentication/components/Register';
import GoogleAuthSuccessPage from './features/authentication/pages/GoogleAuthSuccessPage';
import DashboardPage from './features/dashboard/pages/DashboardPage';
import ReimbursementEditPage from './features/reimbursements/pages/ReimbursementEditPage';
import ReimbursementSubmitPage from './features/reimbursements/pages/ReimbursementSubmitPage';
import ExpenseClaimPage from './features/expense-reports/pages/ExpenseClaimPage';
import ExpenseDraftEditPage from './features/expense-reports/pages/ExpenseDraftEditPage';
import ExpenseReportCreatePage from './features/expense-reports/pages/ExpenseReportCreatePage';
import ExpenseFormPage from './features/expense-reports/pages/ExpenseFormPage';
import ExpenseReportViewPage from './features/expense-reports/pages/ExpenseReportViewPage';
import ProfilePage from './features/profile/pages/ProfilePage';
import UserProfileViewPage from './features/profile/pages/UserProfileViewPage';


import { ROLES } from './utils/roles';

function App() {
  const { user, token, checkAuth } = useAuthStore();

  useEffect(() => {
    if (token && !user) {
      checkAuth();
    }
  }, [token, user, checkAuth]);

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
            path="/auth/success" 
            element={<GoogleAuthSuccessPage />} 
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
            path="/submit" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.STUDENT, ROLES.FACULTY]}>
                <ReimbursementSubmitPage />
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
              <ProtectedRoute requiredRoles={[ROLES.STUDENT, ROLES.FACULTY, ROLES.AUDIT, ROLES.FINANCE]}>
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
            path="/edit-request/:id" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.STUDENT, ROLES.FACULTY]}>
                <ReimbursementEditPage />
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
          
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;