import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import API from '../../../shared/services/axios';
import ExpenseItemForm from './ExpenseItemForm';

const ExpenseReportDetails = () => {
  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [showItemForm, setShowItemForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
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

  const handleDeleteItem = async (itemId) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    
    try {
      await API.delete(`/expense-reports/${id}/items/${itemId}`);
      fetchReport();
    } catch (error) {
      console.error('Failed to delete item:', error);
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
        <div className="bg-blue-50 p-6 rounded-lg border border-blue-200 mb-8">
          <h3 className="text-xl font-bold text-blue-900 mb-6">1. Faculty & Report Information</h3>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-3">
              <div><strong>Faculty Name:</strong> {report.facultyName || report.facultyId?.name}</div>
              <div><strong>Employee ID:</strong> {report.employeeId || report.facultyId?.employeeId || 'N/A'}</div>
              <div><strong>Department/School:</strong> {report.department || report.facultyId?.department || 'N/A'}</div>
              <div><strong>Position/Title:</strong> {report.position || report.facultyId?.position || 'N/A'}</div>
            </div>
            <div className="space-y-3">
              <div><strong>Report ID:</strong> {report.reportId}</div>
              <div><strong>Expense Report Date:</strong> {new Date(report.expenseReportDate).toLocaleDateString()}</div>
              <div><strong>Expense Period:</strong> {new Date(report.expensePeriodStart).toLocaleDateString()} – {new Date(report.expensePeriodEnd).toLocaleDateString()}</div>
              <div><strong>Purpose of Expense:</strong> {report.purposeOfExpense}</div>
              <div><strong>Report Type:</strong> {report.reportType}</div>
            </div>
          </div>
        </div>

        {/* 2. Expense Summary (Header Level) */}
        <div className="bg-green-50 p-6 rounded-lg border border-green-200 mb-8">
          <h3 className="text-xl font-bold text-green-900 mb-6">2. Expense Summary (Header Level)</h3>
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
              <div><strong>Program/Project Code:</strong> {report.programProjectCode || 'N/A'}</div>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-800">Additional Worktags:</h4>
              <div><strong>Business Unit:</strong> {report.businessUnit || 'N/A'}</div>
              <div><strong>Function:</strong> {report.function || 'N/A'}</div>
              <div><strong>Fund:</strong> {report.fund || 'N/A'}</div>
              <div><strong>Region:</strong> {report.region || 'N/A'}</div>
            </div>
          </div>
        </div>

        {/* 3. Expense Itemization (Line Level) */}
        <div className="bg-purple-50 p-6 rounded-lg border border-purple-200 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-purple-900">3. Expense Itemization (Line Level)</h3>
            {report.status === 'Draft' && (
              <button
                onClick={() => setShowItemForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
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
                  className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
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
                    <tr className="bg-purple-100 border-b border-purple-200">
                      <th className="px-4 py-3 text-left font-semibold text-purple-900">Date</th>
                      <th className="px-4 py-3 text-left font-semibold text-purple-900">Expense Category</th>
                      <th className="px-4 py-3 text-left font-semibold text-purple-900">Vendor/Payee</th>
                      <th className="px-4 py-3 text-left font-semibold text-purple-900">Description/Memo</th>
                      <th className="px-4 py-3 text-right font-semibold text-purple-900">Amount</th>
                      <th className="px-4 py-3 text-left font-semibold text-purple-900">Payment Method</th>
                      <th className="px-4 py-3 text-center font-semibold text-purple-900">Receipt</th>
                      <th className="px-4 py-3 text-center font-semibold text-purple-900">Grant</th>
                      {report.status === 'Draft' && <th className="px-4 py-3 text-center font-semibold text-purple-900">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {report.items?.map((item, index) => (
                      <tr key={item._id} className={`border-b border-gray-200 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'} hover:bg-purple-50`}>
                        <td className="px-4 py-3 text-sm">{new Date(item.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-sm font-medium">{item.category}</td>
                        <td className="px-4 py-3 text-sm">{item.vendor}</td>
                        <td className="px-4 py-3 text-sm">{item.description}</td>
                        <td className="px-4 py-3 text-sm text-right font-semibold">${item.amount?.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm">{item.paymentMethod}</td>
                        <td className="px-4 py-3 text-center">
                          {item.receipt ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Attached
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              ✗ Missing
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.chargeToGrant ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              No
                            </span>
                          )}
                        </td>
                        {report.status === 'Draft' && (
                          <td className="px-4 py-3 text-center">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => setEditingItem(item)}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDeleteItem(item._id)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
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

        {/* 4. Totals & Reimbursement */}
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">4. Totals & Reimbursement</h3>
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
                <span className="font-bold text-xl text-green-600">${report.netReimbursement?.toFixed(2) || '0.00'}</span>
              </div>
            </div>
          </div>
        </div>



        {/* Actions */}
        {report.status === 'Draft' && (
          <div className="bg-white p-6 rounded-lg border-2 border-blue-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Report Actions</h4>
            <div className="flex gap-4 justify-between">
              <div className="flex gap-4">
                {report.items?.length > 0 ? (
                  <button
                    onClick={handleSubmitReport}
                    className="px-8 py-4 bg-green-600 text-white font-bold text-lg rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Submit Complete Report for Review
                  </button>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-gray-600 mb-4">Add at least one expense item before submitting the report</p>
                    <button
                      onClick={() => setShowItemForm(true)}
                      className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700"
                    >
                      Add First Expense Item
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={handleDeleteReport}
                className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
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
          reportId={id}
          onSuccess={() => {
            setShowItemForm(false);
            fetchReport();
          }}
          onCancel={() => setShowItemForm(false)}
        />
      )}

      {editingItem && (
        <ExpenseItemForm
          reportId={id}
          editItem={editingItem}
          onSuccess={() => {
            setEditingItem(null);
            fetchReport();
          }}
          onCancel={() => setEditingItem(null)}
        />
      )}
    </div>
  );
};

export default ExpenseReportDetails;
