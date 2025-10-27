import mongoose from 'mongoose';
import User from '../models/User.js';
import SchoolAdmin from '../models/SchoolAdmin.js';

const MONGODB_URI = 'mongodb://127.0.0.1:27017/expenseclaim';

async function checkDeanSRIC() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB\n');

    // Find all Dean SRIC users
    const deanSRICUsers = await User.find({ role: 'Dean SRIC' });
    console.log(`Found ${deanSRICUsers.length} Dean SRIC user(s):`);
    deanSRICUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email}) - ID: ${user._id}`);
    });
    console.log();

    // Check SchoolAdmin records
    const instituteAdmin = await SchoolAdmin.findOne({ school: 'Institute' }).populate('deanSRICId');
    console.log('Institute SchoolAdmin record:');
    if (instituteAdmin) {
      console.log(`  School: ${instituteAdmin.school}`);
      console.log(`  Dean SRIC ID: ${instituteAdmin.deanSRICId?._id || 'NOT SET'}`);
      if (instituteAdmin.deanSRICId) {
        console.log(`  Dean SRIC Name: ${instituteAdmin.deanSRICId.name}`);
        console.log(`  Dean SRIC Email: ${instituteAdmin.deanSRICId.email}`);
      }
    } else {
      console.log('  NOT FOUND - Creating Institute record...');
      const newInstituteAdmin = new SchoolAdmin({
        school: 'Institute'
      });
      await newInstituteAdmin.save();
      console.log('  Created Institute SchoolAdmin record');
    }
    console.log();

    // Auto-fix: If Dean SRIC user exists but not set in SchoolAdmin
    if (deanSRICUsers.length > 0 && (!instituteAdmin?.deanSRICId)) {
      console.log('Fixing: Setting Dean SRIC in Institute SchoolAdmin...');
      const admin = instituteAdmin || await SchoolAdmin.findOne({ school: 'Institute' });
      admin.deanSRICId = deanSRICUsers[0]._id;
      await admin.save();
      console.log('✓ Fixed: Dean SRIC set successfully');
    } else if (deanSRICUsers.length > 0 && instituteAdmin?.deanSRICId) {
      console.log('✓ Dean SRIC is properly configured');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nConnection closed');
  }
}

checkDeanSRIC();
