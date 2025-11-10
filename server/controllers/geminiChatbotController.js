import { GoogleGenerativeAI } from '@google/generative-ai';
import { Pinecone } from '@pinecone-database/pinecone';
import User from '../models/User.js';
import ExpenseReport from '../models/ExpenseReport.js';
import ChatHistory from '../models/ChatHistory.js';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

// Initialize Pinecone
let pinecone, pineconeIndex;
try {
  pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
} catch (error) {
  console.error('Pinecone initialization error:', error);
}

// Memory storage for conversations
const conversationHistories = new Map();

const getUserContext = async (userId) => {
  try {
    const user = await User.findById(userId).select('-password');
    const expenseReports = await ExpenseReport.find({
      submitterId: userId
    }).populate('submitterId', 'name email role');

    return {
      user,
      expenseReports,
      totalRequests: expenseReports.length,
      pendingRequests: expenseReports.filter(r => r.status.includes('Pending')).length,
      completedRequests: expenseReports.filter(r => r.status === 'Completed').length,
      rejectedRequests: expenseReports.filter(r => r.status === 'Rejected').length,
    };
  } catch (error) {
    console.error('Error getting user context:', error);
    return null;
  }
};

const createSystemPrompt = (userContext) => {
  const { user, totalRequests, pendingRequests, completedRequests, rejectedRequests, expenseReports } = userContext;
  
  const recentActivity = expenseReports
    .slice(0, 5)
    .map(r => `${r.purposeOfExpense}: ${r.status} (₹${r.totalAmount})`)
    .join('\n');

  return `You are an AI assistant for the ExpenseClaim System at IIT Mandi. You help users with their expense reports and system navigation.

SYSTEM KNOWLEDGE:
- ExpenseClaim System manages expense reports for Travel, Meals, Accommodation, Office Supplies, and Miscellaneous expenses
- Workflow: Student/Faculty submits → Faculty/School Chair/Dean SRIC/Director → Audit → Finance → Completed
- Multiple items can be added to a single expense report
- Payment methods: University Credit Card (P-Card), Personal Funds (Reimbursement), Direct Invoice to University
- Statuses: Draft, Submitted, Faculty Approved, School Chair Approved, Dean SRIC Approved, Director Approved, Audit Approved, Finance Approved, Completed, Rejected
- Users can upload receipt images, edit drafts, manage profiles with photos
- Roles: Student (submit), Faculty (review + submit), School Chair, Dean SRIC, Director, Audit (review all), Finance (final approval), Admin (manage system)

CURRENT USER CONTEXT:
- Name: ${user.name}
- Role: ${user.role}
- Email: ${user.email}
- Total Requests: ${totalRequests}
- Pending: ${pendingRequests}
- Completed: ${completedRequests}
- Rejected: ${rejectedRequests}

RECENT ACTIVITY:
${recentActivity || 'No recent activity'}

Be helpful, conversational, and provide specific guidance based on the user's context and role. Keep responses concise but informative.`;
};

const getEmbedding = async (text) => {
  try {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Embedding error:', error);
    return null;
  }
};

const searchKnowledgeBase = async (query, userId) => {
  if (!pineconeIndex) return '';
  
  try {
    const queryEmbedding = await getEmbedding(query);
    if (!queryEmbedding) return '';
    
    // Search both system knowledge and user-specific context
    const [systemResults, userResults] = await Promise.all([
      pineconeIndex.query({
        vector: queryEmbedding,
        topK: 2,
        includeMetadata: true,
        filter: { type: { $in: ['system_info', 'workflow', 'statuses', 'features', 'roles'] } }
      }),
      pineconeIndex.query({
        vector: queryEmbedding,
        topK: 3,
        includeMetadata: true,
        filter: { userId: userId }
      })
    ]);
    
    const allMatches = [...systemResults.matches, ...userResults.matches];
    return allMatches
      .map(match => match.metadata?.content || '')
      .join('\n');
  } catch (error) {
    console.error('Knowledge base search error:', error);
    return '';
  }
};

const storeUserContext = async (userId, userContext) => {
  if (!pineconeIndex) return;
  
  try {
    const { user, expenseReports } = userContext;
    
    // Store user profile context
    const profileContent = `User ${user.name} (${user.role}) has ${expenseReports.length} total requests. Recent activity includes expense reports for various expenses.`;
    const profileEmbedding = await getEmbedding(profileContent);
    
    if (profileEmbedding) {
      await pineconeIndex.upsert([{
        id: `user_${userId}_profile`,
        values: profileEmbedding,
        metadata: {
          userId,
          type: 'user_profile',
          content: profileContent,
          userName: user.name,
          userRole: user.role
        }
      }]);
    }
    
    // Store recent expense report contexts
    for (const request of expenseReports.slice(0, 5)) {
      const requestContent = `${user.name} submitted an expense report for ${request.purposeOfExpense}: ₹${request.totalAmount}. Status: ${request.status}. Report Type: ${request.reportType}`;
      const requestEmbedding = await getEmbedding(requestContent);
      
      if (requestEmbedding) {
        await pineconeIndex.upsert([{
          id: `user_${userId}_request_${request._id}`,
          values: requestEmbedding,
          metadata: {
            userId,
            type: 'user_request',
            content: requestContent,
            requestId: request._id.toString(),
            status: request.status,
            amount: request.amount
          }
        }]);
      }
    }
  } catch (error) {
    console.error('Error storing user context:', error);
  }
};

export const chatWithBot = async (req, res) => {
  try {
    // Validate required environment variables
    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is not configured');
      return res.status(500).json({ message: 'Chatbot service is not properly configured' });
    }

    const { message } = req.body;
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: 'Message is required' });
    }

    const userId = req.user._id.toString();

    // Get user context
    const userContext = await getUserContext(userId);
    if (!userContext) {
      return res.status(500).json({ message: 'Failed to get user context' });
    }

    // Store/update user context in vector database
    await storeUserContext(userId, userContext);
    
    // Search knowledge base with user-specific context
    const relevantKnowledge = await searchKnowledgeBase(message, userId);

    // Get or create conversation history
    if (!conversationHistories.has(userId)) {
      conversationHistories.set(userId, []);
    }
    const history = conversationHistories.get(userId);

    let response;
    
    try {
      // Create chat session with history
      const chat = model.startChat({
        history: history,
        generationConfig: {
          maxOutputTokens: 500,
          temperature: 0.7,
        },
      });

      // Create system context message with knowledge base
      const systemPrompt = createSystemPrompt(userContext);
      const knowledgeContext = relevantKnowledge ? `\n\nRELEVANT KNOWLEDGE:\n${relevantKnowledge}` : '';
      const fullMessage = `${systemPrompt}${knowledgeContext}\n\nUser Question: ${message}`;

      // Generate response
      const result = await chat.sendMessage(fullMessage);
      response = result.response.text();
      
      if (!response) {
        throw new Error('Empty response from AI model');
      }
    } catch (aiError) {
      console.error('AI service error:', aiError);
      // Fallback response based on user context
      response = getFallbackResponse(message, userContext);
    }

    // Update conversation history
    history.push(
      { role: 'user', parts: [{ text: message }] },
      { role: 'model', parts: [{ text: response }] }
    );

    // Keep only last 10 exchanges to manage memory
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }

    // Save chat history to database
    await ChatHistory.create({
      userId,
      message,
      response,
      metadata: {
        userContext: {
          totalRequests: userContext.totalRequests,
          pendingRequests: userContext.pendingRequests,
          completedRequests: userContext.completedRequests,
        }
      }
    });

    res.json({
      response,
      context: {
        totalRequests: userContext.totalRequests,
        pendingRequests: userContext.pendingRequests,
      }
    });

  } catch (error) {
    console.error('Chatbot error:', error);
    
    // Provide more specific error messages
    if (error.message?.includes('API key')) {
      return res.status(500).json({ message: 'AI service configuration error' });
    }
    
    if (error.message?.includes('quota') || error.message?.includes('limit') || error.status === 429) {
      // Use fallback response instead of returning error
      const fallbackResponse = getFallbackResponse(req.body.message, userContext);
      
      // Still save to chat history
      await ChatHistory.create({
        userId: req.user._id.toString(),
        message: req.body.message,
        response: fallbackResponse,
        metadata: {
          userContext: {
            totalRequests: userContext.totalRequests,
            pendingRequests: userContext.pendingRequests,
            completedRequests: userContext.completedRequests,
          },
          fallbackUsed: true
        }
      });
      
      return res.json({
        response: fallbackResponse,
        context: {
          totalRequests: userContext.totalRequests,
          pendingRequests: userContext.pendingRequests,
        },
        fallbackMode: true
      });
    }
    
    res.status(500).json({ 
      message: 'Failed to process chat message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const { limit = 20 } = req.query;

    const history = await ChatHistory.find({ userId })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json(history.reverse());
  } catch (error) {
    console.error('Error getting chat history:', error);
    res.status(500).json({ message: 'Failed to get chat history' });
  }
};

export const clearChatHistory = async (req, res) => {
  try {
    const userId = req.user._id.toString();
    
    await ChatHistory.deleteMany({ userId });
    conversationHistories.delete(userId);
    
    // Clear user-specific vectors from Pinecone
    if (pineconeIndex) {
      try {
        await pineconeIndex.deleteMany({ userId });
      } catch (error) {
        console.error('Error clearing user vectors:', error);
      }
    }
    
    res.json({ message: 'Chat history and context cleared' });
  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({ message: 'Failed to clear chat history' });
  }
};

// Fallback response when AI service fails
const getFallbackResponse = (message, userContext) => {
  const { user, totalRequests, pendingRequests, completedRequests, rejectedRequests } = userContext;
  
  const lowerMessage = message.toLowerCase();
  
  // Status and requests related queries
  if (lowerMessage.includes('status') || lowerMessage.includes('request') || lowerMessage.includes('pending')) {
    return `Hi ${user.name}! Here's your current status:\n\n📊 **Your Requests Summary:**\n• Total Requests: ${totalRequests}\n• Pending: ${pendingRequests}\n• Completed: ${completedRequests}\n• Rejected: ${rejectedRequests}\n\nYou can view detailed status updates on your dashboard.`;
  }
  
  // Submission related queries
  if (lowerMessage.includes('submit') || lowerMessage.includes('create') || lowerMessage.includes('new')) {
    return `📝 **To submit a new expense request:**\n\n1. Go to the Submit page\n2. Fill out the expense form with details\n3. Upload receipt images\n4. Submit for review\n\n💡 **Tip:** You can save drafts and submit multiple expenses at once!`;
  }
  
  // Help and how-to queries
  if (lowerMessage.includes('help') || lowerMessage.includes('how') || lowerMessage.includes('guide')) {
    return `🤝 **I can help you with:**\n\n• Checking your request status\n• Submitting new expenses\n• Understanding the approval workflow\n• Managing your profile\n• Navigating the system\n\n**Workflow:** Student submits → Faculty reviews → Audit reviews → Finance approves → Completed`;
  }
  
  // Workflow related queries
  if (lowerMessage.includes('workflow') || lowerMessage.includes('process') || lowerMessage.includes('approval')) {
    return `📋 **Expense Approval Workflow:**\n\n1. **Student** submits expense request\n2. **Faculty** reviews and approves/rejects\n3. **Audit** reviews approved requests\n4. **Finance** gives final approval\n5. **Completed** - reimbursement processed\n\n${user.role === 'Faculty' ? '💼 As Faculty, you can submit directly to Audit.' : ''}`;
  }
  
  // Default response
  return `Hello ${user.name}! 👋\n\nI'm your ExpenseClaim assistant. While I'm running in simplified mode right now, I can still help you with:\n\n• **Status Check:** Ask about your requests\n• **Submission Help:** Learn how to submit expenses\n• **System Guide:** Understand the workflow\n\nWhat would you like to know about?`;
};

// Initialize knowledge base
export const initializeKnowledgeBase = async () => {
  if (!pinecone) {
    console.log('Pinecone not available, skipping knowledge base initialization');
    return;
  }

  try {
    // Check if index exists, create if not
    const indexList = await pinecone.listIndexes();
    const indexExists = indexList.indexes?.some(index => index.name === process.env.PINECONE_INDEX_NAME);
    
    if (!indexExists) {
      console.log('Creating Pinecone index...');
      await pinecone.createIndex({
        name: process.env.PINECONE_INDEX_NAME,
        dimension: 768,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      });
      
      console.log('Waiting for index to be ready...');
      await new Promise(resolve => setTimeout(resolve, 30000));
      
      pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);
    }
    const knowledgeBase = [
      {
        content: "ExpenseClaim System is an expense management system for IIT Mandi. Users can submit expense reports for Travel, Meals, Accommodation, Office Supplies, and Miscellaneous expenses.",
        metadata: { type: "system_info" }
      },
      {
        content: "The approval workflow: Student/Faculty submits → Faculty/School Chair/Dean SRIC/Director → Audit → Finance → Completed.",
        metadata: { type: "workflow" }
      },
      {
        content: "Request statuses: Pending - Faculty, Approved - Audit, Approved - Finance, Rejected, Completed, Sent Back - Faculty/Audit/Finance",
        metadata: { type: "statuses" }
      },
      {
        content: "Users can upload receipt images, edit sent-back requests, view request history, and manage their profiles with photos.",
        metadata: { type: "features" }
      },
      {
        content: "Roles: Student (submit requests), Faculty (review student requests + submit own), Audit (review all requests), Finance (final approval), Admin (manage users and system)",
        metadata: { type: "roles" }
      }
    ];

    for (const item of knowledgeBase) {
      const embedding = await getEmbedding(item.content);
      if (embedding) {
        await pineconeIndex.upsert([{
          id: `system_${item.metadata.type}_${Date.now()}`,
          values: embedding,
          metadata: { ...item.metadata, content: item.content }
        }]);
      }
    }

    console.log('Knowledge base initialized successfully');
  } catch (error) {
    console.error('Error initializing knowledge base:', error);
  }
};