import { useState, useEffect } from 'react';
import API from '../../../shared/services/axios';
import { HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineArrowUturnLeft, HiOutlineClipboardDocumentList } from 'react-icons/hi2';

const FacultyDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [studentReimbursements, facultyReimbursements, expenseReports] = await Promise.all([
        API.get('/reimbursements/student-requests'),
        API.get('/reimbursements/my-requests'),
        API.get('/expense-reports')
      ]);
      
      const studentData = studentReimbursements.data;
      const facultyReimbursementData = facultyReimbursements.data;
      const facultyExpenseReports = expenseReports.data.filter(r => r.submitterId && r.submitterRole === 'Faculty');
      
      // Student requests stats (reimbursements only)
      const studentPending = studentData.filter(r => r.status === 'Pending - Faculty Review').length;
      const studentApproved = studentData.filter(r => r.facultyRemarks && (r.status === 'Pending - Audit Review' || r.status === 'Pending - Finance Review' || r.status === 'Completed')).length;
      const studentRejected = studentData.filter(r => r.status === 'Rejected' && r.facultyRemarks).length;
      const studentSentBack = studentData.filter(r => r.status === 'Sent Back - Faculty').length;
      
      // Faculty's own requests stats (both reimbursements and expense reports)
      const myRequests = facultyReimbursementData.length + facultyExpenseReports.length;
      
      setStats({ 
        studentPending, 
        studentApproved, 
        studentRejected, 
        studentSentBack, 
        myRequests 
      });
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Overview of student requests and your submissions
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading dashboard...</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Student Requests Overview */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Student Requests Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600">Pending Review</h3>
                  <HiOutlineClock className="w-6 h-6 text-yellow-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.studentPending || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600">Approved & Forwarded</h3>
                  <HiOutlineCheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.studentApproved || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600">Rejected</h3>
                  <HiOutlineXCircle className="w-6 h-6 text-red-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.studentRejected || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600">Sent Back</h3>
                  <HiOutlineArrowUturnLeft className="w-6 h-6 text-orange-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.studentSentBack || 0}</p>
              </div>
            </div>
          </div>
          
          {/* My Submissions */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">My Submissions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow border border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600">Total Submitted</h3>
                  <HiOutlineClipboardDocumentList className="w-6 h-6 text-blue-500" />
                </div>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.myRequests || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
