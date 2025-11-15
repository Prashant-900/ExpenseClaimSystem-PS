import { useState, useEffect } from 'react';
import API from '../../../shared/services/axios';

const ExpenseClaimForm = ({ onSuccess }) => {
  const [drafts, setDrafts] = useState([]);
  const [selectedDrafts, setSelectedDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDrafts();
  }, []);

  const fetchDrafts = async () => {
    try {
      const { data } = await API.get('/drafts');
      setDrafts(data);
      if (data.length > 0) {
        setSelectedDrafts([data[0]._id]);
      }
    } catch (error) {
      console.error('Failed to fetch drafts:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedDrafts.length === 0) {
      setError('Please select at least one draft to submit');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const submissionPromises = selectedDrafts.map(async (draftId) => {
        const draft = drafts.find(d => d._id === draftId);
        
        const formDataToSend = new FormData();
        Object.keys(draft).forEach(key => {
          if (draft[key] && key !== '_id' && key !== 'userId' && key !== 'status' && key !== 'createdAt' && key !== 'updatedAt' && key !== '__v') {
            if (key === 'images' && Array.isArray(draft[key])) {
              draft[key].forEach(image => {
                formDataToSend.append('existingImages', image);
              });
            } else {
              formDataToSend.append(key, draft[key]);
            }
          }
        });

        // Handle existing images from draft
        if (formDataToSend.has('existingImages')) {
          const existingImages = formDataToSend.getAll('existingImages');
          formDataToSend.delete('existingImages');
          existingImages.forEach(image => {
            formDataToSend.append('images', image);
          });
        }

        return API.post('/expense-reports', formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      });

      await Promise.all(submissionPromises);
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit expense claims');
    } finally {
      setIsLoading(false);
    }
  };

  const selectedDraftsData = drafts.filter(d => selectedDrafts.includes(d._id));
  const totalAmount = selectedDraftsData.reduce((sum, draft) => sum + (draft.amount || 0), 0);
  
  const handleDraftToggle = (draftId) => {
    setSelectedDrafts(prev => 
      prev.includes(draftId) 
        ? prev.filter(id => id !== draftId)
        : [...prev, draftId]
    );
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Submit Expense Claim</h1>
        <p className="mt-1 text-sm sm:text-base text-gray-600">Submit your final expense claim using a saved draft</p>
      </div>
      
      <div className="max-w-4xl">
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {drafts.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-gray-400 text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No drafts available</h3>
                <p className="text-gray-500 mb-6">Create a draft first before submitting an expense claim</p>
                <button
                  type="button"
                  onClick={() => window.location.href = '/submit'}
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                >
                  Create Draft
                </button>
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Drafts to Submit * (You can select multiple)
                  </label>
                  <div className="space-y-3 max-h-48 sm:max-h-60 overflow-y-auto border border-gray-300 rounded-lg p-3 sm:p-4">
                    {drafts.map((draft) => (
                      <div key={draft._id} className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id={`draft-${draft._id}`}
                          checked={selectedDrafts.includes(draft._id)}
                          onChange={() => handleDraftToggle(draft._id)}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`draft-${draft._id}`} className="flex-1 cursor-pointer">
                          <div className="text-sm font-medium text-gray-900">{draft.title}</div>
                          <div className="text-sm text-gray-600">
                            ₹{draft.amount} • {draft.expenseType} • {new Date(draft.createdAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">{draft.description}</div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedDraftsData.length > 0 && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-4">Selected Drafts Summary</h3>
                    <div className="space-y-4">
                      {selectedDraftsData.map((draft) => (
                        <div key={draft._id} className="bg-white p-3 sm:p-4 rounded border">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 text-sm">
                            <div><strong>Title:</strong> {draft.title}</div>
                            <div><strong>Amount:</strong> ₹{draft.amount}</div>
                            <div><strong>Type:</strong> {draft.expenseType}</div>
                            <div><strong>Date:</strong> {new Date(draft.expenseDate).toLocaleDateString()}</div>
                            <div className="sm:col-span-2"><strong>Description:</strong> {draft.description}</div>
                            {draft.images && draft.images.length > 0 && (
                              <div className="sm:col-span-2">
                                <strong>Attachments:</strong> {draft.images.length} image(s)
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                      <div className="bg-blue-50 p-3 sm:p-4 rounded border-2 border-blue-200">
                        <div className="text-base sm:text-lg font-semibold text-blue-800">
                          Total Amount: ${totalAmount.toFixed(2)}
                        </div>
                        <div className="text-xs sm:text-sm text-blue-600">
                          {selectedDraftsData.length} draft(s) selected
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-4 sm:pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={isLoading || selectedDrafts.length === 0}
                    className="w-full py-3 px-4 sm:px-6 bg-green-600 text-white text-sm sm:text-base font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Submitting...' : `Submit ${selectedDrafts.length} Claim${selectedDrafts.length > 1 ? 's' : ''}`}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpenseClaimForm;
