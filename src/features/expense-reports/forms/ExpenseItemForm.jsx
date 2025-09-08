import { useState } from 'react';
import API from '../../../shared/services/axios';
import { validateExpenseItem } from '../../../utils/expenseValidation';

const ExpenseItemForm = ({ reportId, onSuccess, onCancel, editItem = null }) => {
  const [formData, setFormData] = useState({
    date: editItem?.date?.split('T')[0] || '',
    category: editItem?.category || '',
    vendor: editItem?.vendor || '',
    description: editItem?.description || '',
    amount: editItem?.amount || '',
    paymentMethod: editItem?.paymentMethod || '',
    chargeToGrant: editItem?.chargeToGrant || false
  });
  const [receipt, setReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Travel – Airfare',
    'Travel – Accommodation', 
    'Travel – Meals & Per Diem',
    'Local Transportation (Taxi, Ride-share, Mileage reimbursement)',
    'Conference Fees',
    'Research Equipment/Supplies',
    'Lab Consumables',
    'Books/Subscriptions/Software',
    'Student Activity Support (e.g., refreshments, materials)',
    'Guest Lecturer Honorarium',
    'Miscellaneous / Other'
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
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key]);
      });
      
      if (receipt) {
        formDataToSend.append('receipt', receipt);
      }

      if (editItem) {
        await API.put(`/expense-reports/${reportId}/items/${editItem._id}`, formData);
      } else {
        await API.post(`/expense-reports/${reportId}/items`, formDataToSend, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      
      onSuccess();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to save expense item');
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
              {editItem ? 'Edit' : 'Add'} Expense Item
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
                Vendor/Payee *
              </label>
              <input
                type="text"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                placeholder="Airline, Hotel, Supplier, etc."
              />
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

            {!editItem && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Receipt Upload
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => setReceipt(e.target.files[0])}
                />
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="chargeToGrant"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.chargeToGrant}
                onChange={(e) => setFormData({ ...formData, chargeToGrant: e.target.checked })}
              />
              <label htmlFor="chargeToGrant" className="ml-2 block text-sm text-gray-900">
                Charge to Grant/Department
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : (editItem ? 'Update Item' : 'Add Item')}
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
