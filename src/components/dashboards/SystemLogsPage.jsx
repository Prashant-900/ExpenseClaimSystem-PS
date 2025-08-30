import { useState, useEffect } from 'react';
import API from '../../api/axios';
import StatusBadge from '../shared/StatusBadge';

const SystemLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data } = await API.get('/reimbursements');
      setLogs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      setLogs([]);
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
        <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
        <p className="text-gray-600">View all reimbursement requests and their status</p>
      </div>

      {logs.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500">No logs found</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {logs.map((log) => (
            <li key={log._id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    ${log.amount} - {log.title || log.description}
                  </p>
                  <p className="text-sm text-gray-500">
                    Employee: {log.employeeId?.name || log.submittedBy?.name} | Type: {log.expenseType || log.category}
                  </p>
                  
                  {log.images && log.images.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 mb-1">Receipt Images:</p>
                      <div className="flex gap-1 flex-wrap">
                        {log.images.map((image, index) => (
                          <img
                            key={index}
                            src={`http://localhost:5000/api/images/${image}`}
                            alt={`Receipt ${index + 1}`}
                            className="w-12 h-12 object-cover rounded border cursor-pointer hover:opacity-75"
                            onClick={() => window.open(`http://localhost:5000/api/images/${image}`, '_blank')}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {(log.facultyRemarks || log.auditRemarks || log.financeRemarks) && (
                    <p className="text-xs text-gray-400 mt-1">
                      {log.facultyRemarks && `Faculty: ${log.facultyRemarks}`}
                      {log.auditRemarks && ` | Audit: ${log.auditRemarks}`}
                      {log.financeRemarks && ` | Finance: ${log.financeRemarks}`}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <StatusBadge status={log.status} />
                  <div className="text-sm text-gray-500">
                    {new Date(log.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    )}
    </div>
  );
};

export default SystemLogsPage;