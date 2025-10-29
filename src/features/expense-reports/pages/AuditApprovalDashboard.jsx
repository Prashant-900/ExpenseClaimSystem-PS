import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../authentication/authStore';
import API from '../../../shared/services/axios';
import StatusBadge from '../../../shared/components/StatusBadge';
import ApprovalModal from '../../../shared/components/ApprovalModal';

const AuditApprovalDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [pendingReports, setPendingReports] = useState([]);
  const [processedReports, setProcessedReports] = useState([]);
  const [activeTab, setActiveTab] = useState('pending');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');

  useEffect(() => {
    fetchReports();
  }, [activeTab]);

  const fetchReports = async () => {
    setIsLoading(true);
    try {
      const endpoint = activeTab === 'pending' 
        ? '/expense-reports'
        : '/expense-reports?all=true';
      
      const { data } = await API.get(endpoint);
      
      if (activeTab === 'pending') {
        setPendingReports(data);
      } else {
        // Filter to show only reports processed by this Audit user
        const myProcessedReports = data.filter(report => {
          const auditApproval = report.auditApproval;
          return auditApproval && 
                 auditApproval.approvedById === user._id &&
                 (report.status === 'Audit Approved' || 
                  report.status === 'Finance Approved' || 
                  (report.status === 'Rejected' && auditApproval.approved === false));
        });
        setProcessedReports(myProcessedReports);
      }
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

  const currentReports = activeTab === 'pending' ? pendingReports : processedReports;

  const filteredReports = currentReports.filter(report => {
    const matchesSearch = 
      report.submitterId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.purposeOfExpense?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = filterDepartment === 'all' || report.department === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });

  const totalPendingAmount = pendingReports.reduce((sum, report) => sum + (report.totalAmount || 0), 0);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Audit Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Review and audit expense reports
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-2 px-4 font-medium ${
              activeTab === 'pending'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending Approval ({pendingReports.length})
          </button>
          <button
            onClick={() => setActiveTab('processed')}
            className={`pb-2 px-4 font-medium ${
              activeTab === 'processed'
                ? 'border-b-2 border-blue-600 text-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Processed ({processedReports.length})
          </button>
        </div>
      </div>

      {/* Search and Department Filter */}
      <div className="mb-6 flex gap-4">
        <input
          type="text"
          placeholder="Search by name or purpose..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={filterDepartment}
          onChange={(e) => setFilterDepartment(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Schools</option>
          <option value="SCEE">SCEE</option>
          <option value="SMME">SMME</option>
          <option value="SCENE">SCENE</option>
          <option value="SBB">SBB</option>
          <option value="SCS">SCS</option>
          <option value="SMSS">SMSS</option>
          <option value="SPS">SPS</option>
          <option value="SoM">SoM</option>
          <option value="SHSS">SHSS</option>
        </select>
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
              onClick={() => {
                if (activeTab === 'processed') {
                  navigate(`/expense-report/${report._id}`);
                } else {
                  setSelectedReport(report);
                }
              }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {report.submitterId?.name}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {report.department} • {report.submitterId?.email}
                  </p>
                </div>
                <StatusBadge status={report.status} fundType={report.fundType} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-500">Purpose</p>
                  <p className="text-sm font-medium">{report.purposeOfExpense}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Fund Type</p>
                  <p className="text-sm font-medium">{report.fundType}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Amount</p>
                  <p className="text-sm font-medium text-lg">
                    ₹{report.totalAmount?.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Submitted</p>
                  <p className="text-sm font-medium">
                    {new Date(report.submissionDate || report.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Approval Trail */}
              <div className="text-xs text-gray-600 border-t pt-2 space-y-1">
                {report.facultyApproval?.approved && (
                  <div>✓ Faculty: {report.facultyApproval.approvedBy}</div>
                )}
                {report.schoolChairApproval?.approved && (
                  <div>✓ School Chair: {report.schoolChairApproval.approvedBy}</div>
                )}
                {report.deanSRICApproval?.approved && (
                  <div>✓ Dean SRIC: {report.deanSRICApproval.approvedBy}</div>
                )}
                {report.directorApproval?.approved && (
                  <div>✓ Director: {report.directorApproval.approvedBy}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approval Modal - Only show for pending tab */}
      {selectedReport && activeTab === 'pending' && (
        <ApprovalModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          onSendBack={handleSendBack}
          roleName="Audit"
        />
      )}
    </div>
  );
};

export default AuditApprovalDashboard;
