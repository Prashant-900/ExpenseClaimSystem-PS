import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../auth/authStore';
import { hasRole } from '../utils/roles';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { user, token } = useAuthStore();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles.length > 0 && !hasRole(user.role, requiredRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;