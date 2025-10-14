import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function fixUserIndex() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // Check existing indexes
    const indexes = await usersCollection.indexes();
    console.log('Existing indexes:', indexes.map(idx => ({ name: idx.name, key: idx.key })));

    // Drop the username index if it exists
    try {
      await usersCollection.dropIndex('username_1');
      console.log('Dropped username_1 index');
    } catch (error) {
      if (error.code === 27) {
        console.log('username_1 index does not exist');
      } else {
        console.log('Error dropping index:', error.message);
      }
    }

    // Remove username field from all documents (if it exists)
    const result = await usersCollection.updateMany(
      { username: { $exists: true } },
      { $unset: { username: "" } }
    );
    console.log(`Removed username field from ${result.modifiedCount} documents`);

    // Check for documents with null username (shouldn't exist after unset, but just in case)
    const nullUsernameCount = await usersCollection.countDocuments({ username: null });
    console.log(`Documents with null username: ${nullUsernameCount}`);

    // List all users
    const users = await usersCollection.find({}, { name: 1, email: 1, role: 1 }).toArray();
    console.log('Current users:', users);

    console.log('Database cleanup completed successfully');
  } catch (error) {
    console.error('Error fixing user index:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Disconnected from MongoDB');
  }
}

fixUserIndex();