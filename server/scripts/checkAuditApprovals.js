import mongoose from 'mongoose';
import ExpenseReport from '../models/ExpenseReport.js';
import User from '../models/User.js';

async function checkAuditApprovals() {
  try {
    await mongoose.connect('mongodb://localhost:27017/expense-claim');
    console.log('Connected to MongoDB\n');

    // Find all audit users
    const auditUsers = await User.find({ role: 'Audit' });
    console.log('=== Audit Users ===');
    auditUsers.forEach(user => {
      console.log(`- ${user.name} (${user.email}) - ID: ${user._id}`);
    });
    console.log('');

    // Find all approved reports
    const approvedReports = await ExpenseReport.find({
      status: { $in: ['Audit Approved', 'Finance Approved'] }
    }).populate('submitterId', 'name email')
      .populate('auditApproval.approvedById', 'name email');

    console.log('=== Approved Reports (Audit Level) ===');
    console.log(`Total: ${approvedReports.length}\n`);

    approvedReports.forEach(report => {
      console.log(`Report ID: ${report._id}`);
      console.log(`Status: ${report.status}`);
      console.log(`Submitter: ${report.submitterId?.name}`);
      console.log(`Audit Approval:`);
      if (report.auditApproval) {
        console.log(`  - Approved: ${report.auditApproval.approved}`);
        console.log(`  - Approved By ID: ${report.auditApproval.approvedById?._id || report.auditApproval.approvedById}`);
        console.log(`  - Approved By Name: ${report.auditApproval.approvedById?.name || 'Not populated'}`);
        console.log(`  - Date: ${report.auditApproval.date}`);
        console.log(`  - Remarks: ${report.auditApproval.remarks || 'None'}`);
      } else {
        console.log('  - No audit approval record!');
      }
      console.log('---\n');
    });

    // Find reports pending audit approval
    const pendingReports = await ExpenseReport.find({
      status: { $in: ['Director Approved', 'Dean SRIC Approved'] }
    }).populate('submitterId', 'name email');

    console.log('=== Pending Audit Approval ===');
    console.log(`Total: ${pendingReports.length}\n`);

    pendingReports.forEach(report => {
      console.log(`Report ID: ${report._id}`);
      console.log(`Status: ${report.status}`);
      console.log(`Submitter: ${report.submitterId?.name}`);
      console.log('---\n');
    });

    mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}

checkAuditApprovals();
