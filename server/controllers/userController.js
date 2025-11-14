import User from '../models/User.js';
import { attachProfileImagesToUsers } from '../utils/imageUtils.js';
import { ErrorTypes } from '../utils/appError.js';

export const getUsersByRole = async (req, res) => {
  try {
    const role = req.query.role;
    if (!role) return res.status(400).json({ message: 'Role query param is required' });

    const users = await User.find({ role }).select('-password');
    for (const user of users) {
      user.profileImage = await getProfileImageUrl(user._id);
    }
    
    res.json(usersWithImages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
