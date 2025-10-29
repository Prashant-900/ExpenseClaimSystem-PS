import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function cleanupUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Find and remove incomplete user documents (missing required fields like name or email)
    const incompleteUsers = await usersCollection.find({
      $or: [
        { name: { $exists: false } },
        { email: { $exists: false } },
        { name: null },
        { email: null },
        { name: "" },
        { email: "" }
      ]
    }).toArray();

    console.log('Found incomplete users:', incompleteUsers.length);
    console.log('Incomplete users:', incompleteUsers.map(u => ({ 
      _id: u._id, 
      name: u.name, 
      email: u.email,
      hasPassword: !!u.password,
      role: u.role 
    })));

    if (incompleteUsers.length > 0) {
      const result = await usersCollection.deleteMany({
        $or: [
          { name: { $exists: false } },
          { email: { $exists: false } },
          { name: null },
          { email: null },
          { name: "" },
          { email: "" }
        ]
      });
      console.log(`Deleted ${result.deletedCount} incomplete user documents`);
    }

    // List remaining users
    const remainingUsers = await usersCollection.find({}).toArray();
    console.log('Remaining users:', remainingUsers.map(u => ({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department
    })));

    console.log('User cleanup completed successfully');
  } catch (error) {
    console.error('Error cleaning up users:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

cleanupUsers();