import { useState, useEffect } from 'react';
import API from '../../../shared/services/axios';
import { HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineArrowUturnLeft, HiOutlineClipboardDocumentList } from 'react-icons/hi2';

const FinanceDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Fetch both reimbursements and expense reports
      const [reimbursementResponse, expenseReportResponse] = await Promise.all([
        API.get('/reimbursements'),
        API.get('/expense-reports')
      ]);
      
      const reimbursements = reimbursementResponse.data;
      const expenseReports = expenseReportResponse.data;
      
      // Calculate stats for reimbursements
      const reimbPending = reimbursements.filter(r => r.status === 'Pending - Finance Review').length;
      const reimbCompleted = reimbursements.filter(r => r.status === 'Completed').length;
      const reimbRejected = reimbursements.filter(r => r.status === 'Rejected' && r.financeRemarks).length;
      const reimbSentBack = reimbursements.filter(r => r.status === 'Sent Back - Finance').length;
      
      // Calculate stats for expense reports
      const expensePending = expenseReports.filter(r => r.status === 'Audit Approved').length;
      const expenseCompleted = expenseReports.filter(r => r.status === 'Finance Approved').length;
      const expenseRejected = expenseReports.filter(r => r.status === 'Rejected' && r.financeApproval?.remarks).length;
      const expenseSentBack = expenseReports.filter(r => r.financeApproval?.action === 'sendback').length;
      
      // Combine stats
      const pending = reimbPending + expensePending;
      const completed = reimbCompleted + expenseCompleted;
      const rejected = reimbRejected + expenseRejected;
      const sentBack = reimbSentBack + expenseSentBack;
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
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          <span className="ml-3 text-gray-600">Loading...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Pending Review</h3>
              <HiOutlineClock className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.pending || 0}</p>
          </div>
          <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-gray-600">Approved</h3>
              <HiOutlineCheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.completed || 0}</p>
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
              <h3 className="text-sm font-medium text-gray-600">Sent Back</h3>
              <HiOutlineArrowUturnLeft className="w-6 h-6 text-amber-600" />
            </div>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stats.sentBack || 0}</p>
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

export default FinanceDashboard;
