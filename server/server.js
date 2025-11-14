import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import expenseReportRoutes from './routes/expenseReportRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import imageRoutes from './routes/imageRoutes.js';
import userRoutes from './routes/userRoutes.js';
import chatbotRoutes from './routes/chatbotRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import draftRoutes from './routes/draftRoutes.js';
import { errorHandler } from './utils/errorHandler.js';
import { initializeKnowledgeBase } from './controllers/geminiChatbotController.js';

dotenv.config();

const app = express();

// CORS configuration - allow multiple frontend URLs
const corsOrigins = [
  process.env.FRONTEND_URL,
  "http://43.204.216.162",
  'http://172.18.32.116:5173',
  'http://192.168.1.1:5173',
  "http://ec2-65-0-45-207.ap-south-1.compute.amazonaws.com",
  "http://172.31.5.53:80"
].filter(Boolean);

app.use(cors({
  origin: corsOrigins,
  credentials: true
}));
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
  .then(() => {
    console.log('MongoDB connected');
    // Initialize knowledge base
    initializeKnowledgeBase();
  })
  .catch(err => console.error('MongoDB connection error:', err.message || 'Unknown error'));

app.use('/api/auth', authRoutes);

app.use('/api/expense-reports', expenseReportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/drafts', draftRoutes);



app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));