import Layout from '../../../shared/layout/Layout';
import EditReimbursementForm from '../forms/ReimbursementEditForm';

const EditRequestPage = () => {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <EditReimbursementForm />
      </div>
    </Layout>
  );
};

export default EditRequestPage;