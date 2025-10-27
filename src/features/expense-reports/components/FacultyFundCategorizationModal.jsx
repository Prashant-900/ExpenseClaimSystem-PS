import { useState } from 'react';
import { FUND_TYPES } from '../../../utils/schools';

const FacultyFundCategorizationModal = ({ report, onApprove, onReject, onSendBack, onClose }) => {
  const [action, setAction] = useState('approve');
  const [fundType, setFundType] = useState('');
  const [projectId, setProjectId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation for approval
    if (action === 'approve') {
      if (!fundType) {
        setError('Please select a fund type');
        return;
      }
      if (fundType === 'Project Fund' && !projectId.trim()) {
        setError('Project ID is required for Project Fund');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const approvalData = {
        action,
        remarks,
        ...(action === 'approve' && { fundType, projectId: projectId.trim() || undefined })
      };

      if (action === 'approve') {
        await onApprove(report._id, approvalData);
      } else if (action === 'reject') {
        await onReject(report._id, { action, remarks });
      } else if (action === 'sendback') {
        await onSendBack(report._id, { action, remarks });
      }

      onClose();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to process approval');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Review Student Expense Report</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Report Summary */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Report Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium">Student:</span> {report.submitterId?.name}
              </div>
              <div>
                <span className="font-medium">Department:</span> {report.department}
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
          </div>

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
                  />
                  <span className="text-yellow-600 font-medium">Send Back</span>
                </label>
              </div>
            </div>

            {/* Fund Type Selection - Only for Approve */}
            {action === 'approve' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fund Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={fundType}
                    onChange={(e) => setFundType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={action === 'approve'}
                  >
                    <option value="">Select Fund Type</option>
                    {FUND_TYPES.map(type => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-gray-500">
                    This determines the approval workflow for this expense report
                  </p>
                </div>

                {/* Project ID - Only for Project Fund */}
                {fundType === 'Project Fund' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project ID <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={projectId}
                      onChange={(e) => setProjectId(e.target.value)}
                      placeholder="Enter project identifier"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={fundType === 'Project Fund'}
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Required for Project Fund expenses
                    </p>
                  </div>
                )}

                {/* Workflow Preview */}
                {fundType && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm font-medium text-blue-900 mb-1">Approval Workflow:</p>
                    <p className="text-sm text-blue-700">
                      {fundType === 'Institute Fund' && 'Faculty → School Chair → Director → Audit → Finance'}
                      {fundType === 'Department/School Fund' && 'Faculty → School Chair → Audit → Finance'}
                      {fundType === 'Project Fund' && 'Faculty → School Chair → Dean SRIC → Audit → Finance'}
                      {fundType === 'Professional Development Allowance' && 'Faculty → School Chair → Audit → Finance'}
                    </p>
                  </div>
                )}
              </>
            )}

            {/* Remarks */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remarks {action !== 'approve' && <span className="text-red-500">*</span>}
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={4}
                placeholder="Add your comments or feedback..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={action !== 'approve'}
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
                 action === 'approve' ? 'Approve & Categorize' :
                 action === 'reject' ? 'Reject Report' :
                 'Send Back to Student'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FacultyFundCategorizationModal;
