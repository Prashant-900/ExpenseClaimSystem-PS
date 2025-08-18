import { useState, useEffect } from 'react';
import RequestCard from '../shared/RequestCard';
import API from '../../api/axios';

const FinanceProcessedPage = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await API.get('/admin/logs'); // Get all requests
      // Filter for completed or rejected by finance
      const processed = data.filter(r => 
        r.status === 'Completed' || 
        (r.status === 'Rejected' && r.financeRemarks)
      );
      setRequests(processed);
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
        <h1 className="text-2xl font-bold text-gray-900">Processed Requests</h1>
        <p className="text-gray-600">All requests you have processed</p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No processed requests found.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <RequestCard
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