import { getStatusColor } from '../../utils/statuses';

const StatusBadge = ({ status }) => {
  // Provide clearer status text for better understanding
  const getDisplayStatus = (status) => {
    switch (status) {
      case 'Draft':
        return 'Draft - Not Submitted';
      case 'Faculty Approved':
        return 'Sent to Audit';
      case 'Audit Approved':
        return 'Sent to Finance';
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