export const ROLES = {
  STUDENT: 'Student',
  FACULTY: 'Faculty',
  SCHOOL_CHAIR: 'School Chair',
  DEAN_SRIC: 'Dean SRIC',
  DIRECTOR: 'Director',
  AUDIT: 'Audit',
  FINANCE: 'Finance',
  ADMIN: 'Admin'
};

export const hasRole = (userRole, requiredRoles) => {
  return requiredRoles.includes(userRole);
};

export const getRoleFromEmail = (email) => {
  if (email.endsWith('@students.iitmandi.ac.in')) return ROLES.STUDENT;
  if (email.endsWith('@faculty.iitmandi.ac.in')) return ROLES.FACULTY;
  if (email.endsWith('@audit.iitmandi.ac.in')) return ROLES.AUDIT;
  if (email.endsWith('@finance.iitmandi.ac.in')) return ROLES.FINANCE;
  if (email.endsWith('@admin.iitmandi.ac.in')) return ROLES.ADMIN;
  return null;
};

export const isValidEmail = (email) => {
  const validDomains = [
    '@students.iitmandi.ac.in',
    '@faculty.iitmandi.ac.in',
    '@audit.iitmandi.ac.in',
    '@finance.iitmandi.ac.in',
    '@admin.iitmandi.ac.in'
  ];
  return validDomains.some(domain => email.endsWith(domain));
};