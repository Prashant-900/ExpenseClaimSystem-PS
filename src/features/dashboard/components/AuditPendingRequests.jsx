import { useState, useEffect } from 'react';
import RequestCard from '../../../shared/components/RequestCard';
import API from '../../../shared/services/axios';

const AuditPendingRequests = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionModal, setActionModal] = useState(null);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const expenseReportResponse = await API.get('/expense-reports');
      
      const expenseReports = expenseReportResponse.data.filter(r => 
        r.status === 'Director Approved' || r.status === 'Dean SRIC Approved'
      );
      
      const allRequests = expenseReports.map(req => ({ ...req, type: 'expense-report' }));
      
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pending Audit Requests</h1>
        <p className="text-gray-600 mt-2">
          Review and approve requests awaiting audit approval
        </p>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No requests pending audit approval</p>
        </div>
      ) : (
        <div className="grid gap-4">
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

      {/* Action Modal */}
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
                className={`px-4 py-2 rounded-md text-white font-medium disabled:opacity-50 transition-colors focus:ring-2 focus:ring-blue-500 ${
                  actionModal.action === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  actionModal.action === 'sendback' ? 'bg-yellow-600 hover:bg-yellow-700' :
                  'bg-red-600 hover:bg-red-700'
                }`}
              >
                Confirm {actionModal.action === 'approve' ? 'Approval' : 
                        actionModal.action === 'sendback' ? 'Send Back' : 'Rejection'}
              </button>
              <button
                onClick={() => setActionModal(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 font-medium transition-colors"
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

export default AuditPendingRequests;
