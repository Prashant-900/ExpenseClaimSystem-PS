import Layout from '../../../shared/layout/Layout';
import ExpenseClaimForm from '../forms/ExpenseClaimForm';

const ExpenseClaimPage = () => {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <ExpenseClaimForm onSuccess={() => window.location.href = '/dashboard'} />
      </div>
    </Layout>
  );
};

export default ExpenseClaimPage;