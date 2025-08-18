import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { ROLES } from '../../utils/roles';

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
      
      const totalUsers = usersRes.data.length;
      const totalRequests = logsRes.data.length;
      const pendingRequests = logsRes.data.filter(r => r.status.includes('Pending')).length;
      const completedRequests = logsRes.data.filter(r => r.status === 'Completed').length;
      
      setStats({ totalUsers, totalRequests, pendingRequests, completedRequests });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
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
        <div className="flex justify-center items-center h-64">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.totalUsers || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Total Requests</h3>
            <p className="text-3xl font-bold text-green-600">{stats.totalRequests || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendingRequests || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Completed</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.completedRequests || 0}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;