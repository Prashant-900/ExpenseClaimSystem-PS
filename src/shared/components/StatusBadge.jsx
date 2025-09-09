import { getStatusColor } from '../../utils/statuses';

const StatusBadge = ({ status }) => {
  return (
    <span className={`px-3 py-1 rounded-md text-xs font-medium ${getStatusColor(status)}`}>
      {status}
    </span>
  );
};

export default StatusBadge;