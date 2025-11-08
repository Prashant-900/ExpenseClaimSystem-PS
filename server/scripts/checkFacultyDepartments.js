import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function checkFacultyDepartments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const faculties = await User.find({ role: 'Faculty' }).select('name email department');
    
    console.log('\n=== Faculty Department Status ===\n');
    console.log(`Total Faculty: ${faculties.length}\n`);

    const withDept = faculties.filter(f => f.department);
    const withoutDept = faculties.filter(f => !f.department);

    console.log(`✅ Faculty WITH department: ${withDept.length}`);
    if (withDept.length > 0) {
      withDept.forEach(f => {
        console.log(`   - ${f.name} (${f.email}) → ${f.department}`);
      });
    }

    console.log(`\n❌ Faculty WITHOUT department: ${withoutDept.length}`);
    if (withoutDept.length > 0) {
      withoutDept.forEach(f => {
        console.log(`   - ${f.name} (${f.email}) → NO DEPARTMENT`);
      });
      console.log('\n⚠️  These faculty will NOT appear in department-filtered lists!');
      console.log('   Run updateFacultyDepartments.js to fix this.\n');
    }

    // Group by department
    const byDept = {};
    withDept.forEach(f => {
      byDept[f.department] = (byDept[f.department] || 0) + 1;
    });

    console.log('\n=== Faculty Count by Department ===\n');
    Object.entries(byDept).sort().forEach(([dept, count]) => {
      console.log(`   ${dept}: ${count} faculty`);
    });

    await mongoose.connection.close();
    console.log('\n✅ Check complete\n');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkFacultyDepartments();
