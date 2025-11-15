import { useState, useEffect } from 'react';
import API from '../../../shared/services/axios';
import { HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClipboardDocumentList } from 'react-icons/hi2';

const ManagerDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await API.get('/expense-reports');
      const pending = data.filter(r => r.status && r.status.includes('Pending')).length;
      const approved = data.filter(r => r.status === 'Completed').length;
      const rejected = data.filter(r => r.status === 'Rejected').length;
      const total = data.length;
      
      setStats({ pending, approved, rejected, total });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manager Dashboard</h1>
        <p className="text-gray-600">Overview of your team's requests</p>
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
              <h3 className="text-sm font-medium text-gray-600">Pending</h3>
              <HiOutlineClock className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.pending || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Approved</h3>
              <HiOutlineCheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.approved || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Rejected</h3>
              <HiOutlineXCircle className="w-6 h-6 text-red-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.rejected || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Total</h3>
              <HiOutlineClipboardDocumentList className="w-6 h-6 text-gray-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.total || 0}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;