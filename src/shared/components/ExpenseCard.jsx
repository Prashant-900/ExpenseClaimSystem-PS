import { useState } from 'react';
import StatusBadge from './StatusBadge';
import ExpenseReportModal from './ExpenseReportModal';
import { getCountryByCode, convertCurrency } from '../../utils/countryStateData';

const ExpenseCard = ({ request, onAction, userRole, showActions = true }) => {
  const [showModal, setShowModal] = useState(false);
  
  const canApprove = showActions && ((userRole === 'Audit' && request.status === 'Pending - Audit') ||
                    (userRole === 'Finance' && request.status === 'Approved - Audit'));
  const canSendBack = showActions && ((userRole === 'Audit' && request.status === 'Pending - Audit') ||
                     (userRole === 'Finance' && request.status === 'Approved - Audit'));

  const submitter = request.studentId || request.facultySubmitterId;
  const submitterRole = request.studentId ? 'Student' : 'Faculty';

  const formatCurrency = (amount) => {
    const country = getCountryByCode(request.country || 'IN');
    if (country) {
      return `${country.symbol}${amount.toFixed(2)}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };
  
  const getINREquivalent = (amount) => {
    if (request.country && request.country !== 'IN') {
      const inrAmount = convertCurrency(amount, request.country, 'IN');
      return ` (≈ ₹${inrAmount.toFixed(2)})`;
    }
    return '';
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
        {/* Card Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{request.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  {request.expenseType}
                </span>
                <span>
                  {formatCurrency(request.amount)}
                  {getINREquivalent(request.amount) && (
                    <span className="text-xs text-gray-500">{getINREquivalent(request.amount)}</span>
                  )}
                </span>
                <span>{new Date(request.expenseDate).toLocaleDateString()}</span>
              </div>
            </div>
            <StatusBadge status={request.status} />
          </div>
        </div>

        {/* Card Content */}
        <div className="px-6 py-4">
          {/* Submitter Info */}
          {submitter && (
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                {submitter.profileImage ? (
                  <img 
                    src={submitter.profileImage} 
                    alt="Profile" 
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <span className="text-gray-500 text-sm font-medium">
                    {submitter.name?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">{submitter.name}</p>
                <p className="text-sm text-gray-500">{submitterRole}</p>
              </div>
            </div>
          )}

          {/* Description Preview */}
          <p className="text-gray-700 text-sm mb-4" style={{display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>
            {request.description}
          </p>

          {/* Quick Details */}
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-4">
            <div>
              <span className="font-medium">Submitted:</span>
              <span className="ml-1">{new Date(request.createdAt).toLocaleDateString()}</span>
            </div>
            {request.images && request.images.length > 0 && (
              <div>
                <span className="font-medium">Attachments:</span>
                <span className="ml-1">{request.images.length} file(s)</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              View Report
            </button>
            
            {canApprove && (
              <>
                <button
                  onClick={() => onAction(request._id, 'approve')}
                  className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => onAction(request._id, 'reject')}
                  className="px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
                >
                  Reject
                </button>
                {canSendBack && (
                  <button
                    onClick={() => onAction(request._id, 'sendback')}
                    className="px-4 py-2 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 transition-colors"
                  >
                    Send Back
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      <ExpenseReportModal 
        request={request}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default ExpenseCard;