import { useAuthStore } from '../../authentication/authStore';
import Layout from '../../../shared/layout/Layout';
import StudentExpenseForm from '../forms/StudentExpenseForm';
import FacultyExpenseForm from '../forms/FacultyExpenseForm';

const ExpenseFormPage = () => {
  const { user } = useAuthStore();

  const handleSuccess = () => {
    window.location.href = '/dashboard';
  };

  return (
    <Layout>
      {user?.role === 'Student' ? (
        <StudentExpenseForm onSuccess={handleSuccess} />
      ) : user?.role === 'Faculty' ? (
        <FacultyExpenseForm onSuccess={handleSuccess} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Access denied. Only students and faculty can create expense reports.</p>
        </div>
      )}
    </Layout>
  );
};

export default ExpenseFormPage;