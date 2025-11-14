import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { authenticate } from '../utils/authorizationMiddleware.js';
import { register, verifyEmail, resendVerificationOTP, login, updateProfile, uploadProfileImage } from '../controllers/authController.js';
import upload from '../middleware/fileUploadMiddleware.js';

const router = express.Router();

// Authentication routes
router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendVerificationOTP);
router.post('/login', login);

// Get current user
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Invalid token' });

    // Get profile image URL from S3 (direct public URL)
    const profileImage = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/profiles/${user._id}/profile.jpg`;

    res.json({ ...user.toObject(), profileImage });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// Profile management routes (protected)
router.patch('/profile', authenticate, updateProfile);
router.post('/upload-profile-image', authenticate, upload.single('profileImage'), uploadProfileImage);

export default router;