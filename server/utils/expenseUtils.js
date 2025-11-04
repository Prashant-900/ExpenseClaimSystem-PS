/**
 * Expense Report Utilities
 * Centralized functions for expense calculations and validations
 */

/**
 * Recalculate all totals in an expense report
 * @param {Object} report - The expense report object
 * @returns {Object} The updated report with recalculated totals
 */
export const recalculateTotals = (report) => {
  if (!report) {
    throw new Error('report is required');
  }

  if (report.items && report.items.length > 0) {
    report.totalAmount = report.items.reduce((sum, item) => sum + (item.amountInINR || item.amount || 0), 0);
    
    report.universityCardAmount = report.items
      .filter(item => item.paymentMethod === 'University Credit Card (P-Card)')
      .reduce((sum, item) => sum + (item.amountInINR || item.amount || 0), 0);
    
    report.personalAmount = report.items
      .filter(item => item.paymentMethod === 'Personal Funds (Reimbursement)')
      .reduce((sum, item) => sum + (item.amountInINR || item.amount || 0), 0);
    
    report.netReimbursement = report.personalAmount - (report.nonReimbursableAmount || 0);
  } else {
    // Reset totals if no items
    report.totalAmount = 0;
    report.universityCardAmount = 0;
    report.personalAmount = 0;
    report.netReimbursement = 0;
  }
  
  return report;
};
