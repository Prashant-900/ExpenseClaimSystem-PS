import express from 'express';
// import { requireAuth } from '@clerk/express';
import { authenticate } from '../utils/authorizationMiddleware.js';
import { updateProfile, uploadProfileImage, saveUser } from '../controllers/authController.js';
import upload from '../middleware/fileUploadMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/verify-email', verifyEmail);
router.post('/resend-otp', resendVerificationOTP);
router.post('/login', login);
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ message: 'Invalid token' });

    // Get current profile image from MinIO
    const { Client } = await import('minio');
    const minioClient = new Client({
      endPoint: process.env.MINIO_ENDPOINT,
      port: parseInt(process.env.MINIO_PORT),
      useSSL: false,
      accessKey: process.env.MINIO_ACCESS_KEY,
      secretKey: process.env.MINIO_SECRET_KEY
    });
    
    const objectPath = `profiles/${user._id}/profile.jpg`;
    let profileImage = null;
    
    try {
      await minioClient.statObject(process.env.MINIO_BUCKET, objectPath);
      profileImage = `http://localhost:5000/api/images/${objectPath}`;
    } catch (error) {
      // No profile image exists
    }

    res.json({ ...user.toObject(), profileImage });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

router.get('/google', passport.authenticate('google', {
  scope: ['profile', 'email']
}));

router.get('/google/callback', 
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${token}`);
  }
);

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