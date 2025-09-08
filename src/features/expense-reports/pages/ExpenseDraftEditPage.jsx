import Layout from '../../../shared/layout/Layout';
import EditDraftForm from '../forms/ExpenseDraftEditForm';

const EditDraftPage = () => {
  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <EditDraftForm onSuccess={() => window.location.href = '/drafts'} />
      </div>
    </Layout>
  );
};

export default EditDraftPage;