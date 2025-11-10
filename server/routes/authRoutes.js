import express from 'express';
// import { requireAuth } from '@clerk/express';
import { authenticate } from '../utils/authorizationMiddleware.js';
import { updateProfile, uploadProfileImage, saveUser } from '../controllers/authController.js';
import upload from '../middleware/fileUploadMiddleware.js';

const router = express.Router();

// Save user after registration (no auth required - open endpoint for registration)
router.post('/save-user', saveUser);

// Profile management routes (protected with Clerk + custom auth)
// router.patch('/profile', requireAuth(), authenticate, updateProfile);
// router.post('/upload-profile-image', requireAuth(), authenticate, upload.single('profileImage'), uploadProfileImage);
router.patch('/profile', authenticate, updateProfile);
router.post('/upload-profile-image', authenticate, upload.single('profileImage'), uploadProfileImage);

// Get current user profile
// router.get('/me', requireAuth(), authenticate, async (req, res) => {
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = req.user;
    // Get current profile image URL from S3 (direct public URL)
    const profileImage = `https://${process.env.AWS_S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/profiles/${user._id}/profile.jpg`;

    res.json({ ...user.toObject(), profileImage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;