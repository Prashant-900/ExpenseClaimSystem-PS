import { useAuthStore } from '../../authentication/authStore';
import { useUserRole } from '../../../shared/hooks/useUserRole';
import Layout from '../../../shared/layout/Layout';
import MultiStepExpenseForm from '../components/MultiStepExpenseForm';

const ExpenseFormPage = () => {
  const { user } = useAuthStore();
  const { role } = useUserRole();
  
  // Use role from backend, fallback to user from store
  const userRole = role || user?.role;

  const handleSuccess = () => {
    window.location.href = '/dashboard';
  };

  return (
    <Layout>
      {userRole === 'Student' || userRole === 'Faculty' ? (
        <MultiStepExpenseForm onSuccess={handleSuccess} />
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">Access denied. Only students and faculty can create expense reports.</p>
        </div>
      )}
    </Layout>
  );
};

export default ExpenseFormPage;