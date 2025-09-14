import { useState, useEffect } from 'react';
import RequestCard from '../../../shared/components/RequestCard';
import API from '../../../shared/services/axios';

const AuditDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionModal, setActionModal] = useState(null);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      console.log('=== AUDIT DASHBOARD DEBUG ===');
      
      const reimbursementResponse = await API.get('/reimbursements?pending=true');
      console.log('Reimbursements API response:', reimbursementResponse.data);
      
      const expenseReportResponse = await API.get('/expense-reports');
      console.log('Expense Reports API response:', expenseReportResponse.data);
      
      // Test: Get ALL expense reports to see what exists
      const allReportsResponse = await API.get('/expense-reports?all=true');
      console.log('ALL Expense Reports:', allReportsResponse.data);
      
      const reimbursements = reimbursementResponse.data;
      const expenseReports = expenseReportResponse.data;
      
      console.log('Reimbursements count:', reimbursements.length);
      console.log('Expense Reports count:', expenseReports.length);
      
      if (expenseReports.length > 0) {
        console.log('Expense Reports details:', expenseReports.map(r => ({
          id: r._id,
          status: r.status,
          submitter: r.submitterRole,
          submitterName: r.submitterId?.name
        })));
      }
      
      const allRequests = [
        ...reimbursements.map(req => ({ ...req, type: 'reimbursement' })),
        ...expenseReports.map(req => ({ ...req, type: 'expense-report' }))
      ];
      
      console.log('Total combined requests:', allRequests.length);
      setRequests(allRequests);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (requestId, action) => {
    setActionModal({ requestId, action });
    setRemarks('');
  };

  const confirmAction = async () => {
    try {
      const request = requests.find(r => r._id === actionModal.requestId);
      
      if (request.type === 'reimbursement') {
        await API.patch(`/reimbursements/${actionModal.requestId}/status`, {
          status: actionModal.action,
          remarks
        });
      } else if (request.type === 'expense-report') {
        await API.patch(`/expense-reports/${actionModal.requestId}/approve`, {
          action: actionModal.action,
          remarks
        });
      }
      
      setActionModal(null);
      setRemarks('');
      fetchRequests();
    } catch (error) {
      console.error('Failed to update request:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Audit Dashboard</h1>
        <p className="text-gray-600">Review requests awaiting audit approval</p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No requests pending audit approval.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <RequestCard
              key={request._id}
              request={request}
              onAction={handleAction}
              userRole="Audit"
            />
          ))}
        </div>
      )}

      {actionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {actionModal.action === 'approve' ? 'Approve' : 
               actionModal.action === 'reject' ? 'Reject' : 'Send Back'} Request
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audit Remarks {(actionModal.action === 'reject' || actionModal.action === 'sendback') ? '(Required)' : '(Optional)'}
              </label>
              <textarea
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add your comments..."
              />
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={confirmAction}
                disabled={(actionModal.action === 'reject' || actionModal.action === 'sendback') && !remarks.trim()}
                className={`px-4 py-2 rounded-md text-white font-medium disabled:opacity-50 transition-colors ${
                  actionModal.action === 'approve' ? 'bg-emerald-700 hover:bg-emerald-800' :
                  actionModal.action === 'sendback' ? 'bg-amber-700 hover:bg-amber-800' :
                  'bg-red-700 hover:bg-red-800'
                }`}
              >
                Confirm {actionModal.action === 'approve' ? 'Approval' : 
                        actionModal.action === 'sendback' ? 'Send Back' : 'Rejection'}
              </button>
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditDashboard;
