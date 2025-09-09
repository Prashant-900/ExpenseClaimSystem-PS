import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createTestUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Clear existing test users
    await User.deleteMany({ 
      email: { $in: [
        'alice@admin.iitmandi.ac.in', 
        'bob@audit.iitmandi.ac.in', 
        'carol@finance.iitmandi.ac.in', 
        'jane@faculty.iitmandi.ac.in',
        'john@students.iitmandi.ac.in'
      ] }
    });
    
    // Create test users
    const users = [
      {
        name: 'Alice Admin',
        email: 'alice@admin.iitmandi.ac.in',
        password: '123456',
        role: 'Admin'
      },
      {
        name: 'Bob Audit',
        email: 'bob@audit.iitmandi.ac.in',
        password: '123456',
        role: 'Audit'
      },
      {
        name: 'Carol Finance',
        email: 'carol@finance.iitmandi.ac.in',
        password: '123456',
        role: 'Finance'
      },
      {
        name: 'Jane Faculty',
        email: 'jane@faculty.iitmandi.ac.in',
        password: '123456',
        role: 'Faculty',
        department: 'SCEE'
      },
      {
        name: 'John Student',
        email: 'john@students.iitmandi.ac.in',
        password: '123456',
        role: 'Student',
        department: 'SCEE',
        facultyEmail: 'jane@faculty.iitmandi.ac.in'
      }
    ];
    
    for (const userData of users) {
      await User.create(userData);
      console.log(`Created ${userData.role}: ${userData.email} / 123456`);
    }
    
    console.log('\nAll test users created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

createTestUsers();