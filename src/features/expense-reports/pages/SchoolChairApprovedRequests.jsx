import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../authentication/authStore';
import API from '../../../shared/services/axios';
import StatusBadge from '../../../shared/components/StatusBadge';
import SearchAndFilter from '../../../shared/components/SearchAndFilter';

const SchoolChairApprovedRequests = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [approvedReports, setApprovedReports] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    fetchApprovedReports();
  }, []);

  const fetchApprovedReports = async () => {
    setIsLoading(true);
    try {
      // Fetch all processed reports
      const { data } = await API.get('/expense-reports?processed=true');
      
      // Filter to show only reports approved by this School Chair
      const myApprovedReports = data.filter(report => {
        const schoolChairApproval = report.schoolChairApproval;
        return schoolChairApproval && 
               schoolChairApproval.approved === true && 
               schoolChairApproval.approvedById === user._id;
      });

      setApprovedReports(myApprovedReports);
    } catch (error) {
      console.error('Failed to fetch approved reports:', error);
      alert('Failed to load approved reports');
    } finally {
      setIsLoading(false);
    }
  };

  const filterReports = () => {
    let filtered = [...approvedReports];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.submitterId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.purposeOfExpense?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.submitterId?.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus !== 'all') {
      filtered = filtered.filter(report => report.status === filterStatus);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(report => {
        const approvalDate = new Date(report.schoolChairApproval.date);
        switch (dateFilter) {
          case 'today':
            return approvalDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.setDate(now.getDate() - 7));
            return approvalDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
            return approvalDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    return filtered;
  };

  const filteredReports = filterReports();

  const handleViewDetails = (reportId) => {
    navigate(`/expense-report/${reportId}`);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Approved Requests</h1>
        <p className="text-gray-600 mt-2">
          Requests you have approved as School Chairperson - {user?.department}
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Approved</div>
          <div className="text-2xl font-bold text-green-600">{approvedReports.length}</div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Total Amount</div>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(approvedReports.reduce((sum, r) => sum + (r.totalAmount || 0), 0))}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Fully Processed</div>
          <div className="text-2xl font-bold text-gray-700">
            {approvedReports.filter(r => r.status === 'Finance Approved').length}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name, purpose, department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Status</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Statuses</option>
              <option value="School Chair Approved">Pending Further Approval</option>
              <option value="Dean SRIC Approved">Dean SRIC Approved</option>
              <option value="Director Approved">Director Approved</option>
              <option value="Audit Approved">Audit Approved</option>
              <option value="Finance Approved">Finance Approved (Complete)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Approval Date</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 Days</option>
              <option value="month">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-4 text-sm text-gray-600">
        Showing {filteredReports.length} of {approvedReports.length} approved requests
      </div>

      {/* Reports List */}
      {filteredReports.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No approved requests</h3>
          <p className="mt-1 text-sm text-gray-500">
            {searchTerm || filterStatus !== 'all' || dateFilter !== 'all'
              ? 'Try adjusting your filters'
              : 'You haven\'t approved any requests yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReports.map((report) => (
            <div
              key={report._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleViewDetails(report._id)}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {report.submitterId?.name || report.studentName || 'Unknown'}
                    </h3>
                    <StatusBadge status={report.status} />
                  </div>
                  <p className="text-gray-600 mb-2">{report.purposeOfExpense || 'No purpose specified'}</p>
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                      {report.submitterId?.department || 'N/A'}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      {report.fundType}
                    </span>
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Approved: {formatDate(report.schoolChairApproval.date)}
                    </span>
                  </div>
                  {report.schoolChairApproval.remarks && (
                    <div className="mt-2 text-sm">
                      <span className="font-medium text-gray-700">Your Remarks: </span>
                      <span className="text-gray-600">{report.schoolChairApproval.remarks}</span>
                    </div>
                  )}
                </div>
                <div className="mt-4 md:mt-0 md:ml-6 text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatCurrency(report.totalAmount)}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewDetails(report._id);
                    }}
                    className="mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View Details →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchoolChairApprovedRequests;
