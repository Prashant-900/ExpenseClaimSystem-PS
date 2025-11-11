import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../features/authentication/authStore';
import API from '../services/axios';
import { HiOutlineChatBubbleLeftRight, HiOutlineXMark, HiOutlineTrash, HiOutlinePaperAirplane } from 'react-icons/hi2';

const ChatBot = () => {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      loadChatHistory();
    }
  }, [isOpen]);

  const loadChatHistory = async () => {
    try {
      const { data } = await API.get('/chatbot/history?limit=10');
      const formattedHistory = data.flatMap(chat => [
        { type: 'user', content: chat.message, timestamp: chat.createdAt },
        { type: 'bot', content: chat.response, timestamp: chat.createdAt }
      ]);
      setMessages(formattedHistory);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = { type: 'user', content: inputMessage, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data } = await API.post('/chatbot/chat', { message: inputMessage });
      const botMessage = { 
        type: 'bot', 
        content: data.response, 
        timestamp: new Date(),
        fallbackMode: data.fallbackMode 
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
      const errorMessage = { 
        type: 'bot', 
        content: 'Sorry, I encountered an error. Please try again.', 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearHistory = async () => {
    try {
      await API.delete('/chatbot/history');
      setMessages([]);
    } catch (error) {
      console.error('Failed to clear history:', error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 w-12 h-12 sm:w-14 sm:h-14 bg-gray-800 hover:bg-gray-900 text-white rounded-full shadow-lg flex items-center justify-center z-50 transition-colors"
      >
        {isOpen ? (
          <HiOutlineXMark className="w-5 h-5 sm:w-6 sm:h-6" />
        ) : (
          <HiOutlineChatBubbleLeftRight className="w-5 h-5 sm:w-6 sm:h-6" />
        )}
      </button>

      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:bottom-24 sm:right-6 w-80 sm:w-96 h-80 sm:h-96 bg-white rounded-md shadow-xl border border-gray-200 flex flex-col z-40">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-800 text-white rounded-t-md">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-700 rounded-full flex items-center justify-center">
                <HiOutlineChatBubbleLeftRight className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-medium">ExpenseClaim Assistant</h3>
                <p className="text-xs opacity-90">AI Helper</p>
              </div>
            </div>
            <button
              onClick={clearHistory}
              className="text-white hover:text-gray-200 transition-colors"
              title="Clear History"
            >
              <HiOutlineTrash className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                <p>Hi {user?.name}!</p>
                <p className="text-sm mt-2">I'm your ExpenseClaim assistant. Ask me anything!</p>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs sm:max-w-sm px-3 py-2 rounded-md text-xs sm:text-sm ${
                    message.type === 'user'
                      ? 'bg-gray-800 text-white'
                      : message.fallbackMode
                      ? 'bg-yellow-50 text-gray-800 border border-yellow-200'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.fallbackMode && (
                    <div className="text-xs text-yellow-600 mb-1 flex items-center gap-1">
                      <span>⚠️</span> Simplified mode
                    </div>
                  )}
                  <div className="whitespace-pre-line">{message.content}</div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-3 py-2 rounded-md text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring-1 focus:ring-gray-400"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <HiOutlinePaperAirplane className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;