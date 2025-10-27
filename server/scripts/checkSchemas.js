import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    checkAndUpdateSchemas();
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

async function checkAndUpdateSchemas() {
  try {
    // Get the User collection
    const db = mongoose.connection.db;
    
    console.log('\n📋 Checking User schema...');
    const collections = await db.listCollections({ name: 'users' }).toArray();
    
    if (collections.length > 0) {
      console.log('✅ Users collection exists');
      
      // Check if there are any users with invalid departments
      const users = await db.collection('users').find({}).toArray();
      console.log(`\n👥 Total users in database: ${users.length}`);
      
      // Group by role
      const usersByRole = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});
      
      console.log('\n📊 Users by role:');
      Object.entries(usersByRole).forEach(([role, count]) => {
        console.log(`   ${role}: ${count}`);
      });
      
      // Check department values
      const departmentValues = users
        .filter(u => u.department)
        .map(u => u.department);
      
      const uniqueDepartments = [...new Set(departmentValues)];
      console.log('\n🏫 Departments in use:');
      uniqueDepartments.forEach(dept => {
        const count = departmentValues.filter(d => d === dept).length;
        console.log(`   ${dept}: ${count} user(s)`);
      });
      
      // Check for invalid departments
      const validDepartments = ['SCEE', 'SMME', 'SCENE', 'SBB', 'SCS', 'SMSS', 'SPS', 'SoM', 'SHSS'];
      const invalidDepts = uniqueDepartments.filter(d => !validDepartments.includes(d));
      
      if (invalidDepts.length > 0) {
        console.log('\n⚠️  Invalid departments found:', invalidDepts);
      } else {
        console.log('\n✅ All departments are valid');
      }
      
      // List all valid departments
      console.log('\n✅ Valid departments according to schema:');
      validDepartments.forEach(dept => {
        console.log(`   ${dept}`);
      });
    } else {
      console.log('⚠️  Users collection does not exist yet');
    }
    
    console.log('\n📋 Checking ExpenseReport schema...');
    const expenseCollections = await db.listCollections({ name: 'expensereports' }).toArray();
    
    if (expenseCollections.length > 0) {
      const reports = await db.collection('expensereports').find({}).toArray();
      console.log(`📊 Total expense reports: ${reports.length}`);
    } else {
      console.log('⚠️  ExpenseReports collection does not exist yet');
    }
    
    console.log('\n✅ Schema check complete!');
    console.log('\n💡 Note: If you still see validation errors, try:');
    console.log('   1. Restart the Node.js server');
    console.log('   2. Clear any cached model definitions');
    console.log('   3. Use the exact department codes listed above');
    
  } catch (error) {
    console.error('❌ Error checking schemas:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Database connection closed');
    process.exit(0);
  }
}
