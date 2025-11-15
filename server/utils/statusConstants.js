/**
 * Status Constants
 * Centralized definition of all application constants
 */

// Expense Report Statuses
export const EXPENSE_STATUSES = {
  DRAFT: 'Draft',
  SUBMITTED: 'Submitted',
  FACULTY_APPROVED: 'Faculty Approved',
  SCHOOL_CHAIR_APPROVED: 'School Chair Approved',
  DEAN_SRIC_APPROVED: 'Dean SRIC Approved',
  DIRECTOR_APPROVED: 'Director Approved',
  AUDIT_APPROVED: 'Audit Approved',
  FINANCE_APPROVED: 'Finance Approved',
  COMPLETED: 'Completed',
  REJECTED: 'Rejected'
};

// User Roles
export const USER_ROLES = {
  STUDENT: 'Student',
  FACULTY: 'Faculty',
  SCHOOL_CHAIR: 'School Chair',
  DEAN_SRIC: 'Dean SRIC',
  DIRECTOR: 'Director',
  AUDIT: 'Audit',
  FINANCE: 'Finance',
  ADMIN: 'Admin'
};

// Departments
export const DEPARTMENTS = [
  'SCEE', // School of Civil and Environmental Engineering
  'SMME', // School of Mechanical and Materials Engineering
  'SCENE', // School of Electronics and Communication Engineering
  'SBB', // School of Biomedical and Biological Sciences
  'SCS', // School of Computing Sciences
  'SMSS', // School of Management and Social Sciences
  'SPS', // School of Physical Sciences
  'SoM', // School of Mathematics
  'SHSS' // School of Humanities and Social Sciences
];

// Fund Types
export const FUND_TYPES = {
  INSTITUTE_FUND: 'Institute Fund',
  DEPARTMENT_SCHOOL_FUND: 'Department/School Fund',
  PROJECT_FUND: 'Project Fund',
  PROFESSIONAL_DEVELOPMENT_ALLOWANCE: 'Professional Development Allowance'
};

// Expense Categories
export const EXPENSE_CATEGORIES = {
  TRAVEL_AIR: 'Travel - Air',
  TRAVEL_TRAIN: 'Travel - Train',
  TRAVEL_BUS: 'Travel - Bus',
  TRAVEL_GROUND: 'Travel - Ground Transport',
  ACCOMMODATION_HOTEL: 'Accommodation - Hotel',
  ACCOMMODATION_GUEST: 'Accommodation - Guest House',
  MEALS_BREAKFAST: 'Meals - Breakfast',
  MEALS_LUNCH: 'Meals - Lunch',
  MEALS_DINNER: 'Meals - Dinner',
  CONFERENCE_REGISTRATION: 'Conference - Registration',
  CONFERENCE_WORKSHOP: 'Conference - Workshop',
  SUPPLIES_LAB: 'Supplies - Lab',
  SUPPLIES_OFFICE: 'Supplies - Office',
  MISCELLANEOUS: 'Miscellaneous - Other'
};

// Payment Methods
export const PAYMENT_METHODS = {
  UNIVERSITY_CARD: 'University Credit Card (P-Card)',
  PERSONAL_FUNDS: 'Personal Funds (Reimbursement)',
  DIRECT_INVOICE: 'Direct Invoice to University'
};

// Report Types
export const REPORT_TYPES = {
  TEACHING: 'Teaching-related',
  RESEARCH: 'Research-related',
  ADMINISTRATIVE: 'Administrative/Service',
  OTHER: 'Other'
};

// Funding Sources
export const FUNDING_SOURCES = {
  DEPARTMENT_BUDGET: 'Department Budget',
  RESEARCH_GRANT: 'Research Grant',
  GIFT_ENDOWMENT: 'Gift/Endowment Fund',
  COST_SHARING: 'Cost-Sharing/Matching Fund'
};

// Approval Workflow Paths
export const APPROVAL_WORKFLOWS = {
  INSTITUTE_FUND: ['Faculty', 'School Chair', 'Director', 'Audit', 'Finance'],
  DEPARTMENT_FUND: ['Faculty', 'School Chair', 'Audit', 'Finance'],
  PROJECT_FUND: ['Faculty', 'School Chair', 'Dean SRIC', 'Audit', 'Finance'],
  PROFESSIONAL_DEVELOPMENT: ['Faculty', 'School Chair', 'Audit', 'Finance']
};

// API Response Messages
export const API_MESSAGES = {
  SUCCESS: 'Operation completed successfully',
  CREATED: 'Resource created successfully',
  UPDATED: 'Resource updated successfully',
  DELETED: 'Resource deleted successfully',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN: 'Forbidden access',
  NOT_FOUND: 'Resource not found',
  VALIDATION_ERROR: 'Validation error',
  SERVER_ERROR: 'Internal server error'
};

// File Upload Constraints
export const FILE_CONSTRAINTS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_TYPES: ['image/jpeg', 'image/png', 'application/pdf'],
  ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.pdf']
};

// Validation Rules
export const VALIDATION_RULES = {
  MIN_PASSWORD_LENGTH: 8,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 1000,
  MAX_REMARKS_LENGTH: 500,
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};
