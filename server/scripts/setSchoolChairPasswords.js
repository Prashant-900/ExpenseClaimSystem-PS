import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

dotenv.config();

const setSchoolChairPasswords = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected\n');

    // Password for all placeholder School Chairs
    const password = 'Chair@123';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('=== Setting Passwords for School Chair Accounts ===\n');

    // Find all placeholder School Chair users (created by setupAllSchoolChairs.js)
    const departments = ['SMME', 'SCENE', 'SBB', 'SCS', 'SMSS', 'SPS', 'SoM', 'SHSS'];
    
    let updated = 0;
    
    for (const dept of departments) {
      const email = `chair.${dept.toLowerCase()}@faculty.iitmandi.ac.in`;
      
      const user = await User.findOne({ email });
      
      if (user) {
        user.password = hashedPassword;
        await user.save();
        
        console.log(`✓ Updated password for ${dept} School Chair`);
        console.log(`  Email: ${email}`);
        console.log(`  Password: ${password}\n`);
        
        updated++;
      } else {
        console.log(`⚠️  User not found: ${email}\n`);
      }
    }

    console.log('\n=== Summary ===');
    console.log(`Updated ${updated} School Chair accounts\n`);
    console.log('Login Credentials:');
    console.log('==================');
    console.log('Email Pattern: chair.{dept}@faculty.iitmandi.ac.in');
    console.log(`Password (all accounts): ${password}`);
    console.log('\nAccounts:');
    console.log('  chair.smme@faculty.iitmandi.ac.in');
    console.log('  chair.scene@faculty.iitmandi.ac.in');
    console.log('  chair.sbb@faculty.iitmandi.ac.in');
    console.log('  chair.scs@faculty.iitmandi.ac.in');
    console.log('  chair.smss@faculty.iitmandi.ac.in');
    console.log('  chair.sps@faculty.iitmandi.ac.in');
    console.log('  chair.som@faculty.iitmandi.ac.in');
    console.log('  chair.shss@faculty.iitmandi.ac.in');
    console.log('\n✓ All passwords updated successfully!');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

setSchoolChairPasswords();
