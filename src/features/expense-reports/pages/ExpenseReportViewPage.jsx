import Layout from '../../../shared/layout/Layout';
import ExpenseReportDetails from '../forms/ExpenseReportDetailsView';

const ExpenseReportPage = () => {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <ExpenseReportDetails />
      </div>
    </Layout>
  );
};

export default ExpenseReportPage;