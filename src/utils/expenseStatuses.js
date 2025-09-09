// Unified status system to resolve conflicts between systems
export const UNIFIED_STATUSES = {
  // Draft states
  DRAFT: 'Draft',
  
  // Submission states
  SUBMITTED: 'Submitted',
  
  // Approval workflow states
  PENDING_FACULTY: 'Pending - Faculty Review',
  PENDING_AUDIT: 'Pending - Audit Review', 
  PENDING_FINANCE: 'Pending - Finance Review',
  
  // Approved states
  FACULTY_APPROVED: 'Faculty Approved',
  AUDIT_APPROVED: 'Audit Approved', 
  FINANCE_APPROVED: 'Finance Approved',
  
  // Final states
  COMPLETED: 'Completed',
  REJECTED: 'Rejected',
  
  // Revision states
  SENT_BACK_FACULTY: 'Sent Back - Faculty',
  SENT_BACK_AUDIT: 'Sent Back - Audit',
  SENT_BACK_FINANCE: 'Sent Back - Finance'
};

// Status workflow mapping
export const STATUS_WORKFLOW = {
  [UNIFIED_STATUSES.DRAFT]: [UNIFIED_STATUSES.SUBMITTED],
  [UNIFIED_STATUSES.SUBMITTED]: [UNIFIED_STATUSES.PENDING_FACULTY, UNIFIED_STATUSES.PENDING_AUDIT], // Faculty submissions skip faculty review
  [UNIFIED_STATUSES.PENDING_FACULTY]: [UNIFIED_STATUSES.FACULTY_APPROVED, UNIFIED_STATUSES.REJECTED, UNIFIED_STATUSES.SENT_BACK_FACULTY],
  [UNIFIED_STATUSES.FACULTY_APPROVED]: [UNIFIED_STATUSES.PENDING_AUDIT],
  [UNIFIED_STATUSES.PENDING_AUDIT]: [UNIFIED_STATUSES.AUDIT_APPROVED, UNIFIED_STATUSES.REJECTED, UNIFIED_STATUSES.SENT_BACK_AUDIT],
  [UNIFIED_STATUSES.AUDIT_APPROVED]: [UNIFIED_STATUSES.PENDING_FINANCE],
  [UNIFIED_STATUSES.PENDING_FINANCE]: [UNIFIED_STATUSES.FINANCE_APPROVED, UNIFIED_STATUSES.REJECTED, UNIFIED_STATUSES.SENT_BACK_FINANCE],
  [UNIFIED_STATUSES.FINANCE_APPROVED]: [UNIFIED_STATUSES.COMPLETED],
  [UNIFIED_STATUSES.SENT_BACK_FACULTY]: [UNIFIED_STATUSES.PENDING_FACULTY],
  [UNIFIED_STATUSES.SENT_BACK_AUDIT]: [UNIFIED_STATUSES.PENDING_AUDIT],
  [UNIFIED_STATUSES.SENT_BACK_FINANCE]: [UNIFIED_STATUSES.PENDING_FINANCE]
};

// Legacy status mapping for backward compatibility
export const LEGACY_STATUS_MAPPING = {
  // Reimbursement system legacy statuses
  'Pending - Faculty': UNIFIED_STATUSES.PENDING_FACULTY,
  'Pending - Audit': UNIFIED_STATUSES.PENDING_AUDIT,
  'Pending - Finance': UNIFIED_STATUSES.PENDING_FINANCE,
  'Sent Back - Faculty': UNIFIED_STATUSES.SENT_BACK_FACULTY,
  'Sent Back - Audit': UNIFIED_STATUSES.SENT_BACK_AUDIT,
  'Sent Back - Finance': UNIFIED_STATUSES.SENT_BACK_FINANCE,
  
  // ExpenseReport system legacy statuses
  'Faculty Approved': UNIFIED_STATUSES.FACULTY_APPROVED,
  'Audit Approved': UNIFIED_STATUSES.AUDIT_APPROVED,
  'Finance Approved': UNIFIED_STATUSES.FINANCE_APPROVED
};

// Convert legacy status to unified
export const convertLegacyStatus = (legacyStatus) => {
  return LEGACY_STATUS_MAPPING[legacyStatus] || legacyStatus;
};

// Get next possible statuses
export const getNextStatuses = (currentStatus) => {
  return STATUS_WORKFLOW[currentStatus] || [];
};

// Check if status transition is valid
export const isValidStatusTransition = (fromStatus, toStatus) => {
  const nextStatuses = getNextStatuses(fromStatus);
  return nextStatuses.includes(toStatus);
};

// Get status color for UI
export const getStatusColor = (status) => {
  switch (status) {
    case UNIFIED_STATUSES.DRAFT:
      return 'bg-gray-100 text-gray-800';
    case UNIFIED_STATUSES.SUBMITTED:
      return 'bg-blue-100 text-blue-800';
    case UNIFIED_STATUSES.PENDING_FACULTY:
    case UNIFIED_STATUSES.PENDING_AUDIT:
    case UNIFIED_STATUSES.PENDING_FINANCE:
      return 'bg-yellow-100 text-yellow-800';
    case UNIFIED_STATUSES.FACULTY_APPROVED:
    case UNIFIED_STATUSES.AUDIT_APPROVED:
    case UNIFIED_STATUSES.FINANCE_APPROVED:
      return 'bg-blue-100 text-blue-800';
    case UNIFIED_STATUSES.COMPLETED:
      return 'bg-green-100 text-green-800';
    case UNIFIED_STATUSES.REJECTED:
      return 'bg-red-100 text-red-800';
    case UNIFIED_STATUSES.SENT_BACK_FACULTY:
    case UNIFIED_STATUSES.SENT_BACK_AUDIT:
    case UNIFIED_STATUSES.SENT_BACK_FINANCE:
      return 'bg-orange-100 text-orange-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get user-friendly status description
export const getStatusDescription = (status) => {
  switch (status) {
    case UNIFIED_STATUSES.DRAFT:
      return 'Draft - not yet submitted';
    case UNIFIED_STATUSES.SUBMITTED:
      return 'Submitted and awaiting review';
    case UNIFIED_STATUSES.PENDING_FACULTY:
      return 'Waiting for faculty approval';
    case UNIFIED_STATUSES.PENDING_AUDIT:
      return 'Under audit review';
    case UNIFIED_STATUSES.PENDING_FINANCE:
      return 'Awaiting finance approval';
    case UNIFIED_STATUSES.FACULTY_APPROVED:
      return 'Approved by faculty';
    case UNIFIED_STATUSES.AUDIT_APPROVED:
      return 'Approved by audit';
    case UNIFIED_STATUSES.FINANCE_APPROVED:
      return 'Approved by finance';
    case UNIFIED_STATUSES.COMPLETED:
      return 'Request completed successfully';
    case UNIFIED_STATUSES.REJECTED:
      return 'Request has been rejected';
    case UNIFIED_STATUSES.SENT_BACK_FACULTY:
      return 'Sent back by faculty for revision';
    case UNIFIED_STATUSES.SENT_BACK_AUDIT:
      return 'Sent back by audit for revision';
    case UNIFIED_STATUSES.SENT_BACK_FINANCE:
      return 'Sent back by finance for revision';
    default:
      return 'Unknown status';
  }
};