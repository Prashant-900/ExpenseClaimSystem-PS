import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './auth/authStore';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import Register from './components/Auth/Register';
import AuthSuccessPage from './pages/AuthSuccessPage';
import DashboardPage from './pages/DashboardPage';
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
              <ProtectedRoute requiredRoles={[ROLES.EMPLOYEE]}>
                <DashboardPage />
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
              <ProtectedRoute requiredRoles={[ROLES.MANAGER]}>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/reviewed" 
            element={
              <ProtectedRoute requiredRoles={[ROLES.MANAGER]}>
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
          
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;