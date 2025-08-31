import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './auth/authStore';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import Register from './components/Auth/Register';
import AuthSuccessPage from './pages/AuthSuccessPage';
import DashboardPage from './pages/DashboardPage';
import EditRequestPage from './pages/EditRequestPage';
import SubmitRequestPage from './pages/SubmitRequestPage';
import ProfilePage from './pages/ProfilePage';
import ViewProfilePage from './pages/ViewProfilePage';


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
            element={<AuthSuccessPage />} 
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
                <SubmitRequestPage />
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
                <EditRequestPage />
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
                <ViewProfilePage />
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