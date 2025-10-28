import express from 'express';
import { getUserProfile } from '../controllers/authController.js';
import { getUsersByRole } from '../controllers/userController.js';
import { authenticate } from '../utils/authorizationMiddleware.js';

const router = express.Router();

// Get user profile
router.get('/:userId/profile', authenticate, getUserProfile);

// List users by role (e.g., /list?role=Faculty)
// Public endpoint to allow students to fetch faculty list when preparing submissions
router.get('/list', getUsersByRole);

export default router;