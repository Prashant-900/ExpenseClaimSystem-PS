import { useState } from 'react';
import { useAuthStore } from '../../authentication/authStore';
import API from '../../../shared/services/axios';
import ExpenseItemForm from '../components/ExpenseItemForm';
import { SCHOOLS } from '../../../utils/schools';

const FacultyExpenseForm = ({ onSuccess }) => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    facultyName: user?.name || '',
    department: user?.department || 'SCEE',
    expensePeriodStart: '',
    expensePeriodEnd: '',
    purposeOfExpense: '',
    reportType: 'Teaching-related',
    fundingSource: 'Department Budget',
    fundType: 'Department/School Fund',
    projectId: '',
    costCenter: '',
    programProjectCode: '',
    businessUnit: '',
    function: '',
    fund: '',
    region: '',
    items: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Validate required fields
    if (formData.items.length === 0) {
      setErrorMessage('Please add at least one expense item before submitting.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Validate Project ID when Project Fund is selected
    if (formData.fundType === 'Project Fund' && !formData.projectId) {
      setErrorMessage('Project ID is required when Fund Type is "Project Fund".');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const reportData = {
        ...formData,
        submitterId: user._id,
        submitterRole: 'Faculty',
        expenseReportDate: new Date(),
        totalAmount: formData.items.reduce((sum, item) => sum + (item.amountInINR || 0), 0)
      };
      
      // Create the report (as draft initially)
      const response = await API.post('/expense-reports', reportData);
      
      // Submit the report immediately after creation
      await API.put(`/expense-reports/${response.data._id}/submit`);
      
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create report:', error);
      const message = error.response?.data?.message || 'Failed to create report. Please try again.';
      setErrorMessage(message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddItem = (item) => {
    if (editingItem !== null) {
      const updatedItems = [...formData.items];
      updatedItems[editingItem] = item;
      setFormData({ ...formData, items: updatedItems });
      setEditingItem(null);
    } else {
      setFormData({ ...formData, items: [...formData.items, item] });
    }
    setShowItemForm(false);
  };

  const handleEditItem = (index) => {
    setEditingItem(index);
    setShowItemForm(true);
  };

  const handleDeleteItem = (index) => {
    const updatedItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: updatedItems });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Faculty Expense Report</h2>
      
      {errorMessage && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-5 rounded-lg shadow-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-base font-semibold text-red-800 mb-1">Submission Failed</h3>
              <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Faculty Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Faculty Information</h3>
          <p className="text-xs text-gray-500 mb-4">Your details are automatically filled from your profile and cannot be edited here.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Faculty Name</label>
              <input
                type="text"
                name="facultyName"
                value={formData.facultyName}
                className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
                disabled
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
                disabled
                required
              />
            </div>
          </div>
        </div>

        {/* Report Details */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Report Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Expense Period Start</label>
              <input
                type="date"
                name="expensePeriodStart"
                value={formData.expensePeriodStart}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Expense Period End</label>
              <input
                type="date"
                name="expensePeriodEnd"
                value={formData.expensePeriodEnd}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-2">Purpose of Expense</label>
              <textarea
                name="purposeOfExpense"
                value={formData.purposeOfExpense}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                rows="3"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Report Type</label>
              <select
                name="reportType"
                value={formData.reportType}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="Teaching-related">Teaching-related</option>
                <option value="Research-related">Research-related</option>
                <option value="Administrative/Service">Administrative/Service</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>
        </div>

        {/* Financial Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Financial Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Fund Type *</label>
              <select
                name="fundType"
                value={formData.fundType}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              >
                <option value="Department/School Fund">Department/School Fund</option>
                <option value="Institute Fund">Institute Fund</option>
                <option value="Project Fund">Project Fund</option>
                <option value="Professional Development Allowance">Professional Development Allowance</option>
              </select>
            </div>
            {formData.fundType === 'Project Fund' && (
              <div>
                <label className="block text-sm font-medium mb-2">Project ID *</label>
                <input
                  type="text"
                  name="projectId"
                  value={formData.projectId}
                  onChange={handleChange}
                  className="w-full p-2 border rounded"
                  placeholder="Enter Project ID"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Funding Source</label>
              <select
                name="fundingSource"
                value={formData.fundingSource}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="Department Budget">Department Budget</option>
                <option value="Research Grant">Research Grant</option>
                <option value="Gift/Endowment Fund">Gift/Endowment Fund</option>
                <option value="Cost-Sharing/Matching Fund">Cost-Sharing/Matching Fund</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cost Center</label>
              <input
                type="text"
                name="costCenter"
                value={formData.costCenter}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Program/Project Code</label>
              <input
                type="text"
                name="programProjectCode"
                value={formData.programProjectCode}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Business Unit</label>
              <input
                type="text"
                name="businessUnit"
                value={formData.businessUnit}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
            </div>
          </div>
        </div>

        {/* Expense Items */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Expense Items</h3>
            <button
              type="button"
              onClick={() => setShowItemForm(true)}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add Item
            </button>
          </div>
          
          {formData.items.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No expense items added yet</p>
          ) : (
            <div className="space-y-3">
              {formData.items.map((item, index) => (
                <div key={index} className="border rounded p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium">{item.category}</h4>
                        <span className="text-lg font-bold text-green-600">
                          ₹{item.amountInINR?.toFixed(2) || '0.00'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm">{item.description}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {new Date(item.date).toLocaleDateString()} • {item.paymentMethod}
                      </p>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button
                        type="button"
                        onClick={() => handleEditItem(index)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteItem(index)}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div className="border-t pt-3">
                <div className="flex justify-between items-center font-bold text-lg">
                  <span>Total Amount:</span>
                  <span className="text-green-600">
                    ₹{formData.items.reduce((sum, item) => sum + (item.amountInINR || 0), 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting || formData.items.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Expense Report'}
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>

      {showItemForm && (
        <ExpenseItemForm
          item={editingItem !== null ? formData.items[editingItem] : {}}
          onSave={handleAddItem}
          onCancel={() => {
            setShowItemForm(false);
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
};

export default FacultyExpenseForm;