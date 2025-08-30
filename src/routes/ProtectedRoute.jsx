import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../auth/authStore';
import { hasRole } from '../utils/roles';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { user, token, isLoading } = useAuthStore();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (token && !user && !isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (requiredRoles.length > 0 && !hasRole(user.role, requiredRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;