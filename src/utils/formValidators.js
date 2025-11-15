/**
 * Form Validation Utilities
 * Provides common validation functions for form inputs
 */

/**
 * Validate expense item
 * @param {Object} item - The expense item to validate
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateExpenseItem = (item) => {
  const errors = {};

  if (!item.date) {
    errors.date = 'Date is required';
  }

  if (!item.category) {
    errors.category = 'Category is required';
  }

  if (!item.description?.trim()) {
    errors.description = 'Description is required';
  }

  if (!item.amount || item.amount <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }

  if (!item.paymentMethod) {
    errors.paymentMethod = 'Payment method is required';
  }

  if (!item.businessPurpose?.trim()) {
    errors.businessPurpose = 'Business purpose is required';
  }

  if (!item.receiptImage) {
    errors.receiptImage = 'Receipt image is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};