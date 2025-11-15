import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/authentication/authStore';
import { useUserRole } from '../hooks/useUserRole';
import { HiOutlineBriefcase, HiOutlineArrowRightOnRectangle, HiOutlineUser, HiOutlineBars3 } from 'react-icons/hi2';

const Navbar = ({ onMenuClick }) => {
  const { user, logout } = useAuthStore();
  const { role } = useUserRole();
  const navigate = useNavigate();

  // Use role from backend, fallback to user from store
  const userRole = role || user?.role;

  const handleLogout = async () => {
    try {
      console.log('Logging out...');
      
      // Clear local store
      logout();
      
      // Clear any localStorage items
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Clear session storage
      sessionStorage.clear();
      
      console.log('Logout successful');
      
      // Redirect to login
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      
      // Fallback: force clear everything and redirect
      logout();
      localStorage.clear();
      sessionStorage.clear();
      
      // Force redirect to login
      window.location.href = '/login';
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-3 sm:px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              <HiOutlineBars3 className="w-6 h-6" />
            </button>
            <div className="p-2 bg-gray-100 rounded-md">
              <HiOutlineBriefcase className="w-5 h-5 sm:w-6 sm:h-6 text-gray-700" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-gray-900">ExpenseClaim System</h1>
              <p className="text-xs text-gray-500">Expense Report Management</p>
            </div>
            <div className="sm:hidden">
              <h1 className="text-base font-semibold text-gray-900">ExpenseClaim</h1>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{userRole}</p>
            </div>
            <a href="/profile" className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300 transition-colors">
              {user?.profileImage ? (
                <img src={`${user.profileImage}?v=${Date.now()}`} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                <HiOutlineUser className="w-5 h-5 text-gray-600" />
              )}
            </a>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1 sm:gap-2 bg-gray-700 hover:bg-gray-800 text-white px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500"
            >
              <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;