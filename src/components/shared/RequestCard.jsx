import StatusBadge from './StatusBadge';

const RequestCard = ({ request, onAction, userRole, showActions = true }) => {
  const canApprove = showActions && ((userRole === 'Manager' && request.status === 'Pending - Manager') ||
                    (userRole === 'Finance' && request.status === 'Approved - Finance'));

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">${request.amount}</h3>
          <p className="text-gray-600">{request.description}</p>
          <p className="text-sm text-gray-500">Category: {request.category}</p>
          {request.employeeId && (
            <p className="text-sm text-gray-500">Employee: {request.employeeId.name}</p>
          )}
        </div>
        <StatusBadge status={request.status} />
      </div>
      
      {(request.managerRemarks || request.financeRemarks) && (
        <div className="mb-4 p-3 bg-gray-50 rounded">
          <h4 className="font-medium text-sm mb-2">Remarks:</h4>
          {request.managerRemarks && <p className="text-sm">Manager: {request.managerRemarks}</p>}
          {request.financeRemarks && <p className="text-sm">Finance: {request.financeRemarks}</p>}
        </div>
      )}
      
      {canApprove && (
        <div className="flex gap-2">
          <button
            onClick={() => onAction(request._id, 'approve')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Approve
          </button>
          <button
            onClick={() => onAction(request._id, 'reject')}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reject
          </button>
        </div>
      )}
      
      <div className="mt-4 text-xs text-gray-500">
        Submitted: {new Date(request.createdAt).toLocaleDateString()}
      </div>
    </div>
  );
};

export default RequestCard;