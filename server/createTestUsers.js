import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const testUsers = [
  // Student
  {
    name: 'Test Student',
    email: 'student@students.iitmandi.ac.in',
    password: 'password123',
    role: 'Student',
    studentId: 'B21001',
    department: 'SCEE',
    phone: '+91-9876543210',
    bio: 'Test student account',
    emailVerified: true
  },
  // Faculty
  {
    name: 'Test Faculty',
    email: 'faculty@faculty.iitmandi.ac.in',
    password: 'password123',
    role: 'Faculty',
    department: 'SCS',
    phone: '+91-9876543211',
    bio: 'Test faculty account',
    emailVerified: true
  },
  // School Chair
  {
    name: 'Test School Chair',
    email: 'chair@faculty.iitmandi.ac.in',
    password: 'password123',
    role: 'School Chair',
    department: 'SCEE',
    phone: '+91-9876543212',
    bio: 'Test school chair account',
    emailVerified: true
  },
  // Dean SRIC
  {
    name: 'Test Dean SRIC',
    email: 'dean@faculty.iitmandi.ac.in',
    password: 'password123',
    role: 'Dean SRIC',
    phone: '+91-9876543213',
    bio: 'Test Dean SRIC account',
    emailVerified: true
  },
  // Director
  {
    name: 'Test Director',
    email: 'director@faculty.iitmandi.ac.in',
    password: 'password123',
    role: 'Director',
    phone: '+91-9876543214',
    bio: 'Test director account',
    emailVerified: true
  },
  // Audit
  {
    name: 'Test Audit',
    email: 'audit@audit.iitmandi.ac.in',
    password: 'password123',
    role: 'Audit',
    phone: '+91-9876543215',
    bio: 'Test audit account',
    emailVerified: true
  },
  // Finance
  {
    name: 'Test Finance',
    email: 'finance@finance.iitmandi.ac.in',
    password: 'password123',
    role: 'Finance',
    phone: '+91-9876543216',
    bio: 'Test finance account',
    emailVerified: true
  },
  // Admin
  {
    name: 'Test Admin',
    email: 'admin@admin.iitmandi.ac.in',
    password: 'password123',
    role: 'Admin',
    phone: '+91-9876543217',
    bio: 'Test admin account',
    emailVerified: true
  }
];

async function createTestUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Delete existing test users
    const testEmails = testUsers.map(u => u.email);
    await User.deleteMany({ email: { $in: testEmails } });
    console.log('✓ Cleared existing test users');

    // Create users
    const createdUsers = [];
    for (const userData of testUsers) {
      const user = await User.create(userData);
      
      createdUsers.push(user);
      console.log(`✓ Created ${user.role}: ${user.email}`);
    }

    console.log('\n✅ Successfully created all test users!');
    console.log('\nLogin credentials:');
    console.log('─'.repeat(60));
    testUsers.forEach(u => {
      console.log(`${u.role.padEnd(15)} | ${u.email.padEnd(35)} | password123`);
    });
    console.log('─'.repeat(60));

  } catch (error) {
    console.error('❌ Error creating test users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✓ Database connection closed');
    process.exit(0);
  }
}

createTestUsers();
