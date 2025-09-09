export const STATUSES = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  PENDING_FACULTY: 'Pending - Faculty Review',
  PENDING_AUDIT: 'Pending - Audit Review',
  PENDING_FINANCE: 'Pending - Finance Review',
  FACULTY_APPROVED: 'Faculty Approved',
  AUDIT_APPROVED: 'Audit Approved',
  FINANCE_APPROVED: 'Finance Approved',
  REJECTED: 'Rejected',
  COMPLETED: 'Completed',
  SENT_BACK_FACULTY: 'Sent Back - Faculty',
  SENT_BACK_AUDIT: 'Sent Back - Audit',
  SENT_BACK_FINANCE: 'Sent Back - Finance'
};

export const getStatusColor = (status) => {
  // Handle exact string matches for backend status values
  switch (status) {
    case 'Draft':
    case STATUSES.DRAFT:
      return 'bg-slate-100 text-slate-700 border border-slate-300';
    case 'Submitted':
    case STATUSES.SUBMITTED:
      return 'bg-slate-200 text-slate-800 border border-slate-400';
    case 'Pending - Faculty Review':
    case 'Pending - Faculty':
    case STATUSES.PENDING_FACULTY:
      return 'bg-yellow-100 text-yellow-800 border border-yellow-300';
    case 'Faculty Approved':
    case STATUSES.FACULTY_APPROVED:
      return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
    case 'Pending - Audit Review':
    case 'Pending - Audit':
    case STATUSES.PENDING_AUDIT:
      return 'bg-blue-100 text-blue-800 border border-blue-300';
    case 'Audit Approved':
    case STATUSES.AUDIT_APPROVED:
      return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
    case 'Pending - Finance Review':
    case 'Pending - Finance':
    case STATUSES.PENDING_FINANCE:
      return 'bg-indigo-100 text-indigo-800 border border-indigo-300';
    case 'Finance Approved':
    case STATUSES.FINANCE_APPROVED:
      return 'bg-emerald-100 text-emerald-800 border border-emerald-300';
    case 'Completed':
    case STATUSES.COMPLETED:
      return 'bg-green-100 text-green-800 border border-green-300';
    case 'Rejected':
    case STATUSES.REJECTED:
      return 'bg-red-100 text-red-800 border border-red-300';
    case 'Sent Back - Faculty':
    case STATUSES.SENT_BACK_FACULTY:
    case 'Sent Back - Audit':
    case STATUSES.SENT_BACK_AUDIT:
    case 'Sent Back - Finance':
    case STATUSES.SENT_BACK_FINANCE:
      return 'bg-orange-100 text-orange-800 border border-orange-300';
    default:
      return 'bg-gray-100 text-gray-700 border border-gray-300';
  }
};

export const getStatusDescription = (status) => {
  switch (status) {
    case STATUSES.DRAFT:
      return 'Draft - not yet submitted';
    case STATUSES.SUBMITTED:
      return 'Submitted and awaiting review';
    case STATUSES.PENDING_FACULTY:
      return 'Waiting for faculty approval';
    case STATUSES.PENDING_AUDIT:
      return 'Under audit review';
    case STATUSES.PENDING_FINANCE:
      return 'Awaiting finance approval';
    case STATUSES.FACULTY_APPROVED:
      return 'Approved by faculty';
    case STATUSES.AUDIT_APPROVED:
      return 'Approved by audit';
    case STATUSES.FINANCE_APPROVED:
      return 'Approved by finance';
    case STATUSES.REJECTED:
      return 'Request has been rejected';
    case STATUSES.COMPLETED:
      return 'Request completed successfully';
    case STATUSES.SENT_BACK_FACULTY:
      return 'Sent back by faculty for revision';
    case STATUSES.SENT_BACK_AUDIT:
      return 'Sent back by audit for revision';
    case STATUSES.SENT_BACK_FINANCE:
      return 'Sent back by finance for revision';
    default:
      return 'Unknown status';
  }
};