import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Copy, ThumbsUp, ThumbsDown, AlertCircle, Send, Command, Download, Play, Info, Lock, Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { authenticatedFetch } from '@/lib/api-utils';
import PublishForm from '@/components/Marketplace/PublishForm';

interface AiMessageProps {
  text: string;
  status?: 'idle' | 'thinking' | 'error';
  onRetry?: () => void;
  showActions?: boolean;
  onDownload?: () => void;
  onTest?: () => void;
  downloadToken?: string;
  sessionId?: string;
  testEnvironmentActive?: boolean;
  testEnvironmentTimeLeft?: string;
  isLatest?: boolean;
  canAccessTestFeature?: boolean;
  isDownloadComplete?: boolean;
}

const AiMessage: React.FC<AiMessageProps> = ({ 
  text, 
  status = 'idle',
  onRetry,
  showActions = false,
  onDownload,
  onTest,
  downloadToken,
  sessionId,
  testEnvironmentActive,
  testEnvironmentTimeLeft,
  isLatest = false,
  canAccessTestFeature = false,
  isDownloadComplete = false
}) => {
  const [isDownloadingExtension, setIsDownloadingExtension] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showTestTooltip, setShowTestTooltip] = useState(false);
  const [showPublishForm, setShowPublishForm] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if the device is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Scroll into view when message appears or changes
  useEffect(() => {
    if (isLatest && messageRef.current) {
      // Scroll to the message with smooth animation
      messageRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [isLatest, text, status]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Message copied to clipboard!');
    } catch (err) {
      // console.error('Failed to copy text:', err);
      toast.error('Failed to copy text');
    }
  };

  const handleDownload = async (downloadToken: string, sessionId: string) => {
    try {
      const token = localStorage.getItem('access_token')
      if (!token) {
        toast.error('Authentication required')
        return
      }

      setIsDownloadingExtension(true)
      toast('Preparing your extension for download...', {
        icon: '🔄',
        duration: 3000
      })
      const API_URL = process.env.NEXT_PUBLIC_API_URL;
      const response = await authenticatedFetch(
        `${API_URL}/middleware/extension/download`, 
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            session_id: sessionId,
            download_token: downloadToken
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        toast.error('Download failed. Please try again.')
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'browser_extension.zip'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Extension downloaded successfully!')
    } catch (error) {
      toast.error('Download failed. Please try again.')
    } finally {
      setIsDownloadingExtension(false)
    }
  }

  if (status === 'thinking') {
    return (
      <motion.div 
        ref={messageRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start space-x-3 bg-gradient-to-b from-gray-800/90 to-gray-900/90 p-4 rounded-xl max-w-3xl self-start text-white backdrop-blur-sm border border-indigo-500/30 shadow-lg"
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-indigo-600 to-blue-500 flex items-center justify-center shadow-inner">
          <Command className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className="pulse-container flex space-x-1">
              <div className="pulse-dot"></div>
              <div className="pulse-dot delay-150"></div>
              <div className="pulse-dot delay-300"></div>
            </div>
            <span className="text-xs font-medium text-indigo-300">Thinking...</span>
          </div>
          
          <motion.div 
            className="relative bg-indigo-900/20 backdrop-blur-sm border border-indigo-500/30 p-4 rounded-lg"
            initial={{ opacity: 0, scaleY: 0.95 }}
            animate={{ opacity: 1, scaleY: 1 }}
            transition={{ duration: 0.2 }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-transparent to-blue-500/5 rounded-lg pointer-events-none"></div>
            
            {text ? (
              <p className="font-normal text-indigo-100/90">{text}</p>
            ) : (
              <div className="flex flex-col space-y-3">
                <div className="h-4 bg-indigo-600/20 rounded-full w-full animate-pulse"></div>
                <div className="h-4 bg-indigo-600/20 rounded-full w-3/4 animate-pulse"></div>
                <div className="h-4 bg-indigo-600/20 rounded-full w-1/2 animate-pulse"></div>
              </div>
            )}
          </motion.div>
          
          <style jsx>{`
            .pulse-container {
              display: flex;
              align-items: center;
            }
            
            .pulse-dot {
              width: 6px;
              height: 6px;
              border-radius: 50%;
              background-color: #818cf8;
              opacity: 0.8;
              animation: pulse 1.5s infinite ease-in-out;
            }
            
            .delay-150 {
              animation-delay: 0.15s;
            }
            
            .delay-300 {
              animation-delay: 0.3s;
            }
            
            @keyframes pulse {
              0%, 100% {
                transform: scale(1);
                opacity: 0.6;
              }
              50% {
                transform: scale(1.5);
                opacity: 1;
              }
            }
          `}</style>
        </div>
      </motion.div>
    );
  }

  if (status === 'error') {
    return (
      <motion.div 
        ref={messageRef}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-start space-x-3 bg-red-900/20 p-4 rounded-xl max-w-3xl self-start text-white border border-red-700/50"
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
          <AlertCircle className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          {/*<p className="font-medium text-red-200">An error occurred</p> */}
          <p className="text-sm text-red-300 mt-1">{text}</p>
          <button
            onClick={onRetry}
            className="mt-2 px-3 py-1 bg-red-700 hover:bg-red-600 rounded-lg text-sm flex items-center space-x-1"
          >
            <Send size={12} />
            <span>Retry</span>
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <>
      <motion.div 
        ref={messageRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start space-x-3 bg-gray-800/70 p-4 rounded-xl max-w-3xl self-start text-white backdrop-blur-sm border border-gray-700/50"
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-white" />
        </div>        <div className="flex-1 markdown-content">
        <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              // Apply styling to the root div
              p: ({node, ...props}) => <p className="font-medium mb-3" {...props} />,
            }}
          >
            {text}
          </ReactMarkdown>
          {/* Actions section */}
          {showActions && (
            <div className="flex flex-col space-y-2 mt-3">
              <div className="flex space-x-2">
                <button 
                  onClick={() => downloadToken && sessionId ? 
                    handleDownload(downloadToken, sessionId) : 
                    onDownload && onDownload()}
                  disabled={isDownloadingExtension}
                  className={`flex items-center space-x-1 ${isDownloadComplete ? 'bg-purple-600 hover:bg-purple-700' : 'bg-blue-600 hover:bg-blue-700'} text-white px-3 py-1 rounded-lg text-sm transition-colors disabled:bg-blue-800 disabled:opacity-70`}
                >
                  {isDownloadingExtension ? (
                    <>
                      <div className="h-3 w-3 rounded-full border-2 border-t-white border-r-transparent border-b-white border-l-transparent animate-spin mr-1"></div>
                      <span>Downloading...</span>
                    </>
                  ) : isDownloadComplete ? (
                    <>
                      <Check size={14} className="mr-1" />
                      <span>Downloaded</span>
                    </>
                  ) : (
                    <>
                      <Download size={14} />
                      <span>Download</span>
                    </>
                  )}
                </button>
                
                <button 
                  onClick={() => setShowPublishForm(true)}
                  className="flex items-center space-x-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
                >
                  <svg className="w-3.5 h-3.5 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                  <span>Add to Marketplace</span>
                </button>
                
                {isMobile ? (
                  <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-gray-700 text-gray-300 border border-gray-600">
                    <Info size={12} className="text-yellow-400" />
                    <span>Test in desktop mode</span>
                  </div>
                ) : canAccessTestFeature ? (
                  <button
                    onClick={onTest}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                      ${testEnvironmentActive 
                        ? 'bg-green-600 text-white hover:bg-green-900/50 border border-green-700/30' 
                        : 'bg-green-600 text-white hover:bg-green-900/50 border border-green-700/30' }
                    `}
                  >
                    {testEnvironmentActive ? (
                      <>
                        <div className="flex-shrink-0 w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                        <span>Resume Test ({testEnvironmentTimeLeft})</span>
                      </>
                    ) : (
                      <>
                        <Play size={12} />
                        <span>Test In Playground</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="relative">
                    <button
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-gray-700 text-gray-300 border border-gray-600 cursor-not-allowed"
                      onMouseEnter={() => setShowTestTooltip(true)}
                      onMouseLeave={() => setShowTestTooltip(false)}
                    >
                      <Lock size={12} className="text-gray-400" />
                      <span>Test In Playground</span>
                    </button>
                    {showTestTooltip && (
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-56 bg-gray-800 text-white text-xs p-2 rounded border border-gray-700 shadow-lg z-50">
                        Please purchase credits or a subscription to access the testing feature.
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {isMobile && (
                <div className="bg-yellow-900/30 border border-yellow-700/30 rounded-md p-2 text-xs text-yellow-200">
                  Test in Playground is not supported on mobile devices. Please use a desktop browser for this feature.
                </div>
              )}
              
              {/* {!isMobile && !canAccessTestFeature && (
                <div className="bg-yellow-900/30 border border-yellow-700/30 rounded-md p-2 text-xs text-yellow-200">
                  <div className="flex items-start space-x-2">
                    <Lock size={14} className="text-yellow-300 flex-shrink-0 mt-0.5" />
                    <span>The Test in Playground feature requires a subscription or credits. Visit the <a href="/dashboard" className="underline hover:text-yellow-100">dashboard</a> to upgrade your account.</span>
                  </div>
                </div>
              )} */}
            </div>
          )}
          
          <div className="flex space-x-2 mt-3">
            <button
              onClick={handleCopy}
              className="p-1 rounded hover:bg-gray-700 transition"
              title="Copy to Clipboard"
            >
              <Copy size={16} />
            </button>
            {/* <button
              className="p-1 rounded hover:bg-gray-700 transition"
              title="Like"
            >
              <ThumbsUp size={16} strokeWidth={1.5} />
            </button>
            <button
              className="p-1 rounded hover:bg-gray-700 transition"
              title="Dislike"
            >
              <ThumbsDown size={16} strokeWidth={1.5} />
            </button> */}
          </div>
          
          {/* Add some basic styling for markdown */}
          <style jsx global>{`
            .markdown-content a {
              color: #60a5fa;
              text-decoration: underline;
            }
            
            .markdown-content h1, 
            .markdown-content h2, 
            .markdown-content h3, 
            .markdown-content h4 {
              font-weight: 600;
              margin-top: 1.5rem;
              margin-bottom: 0.75rem;
            }
            
            .markdown-content h1 {
              font-size: 1.5rem;
            }
            
            .markdown-content h2 {
              font-size: 1.25rem;
            }
            
            .markdown-content h3 {
              font-size: 1.125rem;
            }
            
            .markdown-content p {
              margin-bottom: 0.75rem;
            }
            
            .markdown-content ul, .markdown-content ol {
              margin-left: 1.5rem;
              margin-bottom: 0.75rem;
            }
            
            .markdown-content ul {
              list-style-type: disc;
            }
            
            .markdown-content ol {
              list-style-type: decimal;
            }
            
            .markdown-content li {
              margin-bottom: 0.25rem;
            }
            
            .markdown-content pre {
              background-color: rgba(30, 41, 59, 0.5);
              padding: 0.75rem;
              border-radius: 0.375rem;
              overflow-x: auto;
              margin-bottom: 0.75rem;
            }
            
            .markdown-content code {
              font-family: monospace;
              background-color: rgba(30, 41, 59, 0.5);
              padding: 0.15rem 0.3rem;
              border-radius: 0.25rem;
            }
            
            .markdown-content pre code {
              background-color: transparent;
              padding: 0;
            }
            
            .markdown-content blockquote {
              border-left: 3px solid #4b5563;
              padding-left: 1rem;
              margin-left: 0;
              margin-right: 0;
              font-style: italic;
              color: #9ca3af;
            }
            
            .markdown-content table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 0.75rem;
            }
            
            .markdown-content table th,
            .markdown-content table td {
              border: 1px solid #4b5563;
              padding: 0.5rem;
            }
            
            .markdown-content table th {
              background-color: rgba(30, 41, 59, 0.5);
            }
            
            .markdown-content hr {
              border: 0;
              border-top: 1px solid #4b5563;
              margin: 1rem 0;
            }
            
            .markdown-content img {
              max-width: 100%;
              border-radius: 0.25rem;
            }
          `}</style>
        </div>
      </motion.div>

      {/* Publish Form Modal - moved outside the main return component */}
      {showPublishForm && sessionId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="bg-[#111] p-4 sm:p-6 md:p-8 rounded-xl shadow-2xl border border-gray-800 max-w-4xl w-full mx-auto">
            <PublishForm 
              extensionId={sessionId} 
              onSuccess={() => {
                toast.success('Extension published to marketplace successfully!');
                setShowPublishForm(false);
              }} 
              onCancel={() => setShowPublishForm(false)} 
            />
          </div>
        </div>
      )}
    </>
  );
};

export default AiMessage;
