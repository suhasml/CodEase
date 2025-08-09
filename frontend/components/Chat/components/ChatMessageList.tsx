import React, { useRef, useEffect } from 'react';
import { Command } from 'lucide-react';
import { motion } from 'framer-motion';
import UserMessage from './UserMessage';
import AiMessage from './AiMessage';
import { ChatMessage } from './ChatPanel';

// Suggestion prompts
const suggestions = [
  "Build an ai summarizer extension that summarises the page content",
  "Create a Chrome extension that schedules twitter posts",
  "Create to-do lists from browser tabs",
  "Convert code snippets to markdown",
];

interface ChatMessageListProps {
  messages: ChatMessage[];
  hasFiles: boolean;
  isLoading: boolean;
  onRetry: (messageId: string) => void;
  onDownload: () => void;
  onTest: () => void;
  sessionId?: string;
  testEnvironmentActive: boolean;
  testEnvironmentTimeLeft: string;
  canAccessTestFeature?: boolean;
  isDownloadComplete?: boolean;
}

const ChatMessageList: React.FC<ChatMessageListProps> = ({
  messages,
  hasFiles,
  isLoading,
  onRetry,
  onDownload,
  onTest,
  sessionId,
  testEnvironmentActive,
  testEnvironmentTimeLeft,
  canAccessTestFeature = false,
  isDownloadComplete = false,
}) => {
  // Ref for auto-scrolling to the bottom
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    // Create a custom event that the parent can listen for
    const event = new CustomEvent('suggestionClick', { 
      detail: { suggestion } 
    });
    document.dispatchEvent(event);
  };

  // Auto-scroll when messages change or when a message updates (especially AI responses)
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Force scroll to bottom when AI is thinking or when a response completes
  useEffect(() => {
    const aiMessages = messages.filter(m => m.sender === 'AI');
    const latestAiMessage = aiMessages[aiMessages.length - 1];
    
    if (latestAiMessage && (latestAiMessage.status === 'thinking' || latestAiMessage.status === 'idle')) {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  return (
    <div className={`
      flex-1 overflow-y-auto 
      pt-16 sm:pt-20 md:pt-24 pb-6 
      px-2 sm:px-4 lg:px-6 
      scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent
      ${hasFiles ? 'lg:pr-[calc(42%+24px)]' : ''}
    `}>
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : messages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center px-2 sm:px-4">
          {/* Welcome Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: 'easeOut', delay: 0.5 }}
            className="text-center text-white space-y-4 sm:space-y-5 w-full max-w-md"
          >
            <div className="bg-gradient-to-r from-purple-600 to-blue-500 w-12 h-12 sm:w-16 sm:h-16 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Command className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div className="space-y-2 sm:space-y-2.5">
              <h1 className="text-xl sm:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Welcome to CodEase</h1>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed px-2 sm:px-0">
                Your AI-powered assistant for building Chrome extensions. Ask anything or choose a suggestion below to get started!
              </p>
            </div>
            
            {/* Pro tip section */}
            <div className="mt-2 sm:mt-3 bg-blue-900/20 border border-blue-700/30 rounded-lg p-2.5 sm:p-3.5 text-left">
              <h3 className="text-blue-400 font-medium text-xs sm:text-sm mb-1.5 sm:mb-2 flex items-center">
                <span className="mr-1.5 text-blue-300">💡</span> Pro Tip
              </h3>
              <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                For better results, provide detailed prompts that describes what you want to achieve with your extension in detail. 
              </p>
              <p className="text-gray-400 text-xs mt-1.5 sm:mt-2 italic leading-relaxed">
                Example: "Create a Chrome extension that highlights keywords on webpages. It should have a popup UI where users can add/remove words, save preferences, and toggle highlighting with a keyboard shortcut."
              </p>
            </div>
          </motion.div>

          {/* Suggestions - moved closer to welcome panel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.75, ease: 'easeOut', delay: 0.8 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 mt-4 sm:mt-6 w-full max-w-xl px-2 sm:px-0"
          >
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="bg-[#1e1e1e] text-white p-2.5 sm:p-3.5 rounded-xl hover:bg-[#2a2a2a] transition text-left border border-gray-800 shadow-md hover:shadow-lg hover:shadow-blue-500/10 text-xs sm:text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {suggestion}
              </motion.button>
            ))}
          </motion.div>
        </div>
      ) : (
        // Display chat messages
        <div className="space-y-4 sm:space-y-5 pb-4">
          {messages.map((msg, index) => {
            const isLastMessage = index === messages.length - 1;
            return (
              <div key={msg.id} className="mx-0 sm:mx-2 md:mx-4">
                {msg.sender === 'You' ? (
                  <UserMessage text={msg.text} />
                ) : (
                  <AiMessage 
                    text={msg.text} 
                    status={msg.status}
                    onRetry={msg.status === 'error' ? () => onRetry(msg.id) : undefined}
                    showActions={msg.status === 'idle' && hasFiles && msg.id === messages.filter(m => m.sender === 'AI' && m.status === 'idle').pop()?.id}
                    onDownload={onDownload}
                    onTest={onTest}
                    sessionId={sessionId}
                    testEnvironmentActive={testEnvironmentActive}
                    testEnvironmentTimeLeft={testEnvironmentTimeLeft}
                    isLatest={isLastMessage && msg.sender === 'AI'}
                    canAccessTestFeature={canAccessTestFeature}
                    isDownloadComplete={isDownloadComplete}
                    hasFiles={hasFiles}
                  />
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} style={{ height: '20px', scrollMarginTop: '100px' }} />
        </div>
      )}
    </div>
  );
};

export default ChatMessageList;