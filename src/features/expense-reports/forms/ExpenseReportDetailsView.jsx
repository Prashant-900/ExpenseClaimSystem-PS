import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../../shared/services/axios';
import ExpenseItemForm from '../components/ExpenseItemForm';
import ExpenseItemViewModal from '../components/ExpenseItemViewModal';

const ExpenseReportDetails = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewingItem, setViewingItem] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const { data } = await API.get(`/expense-reports/${id}`);
      setReport(data);
    } catch (error) {
      console.error('Failed to fetch report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    try {
      await API.patch(`/expense-reports/${id}/submit`);
      fetchReport();
    } catch (error) {
      console.error('Failed to submit report:', error);
    }
  };

  const handleAddItem = async (item) => {
    try {
      console.log('Adding item:', item);
      console.log('Editing item:', editingItem);
      console.log('Current report items:', report.items);
      
      const updatedItems = editingItem 
        ? report.items.map(existingItem => existingItem._id === editingItem._id ? { ...existingItem, ...item } : existingItem)
        : [...(report.items || []), item];
      
      console.log('Updated items:', updatedItems);
      
      const totalAmount = updatedItems.reduce((sum, item) => sum + (item.amountInINR || 0), 0);
      
      console.log('Total amount:', totalAmount);
      
      const response = await API.patch(`/expense-reports/${id}`, {
        items: updatedItems,
        totalAmount
      });
      
      console.log('API response:', response.data);
      
      setShowItemForm(false);
      setEditingItem(null);
      fetchReport();
    } catch (error) {
      console.error('Failed to save item:', error.response?.data || error.message);
      alert(`Failed to save item: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      const updatedItems = report.items.filter(item => item._id !== itemId);
      const totalAmount = updatedItems.reduce((sum, item) => sum + (item.amountInINR || 0), 0);
      
      await API.patch(`/expense-reports/${id}`, {
        items: updatedItems,
        totalAmount
      });
      
      fetchReport();
    } catch (error) {
      console.error('Failed to delete item:', error);
      alert('Failed to delete item. Please try again.');
    }
  };

  const handleDeleteReport = async () => {
    if (!confirm('Are you sure you want to delete this entire report? This action cannot be undone.')) return;
    
    try {
      console.log('Attempting to delete report:', id);
      const response = await API.delete(`/expense-reports/${id}`);
      console.log('Delete response:', response);
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Failed to delete report:', error);
      console.error('Error details:', error.response?.data);
      alert(`Failed to delete report: ${error.response?.data?.message || error.message}`);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!report) {
    return <div className="text-center py-12">Report not found</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="border-b pb-6 mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Expense Report {report.reportId}</h1>
              <p className="text-gray-600 mt-2">{report.purposeOfExpense}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
              report.status === 'Draft' ? 'bg-gray-100 text-gray-800' :
              report.status === 'Submitted' ? 'bg-blue-100 text-blue-800' :
              report.status === 'Completed' ? 'bg-green-100 text-green-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {report.status}
            </span>
          </div>
        </div>

        {/* 1. Faculty & Report Information */}
        <div className="bg-gray-50 p-6 rounded border border-gray-300 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-300 pb-2">1. Faculty & Report Information</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <div><strong>Name:</strong> {report.facultyName || report.studentName || report.submitterId?.name}</div>
              <div><strong>Role:</strong> {report.submitterRole}</div>
              <div><strong>Department:</strong> {report.department}</div>
              {report.studentId && <div><strong>Student ID:</strong> {report.studentId}</div>}
            </div>
            <div className="space-y-3">
              <div><strong>Report Date:</strong> {new Date(report.expenseReportDate).toLocaleDateString()}</div>
              <div><strong>Period:</strong> {new Date(report.expensePeriodStart).toLocaleDateString()} – {new Date(report.expensePeriodEnd).toLocaleDateString()}</div>
              <div><strong>Report Type:</strong> {report.reportType}</div>
              <div><strong>Purpose:</strong> {report.purposeOfExpense}</div>
            </div>
          </div>
        </div>

        {/* 2. Expense Summary (Header Level) */}
        <div className="bg-gray-50 p-6 rounded border border-gray-300 mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-300 pb-2">2. Expense Summary (Header Level)</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <div><strong>Funding Source:</strong> {report.fundingSource}</div>
              {report.fundingSource === 'Research Grant' && (
                <>
                  <div><strong>Grant Code:</strong> {report.grantCode || 'N/A'}</div>
                  <div><strong>PI Name:</strong> {report.piName || 'N/A'}</div>
                </>
              )}
              <div><strong>Cost Center:</strong> {report.costCenter}</div>
            </div>
            <div className="space-y-3">
              <div><strong>Program/Project Code:</strong> {report.programProjectCode || 'N/A'}</div>
              <div><strong>Business Unit:</strong> {report.businessUnit || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* 3. Expense Itemization (Line Level) */}
        <div className="bg-white p-6 rounded border border-gray-300 mb-8">
          <div className="flex justify-between items-center mb-6 border-b border-gray-300 pb-2">
            <h3 className="text-xl font-bold text-gray-800">3. Expense Itemization (Line Level)</h3>
            {report.status === 'Draft' && (
              <button
                onClick={() => setShowItemForm(true)}
                className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 font-medium"
              >
                Add Expense Item
              </button>
            )}
          </div>
          
          {report.items?.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-gray-400 text-6xl mb-4">📋</div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">No expense items added yet</h4>
              <p className="text-gray-500 mb-4">Add individual expense items to complete your report</p>
              {report.status === 'Draft' && (
                <button
                  onClick={() => setShowItemForm(true)}
                  className="px-6 py-3 bg-gray-700 text-white font-medium rounded hover:bg-gray-800"
                >
                  Add First Item
                </button>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300">
                      <th className="px-4 py-3 text-left font-semibold text-gray-800">Date</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-800">Expense Category</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-800">Description/Memo</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-800">Amount</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-800">Payment Method</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-800">Receipt</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-800">View</th>
                      {report.status === 'Draft' && <th className="px-4 py-3 text-center font-semibold text-gray-800">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {report.items?.map((item, index) => (
                      <tr key={item._id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-gray-100`}>
                        <td className="px-4 py-3 text-sm">{new Date(item.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm font-medium">{item.category}</td>
                        <td className="px-4 py-3 text-sm">{item.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold">₹{item.amountInINR?.toFixed(2) || item.amount?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm">{item.paymentMethod}</td>
                        <td className="px-4 py-3 text-center">
                          {item.receiptImage ? (
                            <img 
                              src={item.receiptImage} 
                              alt="Receipt" 
                              className="w-8 h-8 object-cover rounded cursor-pointer mx-auto"
                              onClick={() => window.open(item.receiptImage, '_blank')}
                            />
                          ) : (
                            <span className="text-red-500 text-xs">Missing</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => setViewingItem(item)}
                            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                          >
                            View
                          </button>
                        </td>
                        {report.status === 'Draft' && (
                          <td className="px-4 py-3 text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => {
                                  setEditingItem(item);
                                  setShowItemForm(true);
                                }}
                                className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item._id)}
                                className="text-gray-700 hover:text-gray-900 text-sm font-medium"
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* 4. Approval Status & History */}
        {(report.status !== 'Draft' || (report.status === 'Draft' && (report.facultyApproval || report.auditApproval || report.financeApproval))) && (
          <div className="bg-white p-6 rounded border border-gray-300 mb-8">
            <h3 className="text-xl font-bold text-gray-800 mb-6 border-b border-gray-300 pb-2">4. Approval Status & History</h3>
            <div className="space-y-4">
              {/* Faculty Step */}
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  report.facultyApproval?.approved === true ? 'bg-green-500' :
                  report.facultyApproval?.action === 'sendback' ? 'bg-yellow-500' :
                  report.facultyApproval?.approved === false ? 'bg-red-500' :
                  report.status === 'Submitted' ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  1
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Faculty Review</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      report.facultyApproval?.approved === true ? 'bg-green-100 text-green-800' :
                      report.facultyApproval?.action === 'sendback' ? 'bg-yellow-100 text-yellow-800' :
                      report.facultyApproval?.approved === false ? 'bg-red-100 text-red-800' :
                      report.status === 'Submitted' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {report.facultyApproval?.approved === true ? 'Approved' :
                       report.facultyApproval?.action === 'sendback' ? 'Sent Back' :
                       report.facultyApproval?.approved === false ? 'Rejected' :
                       report.status === 'Submitted' ? 'Pending' : 'Not Started'}
                    </span>
                  </div>
                  {report.facultyApproval && (
                    <div className="mt-2 text-sm">
                      <p className="text-gray-600">By: {report.facultyName} on {new Date(report.facultyApproval.date).toLocaleDateString()}</p>
                      {report.facultyApproval.remarks && (
                        <p className="text-gray-700 mt-1 bg-gray-50 p-2 rounded"><strong>Remarks:</strong> {report.facultyApproval.remarks}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Audit Step */}
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  report.auditApproval?.approved === true ? 'bg-green-500' :
                  report.auditApproval?.action === 'sendback' ? 'bg-yellow-500' :
                  report.auditApproval?.approved === false ? 'bg-red-500' :
                  report.status === 'Faculty Approved' ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  2
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Audit Review</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      report.auditApproval?.approved === true ? 'bg-green-100 text-green-800' :
                      report.auditApproval?.action === 'sendback' ? 'bg-yellow-100 text-yellow-800' :
                      report.auditApproval?.approved === false ? 'bg-red-100 text-red-800' :
                      report.status === 'Faculty Approved' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {report.auditApproval?.approved === true ? 'Approved' :
                       report.auditApproval?.action === 'sendback' ? 'Sent Back' :
                       report.auditApproval?.approved === false ? 'Rejected' :
                       report.status === 'Faculty Approved' ? 'Pending' : 'Not Started'}
                    </span>
                  </div>
                  {report.auditApproval && (
                    <div className="mt-2 text-sm">
                      <p className="text-gray-600">On {new Date(report.auditApproval.date).toLocaleDateString()}</p>
                      {report.auditApproval.remarks && (
                        <p className="text-gray-700 mt-1 bg-gray-50 p-2 rounded"><strong>Remarks:</strong> {report.auditApproval.remarks}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Finance Step */}
              <div className="flex items-start gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                  report.financeApproval?.approved === true ? 'bg-green-500' :
                  report.financeApproval?.action === 'sendback' ? 'bg-yellow-500' :
                  report.financeApproval?.approved === false ? 'bg-red-500' :
                  report.status === 'Audit Approved' ? 'bg-blue-500' : 'bg-gray-300'
                }`}>
                  3
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold">Finance Review</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      report.financeApproval?.approved === true ? 'bg-green-100 text-green-800' :
                      report.financeApproval?.action === 'sendback' ? 'bg-yellow-100 text-yellow-800' :
                      report.financeApproval?.approved === false ? 'bg-red-100 text-red-800' :
                      report.status === 'Audit Approved' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {report.financeApproval?.approved === true ? 'Approved' :
                       report.financeApproval?.action === 'sendback' ? 'Sent Back' :
                       report.financeApproval?.approved === false ? 'Rejected' :
                       report.status === 'Audit Approved' ? 'Pending' : 'Not Started'}
                    </span>
                  </div>
                  {report.financeApproval && (
                    <div className="mt-2 text-sm">
                      <p className="text-gray-600">On {new Date(report.financeApproval.date).toLocaleDateString()}</p>
                      {report.financeApproval.remarks && (
                        <p className="text-gray-700 mt-1 bg-gray-50 p-2 rounded"><strong>Remarks:</strong> {report.financeApproval.remarks}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5. Totals & Reimbursement */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">5. Totals & Reimbursement</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-300">
                <span className="font-medium">Total Reported Amount:</span>
                <span className="font-bold text-lg">${report.totalAmount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Amount Paid by University Credit Card:</span>
                <span className="font-semibold">${report.universityCardAmount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Amount Paid Personally (to be reimbursed):</span>
                <span className="font-semibold">${report.personalAmount?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between py-1">
                <span>Non-Reimbursable Amounts:</span>
                <span className="font-semibold text-red-600">${report.nonReimbursableAmount?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-gray-400">
                <span className="font-bold text-lg">Net Reimbursement Requested:</span>
                <span className="font-bold text-xl text-gray-800">${report.netReimbursement?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>
        </div>



        {/* Sendback Remarks */}
        {report.status === 'Draft' && (report.facultyApproval?.action === 'sendback' || report.auditApproval?.action === 'sendback' || report.financeApproval?.action === 'sendback') && (
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded">
            <h4 className="text-lg font-semibold text-yellow-800 mb-4">⚠️ Report Sent Back - Action Required</h4>
            {report.facultyApproval?.action === 'sendback' && (
              <div className="mb-3">
                <span className="font-medium text-yellow-800">Faculty Remarks:</span>
                <p className="text-yellow-700 mt-1">{report.facultyApproval.remarks}</p>
              </div>
            )}
            {report.auditApproval?.action === 'sendback' && (
              <div className="mb-3">
                <span className="font-medium text-yellow-800">Audit Remarks:</span>
                <p className="text-yellow-700 mt-1">{report.auditApproval.remarks}</p>
              </div>
            )}
            {report.financeApproval?.action === 'sendback' && (
              <div className="mb-3">
                <span className="font-medium text-yellow-800">Finance Remarks:</span>
                <p className="text-yellow-700 mt-1">{report.financeApproval.remarks}</p>
              </div>
            )}
            <p className="text-sm text-yellow-600 mt-3">Please address the above concerns and resubmit your report.</p>
          </div>
        )}

        {/* Actions */}
        {report.status === 'Draft' && (
          <div className="bg-white p-6 rounded border border-gray-300">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">Report Actions</h4>
            <div className="flex gap-4 justify-between">
              <div className="flex gap-4">
                {report.items?.length > 0 ? (
                  <button
                    onClick={handleSubmitReport}
                    className="px-8 py-4 bg-gray-800 text-white font-bold text-lg rounded hover:bg-gray-900"
                  >
                    Submit Complete Report for Review
                  </button>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">Add at least one expense item before submitting the report</p>
                    <button
                      onClick={() => setShowItemForm(true)}
                      className="px-6 py-3 bg-gray-700 text-white font-medium rounded hover:bg-gray-800"
                    >
                      Add First Expense Item
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={handleDeleteReport}
                className="px-6 py-3 bg-gray-600 text-white font-medium rounded hover:bg-gray-700"
              >
                Delete Report
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showItemForm && (
        <ExpenseItemForm
          item={editingItem || {}}
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

export default ExpenseReportDetails;
