import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import ExpenseReport from '../models/ExpenseReport.js';

dotenv.config();

const testSchoolChairAccess = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected\n');

    // Find the School Chair user
    const schoolChair = await User.findOne({ role: 'School Chair' });
    
    if (!schoolChair) {
      console.log('❌ No School Chair user found');
      return;
    }

    console.log('=== School Chair User ===');
    console.log(`Name: ${schoolChair.name}`);
    console.log(`Email: ${schoolChair.email}`);
    console.log(`Role: ${schoolChair.role}`);
    console.log(`Department: ${schoolChair.department}`);
    console.log('');

    // Test pending query
    console.log('=== Testing Pending Reports Query ===');
    const pendingQuery = {
      department: schoolChair.department,
      status: 'Faculty Approved'
    };
    console.log('Query:', JSON.stringify(pendingQuery, null, 2));
    
    const pendingReports = await ExpenseReport.find(pendingQuery);
    console.log(`Found ${pendingReports.length} pending reports`);
    
    if (pendingReports.length > 0) {
      console.log('\nPending Reports:');
      pendingReports.forEach((report, i) => {
        console.log(`  ${i + 1}. ${report.purposeOfExpense || 'No purpose'}`);
        console.log(`     Status: ${report.status}`);
        console.log(`     Department: ${report.department}`);
        console.log(`     Submitter: ${report.submitterRole}`);
      });
    }

    // Test processed query
    console.log('\n=== Testing Processed Reports Query ===');
    const processedQuery = {
      department: schoolChair.department,
      status: { $in: ['School Chair Approved', 'Dean SRIC Approved', 'Director Approved', 'Audit Approved', 'Finance Approved', 'Rejected'] }
    };
    console.log('Query:', JSON.stringify(processedQuery, null, 2));
    
    const processedReports = await ExpenseReport.find(processedQuery);
    console.log(`Found ${processedReports.length} processed reports`);
    
    if (processedReports.length > 0) {
      console.log('\nProcessed Reports:');
      processedReports.forEach((report, i) => {
        console.log(`  ${i + 1}. ${report.purposeOfExpense || 'No purpose'}`);
        console.log(`     Status: ${report.status}`);
        console.log(`     Department: ${report.department}`);
      });
    }

    console.log('\n✓ Test complete!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
  }
};

testSchoolChairAccess();
