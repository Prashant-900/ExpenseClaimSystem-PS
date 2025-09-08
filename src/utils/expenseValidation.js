// Expense Report Validation Utilities

export const validateExpenseReport = (formData) => {
  const errors = [];

  // Required fields validation
  if (!formData.facultyName?.trim()) {
    errors.push('Faculty name is required');
  }

  if (!formData.department?.trim()) {
    errors.push('Department is required');
  }

  if (!formData.expensePeriodStart) {
    errors.push('Expense period start date is required');
  }

  if (!formData.expensePeriodEnd) {
    errors.push('Expense period end date is required');
  }

  if (!formData.purposeOfExpense?.trim()) {
    errors.push('Purpose of expense is required');
  }

  if (!formData.reportType) {
    errors.push('Report type is required');
  }

  if (!formData.fundingSource) {
    errors.push('Funding source is required');
  }

  if (!formData.costCenter?.trim()) {
    errors.push('Cost center is required');
  }



  // Date validation
  if (formData.expensePeriodStart && formData.expensePeriodEnd) {
    const startDate = new Date(formData.expensePeriodStart);
    const endDate = new Date(formData.expensePeriodEnd);
    
    if (startDate > endDate) {
      errors.push('Expense period start date must be before end date');
    }
  }



  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validateExpenseItem = (itemData) => {
  const errors = [];

  if (!itemData.date) {
    errors.push('Expense date is required');
  }

  if (!itemData.category) {
    errors.push('Expense category is required');
  }

  if (!itemData.vendor?.trim()) {
    errors.push('Vendor/Payee is required');
  }

  if (!itemData.description?.trim()) {
    errors.push('Description is required');
  }

  if (!itemData.amount || itemData.amount <= 0) {
    errors.push('Amount must be greater than 0');
  }

  if (!itemData.paymentMethod) {
    errors.push('Payment method is required');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount || 0);
};

export const calculateTotals = (items) => {
  const totalAmount = items.reduce((sum, item) => sum + (item.amount || 0), 0);
  const universityCardAmount = items
    .filter(item => item.paymentMethod === 'University Credit Card')
    .reduce((sum, item) => sum + (item.amount || 0), 0);
  const personalAmount = items
    .filter(item => item.paymentMethod === 'Personal Funds')
    .reduce((sum, item) => sum + (item.amount || 0), 0);
  const directInvoiceAmount = items
    .filter(item => item.paymentMethod === 'Direct Invoice')
    .reduce((sum, item) => sum + (item.amount || 0), 0);

  return {
    totalAmount,
    universityCardAmount,
    personalAmount,
    directInvoiceAmount,
    netReimbursement: personalAmount // Assuming no non-reimbursable amounts for now
  };
};