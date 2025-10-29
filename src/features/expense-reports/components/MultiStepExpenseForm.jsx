import { useState, useEffect } from 'react';
import { useAuthStore } from '../../authentication/authStore';
import API from '../../../shared/services/axios';
import ExpenseItemForm from './ExpenseItemForm';
import ExpenseItemViewModal from '../components/ExpenseItemViewModal';
import { formatCurrency } from '../../../utils/currencyUtils';

const MultiStepExpenseForm = ({ onSuccess }) => {
  const { user } = useAuthStore();
  const [currentStep, setCurrentStep] = useState(1);
  const [reportId, setReportId] = useState(null);
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: user?.name || '',
    facultyId: '',
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
    items: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [facultyList, setFacultyList] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStep1Submit = (e) => {
    e.preventDefault();
    setCurrentStep(2);
  };

  const handleAddItem = (item) => {
    const updatedItems = editingItem !== null 
      ? formData.items.map((existingItem, index) => index === editingItem ? item : existingItem)
      : [...formData.items, item];
    
    const totalAmount = updatedItems.reduce((sum, item) => sum + (item.amountInINR || 0), 0);
    
    setFormData({ ...formData, items: updatedItems, totalAmount });
    setEditingItem(null);
    setShowItemForm(false);
  };

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const { data } = await API.get('/users/list?role=Faculty');
        setFacultyList(data || []);
      } catch (error) {
        console.error('Failed to fetch faculty list:', error);
      }
    };

    if (user?.role === 'Student') fetchFaculty();
  }, [user]);

  const handleEditItem = (index) => {
    setEditingItem(index);
    setShowItemForm(true);
  };

  const handleDeleteItem = (index) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    const updatedItems = formData.items.filter((_, i) => i !== index);
    const totalAmount = updatedItems.reduce((sum, item) => sum + (item.amountInINR || 0), 0);
    
    setFormData({ ...formData, items: updatedItems, totalAmount });
  };

  const handleSubmitReport = async () => {
    setIsSubmitting(true);
    try {
      const reportData = {
        ...formData,
        submitterId: user._id,
        submitterRole: user.role,
        expenseReportDate: new Date(),
        status: 'Submitted'
      };
      
      if (reportId) {
        await API.patch(`/expense-reports/${reportId}`, reportData);
      } else {
        await API.post('/expense-reports', reportData);
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Failed to submit report:', error);
      alert('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const reportData = {
        ...formData,
        submitterId: user._id,
        submitterRole: user.role,
        expenseReportDate: new Date(),
        status: 'Draft'
      };
      
      if (reportId) {
        await API.patch(`/expense-reports/${reportId}`, reportData);
      } else {
        const { data } = await API.post('/expense-reports', reportData);
        setReportId(data._id);
      }
      
      onSuccess?.();
    } catch (error) {
      console.error('Failed to save draft:', error);
      alert('Failed to save draft. Please try again.');
    }
  };

  if (currentStep === 1) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center text-sm font-medium">1</div>
              <span className="ml-2 text-sm font-medium text-gray-800">Report Details</span>
            </div>
            <div className="flex-1 mx-4 h-px bg-gray-400"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-400 text-gray-600 rounded-full flex items-center justify-center text-sm font-medium">2</div>
              <span className="ml-2 text-sm font-medium text-gray-600">Expense Items</span>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Create {user?.role === 'Student' ? 'Expense Claim' : 'Expense Report'}</h2>
          <p className="text-gray-700">Step 1: Fill in the basic report information</p>
        </div>
        
        <form onSubmit={handleStep1Submit} className="space-y-6">
          {user?.role === 'Student' ? (
            <div className="bg-white p-6 rounded border border-gray-300">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-2">Student Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Student ID</label>
                  <input type="text" name="studentId" value={formData.studentId} onChange={handleChange} className="w-full p-2 border rounded" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Student Name</label>
                  <input type="text" name="studentName" value={formData.studentName} onChange={handleChange} className="w-full p-2 border rounded" required />
                </div>
               <div>
                 <label className="block text-sm font-medium mb-2">School</label>
                 <select name="department" value={formData.department} onChange={handleChange} className="w-full p-2 border rounded" required>
                   <option value="">Select School</option>
                   <option value="SCEE">SCEE</option>
                   <option value="SMME">SMME</option>
                   <option value="SCENE">SCENE</option>
                   <option value="SBB">SBB</option>
                   <option value="SCS">SCS</option>
                   <option value="SMSS">SMSS</option>
                   <option value="SPS">SPS</option>
                   <option value="SoM">SoM</option>
                   <option value="SHSS">SHSS</option>
                 </select>
               </div>
                {user?.role === 'Student' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Select Faculty for Submission</label>
                    <select
                      name="facultyId"
                      value={formData.facultyId}
                      onChange={(e) => {
                        const sel = facultyList.find(f => f._id === e.target.value);
                        setFormData({ ...formData, facultyId: e.target.value, facultyName: sel?.name || '' });
                      }}
                      className="w-full p-2 border rounded"
                      required
                    >
                      <option value="">-- Select Faculty --</option>
                      {facultyList.map(f => (
                        <option key={f._id} value={f._id}>{f.name} ({f.email})</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white p-6 rounded border border-gray-300">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-2">Faculty Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Faculty Name</label>
                  <input type="text" name="facultyName" value={formData.facultyName} onChange={handleChange} className="w-full p-2 border rounded" required />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Department</label>
                  <select name="department" value={formData.department} onChange={handleChange} className="w-full p-2 border rounded">
                    <option value="SCEE">SCEE</option>
                    <option value="SMME">SMME</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white p-6 rounded border border-gray-300">
            <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-2">Report Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Expense Period Start</label>
                <input type="date" name="expensePeriodStart" value={formData.expensePeriodStart} onChange={handleChange} className="w-full p-2 border rounded" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Expense Period End</label>
                <input type="date" name="expensePeriodEnd" value={formData.expensePeriodEnd} onChange={handleChange} className="w-full p-2 border rounded" required />
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Purpose of Expense</label>
                <textarea name="purposeOfExpense" value={formData.purposeOfExpense} onChange={handleChange} className="w-full p-2 border rounded" rows="3" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Report Type</label>
                <select name="reportType" value={formData.reportType} onChange={handleChange} className="w-full p-2 border rounded">
                  <option value="Teaching-related">Teaching-related</option>
                  <option value="Research-related">Research-related</option>
                  <option value="Administrative/Service">Administrative/Service</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Cost Center</label>
                <input type="text" name="costCenter" value={formData.costCenter} onChange={handleChange} className="w-full p-2 border rounded" required />
              </div>
            </div>
          </div>

          {user?.role === 'Faculty' && (
            <div className="bg-white p-6 rounded border border-gray-300">
              <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b border-gray-200 pb-2">Financial Information</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Funding Source</label>
                  <select name="fundingSource" value={formData.fundingSource} onChange={handleChange} className="w-full p-2 border rounded">
                    <option value="Department Budget">Department Budget</option>
                    <option value="Research Grant">Research Grant</option>
                    <option value="Gift/Endowment Fund">Gift/Endowment Fund</option>
                    <option value="Cost-Sharing/Matching Fund">Cost-Sharing/Matching Fund</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Program/Project Code</label>
                  <input type="text" name="programProjectCode" value={formData.programProjectCode} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Business Unit</label>
                  <input type="text" name="businessUnit" value={formData.businessUnit} onChange={handleChange} className="w-full p-2 border rounded" />
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-4">
            <button type="submit" className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-900">
              Next: Add Expense Items
            </button>
            <button type="button" onClick={() => window.history.back()} className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
              Cancel
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-6">
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-700 text-white rounded-full flex items-center justify-center text-sm font-medium">✓</div>
            <span className="ml-2 text-sm font-medium text-gray-700">Report Details</span>
          </div>
          <div className="flex-1 mx-4 h-px bg-gray-700"></div>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-800 text-white rounded-full flex items-center justify-center text-sm font-medium">2</div>
            <span className="ml-2 text-sm font-medium text-gray-800">Expense Items</span>
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Add Expense Items</h2>
        <p className="text-gray-700">Step 2: Add your expense items and submit or save as draft</p>
      </div>

      <div className="bg-white p-6 rounded border border-gray-300 mb-6">
        <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-2">
          <h3 className="text-lg font-semibold text-gray-800">Expense Items</h3>
          <button onClick={() => setShowItemForm(true)} className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800">
            Add Item
          </button>
        </div>
        
        {formData.items.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No expense items added yet. Click "Add Item" to get started.</p>
        ) : (
          <div className="space-y-3">
            {formData.items.map((item, index) => (
              <div key={index} className="border rounded p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium">{item.category}</h4>
                      <span className="text-lg font-bold text-gray-800">
                        {formatCurrency(item.amountInINR, 'INR')}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(item.date).toLocaleDateString()} • {item.paymentMethod}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button onClick={() => setViewingItem(item)} className="px-3 py-1 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200">
                      View
                    </button>
                    <button onClick={() => handleEditItem(index)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">
                      Edit
                    </button>
                    <button onClick={() => handleDeleteItem(index)} className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400">
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <div className="border-t pt-3">
              <div className="flex justify-between items-center font-bold text-lg">
                <span>Total Amount:</span>
                <span className="text-gray-800">
                  {formatCurrency(formData.items.reduce((sum, item) => sum + (item.amountInINR || 0), 0), 'INR')}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button onClick={handleSubmitReport} disabled={isSubmitting || formData.items.length === 0} className="px-6 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 disabled:opacity-50">
          {isSubmitting ? 'Submitting...' : 'Submit Report'}
        </button>
        <button onClick={handleSaveDraft} className="px-6 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
          Save as Draft
        </button>
        <button onClick={() => setCurrentStep(1)} className="px-6 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">
          Back to Details
        </button>
      </div>

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

      {viewingItem && (
        <ExpenseItemViewModal
          item={viewingItem}
          onClose={() => setViewingItem(null)}
        />
      )}
    </div>
  );
};

export default MultiStepExpenseForm;