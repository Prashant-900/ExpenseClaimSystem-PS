import { getStatusColor } from '../../utils/statuses';

const StatusBadge = ({ status }) => {
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
      {status}
    </span>
  );
};

export default StatusBadge;