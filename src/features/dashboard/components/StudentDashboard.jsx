import { useState, useEffect } from 'react';
import RequestCard from '../../../shared/components/RequestCard';
import ExpenseCard from '../../../shared/components/ExpenseCard';
import SearchAndFilter from '../../../shared/components/SearchAndFilter';
import API from '../../../shared/services/axios';
import { HiOutlineClipboardDocumentList, HiOutlinePlus } from 'react-icons/hi2';

const StudentDashboard = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await API.get('/expense-reports');
      setRequests(data);
      setFilteredRequests(data);
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
      request.purposeOfExpense?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reportType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.totalAmount?.toString().includes(searchTerm)
    );
    setFilteredRequests(filtered);
  };

  const handleFilter = (filters) => {
    let filtered = [...requests];
    
    if (filters.status) {
      filtered = filtered.filter(request => request.status === filters.status);
    }
    
    if (filters.amountRange) {
      const [min, max] = filters.amountRange.split('-').map(v => v.replace('+', '').replace('₹', ''));
      filtered = filtered.filter(request => {
        const amount = request.totalAmount;
        if (filters.amountRange === '100000+') return amount >= 100000;
        return amount >= parseInt(min) && amount <= parseInt(max);
      });
    }
    
    setFilteredRequests(filtered);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
        <span className="ml-3 text-gray-600">Loading your requests...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">My Requests</h1>
        <p className="mt-1 text-gray-600">Track the status of your submitted expense reports</p>
      </div>

      <SearchAndFilter 
        onSearch={handleSearch}
        onFilter={handleFilter}
        showFilters={{
          status: true,
          amountRange: true
        }}
      />

      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-md shadow-sm border border-gray-200 p-12 text-center">
          <div className="flex justify-center mb-4">
            <HiOutlineClipboardDocumentList className="w-16 h-16 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
          <p className="text-gray-500 mb-6">Submit your first reimbursement request to get started!</p>
          <button
            onClick={() => window.location.href = '/expense-claim'}
            className="flex items-center gap-2 mx-auto px-6 py-3 bg-gray-800 text-white font-medium rounded-md hover:bg-gray-900 focus:outline-none focus:ring-1 focus:ring-gray-500 transition-colors"
          >
            <HiOutlinePlus className="w-4 h-4" />
            Submit Request
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-sm text-gray-600 mb-4">
            Showing {filteredRequests.length} of {requests.length} reports
          </div>
          {filteredRequests.map((request) => (
            <ExpenseCard
              key={request._id}
              request={request}
              userRole="Student"
              showActions={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
