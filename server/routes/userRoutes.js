import express from 'express';
import { getUserProfile } from '../controllers/authController.js';
import { authenticate } from '../utils/authorizationMiddleware.js';

const router = express.Router();

router.get('/:userId/profile', authenticate, getUserProfile);

export default router;