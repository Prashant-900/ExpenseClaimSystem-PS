import { useState } from 'react';

const SchoolChairApprovalModal = ({ report, onApprove, onReject, onSendBack, onClose }) => {
  const [action, setAction] = useState('approve');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation for reject and sendback - remarks required
    if ((action === 'reject' || action === 'sendback') && !remarks.trim()) {
      setError('Remarks are required when rejecting or sending back a report');
      return;
    }

    setIsSubmitting(true);

    try {
      const approvalData = {
        action,
        remarks: remarks.trim()
      };

      if (action === 'approve') {
        await onApprove(report._id, approvalData);
      } else if (action === 'reject') {
        await onReject(report._id, approvalData);
      } else if (action === 'sendback') {
        await onSendBack(report._id, approvalData);
      }

      onClose();
    } catch (error) {
      console.error('Approval error:', error);
      setError(error.response?.data?.message || 'Failed to process approval');
      setIsSubmitting(false);
    }
  };

  const getNextApprover = (fundType) => {
    switch (fundType) {
      case 'Institute Fund':
        return 'Director';
      case 'Project Fund':
        return 'Dean SRIC';
      case 'Department/School Fund':
      case 'Professional Development Allowance':
        return 'Audit';
      default:
        return 'Next Approver';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Review Expense Report</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              disabled={isSubmitting}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Report Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-3">Report Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Submitter:</span> {report.submitterId?.name || report.facultyName || report.studentName}
              </div>
              <div>
                <span className="font-medium">Role:</span> {report.submitterRole}
              </div>
              <div>
                <span className="font-medium">Department:</span> {report.department}
              </div>
              <div>
                <span className="font-medium">Fund Type:</span> {report.fundType || 'Not Categorized'}
              </div>
              <div>
                <span className="font-medium">Purpose:</span> {report.purposeOfExpense}
              </div>
              <div>
                <span className="font-medium">Total Amount:</span> ₹{report.totalAmount?.toLocaleString()}
              </div>
              <div className="col-span-2">
                <span className="font-medium">Period:</span> {new Date(report.expensePeriodStart).toLocaleDateString()} - {new Date(report.expensePeriodEnd).toLocaleDateString()}
              </div>
            </div>

            {/* Faculty Approval Info */}
            {report.facultyApproval && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="font-medium text-sm mb-2">Faculty Approval</h4>
                <div className="text-sm text-gray-600">
                  <div className="mb-1">
                    <span className="font-medium">Approved by:</span> {report.facultyName}
                  </div>
                  {report.facultyApproval.date && (
                    <div className="mb-1">
                      <span className="font-medium">Date:</span> {new Date(report.facultyApproval.date).toLocaleDateString()}
                    </div>
                  )}
                  {report.facultyApproval.remarks && (
                    <div>
                      <span className="font-medium">Remarks:</span> {report.facultyApproval.remarks}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Expense Items */}
          {report.items && report.items.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-lg mb-3">Expense Items ({report.items.length})</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {report.items.map((item, index) => (
                  <div key={index} className="bg-gray-50 p-3 rounded border">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-semibold">{item.category}</h4>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">₹{item.amountInINR?.toLocaleString()}</div>
                        {item.currency !== 'INR' && (
                          <div className="text-xs text-gray-500">
                            {item.currency} {item.amount?.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                      <div><span className="font-medium">Date:</span> {new Date(item.date).toLocaleDateString()}</div>
                      <div><span className="font-medium">Payment:</span> {item.paymentMethod}</div>
                    </div>
                    {item.receiptImage && (
                      <div className="mt-2 flex gap-3">
                        <button
                          type="button"
                          onClick={() => window.open(item.receiptImage, '_blank')}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          View Receipt
                        </button>
                        <button
                          type="button"
                          onClick={() => window.open(`/expense-report/${report._id}`, '_blank')}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          View Details
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Action Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Action</label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="approve"
                    checked={action === 'approve'}
                    onChange={(e) => setAction(e.target.value)}
                    className="mr-2"
                    disabled={isSubmitting}
                  />
                  <span className="text-green-600 font-medium">Approve</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="reject"
                    checked={action === 'reject'}
                    onChange={(e) => setAction(e.target.value)}
                    className="mr-2"
                    disabled={isSubmitting}
                  />
                  <span className="text-red-600 font-medium">Reject</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="sendback"
                    checked={action === 'sendback'}
                    onChange={(e) => setAction(e.target.value)}
                    className="mr-2"
                    disabled={isSubmitting}
                  />
                  <span className="text-yellow-600 font-medium">Send Back</span>
                </label>
              </div>
            </div>

            {/* Workflow Preview */}
            {action === 'approve' && report.fundType && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm font-medium text-blue-900 mb-1">
                  After approval, this report will go to: <span className="text-blue-700">{getNextApprover(report.fundType)}</span>
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  {report.fundType === 'Institute Fund' && 'Workflow: Faculty → School Chairperson → Director → Audit → Finance'}
                  {report.fundType === 'Project Fund' && 'Workflow: Faculty → School Chairperson → Dean SRIC → Audit → Finance'}
                  {report.fundType === 'Department/School Fund' && 'Workflow: Faculty → School Chairperson → Audit → Finance'}
                  {report.fundType === 'Professional Development Allowance' && 'Workflow: Faculty → School Chairperson → Audit → Finance'}
                </p>
              </div>
            )}

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks {(action === 'reject' || action === 'sendback') && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
                placeholder={
                  action === 'approve' ? 'Add any comments (optional)...' :
                  action === 'reject' ? 'Please provide reason for rejection...' :
                  'Explain what needs to be corrected...'
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={action !== 'approve'}
                disabled={isSubmitting}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-100 border border-red-300 text-red-700 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`px-6 py-2 text-white rounded-md ${
                  action === 'approve' ? 'bg-green-600 hover:bg-green-700' :
                  action === 'reject' ? 'bg-red-600 hover:bg-red-700' :
                  'bg-yellow-600 hover:bg-yellow-700'
                } disabled:opacity-50`}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 
                 action === 'approve' ? 'Approve Report' :
                 action === 'reject' ? 'Reject Report' :
                 'Send Back for Revision'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SchoolChairApprovalModal;
