import express from 'express';
import { chatWithBot, getChatHistory, clearChatHistory } from '../controllers/geminiChatbotController.js';
import { authenticate } from '../utils/authorizationMiddleware.js';

const router = express.Router();

router.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Chatbot service is running' });
});

router.post('/chat', authenticate, chatWithBot);
router.get('/history', authenticate, getChatHistory);
router.delete('/history', authenticate, clearChatHistory);

export default router;