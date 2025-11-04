import { useState, useEffect } from 'react';
import RequestCard from '../../../shared/components/RequestCard';
import ExpenseCard from '../../../shared/components/ExpenseCard';
import SearchAndFilter from '../../../shared/components/SearchAndFilter';
import API from '../../../shared/services/axios';

const FinanceApprovalsPage = () => {
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
      // Fetch expense reports pending finance approval
      const expenseReportResponse = await API.get('/expense-reports');
      
      const expenseReports = expenseReportResponse.data.filter(r => r.status === 'Audit Approved');
      
      // Map with type identifier
      const allRequests = expenseReports.map(req => ({ ...req, type: 'expense-report' }));
      
      // Sort by creation date
      allRequests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setRequests(allRequests);
      setFilteredRequests(allRequests);
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
      (request.studentId?.name || request.facultySubmitterId?.name)?.toLowerCase().includes(searchTerm.toLowerCase())
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
      // Only handle expense reports now
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
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading requests...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Finance Approvals</h1>
        <p className="text-gray-600 mt-2">
          Audit-approved requests awaiting finance approval
        </p>
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
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No requests pending finance approval.</p>
        </div>
      ) : (
        <div>
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredRequests.length} of {requests.length} requests
          </div>
          <div className="grid gap-4">
            {filteredRequests.map((request) => (
              <RequestCard
                key={request._id}
                request={request}
                onAction={handleAction}
                userRole="Finance"
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
                Finance Remarks {(actionModal.action === 'reject' || actionModal.action === 'sendback') ? '(Required)' : '(Optional)'}
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

export default FinanceApprovalsPage;
