import { useState } from 'react';
import API from '../../../shared/services/axios';
import { validateExpenseItem } from '../../../utils/expenseValidation';

const ExpenseItemForm = ({ item, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    date: item?.date?.split('T')[0] || '',
    category: item?.category || '',
    description: item?.description || '',
    amount: item?.amount || '',
    currency: item?.currency || 'INR',
    paymentMethod: item?.paymentMethod || '',
    businessPurpose: item?.businessPurpose || ''
  });
  const [receipts, setReceipts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Travel - Air', 'Travel - Train', 'Travel - Bus', 'Travel - Ground Transport',
    'Accommodation - Hotel', 'Accommodation - Guest House',
    'Meals - Breakfast', 'Meals - Lunch', 'Meals - Dinner',
    'Conference - Registration', 'Conference - Workshop',
    'Supplies - Lab', 'Supplies - Office',
    'Miscellaneous - Other'
  ];

  const paymentMethods = [
    'University Credit Card (P-Card)',
    'Personal Funds (Reimbursement)', 
    'Direct Invoice to University'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validation
    const validation = validateExpenseItem(formData);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      setIsLoading(false);
      return;
    }

    try {
      if (receipts.length === 0 && !item) {
        setError('At least one receipt image is required');
        setIsLoading(false);
        return;
      }

      let receiptUrls = item?.receipts || [];
      
      if (receipts.length > 0) {
        for (const receipt of receipts) {
          const formDataUpload = new FormData();
          formDataUpload.append('file', receipt);
          
          const uploadResponse = await API.post('/upload', formDataUpload, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
          receiptUrls.push(uploadResponse.data.filename);
        }
      }
      
      const itemData = {
        ...formData,
        amount: parseFloat(formData.amount),
        amountInINR: parseFloat(formData.amount),
        receipts: receiptUrls
      };
      
      onSave(itemData);
    } catch (error) {
      setError('Failed to save expense item: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {item ? 'Edit' : 'Add'} Expense Item
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>



            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Conference registration – AI Symposium"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount ($) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                >
                  <option value="">Select method</option>
                  {paymentMethods.map((method) => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Business Purpose *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.businessPurpose}
                onChange={(e) => setFormData({ ...formData, businessPurpose: e.target.value })}
                placeholder="Conference attendance, research meeting, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receipt Images * (Required)
              </label>
              <input
                type="file"
                multiple
                accept="image/*,.pdf"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e) => setReceipts(Array.from(e.target.files))}
              />
              <p className="text-xs text-gray-500 mt-1">Upload one or more receipt images (JPG, PNG, PDF)</p>
              {receipts.length > 0 && (
                <div className="mt-2">
                  <p className="text-sm text-green-600">{receipts.length} file(s) selected</p>
                  <ul className="text-xs text-gray-600">
                    {receipts.map((file, index) => (
                      <li key={index}>{file.name}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : (item ? 'Update Item' : 'Add Item')}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-2 px-4 bg-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpenseItemForm;
