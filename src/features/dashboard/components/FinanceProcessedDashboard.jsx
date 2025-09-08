import { useState, useEffect } from 'react';
import RequestCard from '../../../shared/components/RequestCard';
import ExpenseCard from '../../../shared/components/ExpenseCard';
import API from '../../../shared/services/axios';

const FinanceProcessedPage = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await API.get('/reimbursements');
      // Show all requests that reached finance (Approved - Finance and beyond)
      const financeRequests = data.filter(r => 
        r.status === 'Approved - Finance' ||
        r.status === 'Completed' || 
        (r.status === 'Rejected' && r.financeRemarks) ||
        r.status === 'Sent Back - Finance'
      );
      setRequests(financeRequests);
    } catch (error) {
      console.error('Failed to fetch requests:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">All Finance Requests</h1>
        <p className="text-gray-600">All requests that have reached finance department</p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No processed requests found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {requests.map((request) => (
            <ExpenseCard
              key={request._id}
              request={request}
              userRole="Finance"
              showActions={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FinanceProcessedPage;
