// 'use client';

// import React, { useState, useEffect, useRef } from 'react';
// import { Send, X, Plus } from 'lucide-react';
// import { useRouter } from 'next/navigation';

// interface ChatInputProps {
//   onSendMessage: (message: string) => void;
//   onStopGeneration: () => void;
//   isGenerating: boolean;
//   isStoppingGeneration: boolean;
//   userId: string | null;
//   creditsRemaining: number;
//   followUpsRemaining: number;
//   messageCount: number;
// }

// const ChatInput: React.FC<ChatInputProps> = ({
//   onSendMessage,
//   onStopGeneration,
//   isGenerating,
//   isStoppingGeneration,
//   userId,
//   creditsRemaining,
//   followUpsRemaining,
//   messageCount,
// }) => {
//   const [newMessage, setNewMessage] = useState('');
//   const [inputPlaceholder, setInputPlaceholder] = useState<string>('Send a message...');
//   const router = useRouter();
//   const textareaRef = useRef<HTMLTextAreaElement>(null);

//   // Auto-resize textarea
//   useEffect(() => {
//     if (textareaRef.current) {
//       textareaRef.current.style.height = 'auto';
//       textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 144)}px`; // 144px = 9rem (max-h-36)
//     }
//   }, [newMessage]);

//   // Listen for suggestion clicks from ChatMessageList
//   useEffect(() => {
//     const handleSuggestionClick = (e: CustomEvent) => {
//       setNewMessage(e.detail.suggestion);
      
//       // Focus the textarea after suggestion is set
//       setTimeout(() => {
//         if (textareaRef.current) {
//           textareaRef.current.focus();
//         }
//       }, 0);
//     };

//     document.addEventListener('suggestionClick', handleSuggestionClick as EventListener);
//     return () => {
//       document.removeEventListener('suggestionClick', handleSuggestionClick as EventListener);
//     };
//   }, []);

//   // Update placeholder based on state
//   useEffect(() => {
//     if (!document.activeElement || document.activeElement !== textareaRef.current) {
//       setInputPlaceholder(
//         !userId ? "Please sign in"
//         : creditsRemaining <= 0 && messageCount === 0 ? "No credits remaining, purchase more to continue"
//         : followUpsRemaining <= 0 ? "No follow-ups left for this session"
//         : "Send a message..."
//       );
//     }
//   }, [userId, creditsRemaining, followUpsRemaining, messageCount]);

//   const handleTextareaFocus = () => {
//     if (!userId || followUpsRemaining <= 0 || (creditsRemaining <= 0 && messageCount === 0)) {
//       return; // Keep existing placeholder for disabled states
//     }
    
//     // Change to detailed guidance when focused
//     setInputPlaceholder(
//       "Describe your extension in detail (features, UI, functionality, behavior)..."
//     );
//   };
  
//   const handleTextareaBlur = () => {
//     if (newMessage.trim() === '') {
//       // Reset to default placeholder when not focused and empty
//       setInputPlaceholder(
//         !userId ? "Please sign in"
//         : creditsRemaining <= 0 && messageCount === 0 ? "No credits remaining, purchase more to continue"
//         : followUpsRemaining <= 0 ? "No follow-ups left for this session"
//         : "Send a message..."
//       );
//     }
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       if (!isGenerating) {
//         onSendMessage(newMessage);
//         setNewMessage('');
//       } else {
//         onStopGeneration();
//       }
//     }
//   };

//   return (
//     <div className="border-t border-gray-800/50 bg-[#111111]/95 backdrop-blur-sm shadow-[0_-2px_15px_rgba(0,0,0,0.3)] z-10">
//       {/* Credits alerts - placed above the input bar */}
//       {userId && creditsRemaining <= 0 && (
//         <div className="max-w-3xl mx-auto mt-3 px-4">
//           <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-red-900/40 to-red-600/20 border border-red-500/30 rounded-lg shadow-lg shadow-red-500/5">
//             <div className="flex items-center">
//               <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse mr-2.5"></div>
//               <span className="text-red-300 font-medium">No credits remaining</span>
//             </div>
//             <button 
//               onClick={() => router.push('/pricing')} 
//               className="text-xs font-medium bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md transition-colors shadow-md flex items-center"
//             >
//               <Plus size={14} className="mr-1.5" />
//               Buy Credits
//             </button>
//           </div>
//         </div>
//       )}
      
//       {userId && creditsRemaining <= 2 && creditsRemaining > 0 && (
//         <div className="max-w-3xl mx-auto mt-3 px-4">
//           <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-yellow-900/30 to-yellow-600/10 border border-yellow-500/30 rounded-lg shadow-lg shadow-yellow-500/5">
//             <div className="flex items-center">
//               <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse mr-2.5"></div>
//               <span className="text-yellow-300 font-medium">Running low on credits</span>
//             </div>
//             <button 
//               onClick={() => router.push('/pricing')} 
//               className="text-xs font-medium bg-yellow-600/80 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-md transition-colors shadow-md flex items-center"
//             >
//               <Plus size={14} className="mr-1.5" />
//               Buy More
//             </button>
//           </div>
//         </div>
//       )}
      
//       {/* Message input with integrated credits display */}
//       <div className="max-w-3xl mx-auto flex flex-col px-4 py-4">
//         {/* Credits status bar */}
//         <div className="flex items-center justify-between mb-2.5 px-1.5">
//           <div className="flex items-center space-x-3">
//             <div className="flex items-center">
//               <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse mr-1.5"></div>
//               <span className="text-gray-500 text-xs mr-1">Credits left:</span> 
//               <span className="text-white font-medium text-xs">{creditsRemaining}</span>
//             </div>
            
//             <div className="flex items-center">
//               <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse mr-1.5"></div>
//               <span className="text-gray-500 text-xs mr-1">Follow-ups left:</span> 
//               <span className="text-white font-medium text-xs">{followUpsRemaining}</span>
//             </div>
//           </div>
//         </div>
        
//         {/* Input box */}
//         <div className="flex items-center bg-[#1e1e1e] p-3 rounded-xl shadow-inner border border-gray-800/50">
//           <textarea
//             ref={textareaRef}
//             value={newMessage}
//             onChange={(e) => setNewMessage(e.target.value)}
//             placeholder={inputPlaceholder}
//             className="flex-1 bg-transparent text-white placeholder-gray-500 px-4 py-2 focus:outline-none resize-none overflow-hidden min-h-[40px] max-h-36"
//             disabled={!userId || followUpsRemaining <= 0 || (creditsRemaining <= 0 && messageCount === 0) || isGenerating}
//             onKeyDown={handleKeyDown}
//             onFocus={handleTextareaFocus}
//             onBlur={handleTextareaBlur}
//             rows={1}
//             style={{ height: 'auto' }}
//           />
//           {isGenerating ? (
//             <button
//               onClick={onStopGeneration}
//               disabled={isStoppingGeneration}
//               className={`ml-3 p-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-md ${isStoppingGeneration ? 'opacity-50 cursor-not-allowed' : ''}`}
//             >
//               <X className="w-5 h-5" />
//             </button>
//           ) : (
//             <button
//               onClick={() => {
//                 onSendMessage(newMessage);
//                 setNewMessage('');
//               }}
//               disabled={!userId || newMessage.trim() === '' || followUpsRemaining <= 0 || (creditsRemaining <= 0 && messageCount === 0)}
//               className="ml-3 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
//             >
//               <Send className="w-5 h-5" />
//             </button>
//           )}          
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChatInput;

import React, { useState, useEffect, useRef } from 'react';
import { Send, X, Plus, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ChatInputProps {
  onSendMessage: (message: string) => void;
  onStopGeneration: () => void;
  isGenerating: boolean;
  isStoppingGeneration: boolean;
  userId: string | null;
  creditsRemaining: number;
  followUpsRemaining: number;
  messageCount: number;
}

const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onStopGeneration,
  isGenerating,
  isStoppingGeneration,
  userId,
  creditsRemaining,
  followUpsRemaining,
  messageCount,
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [inputPlaceholder, setInputPlaceholder] = useState<string>('Send a message...');
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 144)}px`; // 144px = 9rem (max-h-36)
    }
  }, [newMessage]);

  // Listen for suggestion clicks from ChatMessageList
  useEffect(() => {
    const handleSuggestionClick = (e: CustomEvent) => {
      setNewMessage(e.detail.suggestion);
      
      // Focus the textarea after suggestion is set
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 0);
    };

    document.addEventListener('suggestionClick', handleSuggestionClick as EventListener);
    return () => {
      document.removeEventListener('suggestionClick', handleSuggestionClick as EventListener);
    };
  }, []);

  // Update placeholder based on state
  useEffect(() => {
    if (!document.activeElement || document.activeElement !== textareaRef.current) {
      setInputPlaceholder(
        !userId ? "Please sign in"
        : creditsRemaining <= 0 && messageCount === 0 ? "No credits remaining, purchase more to continue"
        : followUpsRemaining <= 0 ? "No follow-ups left for this session"
        : "Send a message..."
      );
    }
  }, [userId, creditsRemaining, followUpsRemaining, messageCount]);

  const handleTextareaFocus = () => {
    if (!userId || followUpsRemaining <= 0 || (creditsRemaining <= 0 && messageCount === 0)) {
      return; // Keep existing placeholder for disabled states
    }
    
    // Change to detailed guidance when focused
    setInputPlaceholder(
      "Describe your extension in detail (features, UI, functionality, behavior)..."
    );
  };
  
  const handleTextareaBlur = () => {
    if (newMessage.trim() === '') {
      // Reset to default placeholder when not focused and empty
      setInputPlaceholder(
        !userId ? "Please sign in"
        : creditsRemaining <= 0 && messageCount === 0 ? "No credits remaining, purchase more to continue"
        : followUpsRemaining <= 0 ? "No follow-ups left for this session"
        : "Send a message..."
      );
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isGenerating) {
        onSendMessage(newMessage);
        setNewMessage('');
      } else {
        onStopGeneration();
      }
    }
  };

  return (
    <div className="border-t border-gray-800/50 bg-[#111111]/95 backdrop-blur-sm shadow-[0_-2px_15px_rgba(0,0,0,0.3)] z-10">
      {/* Credits alerts - placed above the input bar */}
      {userId && creditsRemaining <= 0 && (
        <div className="max-w-3xl mx-auto mt-3 px-4">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-red-900/40 to-red-600/20 border border-red-500/30 rounded-lg shadow-lg shadow-red-500/5">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse mr-2.5"></div>
              <span className="text-red-300 font-medium">No credits remaining</span>
            </div>
            <button 
              onClick={() => router.push('/pricing')} 
              className="text-xs font-medium bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md transition-colors shadow-md flex items-center"
            >
              <Plus size={14} className="mr-1.5" />
              Buy Credits
            </button>
          </div>
        </div>
      )}
      
      {userId && creditsRemaining <= 2 && creditsRemaining > 0 && (
        <div className="max-w-3xl mx-auto mt-3 px-4">
          <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-yellow-900/30 to-yellow-600/10 border border-yellow-500/30 rounded-lg shadow-lg shadow-yellow-500/5">
            <div className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse mr-2.5"></div>
              <span className="text-yellow-300 font-medium">Running low on credits</span>
            </div>
            <button 
              onClick={() => router.push('/pricing')} 
              className="text-xs font-medium bg-yellow-600/80 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-md transition-colors shadow-md flex items-center"
            >
              <Plus size={14} className="mr-1.5" />
              Buy More
            </button>
          </div>
        </div>
      )}
      
      {/* Message input with integrated credits display */}
      <div className="max-w-3xl mx-auto flex flex-col px-4 py-4">
        {/* Credits status bar */}
        <div className="flex items-center justify-between mb-2.5 px-1.5">
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse mr-1.5"></div>
              <span className="text-gray-500 text-xs mr-1">Credits left:</span> 
              <span className="text-white font-medium text-xs">{creditsRemaining}</span>
            </div>
            
            <div className="flex items-center">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse mr-1.5"></div>
              <span className="text-gray-500 text-xs mr-1">Follow-ups left:</span> 
              <span className="text-white font-medium text-xs">{followUpsRemaining}</span>
            </div>
          </div>
        </div>
        
        {/* Input box */}
        <div className="flex items-center bg-[#1e1e1e] p-3 rounded-xl shadow-inner border border-gray-800/50">
          <textarea
            ref={textareaRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder={inputPlaceholder}
            className="flex-1 bg-transparent text-white placeholder-gray-500 px-4 py-2 focus:outline-none resize-none overflow-hidden min-h-[40px] max-h-36"
            disabled={!userId || followUpsRemaining <= 0 || (creditsRemaining <= 0 && messageCount === 0) || isGenerating}
            onKeyDown={handleKeyDown}
            onFocus={handleTextareaFocus}
            onBlur={handleTextareaBlur}
            rows={1}
            style={{ height: 'auto' }}
          />
          {isGenerating ? (
            <button
              onClick={onStopGeneration}
              disabled={isStoppingGeneration}
              className={`ml-3 p-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition shadow-md ${isStoppingGeneration ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <X className="w-5 h-5" />
            </button>
          ) : (
            <button
              onClick={() => {
                onSendMessage(newMessage);
                setNewMessage('');
              }}
              disabled={!userId || newMessage.trim() === '' || followUpsRemaining <= 0 || (creditsRemaining <= 0 && messageCount === 0)}
              className="ml-3 p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
            >
              <Send className="w-5 h-5" />
            </button>
          )}          
        </div>
        
        {/* Minimalistic disclaimer below input box */}
        <div className="flex items-center justify-center mt-2 px-2">
          <AlertCircle size={12} className="text-gray-500 mr-1.5" />
          <p className="text-gray-500 text-xs text-center">
            Always review and test code before production use
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;