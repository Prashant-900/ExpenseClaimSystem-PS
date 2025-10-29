import { useState } from 'react';
import StatusBadge from './StatusBadge';
import ExpenseReportModal from './ExpenseReportModal';
import { getCountryByCode, convertCurrency } from '../../utils/countryStateData';
import { HiOutlineEye, HiOutlineCheck, HiOutlineXMark, HiOutlineArrowUturnLeft, HiOutlineUser } from 'react-icons/hi2';

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
      <div className="bg-white rounded-md shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
        {/* Card Header */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{request.title}</h3>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-gray-500 rounded-full"></span>
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
            <StatusBadge status={request.status} fundType={request.fundType} />
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
                  <HiOutlineUser className="w-5 h-5 text-gray-500" />
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
              className="flex items-center justify-center gap-2 flex-1 px-4 py-2 bg-gray-700 text-white font-medium rounded-md hover:bg-gray-800 focus:outline-none focus:ring-1 focus:ring-gray-500 transition-colors"
            >
              <HiOutlineEye className="w-4 h-4" />
              View Report
            </button>
            
            {canApprove && (
              <>
                <button
                  onClick={() => onAction(request._id, 'approve')}
                  className="flex items-center gap-1 px-4 py-2 bg-emerald-700 text-white font-medium rounded-md hover:bg-emerald-800 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                >
                  <HiOutlineCheck className="w-4 h-4" />
                  Approve
                </button>
                <button
                  onClick={() => onAction(request._id, 'reject')}
                  className="flex items-center gap-1 px-4 py-2 bg-red-700 text-white font-medium rounded-md hover:bg-red-800 focus:outline-none focus:ring-1 focus:ring-red-500 transition-colors"
                >
                  <HiOutlineXMark className="w-4 h-4" />
                  Reject
                </button>
                {canSendBack && (
                  <button
                    onClick={() => onAction(request._id, 'sendback')}
                    className="flex items-center gap-1 px-4 py-2 bg-amber-700 text-white font-medium rounded-md hover:bg-amber-800 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-colors"
                  >
                    <HiOutlineArrowUturnLeft className="w-4 h-4" />
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