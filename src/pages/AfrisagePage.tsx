import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Plus, Search, Settings, FileText, Trash2, Edit, MoreVertical, ThumbsUp, ThumbsDown, Copy, Share, RotateCcw, LogOut } from 'lucide-react';
import Header from '../components/layout/Header';

// Import AIService with error handling
let AIService: any;
try {
  AIService = require('../lib/aiService').AIService;
} catch (error) {
  console.error('Failed to load AIService:', error);
  // Fallback AIService
  AIService = {
    generateResponse: async (message: string) => ({
      content: "I'm sorry, I'm experiencing technical difficulties. Please try again later.",
      confidence: 0.0,
    })
  };
}

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'afrisage';
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  isActive: boolean;
  timestamp: Date;
}

const AfrisagePage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hello! I'm Forward Africa, your AI-powered business coach specializing in African markets. I'm here to help you navigate business opportunities, understand market dynamics, and provide insights on legal frameworks across Africa. How can I assist you today?",
      sender: 'afrisage',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversations] = useState<Conversation[]>([
    { id: '1', title: 'How to register business in Kenya?', isActive: true, timestamp: new Date() },
    { id: '2', title: 'Investment opportunities in East Africa', isActive: false, timestamp: new Date() },
    { id: '3', title: 'Fintech regulations in South Africa', isActive: false, timestamp: new Date() },
    { id: '4', title: 'Market expansion strategies', isActive: false, timestamp: new Date() },
    { id: '5', title: 'Legal framework requirements', isActive: false, timestamp: new Date() },
    { id: '6', title: 'Tax compliance in Nigeria', isActive: false, timestamp: new Date() },
    { id: '7', title: 'Partnership agreements', isActive: false, timestamp: new Date() },
    { id: '8', title: 'Funding sources in Africa', isActive: false, timestamp: new Date() },
    { id: '9', title: 'Cultural business practices', isActive: false, timestamp: new Date() },
    { id: '10', title: 'Digital payment systems', isActive: false, timestamp: new Date() }
  ]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    console.log('AfrisagePage mounted');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError(null);

    try {
      // Use real AI service
      const aiResponse = await AIService.generateResponse(inputMessage);

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse.content,
        sender: 'afrisage',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('AI Error:', error);
      setError('Failed to get AI response');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm experiencing technical difficulties. Please try again later.",
        sender: 'afrisage',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Show error if component fails to load
  if (error) {
    return (
      <div className="flex flex-col min-h-screen bg-brand-background/90">
        <Header />
        <main className="flex-grow pt-16">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-white mb-2">Error Loading AI Assistant</h2>
              <p className="text-gray-400 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-brand-background/90">
      {/* Fixed header */}
      <Header />

      {/* Main content area without footer */}
      <main className="flex-grow pt-16">
        <div className="flex h-[calc(100vh-4rem)] bg-gray-900">
          {/* Left Sidebar */}
          <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <h1 className="text-2xl font-bold text-white mb-4">FWD AFRICA AI</h1>
              <div className="flex space-x-2">
                <button className="flex-1 bg-[#ef4444] text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-[#dc2626] transition-colors">
                  <Plus className="w-4 h-4" />
                  <span>New chat</span>
                </button>
                <button className="p-2 bg-gray-700 border border-gray-600 rounded-lg hover:bg-gray-600 transition-colors">
                  <Search className="w-4 h-4 text-gray-300" />
                </button>
              </div>
            </div>

            {/* Conversations */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-gray-300">Your conversations</h2>
                <button className="text-sm text-gray-400 hover:text-gray-200">Clear All</button>
              </div>

              <div className="space-y-1">
                {conversations.slice(0, 6).map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                      conversation.isActive ? 'bg-red-500/10 border border-red-500/20' : 'hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300 truncate">{conversation.title}</span>
                      {conversation.isActive && <div className="w-2 h-2 bg-red-500 rounded-full"></div>}
                    </div>
                    {conversation.isActive && (
                      <div className="flex items-center space-x-1">
                        <button className="p-1 text-gray-400 hover:text-gray-200">
                          <Edit className="w-3 h-3" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-gray-200">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <div className="text-xs text-gray-500 mb-2">Last 7 Days</div>
                <div className="space-y-1">
                  {conversations.slice(6).map((conversation) => (
                    <div
                      key={conversation.id}
                      className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-300 truncate">{conversation.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 flex flex-col bg-gray-900 p-6">
            {/* Chat Container */}
            <div className="flex-1 bg-gray-800 rounded-2xl shadow-lg border border-gray-700 flex flex-col overflow-hidden">
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-red-500/10 to-red-600/10">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Forward Africa AI Assistant</h2>
                    <p className="text-sm text-gray-400">Your African business coach</p>
                  </div>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 shadow-sm ${
                        message.sender === 'user'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-700 text-gray-100 border border-gray-600'
                      }`}>
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                  ))}

                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-2xl px-4 py-3 bg-gray-700 border border-gray-600">
                        <div className="flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                          <span className="text-gray-400">Forward Africa is thinking...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-gray-700 bg-gray-800">
                <div className="max-w-4xl mx-auto">
                  <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      placeholder="Ask Forward Africa about African business opportunities..."
                      className="flex-1 px-4 py-3 border border-gray-600 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-gray-700 text-white placeholder-gray-400 shadow-sm"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={!inputMessage.trim() || isLoading}
                      className="p-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  </form>
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Free Research Preview. Forward Africa may produce inaccurate information about people, places, or facts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AfrisagePage;