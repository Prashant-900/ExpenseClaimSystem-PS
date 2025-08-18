export const ROLES = {
  EMPLOYEE: 'Employee',
  MANAGER: 'Manager',
  FINANCE: 'Finance',
  ADMIN: 'Admin'
};

export const hasRole = (userRole, requiredRoles) => {
  return requiredRoles.includes(userRole);
};