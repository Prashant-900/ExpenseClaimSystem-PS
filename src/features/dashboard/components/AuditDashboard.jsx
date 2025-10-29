import { useState, useEffect } from 'react';
import { HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineClipboardDocumentList } from 'react-icons/hi2';
import { useAuthStore } from '../../authentication/authStore';
import API from '../../../shared/services/axios';

const AuditDashboard = () => {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch pending requests
      const reimbursementResponse = await API.get('/reimbursements?pending=true');
      const expenseReportResponse = await API.get('/expense-reports');
      
      const reimbursements = reimbursementResponse.data;
      const expenseReports = expenseReportResponse.data;
      
      const pending = reimbursements.length + expenseReports.length;
      
      // Fetch all processed requests for stats - personalized to this Audit user
      const allResponse = await API.get('/expense-reports?all=true');
      const allReports = allResponse.data;
      
      // Only count reports approved by this Audit user
      const approved = allReports.filter(r => 
        (r.status === 'Audit Approved' || r.status === 'Finance Approved') &&
        r.auditApproval?.approved === true &&
        r.auditApproval?.approvedById === user._id
      ).length;
      
      // Only count reports rejected by this Audit user
      const rejected = allReports.filter(r => 
        r.status === 'Rejected' &&
        r.auditApproval?.approved === false &&
        r.auditApproval?.approvedById === user._id
      ).length;
      
      setStats({
        pending,
        approved,
        rejected,
        total: pending + approved + rejected
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Audit Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Overview of audit requests and approvals
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Pending Review</h3>
            <HiOutlineClock className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.pending}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Approved by Me</h3>
            <HiOutlineCheckCircle className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.approved}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Rejected</h3>
            <HiOutlineXCircle className="w-6 h-6 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.rejected}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-600">Total Requests</h3>
            <HiOutlineClipboardDocumentList className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
        </div>
      </div>
    </div>
  );
};

export default AuditDashboard;
