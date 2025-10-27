import { useState, useEffect } from 'react';
import { useAuthStore } from '../../authentication/authStore';
import API from '../../../shared/services/axios';
import StatusBadge from '../../../shared/components/StatusBadge';
import FacultyFundCategorizationModal from '../../expense-reports/components/FacultyFundCategorizationModal';

const FacultyApprovalDashboard = () => {
  const { user } = useAuthStore();
  const [pendingReports, setPendingReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const { data } = await API.get('/expense-reports?pending=true');
      setPendingReports(data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (reportId, approvalData) => {
    try {
      await API.patch(`/expense-reports/${reportId}/approve`, approvalData);
      fetchReports();
      setSelectedReport(null);
    } catch (error) {
      console.error('Failed to approve report:', error);
      throw error;
    }
  };

  const handleReject = async (reportId, rejectionData) => {
    try {
      await API.patch(`/expense-reports/${reportId}/approve`, rejectionData);
      fetchReports();
      setSelectedReport(null);
    } catch (error) {
      console.error('Failed to reject report:', error);
      throw error;
    }
  };

  const handleSendBack = async (reportId, sendBackData) => {
    try {
      await API.patch(`/expense-reports/${reportId}/approve`, sendBackData);
      fetchReports();
      setSelectedReport(null);
    } catch (error) {
      console.error('Failed to send back report:', error);
      throw error;
    }
  };

  const filteredReports = pendingReports.filter(report => {
    const matchesSearch = 
      report.submitterId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.purposeOfExpense?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Pending Approvals</h1>
        <p className="text-gray-600 mt-2">
          Review and approve student expense reports from {user?.department}
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by student name, purpose..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Reports List */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Loading reports...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No reports found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredReports.map(report => (
            <div
              key={report._id}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedReport(report)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {report.submitterId?.name || report.studentName}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {report.submitterId?.email}
                  </p>
                </div>
                <StatusBadge status={report.status} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Purpose</p>
                  <p className="text-sm font-medium">{report.purposeOfExpense}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Amount</p>
                  <p className="text-sm font-medium">₹{report.totalAmount?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Student ID</p>
                  <p className="text-sm font-medium">{report.studentId || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Submitted</p>
                  <p className="text-sm font-medium">
                    {new Date(report.submissionDate || report.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approval Modal */}
      {selectedReport && (
        <FacultyFundCategorizationModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onSendBack={handleSendBack}
        />
      )}
    </div>
  );
};

export default FacultyApprovalDashboard;
