import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ExpenseReport from '../models/ExpenseReport.js';
import User from '../models/User.js';

dotenv.config();

const fixHashApprovedReport = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected\n');

    // Find the report that hash approved (most recent one)
    const report = await ExpenseReport.findById('690993cce46a07e4339421e8')
      .populate('submitterId', 'name department')
      .populate('facultyId', 'name department');

    if (!report) {
      console.log('Report not found');
      await mongoose.connection.close();
      return;
    }

    console.log('=== Report Details ===');
    console.log(`Report ID: ${report._id}`);
    console.log(`Status: ${report.status}`);
    console.log(`Submitter: ${report.submitterId?.name} (Dept: ${report.submitterId?.department})`);
    console.log(`Faculty: ${report.facultyId?.name} (Dept: ${report.facultyId?.department})`);
    console.log(`Current Report Department: ${report.department}`);
    console.log(`Faculty Approved By: ${report.facultyApproval?.approvedBy}`);

    if (report.facultyId && report.facultyId.department) {
      console.log(`\nShould be: ${report.facultyId.department}`);
      
      if (report.department !== report.facultyId.department) {
        console.log('\n❌ Department mismatch - Fixing...');
        report.department = report.facultyId.department;
        await report.save();
        console.log(`✓ Updated report department to: ${report.department}`);
      } else {
        console.log('\n✓ Department is already correct');
      }
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
  }
};

fixHashApprovedReport();
