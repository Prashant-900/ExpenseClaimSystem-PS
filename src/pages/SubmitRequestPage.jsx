import Layout from '../components/Layout/Layout';
import ReimbursementForm from '../components/forms/ReimbursementForm';

const SubmitRequestPage = () => {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <ReimbursementForm onSuccess={() => window.location.href = '/dashboard'} />
      </div>
    </Layout>
  );
};

export default SubmitRequestPage;