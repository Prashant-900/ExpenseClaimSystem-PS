import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import SchoolAdmin from '../models/SchoolAdmin.js';

dotenv.config();

const checkAndSetupSchoolAdmins = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    console.log('\n=== Checking School Chair Users ===\n');

    // Find all users with School Chair role
    const schoolChairs = await User.find({ role: 'School Chair' });
    console.log(`Found ${schoolChairs.length} users with School Chair role:\n`);

    for (const chair of schoolChairs) {
      console.log(`User: ${chair.name}`);
      console.log(`  Email: ${chair.email}`);
      console.log(`  Department: ${chair.department || 'NOT SET'}`);
      console.log(`  ID: ${chair._id}`);

      if (!chair.department) {
        console.log(`  ⚠️  WARNING: No department set for this user!`);
        console.log('');
        continue;
      }

      // Check if SchoolAdmin record exists for this department
      const schoolAdmin = await SchoolAdmin.findOne({ school: chair.department });

      if (schoolAdmin) {
        console.log(`  ✓ SchoolAdmin record exists for ${chair.department}`);
        console.log(`    Registered Chair: ${schoolAdmin.schoolChairName}`);
        console.log(`    Chair ID: ${schoolAdmin.schoolChairId}`);
        
        if (schoolAdmin.schoolChairId?.toString() === chair._id.toString()) {
          console.log(`    ✓ User is correctly registered as School Chair`);
        } else {
          console.log(`    ⚠️  User is NOT the registered School Chair for this department`);
          console.log(`    Would you like to update? (manual intervention needed)`);
        }
      } else {
        console.log(`  ❌ NO SchoolAdmin record for ${chair.department}`);
        console.log(`  Creating SchoolAdmin record...`);
        
        const newSchoolAdmin = await SchoolAdmin.create({
          school: chair.department,
          schoolChairId: chair._id,
          schoolChairName: chair.name
        });
        
        console.log(`  ✓ Created SchoolAdmin record for ${chair.department}`);
      }
      console.log('');
    }

    console.log('\n=== Checking All SchoolAdmin Records ===\n');

    const allSchoolAdmins = await SchoolAdmin.find().populate('schoolChairId deanSRICId directorId');
    console.log(`Found ${allSchoolAdmins.length} SchoolAdmin records:\n`);

    for (const admin of allSchoolAdmins) {
      console.log(`School/Department: ${admin.school}`);
      
      if (admin.schoolChairId) {
        console.log(`  School Chair: ${admin.schoolChairName || admin.schoolChairId.name}`);
        console.log(`    Email: ${admin.schoolChairId.email}`);
        console.log(`    Role: ${admin.schoolChairId.role}`);
      } else {
        console.log(`  School Chair: NOT SET`);
      }
      
      if (admin.deanSRICId) {
        console.log(`  Dean SRIC: ${admin.deanSRICName || admin.deanSRICId.name}`);
      }
      
      if (admin.directorId) {
        console.log(`  Director: ${admin.directorName || admin.directorId.name}`);
      }
      
      console.log('');
    }

    console.log('\n=== Summary ===');
    console.log(`Total School Chair users: ${schoolChairs.length}`);
    console.log(`Total SchoolAdmin records: ${allSchoolAdmins.length}`);
    
    const chairsWithoutDept = schoolChairs.filter(u => !u.department).length;
    if (chairsWithoutDept > 0) {
      console.log(`⚠️  ${chairsWithoutDept} School Chair(s) without department assigned`);
    }

    console.log('\n✓ Check complete!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
  }
};

checkAndSetupSchoolAdmins();
