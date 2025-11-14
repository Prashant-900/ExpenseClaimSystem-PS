import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../features/authentication/authStore';
import { useUserRole } from '../hooks/useUserRole';
import { 
  HiOutlineChartBarSquare, 
  HiOutlinePlus, 
  HiOutlineClock, 
  HiOutlineCheckCircle, 
  HiOutlineMagnifyingGlass, 
  HiOutlineClipboardDocumentList, 
  HiOutlineBanknotes, 
  HiOutlineUsers, 
  HiOutlineDocumentText,
  HiOutlineXMark
} from 'react-icons/hi2';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const { role } = useUserRole();
  const location = useLocation();

  // Use role from backend, fallback to user from store
  const userRole = role || user?.role;

  const getNavItems = () => {
    if (userRole === 'Student') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: HiOutlineChartBarSquare },
        { path: '/create-report', label: 'Create Report', icon: HiOutlinePlus }
      ];
    }
    
    if (userRole === 'Faculty') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: HiOutlineChartBarSquare },
        { path: '/create-report', label: 'Create Report', icon: HiOutlinePlus },
        { path: '/faculty/approvals', label: 'Pending Approvals', icon: HiOutlineClock },
        { path: '/faculty/approved', label: 'Approved Requests', icon: HiOutlineCheckCircle },
      ];
    }
    
    if (userRole === 'School Chair') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: HiOutlineChartBarSquare },
        { path: '/expense-reports/school-chair/approvals', label: 'Pending Approvals', icon: HiOutlineClock },
        { path: '/school-chair/approved', label: 'Approved Requests', icon: HiOutlineCheckCircle },
      ];
    }
    
    if (userRole === 'Dean SRIC') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: HiOutlineChartBarSquare },
        { path: '/expense-reports/dean-sric/approvals', label: 'Pending Approvals', icon: HiOutlineClock },
        { path: '/dean-sric/approved', label: 'Approved Requests', icon: HiOutlineCheckCircle },
      ];
    }
    
    if (userRole === 'Director') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: HiOutlineChartBarSquare },
        { path: '/expense-reports/director/approvals', label: 'Pending Approvals', icon: HiOutlineClock },
        { path: '/director/approved', label: 'Approved Requests', icon: HiOutlineCheckCircle },
      ];
    }
    
    if (userRole === 'Audit') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: HiOutlineChartBarSquare },
        { path: '/expense-reports/audit/approvals', label: 'Pending Approvals', icon: HiOutlineClock },
        { path: '/audit/approved', label: 'Approved Requests', icon: HiOutlineCheckCircle }
      ];
    }
    
    if (userRole === 'Finance') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: HiOutlineChartBarSquare },
        { path: '/finance/approvals', label: 'Pending Approvals', icon: HiOutlineClock },
        { path: '/finance/approved', label: 'Approved Requests', icon: HiOutlineCheckCircle }
      ];
    }
    
    if (userRole === 'Admin') {
      return [
        { path: '/dashboard', label: 'Dashboard', icon: HiOutlineChartBarSquare },
        { path: '/users', label: 'Manage Users', icon: HiOutlineUsers },
        { path: '/admin/school-administration', label: 'School Administration', icon: HiOutlineDocumentText },
        { path: '/logs', label: 'System Logs', icon: HiOutlineDocumentText }
      ];
    }
    
    return [{ path: '/dashboard', label: 'Dashboard', icon: HiOutlineChartBarSquare }];
  };

  return (
    <div className="bg-gray-800 text-white w-64 h-full flex flex-col">
      <div className="p-6 border-b border-gray-600">
        <h2 className="text-xl font-bold text-white">ExpenseClaim</h2>
        <div className="mt-2 flex items-center">
          <div className="w-2 h-2 bg-emerald-400 rounded-full mr-2"></div>
          <p className="text-gray-300 text-sm font-medium">{userRole}</p>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <div className="space-y-1">
          {getNavItems().map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                location.pathname === item.path
                  ? 'bg-gray-700 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-gray-600">
        <div className="text-xs text-gray-400">
          © 2025 ExpenseClaim System
        </div>
      </div>
    </div>
  );
};

export default Sidebar;