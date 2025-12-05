import React, { useState, useEffect, useRef } from 'react';
import { useParams } from '../lib/router';
import { Send, Smile, Paperclip, Image as ImageIcon, FileText, Link as LinkIcon, Mic, MoreHorizontal, Search, Phone, Video, Users, Settings, LogOut, ArrowLeft, Plus, X, Check, AlertTriangle, Info, ExternalLink, Download, Share2, Heart, MessageCircle, Eye, EyeOff, Lock, Unlock, Shield, Crown, Medal, Trophy, Badge, Flag, Rocket, Star } from 'lucide-react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import Button from '../components/ui/Button';
import Image from 'next/image';

interface Message {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: Date;
  groupId: string;
  attachments?: {
    type: 'image' | 'video' | 'document' | 'link';
    url: string;
    name?: string;
    thumbnail?: string;
  }[];
}

const ChatPage: React.FC = () => {
  const { groupId } = useParams<{ groupId: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const documentInputRef = useRef<HTMLInputElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Mock user data
  const currentUser = {
    id: 'user-1',
    name: 'John Doe',
    avatar: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg'
  };

  // Load messages from localStorage on component mount
  useEffect(() => {
    if (groupId) {
      const storedMessages = localStorage.getItem(`chat_messages_${groupId}`);
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsedMessages);
      }
    }
  }, [groupId]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (groupId && messages.length > 0) {
      localStorage.setItem(`chat_messages_${groupId}`, JSON.stringify(messages));
    }
  }, [messages, groupId]);

  useEffect(() => {
    // Scroll to bottom when messages change
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const urlRegex = /(https?:\/\/[^\s]+)/g;

  const processMessageContent = (content: string) => {
    const parts = content.split(urlRegex);
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <a
            key={index}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline break-all"
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !groupId) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: newMessage,
      timestamp: new Date(),
      groupId
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    setShowEmojiPicker(false);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleEmojiSelect = (emoji: any) => {
    setNewMessage(prev => prev + emoji.native);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'document') => {
    const file = event.target.files?.[0];
    if (!file || !groupId) return;

    const message: Message = {
      id: `msg-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: '',
      timestamp: new Date(),
      groupId,
      attachments: [{
        type: type,
        url: URL.createObjectURL(file),
        name: file.name
      }]
    };

    setMessages(prev => [...prev, message]);
    setShowAttachmentMenu(false);

    // Clear the input value
    event.target.value = '';
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);

    // Auto-resize textarea
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleShareLink = () => {
    const url = prompt('Enter the URL to share:');
    if (!url || !groupId) return;

    try {
      // Validate URL
      const validUrl = new URL(url);

      const message: Message = {
        id: `msg-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        content: '',
        timestamp: new Date(),
        groupId,
        attachments: [{
          type: 'link',
          url: validUrl.href,
          name: validUrl.href
        }]
      };

      setMessages(prev => [...prev, message]);
      setShowAttachmentMenu(false);
    } catch (error) {
      alert('Please enter a valid URL (e.g., https://example.com)');
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] bg-brand-background-gradient">
      {/* Chat Header */}
      <div className="bg-gray-800 px-4 py-3 flex items-center border-b border-gray-700">
        <div className="flex-1">
          <h2 className="text-white font-semibold text-lg">Group Chat Name</h2>
          <p className="text-gray-400 text-sm">42 members, 12 online</p>
        </div>
      </div>

      {/* Messages Container */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages
          .filter(msg => msg.groupId === groupId)
          .map(message => (
            <div
              key={message.id}
              className={`flex ${message.userId === currentUser.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex ${message.userId === currentUser.id ? 'flex-row-reverse' : 'flex-row'} items-end max-w-[80%]`}>
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-gray-700 mx-2 flex-shrink-0">
                  <Image
                    src={message.userAvatar}
                    alt={message.userName}
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </div>
                <div className={`flex flex-col ${message.userId === currentUser.id ? 'items-end' : 'items-start'}`}>
                  <div className={`rounded-lg px-4 py-2 max-w-full break-words ${
                    message.userId === currentUser.id ? 'bg-red-600 text-white' : 'bg-gray-700 text-white'
                  }`}>
                    {message.content && (
                      <p className="whitespace-pre-wrap">
                        {processMessageContent(message.content)}
                      </p>
                    )}
                    {message.attachments?.map((attachment, index) => (
                      <div key={index} className="mt-2">
                        {attachment.type === 'image' && (
                          <div className="relative w-64 h-40 rounded-lg overflow-hidden bg-gray-600">
                            <Image
                              src={attachment.url}
                              alt="attachment"
                              fill
                              className="object-cover"
                              sizes="256px"
                            />
                          </div>
                        )}
                        {(attachment.type === 'document' || attachment.type === 'link') && (
                          <a
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-400 hover:text-blue-300"
                          >
                            <FileText className="h-4 w-4 mr-2 flex-shrink-0" />
                            <span className="break-all">{attachment.name}</span>
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                  <span className="text-gray-500 text-xs mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-gray-800 p-4 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
          <div className="relative flex-1">
            <div className="min-h-[2.5rem] bg-gray-700 rounded-lg">
              <textarea
                ref={textareaRef}
                value={newMessage}
                onChange={handleTextareaChange}
                placeholder="Type a message..."
                className="w-full bg-transparent text-white placeholder-gray-400 px-4 py-2 resize-none outline-none max-h-32 overflow-y-auto"
                rows={1}
                style={{ minHeight: '40px' }}
                aria-label="Message input"
              />
            </div>

            {/* Emoji Picker */}
            {showEmojiPicker && (
              <div className="absolute bottom-full mb-2">
                <Picker
                  data={data}
                  onEmojiSelect={handleEmojiSelect}
                  theme="dark"
                />
              </div>
            )}

            {/* Attachment Menu */}
            {showAttachmentMenu && (
              <div className="absolute bottom-full mb-2 bg-gray-700 rounded-lg shadow-lg">
                <div className="p-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2 text-white hover:bg-gray-600 px-4 py-2 rounded w-full"
                    aria-label="Upload image"
                  >
                    <ImageIcon className="h-5 w-5 flex-shrink-0" />
                    <span>Image</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleShareLink}
                    className="flex items-center space-x-2 text-white hover:bg-gray-600 px-4 py-2 rounded w-full"
                    aria-label="Share link"
                  >
                    <LinkIcon className="h-5 w-5 flex-shrink-0" />
                    <span>Link</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => documentInputRef.current?.click()}
                    className="flex items-center space-x-2 text-white hover:bg-gray-600 px-4 py-2 rounded w-full"
                    aria-label="Upload document"
                  >
                    <FileText className="h-5 w-5 flex-shrink-0" />
                    <span>Document</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700"
              aria-label="Toggle emoji picker"
            >
              <Smile className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              className="text-gray-400 hover:text-white p-2 rounded-full hover:bg-gray-700"
              aria-label="Toggle attachment menu"
            >
              <Paperclip className="h-6 w-6" />
            </button>
            <button
              type="submit"
              className="bg-red-600 text-white rounded-lg px-4 py-2 hover:bg-red-700 flex items-center justify-center"
              aria-label="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>

          {/* Hidden File Inputs */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => handleFileUpload(e, 'image')}
            className="hidden"
            accept="image/*"
          />
          <input
            type="file"
            ref={documentInputRef}
            onChange={(e) => handleFileUpload(e, 'document')}
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.rtf"
          />
        </form>
      </div>
    </div>
  );
};

export default ChatPage;