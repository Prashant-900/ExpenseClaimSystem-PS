export const STATUSES = {
  PENDING_MANAGER: 'Pending - Manager',
  APPROVED_FINANCE: 'Approved - Finance',
  REJECTED: 'Rejected',
  COMPLETED: 'Completed'
};

export const getStatusColor = (status) => {
  switch (status) {
    case STATUSES.PENDING_MANAGER:
      return 'bg-yellow-100 text-yellow-800';
    case STATUSES.APPROVED_FINANCE:
      return 'bg-blue-100 text-blue-800';
    case STATUSES.REJECTED:
      return 'bg-red-100 text-red-800';
    case STATUSES.COMPLETED:
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};