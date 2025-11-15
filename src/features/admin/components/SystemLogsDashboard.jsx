import { useState, useEffect } from 'react';
import API from '../../../shared/services/axios';
import StatusBadge from '../../../shared/components/StatusBadge';
import SearchAndFilter from '../../../shared/components/SearchAndFilter';
import { getImageUrl } from '../../../config/api';

const SystemLogsPage = () => {
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const { data } = await API.get('/admin/logs');
      const logsData = Array.isArray(data) ? data : [];
      setLogs(logsData);
      setFilteredLogs(logsData);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      setLogs([]);
      setFilteredLogs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (searchTerm) => {
    if (!searchTerm) {
      setFilteredLogs(logs);
      return;
    }
    
    const filtered = logs.filter(log => 
      log.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.amount?.toString().includes(searchTerm) ||
      (log.studentId?.name || log.facultySubmitterId?.name)?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredLogs(filtered);
  };

  const handleFilter = (filters) => {
    let filtered = [...logs];
    
    if (filters.expenseType) {
      filtered = filtered.filter(log => log.expenseType === filters.expenseType);
    }
    
    if (filters.status) {
      filtered = filtered.filter(log => log.status === filters.status);
    }
    
    if (filters.dateRange) {
      const now = new Date();
      const filterDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          filterDate.setMonth(now.getMonth() - 3);
          break;
      }
      
      filtered = filtered.filter(log => new Date(log.createdAt) >= filterDate);
    }
    
    if (filters.amountRange) {
      const [min, max] = filters.amountRange.split('-').map(v => v.replace('+', '').replace('$', ''));
      filtered = filtered.filter(log => {
        const amount = log.amount;
        if (filters.amountRange === '1000+') return amount >= 1000;
        return amount >= parseInt(min) && amount <= parseInt(max);
      });
    }
    
    setFilteredLogs(filtered);
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">System Logs</h1>
        <p className="text-gray-600">View all expense reports and their status</p>
      </div>

      <SearchAndFilter 
        onSearch={handleSearch}
        onFilter={handleFilter}
        showFilters={{
          expenseType: true,
          status: true,
          dateRange: true,
          amountRange: true
        }}
      />

      {filteredLogs.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-gray-500">No logs found</p>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
            <p className="text-sm text-gray-700">Showing {filteredLogs.length} of {logs.length} requests</p>
          </div>
          <ul className="divide-y divide-gray-200">
            {filteredLogs.map((log) => (
            <li key={log._id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    ₹{log.amount} - {log.title || log.description}
                  </p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {(log.studentId?.profileImage || log.facultySubmitterId?.profileImage) && (
                      <img 
                        src={getImageUrl(log.studentId?.profileImage || log.facultySubmitterId?.profileImage)} 
                        alt="Profile" 
                        className="w-6 h-6 rounded-full object-cover cursor-pointer hover:opacity-75"
                        onClick={() => window.open(`/profile/${log.studentId?._id || log.facultySubmitterId?._id}`, '_blank')}
                      />
                    )}
                    <span>Submitted by: {log.studentId?.name || log.facultySubmitterId?.name} | Type: {log.expenseType}</span>
                  </div>
                  
                  {log.images && log.images.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-gray-600 mb-1">Receipt Images:</p>
                      <div className="flex gap-1 flex-wrap">
                        {log.images.map((image, index) => (
                          <img
                            key={index}
                            src={getImageUrl(image)}
                            alt={`Receipt ${index + 1}`}
                            className="w-12 h-12 object-cover rounded border cursor-pointer hover:opacity-75"
                            onClick={() => window.open(getImageUrl(image), '_blank')}
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
