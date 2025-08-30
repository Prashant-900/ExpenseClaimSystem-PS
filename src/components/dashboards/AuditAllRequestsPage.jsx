import { useState, useEffect } from 'react';
import RequestCard from '../shared/RequestCard';
import API from '../../api/axios';

const AuditAllRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const { data } = await API.get('/reimbursements');
      setRequests(data);
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
        <h1 className="text-2xl font-bold text-gray-900">All Requests</h1>
        <p className="text-gray-600">View all reimbursement requests in the system</p>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No requests found.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {requests.map((request) => (
            <RequestCard
              key={request._id}
              request={request}
              userRole="Audit"
              showActions={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AuditAllRequestsPage;