import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { Share } from 'lucide-react';
import { createShareableLink, copyToClipboard, ShareResponse } from '@/lib/sharing-utils';

interface ShareButtonProps {
  sessionId: string;
  extensionTitle?: string;
  isVisible?: boolean;
  className?: string;
  iconOnly?: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

const ShareButton: React.FC<ShareButtonProps> = ({ 
  sessionId, 
  extensionTitle = "Extension",
  isVisible = true,
  className = "",
  iconOnly = false,
  onMouseEnter,
  onMouseLeave
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = async () => {
    if (!sessionId) {
      toast.error('Extension not ready for sharing');
      return;
    }

    setIsSharing(true);
    try {
      const response = await createShareableLink(sessionId, extensionTitle);

      if (response.success && response.share_url) {
        setShareUrl(response.share_url);
        setShowModal(true);
        setIsCopied(false); // Reset copy state
        toast.success(response.message || 'Share link created successfully!');
      } else {
        // Handle API errors gracefully without console logging
        const errorMessage = response.error || 'Failed to create share link';
        toast.error(errorMessage);
      }
    } catch (error) {
      // Handle all errors gracefully without console logging
      let errorMessage = 'Failed to create share link. Please try again.';
      
      if (error instanceof Error) {
        // Check for specific error types for better user messaging
        if (error.message.includes('network') || error.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (error.message.includes('auth')) {
          errorMessage = 'Authentication error. Please sign in again.';
        } else if (error.message.includes('rate')) {
          errorMessage = 'Too many requests. Please wait a moment and try again.';
        }
      }
      
      toast.error(errorMessage);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCopyToClipboard = async () => {
    if (!shareUrl) {
      toast.error('No share link to copy');
      return;
    }

    try {
      const success = await copyToClipboard(shareUrl);
      if (success) {
        setIsCopied(true);
        toast.success('Share link copied to clipboard!');
        
        // Reset the "Copied" state after 2 seconds
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      } else {
        toast.error('Failed to copy share link. Please copy manually.');
      }
    } catch (error) {
      // Handle clipboard errors gracefully
      toast.error('Failed to copy share link. Please copy manually.');
    }
  };

  const closeModal = () => {
    try {
      setShowModal(false);
      setShareUrl(null);
      setIsCopied(false);
    } catch (error) {
      // Handle any unexpected errors when closing modal
      setShowModal(false);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <button
        onClick={handleShare}
        disabled={isSharing || !sessionId}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`
          inline-flex items-center ${iconOnly ? 'p-2' : 'px-3 py-1'} rounded-lg text-sm font-medium
          transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2
          ${isSharing || !sessionId
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
            : iconOnly 
              ? 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500'
              : 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500'
          }
          ${className}
        `}
      >
        {isSharing ? (
          iconOnly ? (
            <svg className="animate-spin h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating...
            </>
          )
        ) : iconOnly ? (
          <Share className="w-4 h-4" />
        ) : (
          <>
            <Share className="w-4 h-4 mr-2 text-white" />
            <span className="text-white font-medium">Share Extension</span>
          </>
        )}
      </button>

      {/* Share Modal */}
      {showModal && shareUrl && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
          onClick={(e) => {
            // Only close if clicking the backdrop, not the modal content
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="bg-[#111] rounded-xl max-w-lg w-full p-6 border border-gray-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center">
                <svg className="w-6 h-6 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Extension is now ready to be shared and used by others
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-gray-800"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-300 mb-4 text-sm">
                Share this link with others so they can test your extension. They'll need to log in first.
              </p>
              
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-400">
                  Shareable Link
                </label>
                <div className="flex items-center space-x-2">
                  <div className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg">
                    <div className="text-blue-400 text-sm font-mono break-all select-all">
                      {shareUrl}
                    </div>
                  </div>
                  <button
                    onClick={handleCopyToClipboard}
                    disabled={isCopied}
                    className={`px-4 py-3 rounded-lg transition-colors text-sm font-medium flex items-center ${
                      isCopied 
                        ? 'bg-green-600 text-white cursor-default' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {isCopied ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      )}
                    </svg>
                    {isCopied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-gray-300 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ShareButton; 