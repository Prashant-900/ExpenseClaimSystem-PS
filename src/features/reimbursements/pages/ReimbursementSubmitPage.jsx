import Layout from '../../../shared/layout/Layout';
import ReimbursementForm from '../forms/ReimbursementForm';

const SubmitRequestPage = () => {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <ReimbursementForm onSuccess={() => window.location.href = '/drafts'} />
      </div>
    </Layout>
  );
};

export default SubmitRequestPage;