import express from 'express';
import { requireAuth } from '@clerk/express';
import { chatWithBot, getChatHistory, clearChatHistory } from '../controllers/geminiChatbotController.js';
import { authenticate } from '../utils/authorizationMiddleware.js';

const router = express.Router();

// Apply Clerk auth to all routes
router.use(requireAuth());
router.use(authenticate);

router.post('/chat', chatWithBot);
router.get('/history', getChatHistory);
router.delete('/history', clearChatHistory);

export default router;