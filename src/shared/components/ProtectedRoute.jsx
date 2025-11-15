import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../features/authentication/authStore';
import { hasRole } from '../../utils/roles';
import { useUserRole } from '../hooks/useUserRole';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { token } = useAuthStore();
  const { role, isLoading: roleLoading, error: roleError } = useUserRole();

  // Not authenticated
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Still loading role
  if (roleLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  // Error fetching role
  if (roleError || !role) {
    return <div className="flex justify-center items-center h-screen">Error: Unable to load user information</div>;
  }

  // Check role if required
  if (requiredRoles.length > 0 && !hasRole(role, requiredRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;