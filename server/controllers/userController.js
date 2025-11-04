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

    const users = await User.find({ role }).select('-password');
    const usersWithImages = await attachProfileImagesToUsers(users);
    res.json(usersWithImages);
  } catch (error) {
    const appError = ErrorTypes.INTERNAL_ERROR(error.message);
    res.status(appError.statusCode).json({ message: appError.message });
  }
};
