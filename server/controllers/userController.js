import User from '../models/User.js';
import { attachProfileImagesToUsers } from '../utils/imageUtils.js';
import { ErrorTypes } from '../utils/appError.js';

export const getUsersByRole = async (req, res) => {
  try {
    const { role, department } = req.query;
    if (!role) return res.status(400).json({ message: 'Role query param is required' });

    // Build query
    const query = { role, emailVerified: true }; // Only return verified users
    
    // Add department filter if provided
    if (department) {
      query.department = department;
    }

    const users = await User.find(query).select('-password -emailVerificationOTPHash -emailVerificationOTPExpires');
    
    // Add profile image URLs
    const usersWithImages = users.map(user => {
      const userObj = user.toObject();
      userObj.profileImage = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/profiles/${user._id}/profile.jpg`;
      return userObj;
    });
    
    res.json(usersWithImages);
  } catch (error) {
    console.error('getUsersByRole error:', error);
    res.status(500).json({ message: error.message });
  }
};
