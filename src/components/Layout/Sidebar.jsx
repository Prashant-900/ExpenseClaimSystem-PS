import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../auth/authStore';

const Sidebar = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  const getNavItems = () => {
    if (user?.role === 'Employee') {
      return [
        { path: '/dashboard', label: 'My Requests', icon: '📊' },
        { path: '/submit', label: 'Submit Request', icon: '➕' }
      ];
    }
    
    if (user?.role === 'Manager') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/pending', label: 'Pending Requests', icon: '⏳' },
        { path: '/reviewed', label: 'Reviewed Requests', icon: '✅' }
      ];
    }
    
    if (user?.role === 'Finance') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/approvals', label: 'Final Approvals', icon: '💰' },
        { path: '/processed', label: 'Processed Requests', icon: '✅' }
      ];
    }
    
    if (user?.role === 'Admin') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/users', label: 'Manage Users', icon: '👥' },
        { path: '/logs', label: 'System Logs', icon: '📋' }
      ];
    }
    
    return [{ path: '/dashboard', label: 'Dashboard', icon: '📊' }];
  };

  return (
    <div className="bg-gray-800 text-white w-64 min-h-screen p-4">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Reimbursement System</h2>
        <p className="text-gray-300 text-sm">{user?.role}</p>
      </div>
      
      <nav>
        {getNavItems().map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 p-3 rounded-lg mb-2 transition-colors ${
              location.pathname === item.path
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;