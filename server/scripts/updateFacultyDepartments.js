import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const DEPARTMENTS = ['SCEE', 'SMME', 'SCENE', 'SBB', 'SCS', 'SMSS', 'SPS', 'SoM', 'SHSS'];

async function updateFacultyDepartments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB\n');

    const faculties = await User.find({ role: 'Faculty', department: { $exists: false } }).select('name email');
    
    if (faculties.length === 0) {
      console.log('✅ All faculty already have departments assigned!\n');
      await mongoose.connection.close();
      rl.close();
      return;
    }

    console.log(`Found ${faculties.length} faculty without departments:\n`);
    faculties.forEach((f, i) => {
      console.log(`${i + 1}. ${f.name} (${f.email})`);
    });

    console.log('\nAvailable departments:', DEPARTMENTS.join(', '));
    console.log('\nOptions:');
    console.log('1. Assign all to same department');
    console.log('2. Skip (manual assignment needed)\n');

    rl.question('Choose option (1 or 2): ', async (option) => {
      if (option === '1') {
        rl.question(`Enter department (${DEPARTMENTS.join('/')}): `, async (dept) => {
          if (!DEPARTMENTS.includes(dept)) {
            console.log(`\n❌ Invalid department. Must be one of: ${DEPARTMENTS.join(', ')}\n`);
            await mongoose.connection.close();
            rl.close();
            return;
          }

          const result = await User.updateMany(
            { role: 'Faculty', department: { $exists: false } },
            { $set: { department: dept } }
          );

          console.log(`\n✅ Updated ${result.modifiedCount} faculty to department: ${dept}\n`);
          await mongoose.connection.close();
          rl.close();
        });
      } else {
        console.log('\n⚠️  Skipped. You can manually assign departments using MongoDB or admin panel.\n');
        await mongoose.connection.close();
        rl.close();
      }
    });

  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
    rl.close();
    process.exit(1);
  }
}

updateFacultyDepartments();
