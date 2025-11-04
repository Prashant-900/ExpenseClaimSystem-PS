import express from 'express';
import { requireAuth } from '@clerk/express';
import { getUsersByRole } from '../controllers/userController.js';
import { getUserProfile } from '../controllers/authController.js';
import { authenticate } from '../utils/authorizationMiddleware.js';

const router = express.Router();

// All routes protected with Clerk
router.use(requireAuth());
router.use(authenticate);

// Get user profile
router.get('/:userId/profile', getUserProfile);

// List users by role (protected)
router.get('/list', getUsersByRole);

export default router;