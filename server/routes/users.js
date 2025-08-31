import express from 'express';
import { getUserProfile } from '../controllers/authCtrl.js';
import { authenticate } from '../utils/roleMiddleware.js';

const router = express.Router();

router.get('/:userId/profile', authenticate, getUserProfile);

export default router;