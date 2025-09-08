import { useAuthStore } from '../../features/authentication/authStore';
import { HiOutlineBriefcase, HiOutlineArrowRightOnRectangle, HiOutlineUser } from 'react-icons/hi2';

const Navbar = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="px-6">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-gray-100 rounded-md">
              <HiOutlineBriefcase className="w-6 h-6 text-gray-700" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">ExpenseClaim System</h1>
              <p className="text-xs text-gray-500">Reimbursement Management</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.role}</p>
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
              className="flex items-center gap-2 bg-gray-700 hover:bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-gray-500"
            >
              <HiOutlineArrowRightOnRectangle className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;