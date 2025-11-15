import { useState, useEffect } from 'react';
import RequestCard from '../../../shared/components/RequestCard';
import ExpenseCard from '../../../shared/components/ExpenseCard';
import SearchAndFilter from '../../../shared/components/SearchAndFilter';
import API from '../../../shared/services/axios';

const ManagerPendingPage = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionModal, setActionModal] = useState(null);
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await API.get('/expense-reports');
      const pendingRequests = data.filter(r => r.status && r.status.includes('Pending'));
      setRequests(pendingRequests);
      setFilteredRequests(pendingRequests);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      setFilteredRequests(requests);
      return;
    }
    
    const filtered = requests.filter(request => 
      request.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.amount?.toString().includes(searchTerm) ||
      request.studentId?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredRequests(filtered);
  };

  const handleFilter = (filters) => {
    let filtered = [...requests];
    
    if (filters.expenseType) {
      filtered = filtered.filter(request => request.expenseType === filters.expenseType);
    }
    
    if (filters.amountRange) {
      const [min, max] = filters.amountRange.split('-').map(v => v.replace('+', '').replace('$', ''));
      filtered = filtered.filter(request => {
        const amount = request.amount;
        if (filters.amountRange === '1000+') return amount >= 1000;
        return amount >= parseInt(min) && amount <= parseInt(max);
      });
    }
    
    setFilteredRequests(filtered);
  };

  const handleAction = (requestId, action) => {
    setActionModal({ requestId, action });
    setRemarks('');
  };

  const confirmAction = async () => {
    try {
      await API.patch(`/expense-reports/${actionModal.requestId}/approve`, {
        action: actionModal.action,
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
        <h1 className="text-2xl font-bold text-gray-900">Student Pending Requests</h1>
        <p className="text-gray-600">Student requests awaiting your approval</p>
      </div>

      <SearchAndFilter 
        onSearch={handleSearch}
        onFilter={handleFilter}
        showFilters={{
          expenseType: true,
          amountRange: true
        }}
      />

      {filteredRequests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No pending requests for approval.</p>
        </div>
      ) : (
        <div>
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredRequests.length} of {requests.length} pending requests
          </div>
          <div className="space-y-6">
            {filteredRequests.map((request) => (
              <ExpenseCard
                key={request._id}
                request={request}
                onAction={handleAction}
                userRole="Faculty"
              />
            ))}
          </div>
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
    </div>
  );
};

export default ManagerPendingPage;
