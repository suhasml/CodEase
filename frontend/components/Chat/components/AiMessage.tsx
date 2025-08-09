import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Copy, ThumbsUp, ThumbsDown, AlertCircle, Send, Command, Download, Play, Info, Lock, Check, Package, X, Coins, Share, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { authenticatedFetch } from '@/lib/api-utils';
import { safeAuthenticatedFetch } from '@/lib/error-handling';
import PublishForm from '@/components/Marketplace/PublishForm';
import useCredits from '@/components/Chat/hooks/useCredits';
import ShareButton from './ShareButton';
import { useRouter } from 'next/navigation';

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
  hasFiles?: boolean;
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
  testEnvironmentTimeLeft,  isLatest = false,
  canAccessTestFeature = false,
  isDownloadComplete = false,
  hasFiles = false
}) => {
  const [isDownloadingExtension, setIsDownloadingExtension] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showTestTooltip, setShowTestTooltip] = useState(false);
  const [showDownloadTooltip, setShowDownloadTooltip] = useState(false);
  const [showMarketplaceTooltip, setShowMarketplaceTooltip] = useState(false);
  const [showTokenizeTooltip, setShowTokenizeTooltip] = useState(false);
  const [showShareTooltip, setShowShareTooltip] = useState(false);
  const [showCopyTooltip, setShowCopyTooltip] = useState(false);
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [showShareAnnouncement, setShowShareAnnouncement] = useState(false);
  const messageRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  
  // Get marketplace and tokenization status from useCredits hook
  const { publishedToMarketplace, isTokenized, tokenName, fetchSessionInfo } = useCredits(sessionId);
  
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

  // Always show share announcement after refresh when extension is ready
  useEffect(() => {
    if (sessionId && hasFiles && showActions && status === 'idle') {
      setShowShareAnnouncement(true);
    }
  }, [sessionId, hasFiles, showActions, status]);

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
    
      toast.error('Failed to copy text');
    }
  };  const handleDownload = async (downloadToken: string, sessionId: string) => {
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
      
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/middleware/extension/download`, 
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
        // Handle different error status codes gracefully
        let errorMessage = 'Download failed. Please try again.';
        
        if (response.status === 429) {
          errorMessage = 'Too many download requests. Please wait a moment and try again.';
        } else if (response.status === 404) {
          errorMessage = 'Extension files not found. Please try regenerating the extension.';
        } else if (response.status === 500) {
          errorMessage = 'Server error occurred. Please try again in a few moments.';
        }
        
        toast.error(errorMessage);
        return
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'browser_extension.zip'
      document.body.appendChild(link)
      link.click()
     
      window.URL.revokeObjectURL(url)
      toast.success('Extension downloaded successfully!')
    } catch (error) {
      // Network or other unexpected errors
      if (error instanceof TypeError && error.message.includes('fetch')) {
        toast.error('Network error. Please check your connection and try again.');
      } else {
        toast.error('Download failed. Please try again.');
      }
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
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center animate-pulse">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <span className="text-sm font-medium text-gray-300">Generating your extension...</span>
          </div>
          <div className="text-xs text-gray-400">{text || "This may take a few moments"}</div>
        </div>
      </motion.div>
    );
  }

  if (status === 'error') {
    return (
      <motion.div 
        ref={messageRef}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start space-x-3 bg-red-900/20 p-4 rounded-xl max-w-3xl self-start text-white backdrop-blur-sm border border-red-500/30"
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center">
          <AlertCircle className="w-4 h-4 text-red-400" />
        </div>
        <div className="flex-1">
          <p className="text-red-300 mb-3">{text}</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onRetry}
            className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-sm transition-colors"
          >
            <Send size={14} />
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

          {/* Share Feature Announcement */}
          {showShareAnnouncement && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-lg p-4 relative"
            >
              <button
                onClick={() => setShowShareAnnouncement(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-blue-400" />
                  </div>
                </div>
                <div>
                  <h4 className="text-blue-300 font-medium mb-1">🎉 New Feature: Share Extensions!</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">
                    You can now share your extensions with others to test online! Create shareable links that let anyone test your extensions in our secure playground environment.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Actions section */}
          {showActions && (
            <div className="flex flex-col space-y-3 mt-4">
              {/* Main action buttons */}
              <div className="flex flex-wrap gap-3">
                {/* Test in Playground - Full Button */}
                {isMobile ? (
                  <div className="flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium bg-gray-700 text-gray-300 border border-gray-600">
                    <Info size={14} className="text-yellow-400" />
                    <span>Test in desktop mode</span>
                  </div>
                ) : canAccessTestFeature ? (
                  <button
                    onClick={onTest}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      testEnvironmentActive 
                        ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg' 
                        : 'bg-green-600 text-white hover:bg-green-700 shadow-lg'
                    }`}
                  >
                    {testEnvironmentActive ? (
                      <>
                        <div className="flex-shrink-0 w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                        <span>Resume Test ({testEnvironmentTimeLeft})</span>
                      </>
                    ) : (
                      <>
                        <Play size={14} />
                        <span>Test in Playground</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="relative">
                    <button
                      className="flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium bg-gray-700 text-gray-300 border border-gray-600 cursor-not-allowed"
                      onMouseEnter={() => setShowTestTooltip(true)}
                      onMouseLeave={() => setShowTestTooltip(false)}
                    >
                      <Lock size={14} className="text-gray-400" />
                      <span>Test in Playground</span>
                    </button>
                    {showTestTooltip && (
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 bg-gray-800 text-white text-xs p-3 rounded-lg border border-gray-700 shadow-lg z-50">
                        Please purchase credits or a subscription to access the testing feature.
                      </div>
                    )}
                  </div>
                )}

                {/* Tokenize & Earn / Go to Token Page - Full Button */}
                <button
                  onClick={() => {
                    if (isTokenized && tokenName) {
                      router.push(`/token/${encodeURIComponent(tokenName)}`);
                    } else if (sessionId) {
                      router.push(`/tokenize/${sessionId}`);
                    }
                  }}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg ${
                    isTokenized 
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                  } text-white`}
                >
                  <Coins size={14} className="text-white" />
                  <span className="text-white font-medium">
                    {isTokenized ? 'Go to Token Page' : 'Tokenize & Earn'}
                  </span>
                </button>
              </div>

              {/* Icon buttons with tooltips */}
              <div className="flex items-center space-x-2">
                {/* Copy - Icon Button */}
                <div className="relative">
                  <button
                    onClick={handleCopy}
                    className="p-2 rounded-lg transition-all duration-200 bg-gray-700 hover:bg-gray-600 text-gray-300"
                    onMouseEnter={() => setShowCopyTooltip(true)}
                    onMouseLeave={() => setShowCopyTooltip(false)}
                  >
                    <Copy size={16} />
                  </button>
                  {showCopyTooltip && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-gray-800 text-white text-xs p-2 rounded border border-gray-700 shadow-lg z-50 whitespace-nowrap">
                      Copy Message
                    </div>
                  )}
                </div>

                {/* Share Extension - Icon Button with Tooltip */}
                <div className="relative">
                  <ShareButton 
                    sessionId={sessionId || ''}
                    extensionTitle={`Extension - ${sessionId}`}
                    isVisible={Boolean(sessionId && (hasFiles || showActions))}
                    className="p-2 rounded-lg transition-all duration-200 bg-blue-600 hover:bg-blue-700 text-white"
                    iconOnly={true}
                    onMouseEnter={() => setShowShareTooltip(true)}
                    onMouseLeave={() => setShowShareTooltip(false)}
                  />
                  {showShareTooltip && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-gray-800 text-white text-xs p-2 rounded border border-gray-700 shadow-lg z-50 whitespace-nowrap">
                      Share Extension
                    </div>
                  )}
                </div>

                {/* Download - Icon Button */}
                <div className="relative">
                  <button 
                    onClick={() => downloadToken && sessionId ? 
                      handleDownload(downloadToken, sessionId) : 
                      onDownload && onDownload()}
                    disabled={isDownloadingExtension}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      isDownloadComplete 
                        ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    } disabled:opacity-70`}
                    onMouseEnter={() => setShowDownloadTooltip(true)}
                    onMouseLeave={() => setShowDownloadTooltip(false)}
                  >
                    {isDownloadingExtension ? (
                      <div className="h-4 w-4 rounded-full border-2 border-t-white border-r-transparent border-b-white border-l-transparent animate-spin"></div>
                    ) : isDownloadComplete ? (
                      <Check size={16} />
                    ) : (
                      <Download size={16} />
                    )}
                  </button>
                  {showDownloadTooltip && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-gray-800 text-white text-xs p-2 rounded border border-gray-700 shadow-lg z-50 whitespace-nowrap">
                      {isDownloadComplete ? 'Downloaded' : 'Download Extension'}
                    </div>
                  )}
                </div>

                {/* Add to Marketplace - Icon Button */}
                <div className="relative">
                  <button 
                    onClick={() => publishedToMarketplace ? null : setShowPublishForm(true)}
                    disabled={publishedToMarketplace}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      publishedToMarketplace 
                        ? 'bg-green-600 text-white cursor-not-allowed opacity-70' 
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                    onMouseEnter={() => setShowMarketplaceTooltip(true)}
                    onMouseLeave={() => setShowMarketplaceTooltip(false)}
                  >
                    <ShoppingBag size={16} />
                  </button>
                  {showMarketplaceTooltip && (
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 bg-gray-800 text-white text-xs p-2 rounded border border-gray-700 shadow-lg z-50 whitespace-nowrap">
                      {publishedToMarketplace ? 'Published to Marketplace' : 'Add to Marketplace'}
                    </div>
                  )}
                </div>
              </div>
              
              {isMobile && (
                <div className="bg-yellow-900/30 border border-yellow-700/30 rounded-lg p-3 text-xs text-yellow-200">
                  Test in Playground is not supported on mobile devices. Please use a desktop browser for this feature.
                </div>
              )}
            </div>
          )}
          
          {/* Add some basic styling for markdown */}
          <style jsx global>{`
            .markdown-content a {
              color: #60a5fa;
              text-decoration: underline;
            }
            
            .markdown-content h1 {
              font-size: 1.5rem;
              font-weight: bold;
              color: white;
              margin-bottom: 0.5rem;
            }
            
            .markdown-content h2 {
              font-size: 1.25rem;
              font-weight: bold;
              color: white;
              margin-bottom: 0.5rem;
            }
            
            .markdown-content h3 {
              font-size: 1.125rem;
              font-weight: bold;
              color: white;
              margin-bottom: 0.5rem;
            }
            
            .markdown-content ul {
              list-style-type: disc;
              margin-left: 1.5rem;
              margin-bottom: 0.75rem;
              color: #d1d5db;
            }
            
            .markdown-content ol {
              list-style-type: decimal;
              margin-left: 1.5rem;
              margin-bottom: 0.75rem;
              color: #d1d5db;
            }
            
            .markdown-content li {
              margin-bottom: 0.25rem;
            }
            
            .markdown-content code {
              background-color: #374151;
              padding: 0.125rem 0.25rem;
              border-radius: 0.25rem;
              font-size: 0.875rem;
              color: #fbbf24;
            }
            
            .markdown-content pre {
              background-color: #111827;
              padding: 0.75rem;
              border-radius: 0.5rem;
              overflow-x: auto;
              margin: 0.75rem 0;
              border: 1px solid #374151;
            }
            
            .markdown-content pre code {
              background-color: transparent;
              padding: 0;
              border-radius: 0;
              color: #e5e7eb;
            }
            
            .markdown-content blockquote {
              border-left: 4px solid #6b7280;
              padding-left: 1rem;
              margin: 0.75rem 0;
              font-style: italic;
              color: #9ca3af;
            }
            
            .markdown-content table {
              width: 100%;
              border-collapse: collapse;
              margin: 0.75rem 0;
            }
            
            .markdown-content th,
            .markdown-content td {
              border: 1px solid #4b5563;
              padding: 0.5rem;
              text-align: left;
            }
            
            .markdown-content th {
              background-color: #374151;
              font-weight: bold;
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
      </motion.div>      {/* Publish Form Modal - moved outside the main return component */}
      {showPublishForm && sessionId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-4xl w-full mx-auto">
            <PublishForm 
              extensionId={sessionId} 
              redirectToChat={true}
              onSuccess={() => {
                setShowPublishForm(false);
                fetchSessionInfo();
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
