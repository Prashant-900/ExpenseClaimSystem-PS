import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ExpenseReport from '../models/ExpenseReport.js';
import User from '../models/User.js';

dotenv.config();

const debugReportRouting = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected\n');

    console.log('=== All Expense Reports ===\n');

    const reports = await ExpenseReport.find({})
      .populate('submitterId', 'name email department role')
      .populate('facultyId', 'name email department role')
      .sort({ createdAt: -1 })
      .limit(5);

    for (const report of reports) {
      console.log(`Report ID: ${report._id}`);
      console.log(`  Status: ${report.status}`);
      console.log(`  Created: ${report.createdAt}`);
      console.log(`  Report Department: ${report.department || 'NOT SET'}`);
      console.log(`  Submitter: ${report.submitterId?.name || 'Unknown'} (${report.submitterRole})`);
      console.log(`    - Submitter Dept: ${report.submitterId?.department || 'NOT SET'}`);
      
      if (report.facultyId) {
        console.log(`  Faculty: ${report.facultyId?.name || 'Unknown'}`);
        console.log(`    - Faculty Dept: ${report.facultyId?.department || 'NOT SET'}`);
      } else {
        console.log(`  Faculty: Not assigned yet`);
      }
      
      if (report.facultyApproval?.approved !== undefined) {
        console.log(`  Faculty Approval: ${report.facultyApproval.approved ? 'APPROVED' : 'REJECTED'}`);
        console.log(`    - By: ${report.facultyApproval.approvedBy}`);
      }
      
      console.log('');
    }

    console.log('\n=== Faculty Users ===\n');
    const faculty = await User.find({ role: 'Faculty' });
    for (const f of faculty) {
      console.log(`${f.name} (${f.email}) - Department: ${f.department || 'NOT SET'}`);
    }

    console.log('\n=== School Chair Users ===\n');
    const chairs = await User.find({ role: 'School Chair' });
    for (const c of chairs) {
      console.log(`${c.name} (${c.email}) - Department: ${c.department || 'NOT SET'}`);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
  }
};

debugReportRouting();
