import express from 'express';
import jwt from 'jsonwebtoken';
import passport from 'passport';
import User from '../models/User.js';
import { register, login, updateProfile, getUserProfile, uploadProfileImage } from '../controllers/authCtrl.js';
import { authenticate } from '../utils/roleMiddleware.js';
import upload from '../middleware/upload.js';

const router = express.Router();

router.post('/register', register);
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

router.patch('/profile', authenticate, updateProfile);
router.post('/upload-profile-image', authenticate, upload.single('profileImage'), uploadProfileImage);

export default router;