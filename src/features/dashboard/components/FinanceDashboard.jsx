import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../authentication/authStore';
import API from '../../../shared/services/axios';

const FinanceDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0,
    totalAmount: 0,
    recentReports: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setIsLoading(true);
    try {
      // Fetch pending reports (Audit approved, waiting for Finance)
      const { data: pendingData } = await API.get('/expense-reports');
      
      // Fetch processed reports (Finance approved or rejected)
      const { data: processedData } = await API.get('/expense-reports?processed=true');
      
      // Calculate statistics - only count reports this Finance user actually approved/rejected
      const approved = processedData.filter(r => 
        r.status === 'Finance Approved' &&
        r.financeApproval?.approved === true &&
        r.financeApproval?.approvedById === user._id
      );
      
      const rejected = processedData.filter(r => 
        r.status === 'Rejected' &&
        r.financeApproval?.approved === false &&
        r.financeApproval?.approvedById === user._id
      );
      
      // Get recent reports (last 5 - show pending + Finance processed by this user)
      const myProcessed = processedData.filter(r => 
        r.financeApproval?.approvedById === user._id
      );
      
      const recentReports = [...pendingData, ...myProcessed]
        .sort((a, b) => {
          const dateA = a.financeApproval?.date || a.submissionDate || a.createdAt;
          const dateB = b.financeApproval?.date || b.submissionDate || b.createdAt;
          return new Date(dateB) - new Date(dateA);
        })
        .slice(0, 5);
      
      // Calculate total amount approved this month by this Finance user
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const approvedThisMonth = approved.filter(r => {
        if (!r.financeApproval?.date) return false;
        const approvalDate = new Date(r.financeApproval.date);
        return approvalDate.getMonth() === currentMonth && 
               approvalDate.getFullYear() === currentYear;
      });
      const totalAmount = approvedThisMonth.reduce((sum, r) => sum + (r.totalAmount || 0), 0);

      setStats({
        pending: pendingData.length,
        approved: approved.length,
        rejected: rejected.length,
        totalAmount,
        recentReports
      });
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Audit Approved':
        return 'bg-blue-100 text-blue-800';
      case 'Finance Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Finance Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, {user?.name}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Pending Approvals */}
        <div 
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => navigate('/finance/approvals')}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-3xl font-bold text-yellow-600">{stats.pending}</span>
          </div>
          <h3 className="text-gray-700 font-medium">Pending Approvals</h3>
          <p className="text-sm text-gray-500 mt-1">Requires your review</p>
        </div>

        {/* Approved */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-3xl font-bold text-green-600">{stats.approved}</span>
          </div>
          <h3 className="text-gray-700 font-medium">Approved</h3>
          <p className="text-sm text-gray-500 mt-1">Total approved reports</p>
        </div>

        {/* Rejected */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-3xl font-bold text-red-600">{stats.rejected}</span>
          </div>
          <h3 className="text-gray-700 font-medium">Rejected</h3>
          <p className="text-sm text-gray-500 mt-1">Total rejected reports</p>
        </div>

        {/* Total Amount This Month */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-blue-600">₹{stats.totalAmount.toLocaleString()}</span>
          </div>
          <h3 className="text-gray-700 font-medium">Approved This Month</h3>
          <p className="text-sm text-gray-500 mt-1">Total amount approved</p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/finance/approvals')}
              className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-gray-700 font-medium">Review Pending Reports</span>
              </div>
              {stats.pending > 0 && (
                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                  {stats.pending}
                </span>
              )}
            </button>

            <button
              onClick={() => navigate('/finance/approved')}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 text-gray-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-gray-700 font-medium">View Approved Reports</span>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {stats.recentReports.length === 0 ? (
              <p className="text-gray-500 text-sm text-center py-4">No recent reports</p>
            ) : (
              stats.recentReports.map((report) => (
                <div
                  key={report._id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0 hover:bg-gray-50 px-2 rounded cursor-pointer"
                  onClick={() => navigate(`/expense-report/${report._id}`)}
                >
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {report.purposeOfExpense || 'No purpose'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {report.submitterId?.name || report.studentName || 'Unknown'} • ₹{report.totalAmount?.toLocaleString()}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(report.status)}`}>
                    {report.status === 'Audit Approved' ? 'Pending' : report.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Role Info */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow-sm border border-green-100 p-6">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Finance</h3>
            <p className="text-sm text-gray-600">Financial Processing Department</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceDashboard;
