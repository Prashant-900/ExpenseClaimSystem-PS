// Unified expense categories to resolve conflicts between systems
export const UNIFIED_EXPENSE_CATEGORIES = {
  // Travel related
  TRAVEL_AIRFARE: 'Travel – Airfare',
  TRAVEL_ACCOMMODATION: 'Travel – Accommodation', 
  TRAVEL_MEALS: 'Travel – Meals & Per Diem',
  TRAVEL_LOCAL_TRANSPORT: 'Local Transportation (Taxi, Ride-share, Mileage)',
  
  // Academic & Research
  CONFERENCE_FEES: 'Conference Fees',
  RESEARCH_EQUIPMENT: 'Research Equipment/Supplies',
  LAB_CONSUMABLES: 'Lab Consumables',
  BOOKS_SOFTWARE: 'Books/Subscriptions/Software',
  
  // Educational Support
  STUDENT_ACTIVITY: 'Student Activity Support',
  GUEST_LECTURER: 'Guest Lecturer Honorarium',
  
  // Office & Administrative
  OFFICE_SUPPLIES: 'Office Supplies',
  
  // Other
  MISCELLANEOUS: 'Miscellaneous / Other'
};

// Legacy mapping for backward compatibility
export const LEGACY_TO_UNIFIED_MAPPING = {
  'Travel': 'Travel – Airfare', // Default travel to airfare
  'Meal': 'Travel – Meals & Per Diem',
  'Accommodation': 'Travel – Accommodation',
  'Office Supplies': 'Office Supplies',
  'Misc': 'Miscellaneous / Other'
};

// Get all categories as array
export const getAllCategories = () => Object.values(UNIFIED_EXPENSE_CATEGORIES);

// Convert legacy category to unified
export const convertLegacyCategory = (legacyCategory) => {
  return LEGACY_TO_UNIFIED_MAPPING[legacyCategory] || legacyCategory;
};

// Check if category is travel-related
export const isTravelCategory = (category) => {
  return category.startsWith('Travel') || category.includes('Transportation');
};

// Get category group
export const getCategoryGroup = (category) => {
  if (isTravelCategory(category)) return 'Travel';
  if (['Conference Fees', 'Research Equipment/Supplies', 'Lab Consumables', 'Books/Subscriptions/Software'].includes(category)) return 'Academic & Research';
  if (['Student Activity Support', 'Guest Lecturer Honorarium'].includes(category)) return 'Educational Support';
  if (category === 'Office Supplies') return 'Administrative';
  return 'Other';
};