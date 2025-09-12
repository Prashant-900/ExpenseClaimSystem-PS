import { useState, useEffect } from 'react';
import API from '../../../shared/services/axios';
import ExpenseReportDetailModal from '../../../shared/components/ExpenseReportDetailModal';
import RequestCard from '../../../shared/components/RequestCard';

const FacultyPendingDashboard = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionModal, setActionModal] = useState(null);
  const [remarks, setRemarks] = useState('');
  const [detailModal, setDetailModal] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      // Fetch both student expense reports and reimbursement requests
      const [expenseReportResponse, reimbursementResponse] = await Promise.all([
        API.get('/expense-reports?pending=true'),
        API.get('/reimbursements?pending=true')
      ]);
      
      const expenseReports = expenseReportResponse.data;
      const reimbursements = reimbursementResponse.data;
      
      // Combine both types with type identifier
      const allReports = [
        ...expenseReports.map(report => ({ ...report, type: 'expense-report' })),
        ...reimbursements.map(req => ({ ...req, type: 'reimbursement' }))
      ];
      
      // Sort by creation date
      allReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setReports(allReports);
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
      const report = reports.find(r => r._id === actionModal.reportId);
      
      if (report.type === 'expense-report') {
        await API.patch(`/expense-reports/${actionModal.reportId}/approve`, {
          action: actionModal.action,
          remarks
        });
      } else if (report.type === 'reimbursement') {
        await API.patch(`/reimbursements/${actionModal.reportId}/status`, {
          status: actionModal.action,
          remarks
        });
      }
      
      setActionModal(null);
      setRemarks('');
      fetchReports();
    } catch (error) {
      console.error('Failed to update report:', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Student Requests - Pending Review</h1>
        <p className="text-gray-600">Student expense reports and reimbursement requests awaiting your approval</p>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No student requests pending your review.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {reports.map((report) => (
            <RequestCard
              key={report._id}
              request={report}
              onAction={handleAction}
              userRole="Faculty"
            />
          ))}
        </div>
      )}

      {actionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {actionModal.action === 'approve' ? 'Approve' : 
               actionModal.action === 'sendback' ? 'Send Back' : 'Reject'} Report
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
                Confirm
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

      {detailModal && (
        <ExpenseReportDetailModal 
          reportId={detailModal}
          isOpen={!!detailModal}
          onClose={() => setDetailModal(null)}
        />
      )}
    </div>
  );
};

export default FacultyPendingDashboard;