import Layout from '../../../shared/layout/Layout';
import ExpenseReportDetails from '../forms/ExpenseReportDetailsView';
import ErrorBoundary from '../../../shared/components/ErrorBoundary';

const ExpenseReportPage = () => {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-2 sm:px-0">
        <ErrorBoundary>
          <ExpenseReportDetails />
        </ErrorBoundary>
      </div>
    </Layout>
  );
};

export default ExpenseReportPage;