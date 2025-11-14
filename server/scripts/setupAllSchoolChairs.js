import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import SchoolAdmin from '../models/SchoolAdmin.js';

dotenv.config();

const setupSchoolChairs = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected\n');

    // All departments that need School Chairs
    const departments = ['SCEE', 'SMME', 'SCENE', 'SBB', 'SCS', 'SMSS', 'SPS', 'SoM', 'SHSS'];

    console.log('=== Setting up School Chairs for all departments ===\n');

    for (const dept of departments) {
      console.log(`Processing ${dept}...`);

      // Check if SchoolAdmin record exists
      let schoolAdmin = await SchoolAdmin.findOne({ school: dept });

      if (schoolAdmin && schoolAdmin.schoolChairId) {
        console.log(`  ✓ ${dept} already has School Chair assigned`);
        const chair = await User.findById(schoolAdmin.schoolChairId);
        console.log(`    Chair: ${chair?.name || 'Unknown'} (${chair?.email || 'N/A'})\n`);
        continue;
      }

      // Find a School Chair user for this department
      let chairUser = await User.findOne({ role: 'School Chair', department: dept });

      if (!chairUser) {
        console.log(`  ⚠️  No School Chair user found for ${dept}`);
        console.log(`  Creating placeholder School Chair user...`);

        // Create a placeholder School Chair user
        chairUser = await User.create({
          name: `${dept} School Chair`,
          email: `chair.${dept.toLowerCase()}@faculty.iitmandi.ac.in`,
          password: '$2a$10$hashedPasswordPlaceholder123456789012345678901234', // Placeholder hash
          role: 'School Chair',
          department: dept,
          contactNumber: '0000000000'
        });

        console.log(`  ✓ Created placeholder user: ${chairUser.email}`);
      } else {
        console.log(`  ✓ Found existing School Chair user: ${chairUser.name} (${chairUser.email})`);
      }

      // Create or update SchoolAdmin record
      if (schoolAdmin) {
        schoolAdmin.schoolChairId = chairUser._id;
        schoolAdmin.schoolChairName = chairUser.name;
        await schoolAdmin.save();
        console.log(`  ✓ Updated SchoolAdmin record for ${dept}\n`);
      } else {
        await SchoolAdmin.create({
          school: dept,
          schoolChairId: chairUser._id,
          schoolChairName: chairUser.name
        });
        console.log(`  ✓ Created SchoolAdmin record for ${dept}\n`);
      }
    }

    console.log('\n=== Summary ===');
    const allSchoolAdmins = await SchoolAdmin.find({}).populate('schoolChairId');
    
    console.log(`\nTotal SchoolAdmin records: ${allSchoolAdmins.length}`);
    console.log('\nDepartments with School Chairs:');
    
    for (const admin of allSchoolAdmins) {
      if (admin.school !== 'Institute' && admin.schoolChairId) {
        console.log(`  ${admin.school}: ${admin.schoolChairName} (${admin.schoolChairId?.email || 'N/A'})`);
      }
    }

    console.log('\n✓ Setup complete!');
    console.log('\nNOTE: Placeholder users have been created with default passwords.');
    console.log('You should update these users through the admin panel with real information.');

    await mongoose.connection.close();
  } catch (error) {
    console.error('Error:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
};

setupSchoolChairs();
