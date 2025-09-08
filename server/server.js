import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import session from 'express-session';
import dotenv from 'dotenv';
import passport from './config/passport.js';
import authRoutes from './routes/authRoutes.js';
import reimbursementRoutes from './routes/reimbursementRoutes.js';

import expenseReportRoutes from './routes/expenseReportRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import userRoutes from './routes/userRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import { errorHandler } from './utils/errorHandler.js';
import { initializeKnowledgeBase } from './controllers/geminiChatbotController.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
    // Initialize knowledge base
    initializeKnowledgeBase();
  })
  .catch(err => console.error('MongoDB connection error:', err.message || 'Unknown error'));

app.use('/api/auth', authRoutes);
app.use('/api/reimbursements', reimbursementRoutes);

app.use('/api/expense-reports', expenseReportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chatbot', chatbotRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));