import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../features/authentication/authStore';
import StatusBadge from './StatusBadge';
import { getProfileImageUrl } from '../../utils/fileUploadUtils';

const RequestCard = ({ request, onAction, userRole, showActions = true }) => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  
  const canApprove = showActions && ((userRole === 'Audit' && request.status === 'Pending - Audit') ||
                    (userRole === 'Finance' && request.status === 'Pending - Finance'));
  const canSendBack = showActions && ((userRole === 'Audit' && request.status === 'Pending - Audit') ||
                     (userRole === 'Finance' && request.status === 'Pending - Finance'));

  const submitter = request.studentId || request.facultySubmitterId;
  const submitterRole = request.studentId ? 'Student' : 'Faculty';

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
                <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg font-medium">
                  {submitter.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <p 
                className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 transition-colors"
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
          {request.title && <h2 className="text-xl font-bold text-gray-800 mb-2">{request.title}</h2>}
          <h3 className="text-lg font-semibold">${request.amount}</h3>
          <p className="text-gray-600">{request.description}</p>
          <p className="text-sm text-gray-500">Type: {request.expenseType}</p>
          {request.expenseDate && (
            <p className="text-sm text-gray-500">Date: {new Date(request.expenseDate).toLocaleDateString()}</p>
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
          
          {request.images && request.images.length > 0 && (
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
        </div>
        <StatusBadge status={request.status} />
      </div>
      
      {(request.auditRemarks || request.financeRemarks) && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <h4 className="font-medium text-sm mb-2">Remarks:</h4>
          {request.auditRemarks && <p className="text-sm">Audit: {request.auditRemarks}</p>}
          {request.financeRemarks && <p className="text-sm">Finance: {request.financeRemarks}</p>}
        </div>
      )}
      
        {canApprove && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => onAction(request._id, 'approve')}
              className="btn-success"
            >
              Approve
            </button>
            <button
              onClick={() => onAction(request._id, 'reject')}
              className="btn-danger"
            >
              Reject
            </button>
            {canSendBack && (
              <button
                onClick={() => onAction(request._id, 'sendback')}
                className="btn-warning"
              >
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