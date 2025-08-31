import mongoose from 'mongoose';

const chatHistorySchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  message: { 
    type: String, 
    required: true 
  },
  response: { 
    type: String, 
    required: true 
  },
  metadata: {
    userContext: {
      totalRequests: Number,
      pendingRequests: Number,
      completedRequests: Number,
    }
  }
}, { timestamps: true });

chatHistorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.model('ChatHistory', chatHistorySchema);