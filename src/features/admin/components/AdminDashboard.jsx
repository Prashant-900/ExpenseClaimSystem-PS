import { useState, useEffect } from 'react';
import API from '../../../shared/services/axios';
import { ROLES } from '../../../utils/roles';
import { HiOutlineUsers, HiOutlineClipboardDocumentList, HiOutlineClock, HiOutlineCheckCircle } from 'react-icons/hi2';

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const [usersRes, logsRes] = await Promise.all([
        API.get('/admin/users'),
        API.get('/admin/logs')
      ]);
      
      const users = Array.isArray(usersRes.data) ? usersRes.data : [];
      const logs = Array.isArray(logsRes.data) ? logsRes.data : [];
      
      const totalUsers = users.length;
      const totalRequests = logs.length;
      const pendingRequests = logs.filter(r => r.status && r.status.includes('Pending')).length;
      const completedRequests = logs.filter(r => r.status === 'Completed').length;
      
      setStats({ totalUsers, totalRequests, pendingRequests, completedRequests });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setStats({ totalUsers: 0, totalRequests: 0, pendingRequests: 0, completedRequests: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage users and view system logs</p>
      </div>



      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
              <HiOutlineUsers className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalUsers || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Total Requests</h3>
              <HiOutlineClipboardDocumentList className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.totalRequests || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Pending</h3>
              <HiOutlineClock className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.pendingRequests || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Completed</h3>
              <HiOutlineCheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.completedRequests || 0}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
