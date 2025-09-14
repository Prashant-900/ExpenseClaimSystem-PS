import { getStatusColor } from '../../utils/statuses';

const StatusBadge = ({ status }) => {
  // Provide clearer status text for better understanding
  const getDisplayStatus = (status) => {
    switch (status) {
      case 'Draft':
        return 'Draft - Not Submitted';
      case 'Submitted':
        return 'Pending Faculty Review';
      case 'Faculty Approved':
        return 'Pending Audit Review';
      case 'Audit Approved':
        return 'Pending Finance Review';
      case 'Finance Approved':
        return 'Completed';
      default:
        return status;
    }
  };

  return (
    <span className={`px-3 py-1 rounded-md text-xs font-medium ${getStatusColor(status)}`}>
      {getDisplayStatus(status)}
    </span>
  );
};

export default StatusBadge;