import { useState } from 'react';
import API from '../../../shared/services/axios';
import { useAuthStore } from '../../../features/authentication/authStore';
import { getAllCategories } from '../../../utils/expenseCategories';
import { SCHOOLS } from '../../../utils/schools';


const ExpenseReportForm = ({ onSuccess }) => {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    // Faculty & Report Information
    facultyName: user?.name || '',
    department: user?.department || '',
    expensePeriodStart: '',
    expensePeriodEnd: '',
    purposeOfExpense: '',
    reportType: '',
    
    // Expense Summary
    fundingSource: '',
    costCenter: '',
    programProjectCode: '',
    businessUnit: '',
    function: '',
    fund: '',
    region: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const expenseCategories = getAllCategories();
  const reportTypes = ['Teaching-related', 'Research-related', 'Administrative/Service', 'Other'];
  const fundingSources = ['Department Budget', 'Research Grant', 'Gift/Endowment Fund', 'Cost-Sharing/Matching Fund'];
  const businessUnits = ['Central Finance', 'Faculty Unit', 'Research Division', 'Academic Affairs'];
  const functions = ['Instruction', 'Research', 'Student Services', 'Administration'];
  const funds = ['General Operating Fund', 'Grant Fund', 'Endowment Fund', 'Special Projects Fund'];
  const regions = ['Main Campus', 'Medical School', 'Satellite Campus', 'Remote Location'];
  const departments = SCHOOLS.map(s => s.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Basic validation
    if (!formData.facultyName?.trim()) {
      setError('Faculty name is required');
      setIsLoading(false);
      return;
    }
    if (!formData.department) {
      setError('Department is required');
      setIsLoading(false);
      return;
    }

    try {
      const { data } = await API.post('/expense-reports', formData);
      window.location.href = `/expense-report/${data._id}`;
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create expense report');
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">University Expense Report</h1>
        <p className="mt-1 text-gray-600">Create a comprehensive expense report following university guidelines</p>
      </div>
      
      <div className="max-w-6xl">
        <div className="card">
          <form onSubmit={handleSubmit} className="card-body space-y-8">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* 1. Faculty & Report Information */}
            <div className="bg-gray-50 p-6 rounded-md border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">1. Faculty & Report Information</h3>
              <p className="text-xs text-gray-500 mb-4">Your name and department are automatically filled from your profile.</p>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Faculty Name *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                    value={formData.facultyName}
                    disabled
                    placeholder="Dr. John Smith"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Department *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed"
                    value={formData.department}
                    disabled
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expense Period Start *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
                    value={formData.expensePeriodStart}
                    onChange={(e) => setFormData({ ...formData, expensePeriodStart: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Expense Period End *
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
                    value={formData.expensePeriodEnd}
                    onChange={(e) => setFormData({ ...formData, expensePeriodEnd: e.target.value })}
                  />
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Purpose of Expense *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
                  value={formData.purposeOfExpense}
                  onChange={(e) => setFormData({ ...formData, purposeOfExpense: e.target.value })}
                  placeholder="Conference travel, Research equipment, Lab supplies, Guest lecture, Student activity"
                />
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type *
                </label>
                <select
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
                  value={formData.reportType}
                  onChange={(e) => setFormData({ ...formData, reportType: e.target.value })}
                >
                  <option value="">Select report type</option>
                  {reportTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 2. Expense Summary (Header Level) */}
            <div className="bg-gray-50 p-6 rounded-md border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">2. Expense Summary (Header Level)</h3>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Funding Source *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
                    value={formData.fundingSource}
                    onChange={(e) => setFormData({ ...formData, fundingSource: e.target.value })}
                  >
                    <option value="">Select funding source</option>
                    {fundingSources.map((source) => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cost Center *
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
                    value={formData.costCenter}
                    onChange={(e) => setFormData({ ...formData, costCenter: e.target.value })}
                    placeholder="Dept of Chemistry Lab Budget"
                  />
                </div>
              </div>
              

              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Program/Project Code
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
                  value={formData.programProjectCode}
                  onChange={(e) => setFormData({ ...formData, programProjectCode: e.target.value })}
                  placeholder="If tied to funded research or academic project"
                />
              </div>
              
              <div className="mt-6">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Additional Worktags</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Business Unit
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
                      value={formData.businessUnit}
                      onChange={(e) => setFormData({ ...formData, businessUnit: e.target.value })}
                    >
                      <option value="">Select business unit</option>
                      {businessUnits.map((unit) => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Function
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
                      value={formData.function}
                      onChange={(e) => setFormData({ ...formData, function: e.target.value })}
                    >
                      <option value="">Select function</option>
                      {functions.map((func) => (
                        <option key={func} value={func}>{func}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-6 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fund
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-one focus:ring-1 focus:ring-gray-400"
                      value={formData.fund}
                      onChange={(e) => setFormData({ ...formData, fund: e.target.value })}
                    >
                      <option value="">Select fund</option>
                      {funds.map((fund) => (
                        <option key={fund} value={fund}>{fund}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Region (Campus)
                    </label>
                    <select
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-400"
                      value={formData.region}
                      onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                    >
                      <option value="">Select region</option>
                      {regions.map((region) => (
                        <option key={region} value={region}>{region}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>



            <div className="pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-4 text-lg font-bold"
              >
                {isLoading ? 'Creating Expense Report...' : 'Create Expense Report & Continue to Item Entry'}
              </button>
              <p className="text-sm text-gray-600 text-center mt-2">
                After creating the report, you'll be able to add individual expense items
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExpenseReportForm;
