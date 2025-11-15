import { useState, useEffect } from 'react';
import RequestCard from '../../../shared/components/RequestCard';
import ExpenseCard from '../../../shared/components/ExpenseCard';
import SearchAndFilter from '../../../shared/components/SearchAndFilter';
import API from '../../../shared/services/axios';

const FacultySubmissionsPage = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      // Fetch faculty's own expense reports
      const expenseReportResponse = await API.get('/expense-reports');
      
      const expenseReports = expenseReportResponse.data.filter(r => r.submitterRole === 'Faculty');
      
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
      request.amount?.toString().includes(searchTerm)
    );
    setFilteredRequests(filtered);
  };

  const handleFilter = (filters) => {
    let filtered = [...requests];
    
    if (filters.expenseType) {
      filtered = filtered.filter(request => request.expenseType === filters.expenseType);
    }
    
    if (filters.status) {
      filtered = filtered.filter(request => request.status === filters.status);
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">My Submissions</h1>
        <p className="mt-1 text-gray-600">Track your submitted reimbursement requests</p>
      </div>

      <SearchAndFilter 
        onSearch={handleSearch}
        onFilter={handleFilter}
        showFilters={{
          expenseType: true,
          status: true,
          amountRange: true
        }}
      />

      {filteredRequests.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
          <p className="text-gray-500">Submit your first request to get started!</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="text-sm text-gray-600 mb-4">
            Showing {filteredRequests.length} of {requests.length} submissions
          </div>
          {filteredRequests.map((request) => (
            <RequestCard
              key={request._id}
              request={request}
              userRole="Faculty"
              showActions={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FacultySubmissionsPage;
