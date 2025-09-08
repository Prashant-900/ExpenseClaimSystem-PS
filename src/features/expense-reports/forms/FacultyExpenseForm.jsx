import { useState } from 'react';
import { useAuthStore } from '../../authentication/authStore';
import API from '../../../shared/services/axios';

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
    costCenter: '',
    programProjectCode: '',
    businessUnit: '',
    function: '',
    fund: '',
    region: '',
    items: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const reportData = {
        ...formData,
        submitterId: user._id,
        submitterRole: 'Faculty',
        expenseReportDate: new Date(),
        totalAmount: formData.items.reduce((sum, item) => sum + (item.amount || 0), 0)
      };
      
      await API.post('/expense-reports', reportData);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create report:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Faculty Expense Report</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Faculty Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Faculty Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Faculty Name</label>
              <input
                type="text"
                name="facultyName"
                value={formData.facultyName}
                onChange={handleChange}
                className="w-full p-2 border rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Department</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              >
                <option value="SCEE">SCEE</option>
                <option value="SMME">SMME</option>
              </select>
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
                required
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

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={isSubmitting}
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
    </div>
  );
};

export default FacultyExpenseForm;