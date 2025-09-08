import { useState, useEffect } from 'react';
import API from '../../../shared/services/axios';

const FinanceDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/reimbursements');
      const pending = data.filter(r => r.status === 'Pending - Finance').length;
      const completed = data.filter(r => r.status === 'Completed').length;
      const rejected = data.filter(r => r.status === 'Rejected' && r.financeRemarks).length;
      const sentBack = data.filter(r => r.status === 'Sent Back - Finance').length;
      const total = pending + completed + rejected + sentBack;
      
      setStats({ pending, completed, rejected, sentBack, total });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Finance Dashboard</h1>
        <p className="text-gray-600">Overview of finance operations</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Pending</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.pending || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Completed</h3>
            <p className="text-3xl font-bold text-green-600">{stats.completed || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Rejected</h3>
            <p className="text-3xl font-bold text-red-600">{stats.rejected || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Sent Back</h3>
            <p className="text-3xl font-bold text-orange-600">{stats.sentBack || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold text-gray-900">Total</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.total || 0}</p>
          </div>
        </div>
      )}
      
      
    </div>
  );
};

export default FinanceDashboard;
