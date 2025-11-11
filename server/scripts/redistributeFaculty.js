import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function redistributeFaculty() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const faculties = await User.find({ role: 'Faculty' }).select('name email department');
    
    if (faculties.length < 3) {
      console.log('Not enough faculty to redistribute. Run addTestFaculty.js first.\n');
      await mongoose.connection.close();
      return;
    }

    console.log('Current faculty distribution:\n');
    faculties.forEach(f => {
      console.log(`   ${f.name} → ${f.department}`);
    });

    // Redistribute to different departments for testing
    const departments = ['SCEE', 'SMME', 'SCENE', 'SCS', 'SHSS'];
    
    for (let i = 0; i < Math.min(faculties.length, departments.length); i++) {
      const faculty = faculties[i];
      const newDept = departments[i];
      
      if (faculty.department !== newDept) {
        await User.updateOne(
          { _id: faculty._id },
          { $set: { department: newDept } }
        );
        console.log(`\n✅ Updated ${faculty.name}: ${faculty.department} → ${newDept}`);
      }
    }

    console.log('\n=== New Distribution ===\n');
    const updated = await User.find({ role: 'Faculty' }).select('name email department');
    const byDept = {};
    updated.forEach(f => {
      byDept[f.department] = (byDept[f.department] || 0) + 1;
    });

    Object.entries(byDept).sort().forEach(([dept, count]) => {
      console.log(`   ${dept}: ${count} faculty`);
      const deptFaculty = updated.filter(f => f.department === dept);
      deptFaculty.forEach(f => {
        console.log(`      - ${f.name} (${f.email})`);
      });
    });

    console.log('\n✅ Faculty redistributed for testing!\n');
    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

redistributeFaculty();
