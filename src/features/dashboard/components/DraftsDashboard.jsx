import { useState, useEffect } from 'react';
import API from '../../../shared/services/axios';

const DraftsPage = () => {
  const [drafts, setDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const { data } = await API.get('/expense-reports');
      const draftReports = data.filter(report => report.status === 'Draft');
      setDrafts(draftReports);
    } catch (error) {
      console.error('Failed to fetch drafts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDraft = async (id) => {
    if (!confirm('Are you sure you want to delete this draft?')) return;
    
    try {
      await API.delete(`/expense-reports/${id}`);
      setDrafts(drafts.filter(d => d._id !== id));
    } catch (error) {
      console.error('Failed to delete draft:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-gray-600">Loading drafts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Drafts</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-600">Manage your saved expense drafts</p>
      </div>

      {drafts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-12 text-center">
          <div className="text-gray-400 text-4xl sm:text-6xl mb-4">📝</div>
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No drafts found</h3>
          <p className="text-sm sm:text-base text-gray-500 mb-6">Create your first draft to get started!</p>
          <button
            onClick={() => window.location.href = '/submit'}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-blue-700"
          >
            Create Draft
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {drafts.map((draft) => (
            <div key={draft._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-4 space-y-2 sm:space-y-0">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 break-words">{draft.purposeOfExpense}</h3>
                  <p className="text-sm sm:text-base text-gray-600 mt-1">{draft.reportType}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xl sm:text-2xl font-bold text-green-600">₹{draft.totalAmount?.toFixed(2) || '0.00'}</p>
                  <p className="text-xs sm:text-sm text-gray-500">{draft.fundingSource}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mb-4">
                <div>
                  <span className="font-medium">Period:</span>
                  <span className="ml-1">{new Date(draft.expensePeriodStart).toLocaleDateString()} - {new Date(draft.expensePeriodEnd).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="font-medium">Created:</span>
                  <span className="ml-1">{new Date(draft.createdAt).toLocaleDateString()}</span>
                </div>
                {draft.items && draft.items.length > 0 && (
                  <div>
                    <span className="font-medium">Items:</span>
                    <span className="ml-1">{draft.items.length} item(s)</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => window.location.href = `/expense-report/${draft._id}`}
                  className="px-3 sm:px-4 py-2 bg-blue-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-blue-700 flex-1 sm:flex-none"
                >
                  Edit Draft
                </button>
                <button
                  onClick={() => deleteDraft(draft._id)}
                  className="px-3 sm:px-4 py-2 bg-red-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-red-700 flex-1 sm:flex-none"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DraftsPage;
