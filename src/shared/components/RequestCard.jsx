import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/authentication/authStore';
import StatusBadge from './StatusBadge';
import { getProfileImageUrl } from '../../utils/fileUploadUtils';
import { HiOutlineUser, HiOutlineCheck, HiOutlineXMark, HiOutlineArrowUturnLeft } from 'react-icons/hi2';

const RequestCard = ({ request, onAction, userRole, showActions = true }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  // Handle both reimbursement and expense report types
  const isReimbursement = request.type === 'reimbursement';
  const isExpenseReport = request.type === 'expense-report';
  
  const canApprove = showActions && (
    (userRole === 'Faculty' && (request.status === 'Pending - Faculty Review' || request.status === 'Submitted')) ||
    (userRole === 'Audit' && (request.status === 'Pending - Audit Review' || request.status === 'Faculty Approved')) ||
    (userRole === 'Finance' && (request.status === 'Pending - Finance Review' || request.status === 'Audit Approved'))
  );
  const canSendBack = showActions && (
    (userRole === 'Faculty' && (request.status === 'Pending - Faculty Review' || request.status === 'Submitted')) ||
    (userRole === 'Audit' && (request.status === 'Pending - Audit Review' || request.status === 'Faculty Approved')) ||
    (userRole === 'Finance' && (request.status === 'Pending - Finance Review' || request.status === 'Audit Approved'))
  );

  // Get submitter info based on request type
  let submitter, submitterRole;
  if (isReimbursement) {
    submitter = request.studentId || request.facultySubmitterId;
    submitterRole = request.studentId ? 'Student' : 'Faculty';
  } else if (isExpenseReport) {
    submitter = request.submitterId;
    submitterRole = request.submitterRole;
  }

  const openProfile = () => {
    if (submitter) {
      window.open(`/profile/${submitter._id}`, '_blank');
    }
  };

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
          {/* Display title/purpose based on request type */}
          {isReimbursement && request.title && <h2 className="text-xl font-bold text-gray-800 mb-2">{request.title}</h2>}
          {isExpenseReport && request.purposeOfExpense && <h2 className="text-xl font-bold text-gray-800 mb-2">{request.purposeOfExpense}</h2>}
          
          {/* Display amount */}
          <h3 className="text-lg font-semibold">
            {isReimbursement ? `$${request.amount}` : `₹${request.totalAmount?.toFixed(2) || '0.00'}`}
          </h3>
          
          {/* Display description */}
          <p className="text-gray-600">
            {isReimbursement ? request.description : request.reportType}
          </p>
          
          {/* Display type and date */}
          {isReimbursement && (
            <>
              <p className="text-sm text-gray-500">Type: {request.expenseType}</p>
              {request.expenseDate && (
                <p className="text-sm text-gray-500">Date: {new Date(request.expenseDate).toLocaleDateString()}</p>
              )}
            </>
          )}
          
          {isExpenseReport && (
            <>
              <p className="text-sm text-gray-500">Department: {request.department}</p>
              <p className="text-sm text-gray-500">Items: {request.items?.length || 0}</p>
              {request.expensePeriodStart && request.expensePeriodEnd && (
                <p className="text-sm text-gray-500">
                  Period: {new Date(request.expensePeriodStart).toLocaleDateString()} - {new Date(request.expensePeriodEnd).toLocaleDateString()}
                </p>
              )}
            </>
          )}
          
          {/* Dynamic fields based on expense type */}
          {request.expenseType === 'Travel' && (
            <div className="text-sm text-gray-500 mt-2">
              {request.originCity && request.destinationCity && (
                <p>Route: {request.originCity} → {request.destinationCity}</p>
              )}
              {request.travelMode && <p>Mode: {request.travelMode}</p>}
            </div>
          )}
          {request.expenseType === 'Meal' && (
            <div className="text-sm text-gray-500 mt-2">
              {request.restaurantName && <p>Restaurant: {request.restaurantName}</p>}
              {request.mealType && <p>Type: {request.mealType}</p>}
            </div>
          )}
          {request.expenseType === 'Accommodation' && (
            <div className="text-sm text-gray-500 mt-2">
              {request.hotelName && <p>Hotel: {request.hotelName}</p>}
              {request.accommodationCity && <p>Location: {request.accommodationCity}</p>}
            </div>
          )}
          {request.expenseType === 'Office Supplies' && (
            <div className="text-sm text-gray-500 mt-2">
              {request.itemName && <p>Item: {request.itemName}</p>}
              {request.vendorName && <p>Vendor: {request.vendorName}</p>}
            </div>
          )}
          
          {/* Display images based on request type */}
          {isReimbursement && request.images && request.images.length > 0 && (
            <div className="mt-3">
              <p className="text-sm font-medium text-gray-700 mb-2">Receipt Images:</p>
              <div className="flex gap-2 flex-wrap">
                {request.images.map((image, index) => (
                  <img
                    key={index}
                    src={`http://localhost:5000/api/images/${image}`}
                    alt={`Receipt ${index + 1}`}
                    className="w-20 h-20 object-cover rounded border cursor-pointer hover:opacity-75"
                    onClick={() => window.open(`http://localhost:5000/api/images/${image}`, '_blank')}
                  />
                ))}
              </div>
            </div>
          )}
          
          {isExpenseReport && request.items && request.items.length > 0 && (
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
        <StatusBadge status={request.status} />
      </div>
      
      {/* Display remarks based on request type */}
      {isReimbursement && (request.auditRemarks || request.financeRemarks) && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <h4 className="font-medium text-sm mb-2">Remarks:</h4>
          {request.auditRemarks && <p className="text-sm">Audit: {request.auditRemarks}</p>}
          {request.financeRemarks && <p className="text-sm">Finance: {request.financeRemarks}</p>}
        </div>
      )}
      
      {isExpenseReport && (request.facultyApproval?.remarks || request.auditApproval?.remarks || request.financeApproval?.remarks) && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <h4 className="font-medium text-sm mb-2">Remarks:</h4>
          {request.facultyApproval?.remarks && <p className="text-sm">Faculty: {request.facultyApproval.remarks}</p>}
          {request.auditApproval?.remarks && <p className="text-sm">Audit: {request.auditApproval.remarks}</p>}
          {request.financeApproval?.remarks && <p className="text-sm">Finance: {request.financeApproval.remarks}</p>}
        </div>
      )}
      
        {canApprove && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => onAction(request._id, 'approve')}
              className="flex items-center gap-2 btn-success"
            >
              <HiOutlineCheck className="w-4 h-4" />
              Approve
            </button>
            <button
              onClick={() => onAction(request._id, 'reject')}
              className="flex items-center gap-2 btn-danger"
            >
              <HiOutlineXMark className="w-4 h-4" />
              Reject
            </button>
            {canSendBack && (
              <button
                onClick={() => onAction(request._id, 'sendback')}
                className="flex items-center gap-2 btn-warning"
              >
                <HiOutlineArrowUturnLeft className="w-4 h-4" />
                Send Back
              </button>
            )}
          </div>
        )}
        

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