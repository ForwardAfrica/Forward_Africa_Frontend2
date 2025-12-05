import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Users, MessageCircle, Bell, Search, Settings, BookOpen, Calendar, Folder, Star, Plus, MoreHorizontal, Phone, Video, Send, Mic, Menu, X, TrendingUp, Users2, Sparkles, Hash, Globe, Shield, Crown, AlertCircle, CheckCircle, Paperclip } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext'; // Adjust path as needed
import { authService } from '../lib/auth';

interface NetworkGroup {
  id: string;
  name: string;
  description: string;
  members: number;
  lastActive: string;
  unreadMessages?: number;
  joined?: boolean;
  image: string;
  onlineMembers?: number;
  category?: string;
  isVerified?: boolean;
  isPremium?: boolean;
  tags?: string[];
}

interface Message {
  id: string;
  content: string;
  sender: string;
  senderId: string;
  timestamp: string;
  avatar: string;
  isVerified?: boolean;
  status?: 'sending' | 'sent' | 'error';
}

interface ChatError {
  message: string;
  type: 'network' | 'validation' | 'permission' | 'general';
}

const initialNetworkGroups: NetworkGroup[] = [
  {
    id: 'sme-network',
    name: 'SME Network',
    description: 'Connect with fellow small and medium enterprise owners to share experiences and opportunities',
    members: 2547,
    onlineMembers: 156,
    lastActive: '2 min ago',
    unreadMessages: 12,
    image: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'Business',
    isVerified: true,
    isPremium: true,
    tags: ['Business', 'Networking', 'Verified']
  },
  {
    id: 'finance-network',
    name: 'Finance Professionals Network',
    description: 'Discussion group for finance professionals to share insights and best practices',
    members: 1893,
    onlineMembers: 89,
    lastActive: '5 min ago',
    unreadMessages: 8,
    image: 'https://images.pexels.com/photos/7567473/pexels-photo-7567473.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'Finance',
    isVerified: true,
    tags: ['Finance', 'Professional', 'Verified']
  },
  {
    id: 'managers-network',
    name: 'Managers Network',
    description: 'Leadership and management discussions for experienced managers',
    members: 2156,
    onlineMembers: 234,
    lastActive: 'Just now',
    unreadMessages: 15,
    image: 'https://images.pexels.com/photos/416405/pexels-photo-416405.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'Leadership',
    isPremium: true,
    tags: ['Leadership', 'Management', 'Premium']
  },
  {
    id: 'techies-network',
    name: 'Techies Network',
    description: 'Tech professionals sharing knowledge and discussing latest trends',
    members: 3102,
    onlineMembers: 445,
    lastActive: '1 min ago',
    unreadMessages: 23,
    image: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'Technology',
    isVerified: true,
    tags: ['Technology', 'Innovation', 'Verified']
  },
  {
    id: 'lawyers-network',
    name: 'Lawyers Network',
    description: 'Legal professionals discussing industry trends and sharing expertise',
    members: 1456,
    onlineMembers: 67,
    lastActive: '10 min ago',
    unreadMessages: 5,
    image: 'https://images.pexels.com/photos/5668858/pexels-photo-5668858.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'Legal',
    tags: ['Legal', 'Professional']
  },
  {
    id: 'marketers-network',
    name: 'Marketers Network',
    description: 'Marketing professionals sharing strategies and industry insights',
    members: 2789,
    onlineMembers: 178,
    lastActive: '3 min ago',
    unreadMessages: 17,
    image: 'https://images.pexels.com/photos/1447418/pexels-photo-1447418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'Marketing',
    isPremium: true,
    tags: ['Marketing', 'Strategy', 'Premium']
  },
  {
    id: 'job-hunting',
    name: 'Job Hunting Help Group',
    description: 'Support and resources for job seekers across all industries',
    members: 4231,
    onlineMembers: 567,
    lastActive: 'Just now',
    unreadMessages: 31,
    image: 'https://images.pexels.com/photos/3760067/pexels-photo-3760067.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    category: 'Career',
    isVerified: true,
    tags: ['Career', 'Job Search', 'Verified']
  },
];

// Sample initial messages for each group
const getInitialMessages = (groupId: string): Message[] => {
  const messages: Record<string, Message[]> = {
    'sme-network': [
  {
    id: '1',
        content: 'Welcome to the SME Network! Feel free to introduce yourself and share your business experiences.',
        sender: 'Community Bot',
        senderId: 'bot-1',
        timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg'
  },
  {
    id: '2',
        content: 'Has anyone tried the new business registration process in Kenya?',
        sender: 'Sarah Johnson',
        senderId: 'user-2',
        timestamp: new Date(Date.now() - 1800000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg',
        isVerified: true
  },
  {
    id: '3',
        content: 'Yes! It\'s much faster now with the eCitizen portal. Takes about 2-3 days instead of weeks.',
        sender: 'Mike Chen',
        senderId: 'user-3',
        timestamp: new Date(Date.now() - 900000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        avatar: 'https://images.pexels.com/photos/5439367/pexels-photo-5439367.jpeg'
      }
    ],
    'finance-network': [
      {
        id: '1',
        content: 'Welcome to the Finance Professionals Network! Let\'s discuss investment strategies and market trends.',
        sender: 'Community Bot',
        senderId: 'bot-1',
        timestamp: new Date(Date.now() - 3600000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    avatar: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg'
  }
    ]
  };

  return messages[groupId] || [];
};

// Add WebSocket connection state
interface ChatState {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError: string | null;
}

const CommunityPage: React.FC = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [groups, setGroups] = useState<NetworkGroup[]>(initialNetworkGroups);
  const [selectedGroup, setSelectedGroup] = useState<NetworkGroup | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'joined' | 'work' | 'personal' | 'saved'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [messageInput, setMessageInput] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Chat functionality state
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [chatError, setChatError] = useState<ChatError | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  // Add WebSocket state
  const [chatState, setChatState] = useState<ChatState>({
    isConnected: false,
    isConnecting: false,
    connectionError: null
  });

  // WebSocket connection
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // Current user (in real app, get from auth context)
  const currentUser = {
    id: 'user-1',
    name: 'John Doe',
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg',
    isVerified: true
  };

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Load joined groups from localStorage on initial render
  useEffect(() => {
    const joinedGroups = localStorage.getItem('joinedGroups');
    const joinedGroupIds = joinedGroups ? JSON.parse(joinedGroups) : [];

    setGroups(initialNetworkGroups.map(group => ({
      ...group,
      joined: joinedGroupIds.includes(group.id)
    })));
  }, []);

  // Load chat messages when group is selected
  useEffect(() => {
    if (selectedGroup) {
      loadChatMessages(selectedGroup.id);
    }
  }, [selectedGroup]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Initialize WebSocket connection
  useEffect(() => {
    if (selectedGroup) {
      connectToChat(selectedGroup.id);
    }

    return () => {
      if (wsConnection) {
        wsConnection.close();
      }
    };
  }, [selectedGroup]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSidebarOpen(false);
        setChatOpen(false);
      }
      if (e.key === 'Enter' && e.ctrlKey) {
        messageInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const loadChatMessages = useCallback((groupId: string) => {
    try {
      // Load initial messages for the group
      const initialMessages = getInitialMessages(groupId);
      setChatMessages(initialMessages);
      localStorage.setItem(`chat-${groupId}`, JSON.stringify(initialMessages));
      setChatError(null);
    } catch (error) {
      console.error('Failed to load chat messages:', error);
      setChatError({
        message: 'Failed to load chat messages',
        type: 'network'
      });
    }
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const handleJoinGroup = async (groupId: string) => {
    setIsLoading(true);
    setChatError(null);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));

    const joinedGroups = localStorage.getItem('joinedGroups');
    const joinedGroupIds = joinedGroups ? JSON.parse(joinedGroups) : [];

    if (joinedGroupIds.includes(groupId)) {
      // Leave group
      const updatedJoinedGroups = joinedGroupIds.filter((id: string) => id !== groupId);
      localStorage.setItem('joinedGroups', JSON.stringify(updatedJoinedGroups));
    } else {
      // Join group
      joinedGroupIds.push(groupId);
      localStorage.setItem('joinedGroups', JSON.stringify(joinedGroupIds));
    }

    setGroups(prevGroups =>
      prevGroups.map(group =>
        group.id === groupId ? { ...group, joined: !group.joined } : group
      )
    );
    } catch (error) {
      console.error('Failed to join/leave group:', error);
      setChatError({
        message: 'Failed to join/leave group',
        type: 'network'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getWebSocketUrl = (groupId: string) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const baseUrl = isDevelopment ? 'ws://localhost:3001' : 'wss://your-domain.com';
    const token = authService.getToken();
    return `${baseUrl}/group/${groupId}?token=${token}`;
  };

  const connectToChat = (groupId: string) => {
    const token = authService.getToken();
    if (!token) {
      setChatState(prev => ({
        ...prev,
        connectionError: 'Please log in to chat'
      }));
      return;
    }

    setChatState(prev => ({ ...prev, isConnecting: true, connectionError: null }));

    try {
      const wsUrl = getWebSocketUrl(groupId);
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('Connected to chat server');
        setChatState(prev => ({
          ...prev,
          isConnected: true,
          isConnecting: false
        }));
        setWsConnection(ws);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        handleIncomingMessage(data);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setChatState(prev => ({
          ...prev,
          isConnecting: false,
          connectionError: 'Failed to connect to chat server. Please check your connection.'
        }));
      };

      ws.onclose = () => {
        console.log('Disconnected from chat server');
        setChatState(prev => ({
          ...prev,
          isConnected: false,
          isConnecting: false
        }));
        setWsConnection(null);
      };

    } catch (error) {
      console.error('Failed to connect to chat:', error);
      setChatState(prev => ({
        ...prev,
        isConnecting: false,
        connectionError: 'Failed to connect to chat server'
      }));
    }
  };

  const handleIncomingMessage = (data: any) => {
    if (data.type === 'recent_messages') {
      // ✅ Messages from database
      setChatMessages(data.messages);
    } else if (data.type === 'message') {
      // ✅ New message saved to database
      const newMessage: Message = {
        id: data.messageId,
        content: data.content,
        sender: data.sender.full_name,
        senderId: data.sender.id,
        timestamp: new Date(data.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        }),
        avatar: data.sender.avatar,
        isVerified: data.sender.isVerified,
        status: 'sent'
      };

      setChatMessages(prev => [...prev, newMessage]);
    }
  };

  const sendMessageToServer = async (message: Message): Promise<boolean> => {
    if (!wsConnection || wsConnection.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket connection not available');
    }

    // ✅ Correct format that will save to database
    const messageData = {
      content: message.content,
      messageType: 'text' // or get from message
    };

    wsConnection.send(JSON.stringify(messageData));
    return true;
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedGroup || isSendingMessage) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      content: messageInput.trim(),
      sender: currentUser.name,
      senderId: currentUser.id,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      avatar: currentUser.avatar,
      isVerified: currentUser.isVerified,
      status: 'sending'
    };

    setIsSendingMessage(true);
    setChatError(null);

    try {
      // Add message to chat immediately (optimistic update)
      setChatMessages(prev => [...prev, newMessage]);
      setMessageInput('');

      // ✅ Send to server (will save to database)
      if (wsConnection && wsConnection.readyState === WebSocket.OPEN) {
        wsConnection.send(JSON.stringify({
          content: newMessage.content,
          messageType: 'text'
        }));
      }

      // Update message status to sent
      setChatMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'sent' } : msg
        )
      );

    } catch (error) {
      console.error('Failed to send message:', error);
      setChatMessages(prev =>
        prev.map(msg =>
          msg.id === newMessage.id ? { ...msg, status: 'error' } : msg
        )
      );
      setChatError({
        message: 'Failed to send message. Please check your connection.',
        type: 'network'
      });
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageInput(e.target.value);

    // Simulate typing indicator
    if (!isTyping) {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    }
  };

  const handleImageError = (groupId: string) => {
    setImageErrors(prev => ({ ...prev, [groupId]: true }));
  };

  const retryMessage = (messageId: string) => {
    const message = chatMessages.find(msg => msg.id === messageId);
    if (message) {
      setMessageInput(message.content);
      messageInputRef.current?.focus();

      // Remove the failed message
      setChatMessages(prev => prev.filter(msg => msg.id !== messageId));
    }
  };

  const filteredGroups = groups.filter(group => {
    const matchesSearch = group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         group.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    if (activeTab === 'joined') return group.joined && matchesSearch;
    if (activeTab === 'work') return group.category === 'Business' && matchesSearch;
    if (activeTab === 'personal') return group.category === 'Career' && matchesSearch;

    return matchesSearch;
  });

  const handleGroupSelect = (group: NetworkGroup) => {
    setSelectedGroup(group);
    setChatError(null);

    // On mobile, open the chat panel
    if (window.innerWidth < 1024) {
      setChatOpen(true);
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case 'all': return <Globe className="h-5 w-5" />;
      case 'joined': return <Users2 className="h-5 w-5" />;
      case 'work': return <BookOpen className="h-5 w-5" />;
      case 'personal': return <Users className="h-5 w-5" />;
      case 'saved': return <Star className="h-5 w-5" />;
      default: return <MessageCircle className="h-5 w-5" />;
    }
  };

  const getTabLabel = (tab: string) => {
    switch (tab) {
      case 'all': return 'All Communities';
      case 'joined': return 'My Communities';
      case 'work': return 'Work';
      case 'personal': return 'Personal';
      case 'saved': return 'Saved';
      default: return 'All';
    }
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sending':
        return <div className="w-3 h-3 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />;
      case 'sent':
        return <CheckCircle className="h-3 w-3 text-green-400" />;
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-400" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-brand-background-gradient">
      {/* Mobile Header - Highest z-index to stay on top */}
      <div className="lg:hidden bg-gray-800/95 backdrop-blur-sm border-b border-gray-700/50 p-4 sticky top-0 z-[9999]">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 hover:scale-105"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-red-400" />
            <h1 className="text-xl font-bold text-white">Communities</h1>
          </div>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            className="text-white p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 hover:scale-105"
            aria-label="Toggle chat"
          >
            <MessageCircle className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="flex h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)]">
        {/* Left Sidebar - Navigation - Fixed positioning to account for mobile header */}
        <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static top-[8rem] lg:top-0 left-0 bottom-0 z-[60] w-64 bg-gray-800/95 backdrop-blur-sm border-r border-gray-700/50 flex flex-col transition-all duration-300 ease-in-out lg:transition-none shadow-2xl`}>
          {/* Close button for mobile */}
          <div className="lg:hidden flex justify-end p-4">
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-white p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 hover:scale-105"
              aria-label="Close sidebar"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-gray-700/50">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">JD</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">John Doe</p>
                <div className="text-sm text-green-400 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-2 inline-block animate-pulse" />
                  <span>Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-700/50">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 group-focus-within:text-red-400 transition-colors duration-200" />
              <input
                type="text"
                placeholder="Search communities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-white placeholder-gray-400 transition-all duration-200 backdrop-blur-sm"
                aria-label="Search communities"
              />
            </div>
          </div>

          {/* Navigation */}
          <div className="flex-1 p-4 overflow-y-auto">
            <nav className="space-y-2">
              {(['all', 'joined', 'work', 'personal', 'saved'] as const).map((tab) => (
              <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                    activeTab === tab
                      ? 'bg-[#ef4444] text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700/50 hover:text-white'
                  }`}
                  aria-label={`Show ${getTabLabel(tab).toLowerCase()}`}
                >
                  <div className={`transition-all duration-200 ${activeTab === tab ? 'scale-110' : 'group-hover:scale-105'}`}>
                    {getTabIcon(tab)}
                  </div>
                  <span className="font-medium">{getTabLabel(tab)}</span>
              </button>
              ))}
            </nav>
          </div>

          {/* Settings */}
          <div className="p-4 border-t border-gray-700/50">
            <button
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:bg-gray-700/50 hover:text-white transition-all duration-200 group"
              aria-label="Open settings"
            >
              <Settings className="h-5 w-5 group-hover:rotate-90 transition-transform duration-200" />
              <span className="font-medium">Settings</span>
            </button>
          </div>
        </div>

        {/* Center Column - Groups List */}
        <div className="flex-1 flex flex-col bg-transparent">
          {/* Header */}
          <div className="bg-gray-800/95 backdrop-blur-sm border-b border-gray-700/50 p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3 mb-2">
                  <Sparkles className="h-6 w-6 text-red-400" />
                  <h1 className="text-2xl font-bold text-white">Communities</h1>
                </div>
                <p className="text-gray-400">{filteredGroups.length} communities available</p>
              </div>
              <button
                className="bg-[#ef4444] text-white px-6 py-3 rounded-xl hover:bg-[#dc2626] transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                aria-label="Create new community"
              >
                <Plus className="h-5 w-5" />
                <span className="hidden sm:inline font-medium">Create Community</span>
              </button>
            </div>
          </div>

          {/* Groups Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {filteredGroups.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-24 h-24 bg-gray-700/50 rounded-full flex items-center justify-center mb-6">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No communities found</h3>
                <p className="text-gray-400 max-w-md">Try adjusting your search terms or browse all communities</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredGroups.map((group) => (
                <div
                  key={group.id}
                    className="group bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 hover:bg-gray-700/50 hover:border-gray-600/50 transition-all duration-300 cursor-pointer transform hover:scale-105 hover:shadow-xl hover:shadow-black/20"
                  onClick={() => handleGroupSelect(group)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleGroupSelect(group);
                    }
                  }}
                  aria-label={`Select ${group.name} community`}
                >
                    <div className="flex items-start space-x-4">
                      <div className="relative">
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-700 shadow-lg">
                          {!imageErrors[group.id] ? (
                      <Image
                        src={group.image}
                        alt={group.name}
                        fill
                              className="object-cover transition-transform duration-300 group-hover:scale-110"
                              sizes="64px"
                              onError={() => handleImageError(group.id)}
                            />
                          ) : (
                            <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                              <Users className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        {group.isVerified && (
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                            <Shield className="h-3 w-3 text-white" />
                          </div>
                        )}
                        {group.isPremium && (
                          <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center shadow-lg">
                            <Crown className="h-3 w-3 text-white" />
                          </div>
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-bold text-white text-lg truncate">{group.name}</h3>
                          {group.isVerified && (
                            <Shield className="h-4 w-4 text-blue-400" />
                          )}
                          {group.isPremium && (
                            <Crown className="h-4 w-4 text-yellow-400" />
                          )}
                        </div>
                        <p className="text-gray-300 text-sm line-clamp-2 mb-3">{group.description}</p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1 mb-3">
                          {group.tags?.slice(0, 2).map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <div className="flex items-center space-x-4">
                            <span className="flex items-center space-x-1">
                              <Users2 className="h-3 w-3" />
                              <span>{group.members.toLocaleString()}</span>
                            </span>
                            <span className="flex items-center space-x-1 text-green-400">
                              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                              <span>{group.onlineMembers}</span>
                            </span>
                          </div>
                          <span>{group.lastActive}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700/50">
                      {group.unreadMessages && group.unreadMessages > 0 && (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-red-400">{group.unreadMessages} new</span>
                  </div>
                      )}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinGroup(group.id);
                      }}
                        disabled={isLoading}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-105 ${
                        group.joined
                            ? 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50'
                            : 'bg-[#ef4444] text-white hover:bg-[#dc2626] shadow-lg'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      aria-label={group.joined ? `Leave ${group.name}` : `Join ${group.name}`}
                    >
                        {isLoading ? '...' : (group.joined ? 'Joined' : 'Join')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>

        {/* Right Column - Chat/Details - Fixed positioning that doesn't move with scroll */}
        <div className={`${chatOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 fixed lg:static top-[8rem] lg:top-0 right-0 bottom-0 z-[60] w-80 bg-gray-800/95 backdrop-blur-sm border-l border-gray-700/50 flex flex-col transition-all duration-300 ease-in-out lg:transition-none shadow-2xl`}>
          {/* Close button for mobile */}
          <div className="lg:hidden flex justify-end p-4">
            <button
              onClick={() => setChatOpen(false)}
              className="text-white p-2 hover:bg-gray-700/50 rounded-lg transition-all duration-200 hover:scale-105"
              aria-label="Close chat"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {selectedGroup ? (
            <>
              {/* Group Header - Fixed at top */}
              <div className="p-6 border-b border-gray-700/50 flex-shrink-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-700 shadow-lg">
                      {!imageErrors[selectedGroup.id] ? (
                    <Image
                      src={selectedGroup.image}
                      alt={selectedGroup.name}
                      fill
                      className="object-cover"
                          sizes="48px"
                          onError={() => handleImageError(selectedGroup.id)}
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                          <Users className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    {selectedGroup.isVerified && (
                      <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Shield className="h-2.5 w-2.5 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-bold text-white text-lg">{selectedGroup.name}</h2>
                    <p className="text-sm text-gray-400">
                      {selectedGroup.members.toLocaleString()} members,
                      <span className="text-green-400 ml-1">{selectedGroup.onlineMembers} online</span>
                    </p>
                  </div>
                  <div className="flex items-center space-x-1">
                    <button className="p-2 text-gray-400 hover:text-gray-300 rounded-lg hover:bg-gray-700/50 transition-all duration-200" aria-label="Search in chat">
                      <Search className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-300 rounded-lg hover:bg-gray-700/50 transition-all duration-200" aria-label="Voice call">
                      <Phone className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-300 rounded-lg hover:bg-gray-700/50 transition-all duration-200" aria-label="Video call">
                      <Video className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-gray-300 rounded-lg hover:bg-gray-700/50 transition-all duration-200" aria-label="More options">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Error Display */}
              {chatError && (
                <div className="p-4 bg-red-500/10 border-l-4 border-red-500">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <p className="text-sm text-red-400">{chatError.message}</p>
                  </div>
                </div>
              )}

              {/* Connection Error - Fixed below header */}
              {chatState.connectionError && (
                <div className="p-4 bg-red-500/10 border-l-4 border-red-500 flex-shrink-0">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <p className="text-sm text-red-400">{chatState.connectionError}</p>
                    <button
                      onClick={() => connectToChat(selectedGroup.id)}
                      className="text-xs text-red-400 hover:text-red-300 underline"
                    >
                      Retry
                    </button>
                  </div>
                </div>
              )}

              {/* Chat Messages - Scrollable area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0">
                <div className="text-center">
                  <span className="text-xs text-gray-500 bg-gray-700/50 px-3 py-1 rounded-full">Today</span>
                </div>

                {chatMessages.map((message) => (
                  <div key={message.id} className={`flex space-x-3 group ${message.senderId === currentUser.id ? 'justify-end' : ''}`}>
                    {message.senderId !== currentUser.id && (
                      <div className="relative">
                        <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-700 shadow-lg">
                      <Image
                        src={message.avatar}
                        alt={message.sender}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                        {message.isVerified && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <Shield className="h-2 w-2 text-white" />
                          </div>
                        )}
                      </div>
                    )}

                    <div className={`flex-1 max-w-[70%] ${message.senderId === currentUser.id ? 'order-first' : ''}`}>
                      <div className={`rounded-2xl p-4 shadow-lg ${
                        message.senderId === currentUser.id
                          ? 'bg-[#ef4444] text-white'
                          : 'bg-gray-700/50 backdrop-blur-sm'
                      }`}>
                        {message.senderId !== currentUser.id && (
                          <div className="flex items-center space-x-2 mb-2">
                            <p className="text-sm font-medium text-white">{message.sender}</p>
                            {message.isVerified && (
                              <Shield className="h-3 w-3 text-blue-400" />
                            )}
                          </div>
                        )}
                        <p className={`text-sm ${message.senderId === currentUser.id ? 'text-white' : 'text-gray-100'}`}>
                          {message.content}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-500">{message.timestamp}</p>
                        {message.senderId === currentUser.id && message.status && (
                          <div className="flex items-center space-x-1">
                            {getMessageStatusIcon(message.status)}
                            {message.status === 'error' && (
                              <button
                                onClick={() => retryMessage(message.id)}
                                className="text-xs text-red-400 hover:text-red-300 underline"
                              >
                                Retry
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <div className="flex space-x-3">
                    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-700 shadow-lg">
                      <Image
                        src="https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg"
                        alt="Typing"
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div className="flex-1 max-w-[70%]">
                      <div className="rounded-2xl p-4 bg-gray-700/50 backdrop-blur-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Auto-scroll to bottom */}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input - Fixed at bottom */}
              <div className="p-6 border-t border-gray-700/50 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
                  <button
                    type="button"
                    className="p-2 text-gray-400 hover:text-gray-300 rounded-lg hover:bg-gray-700/50 transition-all duration-200"
                    aria-label="Add attachment"
                  >
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <div className="flex-1 relative">
                  <input
                      ref={messageInputRef}
                    type="text"
                    placeholder="Type a message..."
                    value={messageInput}
                      onChange={handleTyping}
                      disabled={isSendingMessage}
                      className="w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border border-gray-600/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 text-white placeholder-gray-400 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Message input"
                  />
                  </div>
                  <button
                    type="submit"
                    disabled={!messageInput.trim() || isSendingMessage}
                    className="p-3 bg-[#ef4444] text-white rounded-xl hover:bg-[#dc2626] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                    aria-label="Send message"
                  >
                    {isSendingMessage ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                    <Send className="h-4 w-4" />
                    )}
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-700/50 rounded-full flex items-center justify-center mb-6">
                  <MessageCircle className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">Select a Community</h3>
                <p className="text-gray-400 max-w-sm">Choose a community from the list to start chatting and networking with fellow professionals</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile overlay */}
      {(sidebarOpen || chatOpen) && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => {
            setSidebarOpen(false);
            setChatOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default CommunityPage;
