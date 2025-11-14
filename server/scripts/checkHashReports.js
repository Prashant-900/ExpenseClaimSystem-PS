import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ExpenseReport from '../models/ExpenseReport.js';
import User from '../models/User.js';

dotenv.config();

const checkHashReports = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected\n');

    // Find the faculty user "hash"
    const hash = await User.findOne({ name: 'hash' });

    if (!hash) {
      console.log('Faculty user "hash" not found');
      await mongoose.connection.close();
      return;
    }

    console.log(`Faculty: ${hash.name}`);
    console.log(`Email: ${hash.email}`);
    console.log(`Department: ${hash.department}`);
    console.log(`ID: ${hash._id}\n`);

    // Find all reports submitted by hash
    const reports = await ExpenseReport.find({ submitterId: hash._id });

    console.log(`Found ${reports.length} reports submitted by hash\n`);

    for (const report of reports) {
      console.log(`Report ID: ${report._id}`);
      console.log(`  Status: ${report.status}`);
      console.log(`  Current Department: ${report.department || 'NOT SET'}`);
      console.log(`  Should be: ${hash.department}`);
      
      if (report.department !== hash.department) {
        console.log(`  ❌ MISMATCH - Fixing...`);
        report.department = hash.department;
        await report.save();
        console.log(`  ✓ Fixed to: ${hash.department}`);
      } else {
        console.log(`  ✓ Already correct`);
      }
      console.log('');
    }

    console.log('✓ Check complete!');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
  }
};

checkHashReports();
