import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { uploadToS3 } from '../middleware/fileUploadMiddleware.js';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const register = async (req, res) => {
  try {
    const { name, email, password, facultyEmail, department, studentId } = req.body;
    
    // Validate email domain
    const validDomains = [
      '@students.iitmandi.ac.in',
      '@faculty.iitmandi.ac.in',
      '@audit.iitmandi.ac.in',
      '@finance.iitmandi.ac.in',
      '@admin.iitmandi.ac.in'
    ];
    
    const isValidDomain = validDomains.some(domain => email.endsWith(domain));
    if (!isValidDomain) {
      return res.status(400).json({ message: 'Invalid email domain. Use IIT Mandi email.' });
    }
    
    // Assign role based on email domain
    let role = 'Student';
    if (email.endsWith('@faculty.iitmandi.ac.in')) role = 'Faculty';
    else if (email.endsWith('@audit.iitmandi.ac.in')) role = 'Audit';
    else if (email.endsWith('@finance.iitmandi.ac.in')) role = 'Finance';
    else if (email.endsWith('@admin.iitmandi.ac.in')) role = 'Admin';
    
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const userData = { name, email, password, role, facultyEmail, department };
    
    // Add studentId for students
    if (role === 'Student' && studentId) {
      userData.studentId = studentId;
    }
    
    const user = await User.create(userData);
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, department: user.department, studentId: user.studentId, profileImage: user.profileImage }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProfileImageUrl = (userId) => {
  // Return direct public S3 URL (bucket is public)
  return `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/profiles/${userId}/profile.jpg`;
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate email domain
    const validDomains = [
      '@students.iitmandi.ac.in',
      '@faculty.iitmandi.ac.in',
      '@audit.iitmandi.ac.in',
      '@finance.iitmandi.ac.in',
      '@admin.iitmandi.ac.in'
    ];
    
    const isValidDomain = validDomains.some(domain => email.endsWith(domain));
    if (!isValidDomain) {
      return res.status(400).json({ message: 'Invalid email domain. Use IIT Mandi email.' });
    }
    
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const profileImage = await getProfileImageUrl(user._id);
    const token = generateToken(user._id);
    
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, profileImage }
    });
  } catch (error) {
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