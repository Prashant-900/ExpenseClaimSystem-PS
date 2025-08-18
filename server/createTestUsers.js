import mongoose from 'mongoose';
import User from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createTestUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    // Clear existing test users
    await User.deleteMany({ 
      email: { $in: ['admin@test.com', 'manager@test.com', 'finance@test.com', 'employee@test.com'] }
    });
    
    // Create test users
    const users = [
      {
        name: 'Admin User',
        email: 'admin@test.com',
        password: '123456',
        role: 'Admin'
      },
      {
        name: 'Manager User',
        email: 'manager@test.com',
        password: '123456',
        role: 'Manager'
      },
      {
        name: 'Finance User',
        email: 'finance@test.com',
        password: '123456',
        role: 'Finance'
      },
      {
        name: 'Employee User',
        email: 'employee@test.com',
        password: '123456',
        role: 'Employee',
        managerEmail: 'manager@test.com'
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