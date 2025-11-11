import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const testFaculty = [
  { name: 'Prof. SMME Test', email: 'test.smme@faculty.iitmandi.ac.in', department: 'SMME' },
  { name: 'Prof. SCENE Test', email: 'test.scene@faculty.iitmandi.ac.in', department: 'SCENE' },
  { name: 'Prof. SCS Test', email: 'test.scs@faculty.iitmandi.ac.in', department: 'SCS' },
  { name: 'Prof. SHSS Test', email: 'test.shss@faculty.iitmandi.ac.in', department: 'SHSS' },
];

async function addTestFaculty() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    console.log('Adding test faculty to different departments...\n');

    for (const faculty of testFaculty) {
      // Check if already exists
      const existing = await User.findOne({ email: faculty.email });
      if (existing) {
        console.log(`⚠️  ${faculty.name} already exists, skipping...`);
        continue;
      }

      // Create new faculty
      const hashedPassword = await bcrypt.hash('password123', 12);
      const newFaculty = new User({
        name: faculty.name,
        email: faculty.email,
        password: hashedPassword,
        role: 'Faculty',
        department: faculty.department
      });

      await newFaculty.save();
      console.log(`✅ Created: ${faculty.name} (${faculty.department})`);
    }

    console.log('\n=== Summary ===');
    const allFaculty = await User.find({ role: 'Faculty' }).select('name department');
    const byDept = {};
    allFaculty.forEach(f => {
      byDept[f.department] = (byDept[f.department] || 0) + 1;
    });

    console.log('\nFaculty count by department:');
    Object.entries(byDept).sort().forEach(([dept, count]) => {
      console.log(`   ${dept}: ${count} faculty`);
    });

    console.log('\n✅ Done! Test faculty added.\n');
    console.log('Login credentials for test faculty:');
    console.log('   Email: test.smme@faculty.iitmandi.ac.in');
    console.log('   Password: password123\n');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

addTestFaculty();
