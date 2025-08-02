'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import Orb from './Orb';
import { makeGeminiRequest } from '@/utils/api';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIAssistantModal: React.FC<AIAssistantModalProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { type: 'bot', content: 'Hello! I\'m your AI assistant. How can I help you today?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      const response = await makeGeminiRequest(userMessage);
      
      // Extract the content from the response object
      let botResponse = '';
      if (typeof response === 'string') {
        botResponse = response;
      } else if (response && typeof response === 'object') {
        // Handle different possible response structures
        if (response.content) {
          botResponse = response.content;
        } else if (response.message) {
          botResponse = response.message;
        } else if (response.text) {
          botResponse = response.text;
        } else {
          // If we can't find the content, stringify the response for debugging
          botResponse = 'I received an unexpected response format. Please try again.';
          console.error('Unexpected response format:', response);
        }
      } else {
        botResponse = 'I encountered an unexpected response. Please try again.';
      }

      setMessages(prev => [...prev, { type: 'bot', content: botResponse }]);
      setIsTyping(false);
    } catch (error) {
      console.error('Error making Gemini request:', error);
      setMessages(prev => [...prev, { type: 'bot', content: 'I encountered an error. Please try again.' }]);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Modal Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-all duration-500"
          onClick={onClose}
        ></div>
        
        {/* Modal Container */}
        <div className={`relative w-full max-w-4xl h-[700px] transition-all duration-700 ease-out transform ${
          isOpen ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}>
          
          <div className="relative bg-black/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-800/50 h-full flex overflow-hidden">
            
           <Orb
    hoverIntensity={0.5}
    rotateOnHover={true}
    hue={0}
    forceHoverState={false}
  />

            {/* Right Side - Chat Interface */}
            <div className="w-1/2 flex flex-col bg-gradient-to-b from-gray-950/50 to-black/60">
              
              {/* Header */}
              <div className="p-6 border-b border-gray-800/50">
                <h3 className="text-xl font-semibold text-white">Conversation</h3>
                <p className="text-gray-400 text-sm mt-1">Chat with your AI assistant</p>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 chat-scroll">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm ${
                      message.type === 'user'
                        ? 'bg-purple-900/30 text-purple-100 border border-purple-800/30 rounded-br-md'
                        : 'bg-gray-900/50 text-gray-200 border border-gray-800/30 rounded-bl-md'
                    }`}>
                      {message.content}
                    </div>
                  </div>
                ))}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="flex justify-start animate-fade-in">
                    <div className="bg-gray-900/50 border border-gray-800/30 rounded-2xl rounded-bl-md px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-purple-400/60 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-blue-400/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-purple-400/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                        <span className="text-xs text-gray-400 ml-2">AI is thinking</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-gray-800/50">
                <div className="flex space-x-3">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      className="w-full bg-gray-900/50 border border-gray-700/50 rounded-2xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-600/50 focus:border-purple-600/50 transition-all backdrop-blur-sm"
                      disabled={isTyping}
                    />
                  </div>
                  <button
                    onClick={handleSubmit}
                    disabled={!input.trim() || isTyping}
                    className="w-12 h-12 bg-gradient-to-r from-purple-700/80 to-blue-700/80 hover:from-purple-600/80 hover:to-blue-600/80 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl flex items-center justify-center transition-all duration-200 hover:scale-105 border border-purple-600/30"
                  >
                    <Send className="w-5 h-5 text-white" />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Press Enter to send • AI Assistant
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes wave {
          0%, 100% { height: 8px; }
          50% { height: 32px; }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-wave {
          animation: wave 1.2s ease-in-out infinite;
        }

        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }

        .chat-scroll::-webkit-scrollbar {
          width: 4px;
        }
        
        .chat-scroll::-webkit-scrollbar-track {
          background: rgba(17, 24, 39, 0.3);
          border-radius: 4px;
        }
        
        .chat-scroll::-webkit-scrollbar-thumb {
          background: rgba(147, 51, 234, 0.4);
          border-radius: 4px;
        }
      `}</style>
    </>
  );
};

// Example usage component
export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-black flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-900/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-900/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative text-center z-10">
        <div className="mb-12">
          <div className="mb-6">
            <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-purple-800/30 to-blue-800/30 p-1 mb-4">
              <div className="w-full h-full rounded-full bg-black flex items-center justify-center border border-gray-800/50">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600/50 to-blue-600/50"></div>
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
            AI Assistant
          </h1>
          <p className="text-xl text-gray-400 mb-8">Advanced conversational AI interface</p>
        </div>
        
        <button
          onClick={() => setIsModalOpen(true)}
          className="group relative px-8 py-4 bg-gradient-to-r from-purple-800/60 to-blue-800/60 hover:from-purple-700/60 hover:to-blue-700/60 text-white font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-2xl border border-purple-700/30"
        >
          <span className="relative">Launch AI Assistant</span>
        </button>
      </div>

      <AIAssistantModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}