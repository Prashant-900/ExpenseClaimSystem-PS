import User from '../models/User.js';
import { attachProfileImagesToUsers } from '../utils/imageUtils.js';
import { ErrorTypes } from '../utils/appError.js';

export const getUsersByRole = async (req, res) => {
  try {
    const role = req.query.role;
    if (!role) {
      const error = ErrorTypes.MISSING_FIELD('role query parameter');
      return res.status(error.statusCode).json({ message: error.message });
    }

    console.log(`📋 Fetching users with role: ${role}`);
    const users = await User.find({ role }).select('-password');
    console.log(`✅ Found ${users.length} users with role ${role}`);
    
    // Log first few users for debugging (before transformation)
    if (users.length > 0) {
      console.log('Sample user data (raw from DB):', {
        name: users[0].name,
        email: users[0].email,
        department: users[0].department,
        role: users[0].role,
        _id: users[0]._id
      });
    }
    
    const usersWithImages = await attachProfileImagesToUsers(users);
    
    // Log after transformation
    if (usersWithImages.length > 0) {
      console.log('Sample user data (after transformation):', {
        name: usersWithImages[0].name,
        email: usersWithImages[0].email,
        department: usersWithImages[0].department,
        role: usersWithImages[0].role,
        _id: usersWithImages[0]._id,
        hasProfileImage: !!usersWithImages[0].profileImage
      });
    }
    
    res.json(usersWithImages);
  } catch (error) {
    console.error('❌ Error fetching users by role:', error);
    const appError = ErrorTypes.INTERNAL_ERROR(error.message);
    res.status(appError.statusCode).json({ message: appError.message });
  }
};
