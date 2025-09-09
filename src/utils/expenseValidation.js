export const validateExpenseItem = (item) => {
  const errors = [];

  if (!item.date) {
    errors.push('Date is required');
  }

  if (!item.category) {
    errors.push('Category is required');
  }

  if (!item.description) {
    errors.push('Description is required');
  }

  if (!item.amount || item.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }

  if (!item.paymentMethod) {
    errors.push('Payment method is required');
  }

  if (!item.businessPurpose) {
    errors.push('Business purpose is required');
  }

  if (!item.receiptImage) {
    errors.push('Receipt image is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateExpenseReport = (report) => {
  const errors = [];

  if (!report.items || report.items.length === 0) {
    errors.push('At least one expense item is required');
  }

  // Validate each item
  if (report.items) {
    report.items.forEach((item, index) => {
      const itemValidation = validateExpenseItem(item);
      if (!itemValidation.isValid) {
        errors.push(`Item ${index + 1}: ${itemValidation.errors.join(', ')}`);
      }
    });
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};