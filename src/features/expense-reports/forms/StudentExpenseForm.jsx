import { useState, useEffect } from 'react';
import { useAuthStore } from '../../authentication/authStore';
import { useUserRole } from '../../../shared/hooks/useUserRole';
import API from '../../../shared/services/axios';
import ExpenseItemForm from '../components/ExpenseItemForm';

const StudentExpenseForm = ({ onSuccess }) => {
  const { user } = useAuthStore();
  const { role } = useUserRole();
  
  // Use role from backend, fallback to user from store
  const userRole = role || user?.role;
  const [formData, setFormData] = useState({
    studentId: user?.studentId || '',
    studentName: user?.name || '',
    facultyId: '',
    facultyName: '',
    expensePeriodStart: '',
    expensePeriodEnd: '',
    purposeOfExpense: '',
    reportType: 'Teaching-related',
    department: user?.department || 'SCEE',
    fundingSource: 'Department Budget',
    costCenter: '',
    items: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [facultyList, setFacultyList] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    
    // Pre-submission validation: Check if student ID exists
    if (!user?.studentId || user.studentId.trim() === '') {
      setErrorMessage('Student ID is required. Please complete your profile by adding your Student ID (Roll Number) before creating expense reports.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    // Validate required fields
    if (formData.items.length === 0) {
      setErrorMessage('Please add at least one expense item before submitting.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const reportData = {
        ...formData,
        submitterId: user._id,
        submitterRole: 'Student',
        expenseReportDate: new Date(),
        totalAmount: formData.items.reduce((sum, item) => sum + (item.amountInINR || 0), 0),
        facultyId: formData.facultyId || null,
        facultyName: formData.facultyName || null
      };
      
      await API.post('/expense-reports', reportData);
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create report:', error);
      const message = error.response?.data?.message || 'Failed to create report. Please try again.';
      setErrorMessage(message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      // If backend says profile update required, show message longer before redirect
      if (error.response?.data?.requiresProfileUpdate) {
        setTimeout(() => {
          window.location.href = '/profile';
        }, 3000);
      }
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

  useEffect(() => {
    // Only fetch faculty list when user is a Student
    const fetchFaculty = async () => {
      try {
        // Filter faculty by student's department
        const department = user?.department || formData.department;
        const url = department 
          ? `/users/list?role=Faculty&department=${department}`
          : '/users/list?role=Faculty';
        
        const { data } = await API.get(url);
        setFacultyList(data || []);
        
        if (data && data.length === 0 && department) {
          console.warn(`No faculty found for department: ${department}`);
        }
      } catch (error) {
        console.error('Failed to fetch faculty list:', error);
      }
    };

    if (userRole === 'Student') {
      fetchFaculty();
    }
  }, [user, userRole, formData.department]);

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
      <h2 className="text-2xl font-bold mb-6">Student Expense Claim</h2>
      
      {errorMessage && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-5 rounded-lg shadow-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-base font-semibold text-red-800 mb-1">
                {errorMessage.includes('Student ID') ? '⚠️ Student ID Required' : 'Submission Failed'}
              </h3>
              <p className="text-sm text-red-700 font-medium">{errorMessage}</p>
              {errorMessage.includes('Student ID') && (
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={() => window.location.href = '/profile'}
                    className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                  >
                    Go to Profile to Add Student ID
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Information */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Student Information</h3>
          <p className="text-xs text-gray-500 mb-4">Student details are automatically filled from your profile and cannot be edited here.</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Student ID</label>
              <input
                type="text"
                name="studentId"
                value={formData.studentId}
                className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
                disabled
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Student Name</label>
              <input
                type="text"
                name="studentName"
                value={formData.studentName}
                className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed"
                disabled
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">School</label>
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

        {/* Expense Details */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">Expense Details</h3>
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
            {userRole === 'Student' && (
              <div className="col-span-2">
                <label className="block text-sm font-medium mb-2">Select Faculty for Submission</label>
                <select
                  name="facultyId"
                  value={formData.facultyId}
                  onChange={(e) => {
                    const selected = facultyList.find(f => f._id === e.target.value);
                    setFormData({ ...formData, facultyId: e.target.value, facultyName: selected?.name || '' });
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
            {isSubmitting ? 'Creating...' : 'Create Expense Claim'}
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

export default StudentExpenseForm;