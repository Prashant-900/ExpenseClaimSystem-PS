import { useState, useEffect } from 'react';
import RequestCard from '../shared/RequestCard';
import API from '../../api/axios';

const ManagerPendingPage = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionModal, setActionModal] = useState(null);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await API.get('/reimbursements?pending=true');
      setRequests(data);
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
      await API.patch(`/reimbursements/${actionModal.requestId}/status`, {
        status: actionModal.action,
        remarks
      });
      
      setActionModal(null);
      setRemarks('');
      fetchRequests();
    } catch (error) {
      console.error('Failed to update request:', error);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Pending Requests</h1>
        <p className="text-gray-600">Review and approve employee requests</p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No pending requests for approval.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <RequestCard
              key={request._id}
              request={request}
              onAction={handleAction}
              userRole="Manager"
            />
          ))}
        </div>
      )}

      {actionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {actionModal.action === 'approve' ? 'Approve' : 'Reject'} Request
            </h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks {actionModal.action === 'reject' ? '(Required)' : '(Optional)'}
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
                disabled={actionModal.action === 'reject' && !remarks.trim()}
                className={`px-4 py-2 rounded text-white ${
                  actionModal.action === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                } disabled:opacity-50`}
              >
                Confirm {actionModal.action === 'approve' ? 'Approval' : 'Rejection'}
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
    </div>
  );
};

export default ManagerPendingPage;