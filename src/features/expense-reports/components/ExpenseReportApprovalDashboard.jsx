import { useState, useEffect } from 'react';
import API from '../../../shared/services/axios';
import { useAuthStore } from '../../authentication/authStore';
import { useUserRole } from '../../../shared/hooks/useUserRole';
import ExpenseReportDetailModal from '../../../shared/components/ExpenseReportDetailModal';

const ExpenseReportApprovalDashboard = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionModal, setActionModal] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [detailModal, setDetailModal] = useState(null);
  const { user } = useAuthStore();
  const { role } = useUserRole();

  // Use role from backend, fallback to user from store
  const userRole = role || user?.role;

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await API.get('/expense-reports');
      setReports(data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (reportId, action) => {
    setActionModal({ reportId, action });
    setRemarks('');
  };

  const confirmAction = async () => {
    try {
      await API.patch(`/expense-reports/${actionModal.reportId}/approve`, {
        action: actionModal.action,
        remarks
      });
      
      setActionModal(null);
      setRemarks('');
      fetchReports();
    } catch (error) {
      console.error('Failed to update report:', error);
    }
  };

  const canApprove = (report) => {
    if (userRole === 'Faculty' && report.status === 'Submitted') return true;
    if (userRole === 'Audit' && report.status === 'Faculty Approved') return true;
    if (userRole === 'Finance' && report.status === 'Audit Approved') return true;
    return false;
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  const pendingReports = reports.filter(canApprove);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pending Expense Reports</h1>
        <p className="text-gray-600">Review expense reports awaiting approval</p>
      </div>

      {pendingReports.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No expense reports pending approval.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {pendingReports.map((report) => (
            <div key={report._id} className="bg-white rounded-lg shadow-md border border-yellow-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {report.submitterId?.profileImage ? (
                      <img 
                        src={`${report.submitterId.profileImage}?v=${Date.now()}`} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500 text-lg font-medium">
                        {(report.submitterId?.name || report.facultyName || report.studentName)?.charAt(0)?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      <button
                        onClick={() => window.location.href = `/profile/${report.submitterId?._id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {report.submitterId?.name || report.facultyName || report.studentName}
                      </button>
                      {' - '}{report.purposeOfExpense}
                    </h3>
                    <p className="text-gray-600 mt-1">{report.reportType} ({report.submitterRole})</p>
                    <p className="text-sm text-gray-500">
                      Period: {new Date(report.expensePeriodStart).toLocaleDateString()} - {new Date(report.expensePeriodEnd).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">₹{report.totalAmount?.toFixed(2) || '0.00'}</p>
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    {report.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                <div>
                  <span className="font-medium">Department:</span> {report.department}
                </div>
                <div>
                  <span className="font-medium">Items:</span> {report.items?.length || 0}
                  {report.items?.some(item => !item.receiptImage) && (
                    <span className="ml-2 text-red-500 text-xs">(Missing receipts)</span>
                  )}
                </div>
                <div>
                  <span className="font-medium">Funding:</span> {report.fundingSource}
                </div>
              </div>
              
              {/* Receipt Images Preview */}
              {report.items?.length > 0 && (
                <div className="mb-4">
                  <span className="text-sm font-medium text-gray-700">Receipt Images:</span>
                  <div className="flex gap-2 mt-2 overflow-x-auto">
                    {report.items.slice(0, 4).map((item, index) => (
                      <div key={index} className="flex-shrink-0">
                        {item.receiptImage ? (
                          <img 
                            src={item.receiptImage} 
                            alt={`Receipt ${index + 1}`}
                            className="w-16 h-16 object-cover border rounded cursor-pointer"
                            onClick={() => window.open(item.receiptImage, '_blank')}
                          />
                        ) : (
                          <div className="w-16 h-16 border-2 border-dashed border-red-300 rounded flex items-center justify-center">
                            <span className="text-red-400 text-xs">No Image</span>
                          </div>
                        )}
                      </div>
                    ))}
                    {report.items.length > 4 && (
                      <div className="w-16 h-16 border border-gray-300 rounded flex items-center justify-center bg-gray-100">
                        <span className="text-gray-500 text-xs">+{report.items.length - 4}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setDetailModal(report._id)}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                  View Details
                </button>
                <button
                  onClick={() => handleAction(report._id, 'approve')}
                  className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleAction(report._id, 'reject')}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleAction(report._id, 'sendback')}
                  className="px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700"
                >
                  Send Back
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {actionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {actionModal.action === 'approve' ? 'Approve' : 
               actionModal.action === 'sendback' ? 'Send Back' : 'Reject'} Expense Report
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks {(actionModal.action === 'reject' || actionModal.action === 'sendback') ? '(Required)' : '(Optional)'}
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add your comments..."
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={confirmAction}
                disabled={(actionModal.action === 'reject' || actionModal.action === 'sendback') && !remarks.trim()}
                className={`px-4 py-2 rounded text-white ${
                  actionModal.action === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  actionModal.action === 'sendback' ? 'bg-yellow-600 hover:bg-yellow-700' :
                  'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                Confirm {actionModal.action === 'approve' ? 'Approval' : 
                        actionModal.action === 'sendback' ? 'Send Back' : 'Rejection'}
              </button>
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <ExpenseReportDetailModal 
        reportId={detailModal}
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
      />
    </div>
  );
};

export default ExpenseReportApprovalDashboard;