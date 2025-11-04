import { useState, useEffect } from 'react';
import API from '../../../shared/services/axios';
import ExpenseReportDetailModal from '../../../shared/components/ExpenseReportDetailModal';
import RequestCard from '../../../shared/components/RequestCard';
import FacultyFundCategorizationModal from '../../expense-reports/components/FacultyFundCategorizationModal';

const FacultyPendingDashboard = () => {
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [detailModal, setDetailModal] = useState(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      // Fetch only expense reports pending faculty approval
      const expenseReportResponse = await API.get('/expense-reports?pending=true');
      
      const expenseReports = expenseReportResponse.data;
      
      // Map reports with type identifier
      const allReports = expenseReports.map(report => ({ ...report, type: 'expense-report' }));
      
      // Sort by creation date
      allReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      setReports(allReports);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = (reportId, action) => {
    const report = reports.find(r => r._id === reportId);
    setSelectedReport(report);
  };

  const handleApprove = async (reportId, approvalData) => {
    try {
      await API.patch(`/expense-reports/${reportId}/approve`, approvalData);
      fetchReports();
    } catch (error) {
      console.error('Failed to approve report:', error);
      throw error;
    }
  };

  const handleReject = async (reportId, rejectionData) => {
    try {
      await API.patch(`/expense-reports/${reportId}/approve`, rejectionData);
      fetchReports();
    } catch (error) {
      console.error('Failed to reject report:', error);
      throw error;
    }
  };

  const handleSendBack = async (reportId, sendBackData) => {
    try {
      await API.patch(`/expense-reports/${reportId}/approve`, sendBackData);
      fetchReports();
    } catch (error) {
      console.error('Failed to send back report:', error);
      throw error;
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading reports...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Student Requests - Pending Review</h1>
        <p className="text-gray-600 mt-2">
          Student expense reports and reimbursement requests awaiting your approval
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500 text-lg">No student requests pending your review.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <RequestCard
              key={report._id}
              request={report}
              onAction={handleAction}
              userRole="Faculty"
            />
          ))}
        </div>
      )}

      {selectedReport && selectedReport.type === 'expense-report' && (
        <FacultyFundCategorizationModal
          report={selectedReport}
          onApprove={handleApprove}
          onReject={handleReject}
          onSendBack={handleSendBack}
          onClose={() => setSelectedReport(null)}
        />
      )}

      {detailModal && (
        <ExpenseReportDetailModal 
          reportId={detailModal}
          isOpen={!!detailModal}
          onClose={() => setDetailModal(null)}
        />
      )}
    </div>
  );
};

export default FacultyPendingDashboard;