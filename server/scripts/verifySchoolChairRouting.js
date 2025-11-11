import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ExpenseReport from '../models/ExpenseReport.js';
import User from '../models/User.js';
import SchoolAdmin from '../models/SchoolAdmin.js';

dotenv.config();

const verifySchoolChairRouting = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected\n');

    console.log('=== VERIFICATION: School Chair Routing Setup ===\n');

    // Check all faculty
    console.log('1. Faculty Users and Their Departments:');
    console.log('='.repeat(50));
    const faculty = await User.find({ role: 'Faculty' });
    for (const f of faculty) {
      console.log(`   ${f.name.padEnd(20)} → ${f.department || 'NO DEPT'}`);
    }

    // Check all school chairs
    console.log('\n2. School Chair Assignments:');
    console.log('='.repeat(50));
    const departments = ['SCEE', 'SMME', 'SCENE', 'SBB', 'SCS', 'SMSS', 'SPS', 'SoM', 'SHSS'];
    for (const dept of departments) {
      const schoolAdmin = await SchoolAdmin.findOne({ school: dept }).populate('schoolChairId');
      if (schoolAdmin && schoolAdmin.schoolChairId) {
        console.log(`   ${dept.padEnd(10)} → ${schoolAdmin.schoolChairName.padEnd(25)} (${schoolAdmin.schoolChairId.email})`);
      } else {
        console.log(`   ${dept.padEnd(10)} → ❌ NO CHAIR ASSIGNED`);
      }
    }

    // Check recent reports
    console.log('\n3. Recent Reports (Last 3):');
    console.log('='.repeat(50));
    const reports = await ExpenseReport.find({})
      .populate('submitterId', 'name department role')
      .populate('facultyId', 'name department')
      .sort({ createdAt: -1 })
      .limit(3);

    for (const report of reports) {
      console.log(`\n   Report: ${report._id}`);
      console.log(`   Status: ${report.status}`);
      console.log(`   Submitter: ${report.submitterId?.name} (${report.submitterRole}) - Dept: ${report.submitterId?.department}`);
      console.log(`   Report Dept: ${report.department || 'NOT SET'}`);
      
      if (report.facultyId) {
        console.log(`   Faculty: ${report.facultyId.name} - Dept: ${report.facultyId.department}`);
        
        // Check which school chair should receive this
        const schoolAdmin = await SchoolAdmin.findOne({ school: report.department }).populate('schoolChairId');
        if (schoolAdmin && schoolAdmin.schoolChairId) {
          console.log(`   → Should go to: ${schoolAdmin.schoolChairName} (${report.department})`);
        } else {
          console.log(`   → ⚠️ No School Chair for ${report.department}`);
        }
      } else {
        console.log(`   Faculty: Not assigned`);
      }
    }

    console.log('\n\n=== TEST SCENARIO ===');
    console.log('If a student from SCEE creates a report and selects faculty "hash" (SHSS):');
    console.log('  1. Report initially has department: SCEE (student\'s dept)');
    console.log('  2. When student SUBMITS, department updates to: SHSS (faculty\'s dept)');
    console.log('  3. When hash APPROVES, report goes to: SHSS School Chair');
    console.log('  4. SHSS School Chair email: chair.shss@faculty.iitmandi.ac.in');
    console.log('  5. SHSS School Chair password: Chair@123');

    console.log('\n✓ Verification complete!\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
  }
};

verifySchoolChairRouting();
