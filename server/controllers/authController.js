import User from '../models/User.js';
import { uploadToS3 } from '../middleware/fileUploadMiddleware.js';
import { getProfileImageUrl } from '../utils/imageUtils.js';
import { ErrorTypes } from '../utils/appError.js';

export const saveUser = async (req, res) => {
  try {
    // Get userId from Clerk auth - handle different patterns
    const auth = req.auth;
    if (!auth) {
      const error = ErrorTypes.UNAUTHORIZED();
      return res.status(error.statusCode).json({ message: error.message });
    }

    const userId = auth.userId || auth.sub;
    if (!userId) {
      const error = ErrorTypes.UNAUTHORIZED();
      return res.status(error.statusCode).json({ message: error.message });
    }

    const { name, email, department, studentId } = req.body;

    // Check if user already exists
    let user = await User.findOne({ clerkId: userId });

    if (user) {
      // Update existing user with registration data
      user = await User.findByIdAndUpdate(
        user._id,
        { department, studentId },
        { new: true, runValidators: true }
      );
    } else {
      // Create new user
      // Determine role based on email domain
      let role = 'Employee';
      if (email?.endsWith('@faculty.iitmandi.ac.in')) role = 'Faculty';
      else if (email?.endsWith('@audit.iitmandi.ac.in')) role = 'Audit';
      else if (email?.endsWith('@finance.iitmandi.ac.in')) role = 'Finance';
      else if (email?.endsWith('@admin.iitmandi.ac.in')) role = 'Admin';
      else if (email?.endsWith('@students.iitmandi.ac.in')) role = 'Student';

      user = await User.create({
        clerkId: userId,
        name,
        email,
        role,
        department,
        studentId: studentId || '',
      });
    }

    res.json({ 
      message: 'User saved successfully',
      user: user.toObject() 
    });
  } catch (error) {
    const appError = error.code === 11000 
      ? ErrorTypes.DUPLICATE('Email or Student ID')
      : ErrorTypes.INTERNAL_ERROR(error.message);
    res.status(appError.statusCode).json({ message: appError.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, phone, department, bio, studentId } = req.body;
    const updateData = { name, phone, department, bio };

    // Only allow students to update studentId
    if (req.user.role === 'Student' && studentId !== undefined) {
      updateData.studentId = studentId;
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ user });
  } catch (error) {
    const appError = ErrorTypes.INTERNAL_ERROR(error.message);
    res.status(appError.statusCode).json({ message: appError.message });
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      const error = ErrorTypes.MISSING_FIELD('Profile image');
      return res.status(error.statusCode).json({ message: error.message });
    }

    const fileName = await uploadToS3(req.file, req.user._id, 'profile');
    // Direct public S3 URL (bucket is public)
    const imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    res.json({ message: 'Profile image uploaded successfully', imageUrl });
  } catch (error) {
    const appError = ErrorTypes.FILE_UPLOAD_ERROR(error.message);
    res.status(appError.statusCode).json({ message: appError.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      const error = ErrorTypes.USER_NOT_FOUND();
      return res.status(error.statusCode).json({ message: error.message });
    }

    // Get profile image URL
    const profileImage = getProfileImageUrl(user._id);

    res.json({ ...user.toObject(), profileImage });
  } catch (error) {
    const appError = ErrorTypes.INTERNAL_ERROR(error.message);
    res.status(appError.statusCode).json({ message: appError.message });
  }
};