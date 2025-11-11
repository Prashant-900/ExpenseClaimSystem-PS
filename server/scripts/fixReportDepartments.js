import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ExpenseReport from '../models/ExpenseReport.js';
import User from '../models/User.js';

dotenv.config();

const fixReportDepartments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected\n');

    console.log('=== Checking and Fixing Report Departments ===\n');

    // Find all reports
    const reports = await ExpenseReport.find({}).populate('submitterId');

    console.log(`Found ${reports.length} total reports\n`);

    let fixed = 0;
    let alreadyCorrect = 0;
    let needsManualReview = 0;

    for (const report of reports) {
      console.log(`Report ID: ${report._id}`);
      console.log(`  Submitter: ${report.submitterId?.name || 'Unknown'} (${report.submitterRole})`);
      console.log(`  Current Department: ${report.department || 'NOT SET'}`);

      if (!report.submitterId) {
        console.log(`  ⚠️  Submitter not found - needs manual review\n`);
        needsManualReview++;
        continue;
      }

      const correctDepartment = report.submitterId.department;
      console.log(`  Submitter's Department: ${correctDepartment || 'NOT SET'}`);

      if (!correctDepartment) {
        console.log(`  ⚠️  Submitter has no department - needs manual review\n`);
        needsManualReview++;
        continue;
      }

      if (report.department === correctDepartment) {
        console.log(`  ✓ Department is correct\n`);
        alreadyCorrect++;
      } else {
        console.log(`  ❌ Department mismatch - fixing...`);
        report.department = correctDepartment;
        await report.save();
        console.log(`  ✓ Updated to: ${correctDepartment}\n`);
        fixed++;
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Total reports: ${reports.length}`);
    console.log(`Already correct: ${alreadyCorrect}`);
    console.log(`Fixed: ${fixed}`);
    console.log(`Need manual review: ${needsManualReview}`);
    console.log('\n✓ Department fix complete!');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

fixReportDepartments();
