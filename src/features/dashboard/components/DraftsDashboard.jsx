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
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">My Drafts</h1>
        <p className="mt-1 text-gray-600">Manage your saved expense drafts</p>
      </div>

      {drafts.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="text-gray-400 text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No drafts found</h3>
          <p className="text-gray-500 mb-6">Create your first draft to get started!</p>
          <button
            onClick={() => window.location.href = '/submit'}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
          >
            Create Draft
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {drafts.map((draft) => (
            <div key={draft._id} className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{draft.purposeOfExpense}</h3>
                  <p className="text-gray-600 mt-1">{draft.reportType}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600">${draft.totalAmount?.toFixed(2) || '0.00'}</p>
                  <p className="text-sm text-gray-500">{draft.fundingSource}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
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

              <div className="flex gap-3">
                <button
                  onClick={() => window.location.href = `/expense-report/${draft._id}`}
                  className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                  Edit Draft
                </button>
                <button
                  onClick={() => deleteDraft(draft._id)}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700"
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
