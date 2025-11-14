import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const checkFacultyUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected\n');

    // Find the faculty user "hash"
    const faculty = await User.findOne({ name: 'hash' });

    if (!faculty) {
      console.log('Faculty user "hash" not found');
    } else {
      console.log('=== Faculty User: hash ===');
      console.log(`Name: ${faculty.name}`);
      console.log(`Email: ${faculty.email}`);
      console.log(`Role: ${faculty.role}`);
      console.log(`Department: ${faculty.department || 'NOT SET'}`);
      console.log(`ID: ${faculty._id}`);
    }

    // Also find all faculty users
    console.log('\n=== All Faculty Users ===');
    const allFaculty = await User.find({ role: 'Faculty' });
    
    for (const fac of allFaculty) {
      console.log(`\n${fac.name}`);
      console.log(`  Email: ${fac.email}`);
      console.log(`  Department: ${fac.department || 'NOT SET'}`);
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
  }
};

checkFacultyUser();
