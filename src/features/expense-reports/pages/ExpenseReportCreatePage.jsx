import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import Layout from '../../../shared/layout/Layout';
import ExpenseReportForm from '../forms/ExpenseReportForm';
import StudentExpenseForm from '../forms/StudentExpenseForm';
import { useAuthStore } from '../../authentication/authStore';
import { useUserRole } from '../../../shared/hooks/useUserRole';

const CreateReportPage = () => {
  const { user, checkAuth } = useAuthStore();
  const { role } = useUserRole();
  const navigate = useNavigate();
  
  // Use role from backend, fallback to user from store
  const userRole = role || user?.role;
  
  // Force refresh user data when component mounts to ensure we have latest studentId
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Check if student ID is missing for students
  const isStudentMissingId = userRole === 'Student' && !user?.studentId;

  if (isStudentMissingId) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg shadow-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-6 w-6 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  Student ID Required
                </h3>
                <p className="text-yellow-700 mb-4">
                  You must complete your profile by adding your Student ID (Roll Number) before you can create expense reports.
                </p>
                <button
                  onClick={() => navigate('/profile')}
                  className="px-6 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
                >
                  Go to Profile Page
                </button>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        {userRole === 'Student' ? (
          <StudentExpenseForm onSuccess={() => window.location.href = '/dashboard'} />
        ) : (
          <ExpenseReportForm onSuccess={() => window.location.href = '/dashboard'} />
        )}
      </div>
    </Layout>
  );
};

export default CreateReportPage;