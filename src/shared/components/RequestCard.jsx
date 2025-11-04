import StatusBadge from './StatusBadge';
import { HiOutlineUser, HiOutlineCheck, HiOutlineXMark, HiOutlineArrowUturnLeft, HiOutlinePrinter } from 'react-icons/hi2';

const RequestCard = ({ request, onAction, userRole, showActions = true }) => {
  
  const canApprove = showActions && (
    (userRole === 'Faculty' && (request.status === 'Pending - Faculty Review' || request.status === 'Submitted')) ||
    (userRole === 'Audit' && (
      request.status === 'Director Approved' || 
      request.status === 'Dean SRIC Approved'
    )) ||
    (userRole === 'Finance' && (request.status === 'Pending - Finance Review' || request.status === 'Audit Approved'))
  );
  const canSendBack = canApprove;

  // Get submitter info (expense reports)
  let submitter, submitterRole;
  submitter = request.submitterId;
  submitterRole = request.submitterRole;

  const openProfile = () => {
    if (submitter) {
      window.open(`/profile/${submitter._id}`, '_blank');
    }
  };

  const handlePrintRequest = async () => {
    try {
      // For expense reports, we'll use a simpler print for now since we have full PDF in the details view
      alert('Please use the "Print Report" button in the detailed expense report view for a complete PDF.');
    } catch (error) {
      console.error('Failed to generate PDF:', error);
      alert('Failed to generate PDF. Please try again.');
    }
  };

  // Check if request is in a final state (completed or rejected)
  const isRequestFinal = request && (
    request.status === 'Approved - Finance' || 
    request.status === 'Finance Approved' ||
    request.status === 'Completed' || 
    request.status === 'Rejected'
  );

  return (
    <div className="card">
      {/* Submitter Profile Header */}
      {submitter && (
        <div className="card-header">
          <div className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 cursor-pointer hover:opacity-75 transition-opacity"
              onClick={openProfile}
            >
              {submitter.profileImage ? (
                <img 
                  src={submitter.profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <HiOutlineUser className="w-6 h-6" />
                </div>
              )}
            </div>
            <div>
              <p 
                className="font-medium text-gray-900 cursor-pointer hover:text-gray-700 transition-colors"
                onClick={openProfile}
              >
                {submitter.name}
              </p>
              <p className="text-sm text-gray-500">{submitterRole}</p>
            </div>
          </div>
        </div>
      )}
      
      <div className="card-body">
        <div className="flex justify-between items-start mb-4">
        <div>
          {/* Display title/purpose for expense reports */}
          {request.purposeOfExpense && <h2 className="text-xl font-bold text-gray-800 mb-2">{request.purposeOfExpense}</h2>}
          
          {/* Display amount */}
          <h3 className="text-lg font-semibold">
            ₹{request.totalAmount?.toFixed(2) || '0.00'}
          </h3>
          
          {/* Display description */}
          <p className="text-gray-600">
            {request.reportType}
          </p>
          
          {/* Display expense report specific fields */}
          <p className="text-sm text-gray-500">Department: {request.department}</p>
          <p className="text-sm text-gray-500">Items: {request.items?.length || 0}</p>
          {request.expensePeriodStart && request.expensePeriodEnd && (
            <p className="text-sm text-gray-500">
              Period: {new Date(request.expensePeriodStart).toLocaleDateString()} - {new Date(request.expensePeriodEnd).toLocaleDateString()}
            </p>
          )}
          
          {/* Display expense items */}
          {request.items && request.items.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Expense Items:</p>
              <div className="space-y-1">
                {request.items.slice(0, 3).map((item, index) => (
                  <p key={index} className="text-sm text-gray-600">
                    {item.description} - ₹{item.amountInINR?.toFixed(2) || '0.00'}
                  </p>
                ))}
                {request.items.length > 3 && (
                  <p className="text-sm text-gray-500">...and {request.items.length - 3} more items</p>
                )}
              </div>
            </div>
          )}
        </div>
        <StatusBadge status={request.status} fundType={request.fundType} />
      </div>
      
      {/* Display remarks for expense reports */}
      {(request.auditApproval?.remarks || request.financeApproval?.remarks || (request.facultyApproval?.remarks && request.submitterRole !== 'Faculty')) && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <h4 className="font-medium text-sm mb-2">Remarks:</h4>
          {request.facultyApproval?.remarks && request.submitterRole !== 'Faculty' && <p className="text-sm">Faculty: {request.facultyApproval.remarks}</p>}
          {request.auditApproval?.remarks && <p className="text-sm">Audit: {request.auditApproval.remarks}</p>}
          {request.financeApproval?.remarks && <p className="text-sm">Finance: {request.financeApproval.remarks}</p>}
        </div>
      )}
      
        <div className="flex gap-3 mt-4">
          {/* View Details Button */}
          <button
            onClick={() => {
              window.open(`/expense-report/${request._id}`, '_blank');
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
          >
            View Details
          </button>
          
          {/* Action Buttons */}
          {canApprove && (
            <>
              <button
                onClick={() => onAction(request._id, 'approve')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
              >
                <HiOutlineCheck className="w-4 h-4 inline mr-1" />
                Approve
              </button>
              <button
                onClick={() => onAction(request._id, 'reject')}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
              >
                <HiOutlineXMark className="w-4 h-4 inline mr-1" />
                Reject
              </button>
              {canSendBack && (
                <button
                  onClick={() => onAction(request._id, 'sendback')}
                  className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 font-medium"
                >
                  <HiOutlineArrowUturnLeft className="w-4 h-4 inline mr-1" />
                  Send Back
                </button>
              )}
            </>
          )}
          
          {/* Print Button for Final State Requests */}
          {isRequestFinal && (
            <button
              onClick={handlePrintRequest}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 font-medium"
              title="Download PDF Report"
            >
              <HiOutlinePrinter className="w-4 h-4 inline mr-1" />
              Print
            </button>
          )}
        </div>
        

      </div>
      
      <div className="card-footer">
        <p className="text-sm text-gray-500">
          Submitted: {new Date(request.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default RequestCard;