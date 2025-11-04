import User from '../models/User.js';
import { uploadToS3 } from '../middleware/fileUploadMiddleware.js';

export const saveUser = async (req, res) => {
  try {
    const { userId } = req.auth;
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
    console.error('Save user error:', error);
    res.status(500).json({ message: error.message });
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
    res.status(500).json({ message: error.message });
  }
};

export const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const fileName = await uploadToS3(req.file, req.user._id, 'profile');
    // Direct public S3 URL (bucket is public)
    const imageUrl = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

    res.json({ message: 'Profile image uploaded successfully', imageUrl });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({ message: 'Failed to upload profile image' });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get profile image URL
    const profileImage = await getProfileImageUrl(user._id);

    res.json({ ...user.toObject(), profileImage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfileImageUrl = (userId) => {
  // Return direct public S3 URL (bucket is public)
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/profiles/${userId}/profile.jpg`;
};