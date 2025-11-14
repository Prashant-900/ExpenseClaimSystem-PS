import { useState } from 'react';

const ApprovalModal = ({ report, onApprove, onReject, onSendBack, onClose, roleName }) => {
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

  const getNextApprover = (fundType, currentRole) => {
    if (currentRole === 'School Chair') {
      switch (fundType) {
        case 'Institute Fund': return 'Director';
        case 'Project Fund': return 'Dean SRIC';
        case 'Department/School Fund':
        case 'Professional Development Allowance': return 'Audit';
        default: return 'Next Approver';
      }
    } else if (currentRole === 'Dean SRIC' || currentRole === 'Director') {
      return 'Audit';
    } else if (currentRole === 'Audit') {
      return 'Finance';
    }
    return 'Next Stage';
  };

  const getWorkflowPath = (fundType) => {
    switch (fundType) {
      case 'Institute Fund':
        return 'Faculty → School Chairperson → Director → Audit → Finance';
      case 'Project Fund':
        return 'Faculty → School Chairperson → Dean SRIC → Audit → Finance';
      case 'Department/School Fund':
      case 'Professional Development Allowance':
        return 'Faculty → School Chairperson → Audit → Finance';
      default:
        return 'Standard workflow';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Review Expense Report - {roleName}
            </h2>
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
                <span className="font-medium">Fund Type:</span> 
                <span className="ml-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs">
                  {report.fundType || 'Not Categorized'}
                </span>
              </div>
              <div className="col-span-2">
                <span className="font-medium">Purpose:</span> {report.purposeOfExpense}
              </div>
              <div>
                <span className="font-medium">Total Amount:</span> 
                <span className="text-green-600 font-bold">₹{report.totalAmount?.toLocaleString()}</span>
              </div>
              <div>
                <span className="font-medium">Period:</span> {new Date(report.expensePeriodStart).toLocaleDateString()} - {new Date(report.expensePeriodEnd).toLocaleDateString()}
              </div>
            </div>

            {/* Previous Approvals */}
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium text-sm mb-2">Previous Approvals</h4>
              <div className="space-y-2 text-sm text-gray-600">
                {/* Render approvalHistory if present */}
                {report.approvalHistory && report.approvalHistory.length > 0 ? (
                  report.approvalHistory.map((entry, idx) => (
                    <div key={idx} className="flex items-start">
                      <span className={entry.approved ? "text-green-600 mr-2" : "text-red-600 mr-2"}>✓</span>
                      <div className="flex-1">
                        <span className="font-medium">{entry.stage}:</span> {entry.approvedBy}
                        {entry.date && (
                          <span className="text-xs text-gray-500 ml-2">
                            ({new Date(entry.date).toLocaleDateString()})
                          </span>
                        )}
                        {entry.remarks && (
                          <div className="text-xs mt-1 text-gray-500 italic">
                            "{entry.remarks}"
                          </div>
                        )}
                        {entry.action === 'sendback' && (
                          <div className="text-xs mt-1 text-yellow-600 italic">Sent Back</div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  // Fallback to legacy fields if approvalHistory is missing
                  <>
                    {report.facultyApproval && (
                      <div className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <div className="flex-1">
                          <span className="font-medium">Faculty:</span> {report.facultyName}
                          {report.facultyApproval.date && (
                            <span className="text-xs text-gray-500 ml-2">
                              ({new Date(report.facultyApproval.date).toLocaleDateString()})
                            </span>
                          )}
                          {report.facultyApproval.remarks && (
                            <div className="text-xs mt-1 text-gray-500 italic">
                              "{report.facultyApproval.remarks}"
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {report.schoolChairApproval && (
                      <div className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <div className="flex-1">
                          <span className="font-medium">School Chairperson:</span> {report.schoolChairName || 'Approved'}
                          {report.schoolChairApproval.date && (
                            <span className="text-xs text-gray-500 ml-2">
                              ({new Date(report.schoolChairApproval.date).toLocaleDateString()})
                            </span>
                          )}
                          {report.schoolChairApproval.remarks && (
                            <div className="text-xs mt-1 text-gray-500 italic">
                              "{report.schoolChairApproval.remarks}"
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {report.deanSRICApproval && (
                      <div className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <div className="flex-1">
                          <span className="font-medium">Dean SRIC:</span> {report.deanSRICName || 'Approved'}
                          {report.deanSRICApproval.date && (
                            <span className="text-xs text-gray-500 ml-2">
                              ({new Date(report.deanSRICApproval.date).toLocaleDateString()})
                            </span>
                          )}
                          {report.deanSRICApproval.remarks && (
                            <div className="text-xs mt-1 text-gray-500 italic">
                              "{report.deanSRICApproval.remarks}"
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {report.directorApproval && (
                      <div className="flex items-start">
                        <span className="text-green-600 mr-2">✓</span>
                        <div className="flex-1">
                          <span className="font-medium">Director:</span> {report.directorName || 'Approved'}
                          {report.directorApproval.date && (
                            <span className="text-xs text-gray-500 ml-2">
                              ({new Date(report.directorApproval.date).toLocaleDateString()})
                            </span>
                          )}
                          {report.directorApproval.remarks && (
                            <div className="text-xs mt-1 text-gray-500 italic">
                              "{report.directorApproval.remarks}"
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    {report.auditApproval && (
                      <div className="flex items-start">
                        <span className={report.auditApproval.approved ? "text-green-600 mr-2" : "text-red-600 mr-2"}>✓</span>
                        <div className="flex-1">
                          <span className="font-medium">Audit:</span> {report.auditApproval.approvedBy || 'Processed'}
                          {report.auditApproval.date && (
                            <span className="text-xs text-gray-500 ml-2">
                              ({new Date(report.auditApproval.date).toLocaleDateString()})
                            </span>
                          )}
                          {report.auditApproval.remarks && (
                            <div className="text-xs mt-1 text-gray-500 italic">
                              "{report.auditApproval.remarks}"
                            </div>
                          )}
                          {report.auditApproval.action === 'sendback' && (
                            <div className="text-xs mt-1 text-yellow-600 italic">Sent Back</div>
                          )}
                        </div>
                      </div>
                    )}
                    {report.financeApproval && (
                      <div className="flex items-start">
                        <span className={report.financeApproval.approved ? "text-green-600 mr-2" : "text-red-600 mr-2"}>✓</span>
                        <div className="flex-1">
                          <span className="font-medium">Finance:</span> {report.financeApproval.approvedBy || 'Processed'}
                          {report.financeApproval.date && (
                            <span className="text-xs text-gray-500 ml-2">
                              ({new Date(report.financeApproval.date).toLocaleDateString()})
                            </span>
                          )}
                          {report.financeApproval.remarks && (
                            <div className="text-xs mt-1 text-gray-500 italic">
                              "{report.financeApproval.remarks}"
                            </div>
                          )}
                          {report.financeApproval.action === 'sendback' && (
                            <div className="text-xs mt-1 text-yellow-600 italic">Sent Back</div>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
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
                  After approval, this report will go to: 
                  <span className="text-blue-700 font-bold ml-1">
                    {getNextApprover(report.fundType, roleName)}
                  </span>
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  Full Workflow: {getWorkflowPath(report.fundType)}
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

export default ApprovalModal;
