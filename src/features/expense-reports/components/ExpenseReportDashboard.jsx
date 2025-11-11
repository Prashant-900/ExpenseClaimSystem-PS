import { useState, useEffect } from 'react';
import API from '../../../shared/services/axios';

const ExpenseReportDashboard = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const { data } = await API.get('/expense-reports');
      setReports(data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading reports...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Expense Reports</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-600">Manage your expense reports</p>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-12 text-center">
          <div className="text-gray-400 text-4xl sm:text-6xl mb-4">📋</div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No reports found</h3>
          <p className="text-sm sm:text-base text-gray-500 mb-6">Create your first expense report to get started!</p>
          <button
            onClick={() => window.location.href = '/create-report'}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-blue-700"
          >
            Create Report
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((report) => (
            <div key={report._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-3 sm:space-y-0">
                <div className="flex-1">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900">
                    Report {report.reportId}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">{report.purposeOfExpense}</p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    {new Date(report.expensePeriodStart).toLocaleDateString()} - {new Date(report.expensePeriodEnd).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">₹{report.totalAmount?.toFixed(2) || '0.00'}</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    report.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
                    report.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
                    report.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {report.status}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-4">
                <div>
                  <span className="font-medium">Type:</span> {report.reportType}
                </div>
                <div>
                  <span className="font-medium">Items:</span> {report.items?.length || 0}
                </div>
                <div>
                  <span className="font-medium">Funding:</span> {report.fundingSource}
                </div>
              </div>

              <div className="flex gap-2 sm:gap-3">
                <button
                  onClick={() => window.location.href = `/expense-report/${report._id}`}
                  className="px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-blue-700 flex-1 sm:flex-none"
                >
                  View/Edit Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpenseReportDashboard;
