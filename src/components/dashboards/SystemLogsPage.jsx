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
      const { data } = await API.get('/admin/logs');
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
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

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {logs.map((log) => (
            <li key={log._id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    ${log.amount} - {log.description}
                  </p>
                  <p className="text-sm text-gray-500">
                    Employee: {log.employeeId?.name} | Category: {log.category}
                  </p>
                  {(log.managerRemarks || log.financeRemarks) && (
                    <p className="text-xs text-gray-400 mt-1">
                      {log.managerRemarks && `Manager: ${log.managerRemarks}`}
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
    </div>
  );
};

export default SystemLogsPage;