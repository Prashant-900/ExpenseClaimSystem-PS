import Layout from '../components/Layout/Layout';
import EditReimbursementForm from '../components/forms/EditReimbursementForm';

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