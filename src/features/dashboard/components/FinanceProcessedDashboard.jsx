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
      const { data } = await API.get('/expense-reports?processed=true');
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
            <div key={request._id} className="bg-white rounded-lg shadow-md border p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {request.submitterId?.profileImage ? (
                      <img 
                        src={`${request.submitterId.profileImage}?v=${Date.now()}`} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500 text-lg font-medium">
                        {(request.submitterId?.name || request.facultyName || request.studentName)?.charAt(0)?.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      {request.submitterId?.name || request.facultyName || request.studentName}
                      {' - '}{request.purposeOfExpense}
                    </h3>
                    <p className="text-gray-600 mt-1">{request.reportType} ({request.submitterRole})</p>
                    <p className="text-sm text-gray-500">
                      Period: {new Date(request.expensePeriodStart).toLocaleDateString()} - {new Date(request.expensePeriodEnd).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">₹{request.totalAmount?.toFixed(2) || '0.00'}</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    request.status === 'Finance Approved' ? 'bg-green-100 text-green-800' :
                    request.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {request.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Department:</span> {request.department}
                </div>
                <div>
                  <span className="font-medium">Items:</span> {request.items?.length || 0}
                </div>
                <div>
                  <span className="font-medium">Funding:</span> {request.fundingSource}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FinanceProcessedPage;
