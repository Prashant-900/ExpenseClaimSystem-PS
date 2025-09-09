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
      const [studentResponse, facultyResponse] = await Promise.all([
        API.get('/reimbursements/student-requests'),
        API.get('/reimbursements/my-requests')
      ]);
      
      const studentData = studentResponse.data;
      const facultyData = facultyResponse.data;
      
      // Student requests stats
      const studentPending = studentData.filter(r => r.status === 'Pending - Faculty').length;
      const studentApproved = studentData.filter(r => r.facultyRemarks && (r.status === 'Pending - Audit' || r.status === 'Pending - Finance' || r.status === 'Completed')).length;
      const studentRejected = studentData.filter(r => r.status === 'Rejected' && r.facultyRemarks).length;
      const studentSentBack = studentData.filter(r => r.status === 'Sent Back - Faculty').length;
      
      // Faculty's own requests stats
      const myRequests = facultyData.length;
      
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
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Faculty Dashboard</h1>
        <p className="mt-1 text-gray-600">Overview of student requests and your submissions</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          <span className="ml-3 text-gray-600">Loading dashboard...</span>
        </div>
      ) : (
        <div className="space-y-8">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Student Requests Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600">Pending Review</h3>
                  <HiOutlineClock className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.studentPending || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600">Approved</h3>
                  <HiOutlineCheckCircle className="w-6 h-6 text-emerald-600" />
                </div>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.studentApproved || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600">Rejected</h3>
                  <HiOutlineXCircle className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.studentRejected || 0}</p>
              </div>
              <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600">Sent Back</h3>
                  <HiOutlineArrowUturnLeft className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.studentSentBack || 0}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">My Submissions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-gray-600">Total Submitted</h3>
                  <HiOutlineClipboardDocumentList className="w-6 h-6 text-gray-600" />
                </div>
                <p className="text-3xl font-bold text-gray-800 mt-2">{stats.myRequests || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyDashboard;
