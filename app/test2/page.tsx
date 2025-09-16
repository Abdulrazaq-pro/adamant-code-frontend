"use client"

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';



// Demo data for simulation
const demoResponses = [
  "I'd be happy to help you with that! Let me think about the best approach for your project.",
  "That's a great question! Based on what you've shared, I recommend considering these options...",
  "I understand what you're looking for. Here's how we can solve this together:",
  "Perfect! Let me break this down into manageable steps for you.",
  "Interesting approach! I can definitely help you optimize that further."
];

// ChatMessage Component
const ChatMessage = ({ message, isLast }) => {
  const isAI = message.sender === 'ai';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`flex gap-3 ${isAI ? 'flex-row' : 'flex-row-reverse'} ${isLast ? 'mb-0' : 'mb-4'}`}
    >
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center shadow-md ${
        isAI 
          ? 'bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200' 
          : 'bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200'
      }`}>
        {isAI ? (
          <Bot className="w-4 h-4 text-blue-600" />
        ) : (
          <User className="w-4 h-4 text-gray-600" />
        )}
      </div>
      
      {/* Message Bubble */}
      <div className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm border ${
        isAI
          ? 'bg-white border-gray-200 text-gray-800'
          : 'bg-gradient-to-r from-blue-500 to-indigo-600 border-blue-300 text-white'
      }`}>
        <p className="text-sm leading-relaxed">{message.text}</p>
        {isAI && (
          <div className="flex items-center gap-1 mt-2 opacity-60">
            <Sparkles className="w-3 h-3" />
            <span className="text-xs">AI Assistant</span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// TypingIndicator Component
const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="flex gap-3 mb-4"
  >
    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 flex items-center justify-center shadow-md">
      <Bot className="w-4 h-4 text-blue-600" />
    </div>
    <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl shadow-sm">
      <div className="flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 rounded-full bg-blue-400"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
          />
        ))}
      </div>
    </div>
  </motion.div>
);

// MessageInput Component
const MessageInput = ({ onSend, isLoading }) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = () => {
    if (!input.trim() || isLoading) return;
    onSend(input.trim());
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  return (
    <div className="border-t border-gray-200 bg-gray-50 p-4">
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
            className="w-full resize-none border border-gray-300 rounded-2xl px-4 py-3 text-sm bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ minHeight: '44px', maxHeight: '120px' }}
          />
        </div>
        <motion.button
          type="button"
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md flex items-center justify-center transition-shadow"
        >
          <Send className="w-4 h-4" />
        </motion.button>
      </div>
    </div>
  );
};

// ChatHeader Component
const ChatHeader = ({ messageCount }) => (
  <div className="border-b border-gray-200 bg-white p-4">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 flex items-center justify-center shadow-sm">
          <Bot className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="font-semibold text-gray-900">AI Assistant</h2>
          <p className="text-sm text-gray-500">
            {messageCount > 1 ? `${messageCount} messages` : 'Ready to help'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-green-400 shadow-sm"></div>
        <span className="text-xs text-gray-500">Online</span>
      </div>
    </div>
  </div>
);

// MessagesContainer Component
const MessagesContainer = ({ messages, isLoading }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-50 to-indigo-100 border border-blue-200 flex items-center justify-center shadow-sm">
            <Sparkles className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Welcome to AI Assistant</h3>
          <p className="text-sm text-gray-500 leading-relaxed">
            I'm here to help with your questions, provide insights, and assist with various tasks. 
            What would you like to explore today?
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      <AnimatePresence mode="popLayout">
        {messages.map((message, index) => (
          <ChatMessage
            key={`${message.id || index}-${message.timestamp || Date.now()}`}
            message={message}
            isLast={index === messages.length - 1 && !isLoading}
          />
        ))}
        {isLoading && <TypingIndicator />}
      </AnimatePresence>
      <div ref={messagesEndRef} />
    </div>
  );
};

// Main AIChatInterface Component
const AIChatInterface = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: '👋 Hello! I\'m your AI assistant. How can I help you today?',
      timestamp: Date.now()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = (text) => {
    const userMessage = {
      id: Date.now(),
      sender: 'user',
      text,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage = {
        id: Date.now() + 1,
        sender: 'ai',
        text: demoResponses[Math.floor(Math.random() * demoResponses.length)],
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000 + Math.random() * 1500);
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      <ChatHeader messageCount={messages.length} />
      <div className="h-[500px] flex flex-col">
        <MessagesContainer messages={messages} isLoading={isLoading} />
        <MessageInput onSend={handleSend} isLoading={isLoading} />
      </div>
    </div>
  );
};

// Demo Integration Component - Shows how it integrates with your existing chat
const IntegratedChatDemo = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Chat Integration Demo</h1>
          <p className="text-gray-600">Light theme components ready for your existing chat system</p>
        </div>
        
        {/* Your existing chat would go here */}
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">Original Chat Interface</h2>
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
              <p className="text-gray-600 text-center py-8">Your existing chat components would render here</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-800">New AI Assistant</h2>
            <AIChatInterface />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Component Structure</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900">ChatHeader</h4>
              <p className="text-blue-700 mt-1">Avatar, title, status indicator</p>
            </div>
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <h4 className="font-medium text-green-900">MessagesContainer</h4>
              <p className="text-green-700 mt-1">Scrollable messages area</p>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
              <h4 className="font-medium text-purple-900">ChatMessage</h4>
              <p className="text-purple-700 mt-1">Individual message bubbles</p>
            </div>
            <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
              <h4 className="font-medium text-orange-900">TypingIndicator</h4>
              <p className="text-orange-700 mt-1">Animated typing dots</p>
            </div>
            <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
              <h4 className="font-medium text-pink-900">MessageInput</h4>
              <p className="text-pink-700 mt-1">Auto-resize textarea + send</p>
            </div>
            <div className="p-3 bg-indigo-50 rounded-lg border border-indigo-200">
              <h4 className="font-medium text-indigo-900">AIChatInterface</h4>
              <p className="text-indigo-700 mt-1">Main container component</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IntegratedChatDemo;