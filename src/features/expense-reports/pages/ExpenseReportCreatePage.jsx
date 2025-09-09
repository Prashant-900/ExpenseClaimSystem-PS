import Layout from '../../../shared/layout/Layout';
import ExpenseReportForm from '../forms/ExpenseReportForm';

const CreateReportPage = () => {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <ExpenseReportForm onSuccess={() => window.location.href = '/dashboard'} />
      </div>
    </Layout>
  );
};

export default CreateReportPage;