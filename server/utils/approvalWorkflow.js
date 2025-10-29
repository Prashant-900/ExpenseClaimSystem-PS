import SchoolAdmin from '../models/SchoolAdmin.js';

// Determine the approval workflow based on fund type
export const getApprovalWorkflow = (fundType) => {
  switch (fundType) {
    case 'Institute Fund':
      // School Chair → Director → Audit → Finance
      return ['School Chair', 'Director', 'Audit', 'Finance'];
    case 'Department/School Fund':
      // School Chair → Audit → Finance
      return ['School Chair', 'Audit', 'Finance'];
    case 'Project Fund':
      // School Chair → Dean SRIC → Audit → Finance
      return ['School Chair', 'Dean SRIC', 'Audit', 'Finance'];
    case 'Professional Development Allowance':
      // School Chair → Audit → Finance
      return ['School Chair', 'Audit', 'Finance'];
    default:
      return ['School Chair', 'Audit', 'Finance'];
  }
};

// Get the next approver role in the workflow
export const getNextApproverRole = (currentStatus, fundType) => {
  const workflow = getApprovalWorkflow(fundType);
  
  const statusToWorkflowMap = {
    'Faculty Approved': 'School Chair',
    'School Chair Approved': workflow[1], // Next after School Chair
    'Dean SRIC Approved': 'Audit',
    'Director Approved': 'Audit',
    'Audit Approved': 'Finance'
  };
  
  return statusToWorkflowMap[currentStatus];
};

// Get school chairperson for a given school
export const getSchoolChair = async (school) => {
  const schoolAdmin = await SchoolAdmin.findOne({ school }).populate('schoolChairId');
  return schoolAdmin?.schoolChairId;
};

// Get Dean SRIC
export const getDeanSRIC = async () => {
  const instituteAdmin = await SchoolAdmin.findOne({ school: 'Institute' }).populate('deanSRICId');
  return instituteAdmin?.deanSRICId;
};

// Get Director
export const getDirector = async () => {
  const instituteAdmin = await SchoolAdmin.findOne({ school: 'Institute' }).populate('directorId');
  return instituteAdmin?.directorId;
};

// Determine if user can approve based on role, report, and workflow
export const canUserApprove = async (user, report) => {
  if (!report.fundType) return false; // Fund type must be set by faculty first
  
  const workflow = getApprovalWorkflow(report.fundType);
  const currentStatus = report.status;
  
  // Map current status to required role
  if (currentStatus === 'Faculty Approved' && user.role === 'School Chair') {
    // Verify user is the school chair for this report's department
    const schoolChair = await getSchoolChair(report.department);
    return schoolChair && schoolChair._id.toString() === user._id.toString();
  }
  
  if (currentStatus === 'School Chair Approved') {
    const nextRole = workflow[1]; // Role after School Chair
    if (nextRole === 'Director' && user.role === 'Director') {
      const director = await getDirector();
      return director && director._id.toString() === user._id.toString();
    }
    if (nextRole === 'Dean SRIC' && user.role === 'Dean SRIC') {
      const dean = await getDeanSRIC();
      return dean && dean._id.toString() === user._id.toString();
    }
    if (nextRole === 'Audit' && user.role === 'Audit') {
      return true;
    }
  }
  
  if ((currentStatus === 'Director Approved' || currentStatus === 'Dean SRIC Approved') && user.role === 'Audit') {
    return true;
  }
  
  if (currentStatus === 'Audit Approved' && user.role === 'Finance') {
    return true;
  }
  
  return false;
};
