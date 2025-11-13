import { getStatusColor } from '../../utils/statuses';

const StatusBadge = ({ status, fundType }) => {
  // Provide clearer status text for better understanding
  const getDisplayStatus = (status, fundType) => {
    switch (status) {
      case 'Draft':
        return 'Draft - Not Submitted';
      case 'Submitted':
        return 'Pending Faculty Review';
      case 'Faculty Approved':
        return 'Pending School Chairperson Review';
      case 'School Chair Approved':
        // Show next stage based on fund type
        if (fundType === 'Project Fund') {
          return 'Pending Dean SRIC Review';
        } else if (fundType === 'Institute Fund') {
          return 'Pending Director Review';
        } else {
          return 'Pending Audit Review';
        }
      case 'Dean SRIC Approved':
        return 'Pending Audit Review';
      case 'Director Approved':
        return 'Pending Audit Review';
      case 'Audit Approved':
        return 'Pending Finance Review';
      case 'Finance Approved':
        return 'Completed';
      case 'Rejected':
        return 'Rejected';
      default:
        return status;
    }
  };

  return (
    <span className={`px-3 py-1 rounded-md text-xs font-medium ${getStatusColor(status)}`}>
      {getDisplayStatus(status, fundType)}
    </span>
  );
};

export default StatusBadge;