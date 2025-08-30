import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../auth/authStore';

const Sidebar = () => {
  const { user } = useAuthStore();
  const location = useLocation();

  const getNavItems = () => {
    if (user?.role === 'Student') {
      return [
        { path: '/dashboard', label: 'My Requests', icon: '📊' },
        { path: '/submit', label: 'Submit Request', icon: '➕' }
      ];
    }
    
    if (user?.role === 'Faculty') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/pending', label: 'Student Pending', icon: '⏳' },
        { path: '/reviewed', label: 'Student Reviewed', icon: '✅' },
        { path: '/submit', label: 'Submit Request', icon: '➕' },
        { path: '/faculty-submissions', label: 'My Submissions', icon: '📋' },
      ];
    }
    
    if (user?.role === 'Audit') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/audit', label: 'Audit Requests', icon: '🔍' },
        { path: '/audit-all', label: 'All Requests', icon: '📋' }
      ];
    }
    
    if (user?.role === 'Finance') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: '📊' },
        { path: '/approvals', label: 'Final Approvals', icon: '💰' },
        { path: '/processed', label: 'All Requests', icon: '✅' }
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
    <div className="bg-gray-900 text-white w-64 h-full flex flex-col">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-bold text-white">ExpenseClaim</h2>
        <div className="mt-2 flex items-center">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
          <p className="text-gray-300 text-sm font-medium">{user?.role}</p>
        </div>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {getNavItems().map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>
      
      <div className="p-4 border-t border-gray-700">
        <div className="text-xs text-gray-400">
          © 2024 ExpenseClaim System
        </div>
      </div>
    </div>
  );
};

export default Sidebar;