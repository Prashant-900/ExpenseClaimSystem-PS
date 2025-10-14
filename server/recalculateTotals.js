import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ExpenseReport from './models/ExpenseReport.js';

dotenv.config();

const recalculateAllReportTotals = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Get all expense reports
    const reports = await ExpenseReport.find({});
    console.log(`Found ${reports.length} reports to update`);

    let updatedCount = 0;

    for (const report of reports) {
      if (report.items && report.items.length > 0) {
        // Recalculate totals
        const oldTotalAmount = report.totalAmount;
        const oldUniversityCardAmount = report.universityCardAmount;
        const oldPersonalAmount = report.personalAmount;
        const oldNetReimbursement = report.netReimbursement;

        report.totalAmount = report.items.reduce((sum, item) => sum + (item.amountInINR || item.amount || 0), 0);
        report.universityCardAmount = report.items
          .filter(item => item.paymentMethod === 'University Credit Card (P-Card)')
          .reduce((sum, item) => sum + (item.amountInINR || item.amount || 0), 0);
        report.personalAmount = report.items
          .filter(item => item.paymentMethod === 'Personal Funds (Reimbursement)')
          .reduce((sum, item) => sum + (item.amountInINR || item.amount || 0), 0);
        report.netReimbursement = report.personalAmount - (report.nonReimbursableAmount || 0);

        // Check if anything changed
        const changed = (
          oldTotalAmount !== report.totalAmount ||
          oldUniversityCardAmount !== report.universityCardAmount ||
          oldPersonalAmount !== report.personalAmount ||
          oldNetReimbursement !== report.netReimbursement
        );

        if (changed) {
          await report.save();
          updatedCount++;
          console.log(`Updated report ${report._id}:`);
          console.log(`  Total: ${oldTotalAmount} -> ${report.totalAmount}`);
          console.log(`  University Card: ${oldUniversityCardAmount} -> ${report.universityCardAmount}`);
          console.log(`  Personal: ${oldPersonalAmount} -> ${report.personalAmount}`);
          console.log(`  Net Reimbursement: ${oldNetReimbursement} -> ${report.netReimbursement}`);
        }
      }
    }

    console.log(`\nUpdate completed! Updated ${updatedCount} out of ${reports.length} reports.`);

  } catch (error) {
    console.error('Error updating reports:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
};

recalculateAllReportTotals();