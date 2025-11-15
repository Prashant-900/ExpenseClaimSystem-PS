import express from 'express';
import { chatWithBot, getChatHistory, clearChatHistory } from '../controllers/geminiChatbotController.js';
import { authenticate } from '../utils/authorizationMiddleware.js';

const router = express.Router();

// Apply JWT authentication to all routes
router.use(authenticate);

router.post('/chat', chatWithBot);
router.get('/history', getChatHistory);
router.delete('/history', clearChatHistory);

export default router;