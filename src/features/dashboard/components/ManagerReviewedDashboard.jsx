import { useState, useEffect } from 'react';
import RequestCard from '../../../shared/components/RequestCard';
import ExpenseCard from '../../../shared/components/ExpenseCard';
import SearchAndFilter from '../../../shared/components/SearchAndFilter';
import API from '../../../shared/services/axios';

const ManagerReviewedPage = () => {
  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await API.get('/expense-reports');
      const reviewed = data.filter(r => r.status !== 'Draft' && r.status !== 'Submitted');
      setRequests(reviewed);
      setFilteredRequests(reviewed);
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
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Student Reviewed Requests</h1>
        <p className="text-gray-600">All student requests you have handled</p>
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
        <div className="text-center py-12">
          <p className="text-gray-500">No reviewed requests found.</p>
        </div>
      ) : (
        <div>
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredRequests.length} of {requests.length} reviewed requests
          </div>
          <div className="space-y-6">
            {filteredRequests.map((request) => (
              <ExpenseCard
                key={request._id}
                request={request}
                userRole="Faculty"
                showActions={false}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerReviewedPage;
