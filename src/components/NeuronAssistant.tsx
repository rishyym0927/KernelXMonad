import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X, Sparkles, Bot, User } from 'lucide-react';
import { makeGeminiRequest } from '@/utils/api';

export const NeuronAssistant = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { type: 'bot', content: 'Hello! I\'m your Neuron AI Assistant. How can I help you today?' }
  ]);
  const [isOpen, setIsOpen] = useState(false);
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

    const userMessage = input.trim() + " Keep the response within 2-3 lines.";
    setInput('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setIsTyping(true);

   try {
      const response = await makeGeminiRequest(userMessage);
      
      // Handle different response formats
      let botMessage = '';
      if (typeof response === 'string') {
        botMessage = response;
      } else if (response && typeof response === 'object') {
        // If response is an object with content property
        botMessage = response.content || response.message || JSON.stringify(response);
      } else {
        botMessage = 'Sorry, I received an unexpected response format.';
      }
      
      setMessages(prev => [...prev, { type: 'bot', content: botMessage }]);
      setIsTyping(false);
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setMessages(prev => [...prev, { type: 'bot', content: 'Sorry, I encountered an error. Please try again.' }]);
      setIsTyping(false);
    }
  };

const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    handleSubmit();
  }
};


  return (
    <>
      {/* Floating Action Button */}
      <div className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${isOpen ? 'scale-0' : 'scale-100'}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="group relative w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full animate-pulse opacity-75"></div>
          <MessageCircle className="w-7 h-7 text-white relative z-10" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </button>
      </div>

      {/* Chat Modal */}
      <div className={`fixed inset-0 z-40 transition-all duration-300 ${isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/20 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        ></div>
        
        {/* Chat Container */}
        <div className={`absolute bottom-6 right-6 w-96 h-[600px] transition-all duration-500 ease-out ${
          isOpen ? 'transform translate-y-0 scale-100 opacity-100' : 'transform translate-y-8 scale-95 opacity-0'
        }`}>
          <div className="bg-white/10 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600/90 to-blue-600/90 p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Neuron AI</h3>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-white/80 text-xs">Online</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-slate-900/50 to-slate-800/50">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] ${
                    message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.type === 'user' 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                        : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                    }`}>
                      {message.type === 'user' ? (
                        <User className="w-4 h-4 text-white" />
                      ) : (
                        <Bot className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div className={`rounded-2xl px-4 py-3 text-sm ${
                      message.type === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-br-md'
                        : 'bg-white/10 text-white rounded-bl-md border border-white/10'
                    }`}>
                      {message.content}
                    </div>
                  </div>
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start animate-fade-in">
                  <div className="flex items-start space-x-2 max-w-[80%]">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white/10 rounded-2xl rounded-bl-md px-4 py-3 border border-white/10">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-white/60 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/5 border-t border-white/10">
              <div className="flex space-x-2">
                <div className="flex-1 relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="w-full bg-white/10 border border-white/20 rounded-full px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                    disabled={isTyping}
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={!input.trim() || isTyping}
                  className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-full flex items-center justify-center transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                >
                  <Send className="w-5 h-5 text-white" />
                </button>
              </div>
              <p className="text-xs text-white/40 mt-2 text-center">
                Powered by Neuron AI • Press Enter to send
              </p>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
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
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </>
  );
};