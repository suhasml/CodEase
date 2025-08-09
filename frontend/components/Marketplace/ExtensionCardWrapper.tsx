'use client';

import React, { useState } from 'react';
import { Download, Star, ExternalLink, Tag, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authenticatedFetch } from '@/lib/api-utils';

interface ExtensionCardProps {
  id: string;
  title: string;
  description: string;
  owner: string;
  username?: string;
  price: number;
  rating: number;
  category: string;
  tags: string[];
  isPurchased: boolean;
  ownedByCurrentUser?: boolean; // Flag indicating if the current user owns this extension
  sellerWalletAddress?: string;
  hasWallet?: boolean;
  onPurchaseClick: (id: string) => void;
  onRatingSubmit?: (id: string, rating: number) => void;
  createdAt: string;
  canDownload?: boolean;
  onDownloadClick?: () => void;
  isDownloading?: boolean;
  customActionButtons?: React.ReactNode; // Custom action buttons to render
}

const ExtensionCardWrapper: React.FC<ExtensionCardProps> = ({
  id,
  title,
  description,
  owner,
  username,
  price,
  ownedByCurrentUser,
  rating,
  category,
  tags,
  isPurchased,
  onPurchaseClick,
  onRatingSubmit,
  createdAt,
  canDownload = false,
  onDownloadClick,
  isDownloading = false,
  customActionButtons
}) => {
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < 5; i++) {
      const starKey = `extension-${id}-star-${i}`;
      if (i < fullStars) {
        stars.push(<Star key={starKey} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && halfStar) {
        stars.push(
          <span key={starKey} className="relative">
            <Star className="w-4 h-4 text-gray-400" />
            <Star 
              key={`${starKey}-half`}
              className="absolute top-0 left-0 w-4 h-4 fill-yellow-400 text-yellow-400 overflow-hidden" 
              style={{ clipPath: 'inset(0 50% 0 0)' }} 
            />
          </span>
        );
      } else {
        stars.push(<Star key={starKey} className="w-4 h-4 text-gray-400" />);
      }
    }
    
    return (
      <div className="flex items-center gap-1">
        {stars}
        <span className="ml-1 text-sm text-gray-300">{rating.toFixed(1)}</span>
      </div>
    );
  };

  const handleRatingSubmit = async () => {
    if (userRating === 0) {
      toast.error('Please select a rating');
      return;
    }

    setIsSubmittingRating(true);
    
    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/marketplace/rate/${id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ rating: userRating }),
        }
      );

      if (response.ok) {
        toast.success('Thank you for your rating!');
        setShowRatingModal(false);
        
        if (onRatingSubmit) {
          onRatingSubmit(id, userRating);
        }
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit rating');
      }    } catch (error: any) {
      toast.error(error.message || 'Failed to submit rating');
    } finally {
      setIsSubmittingRating(false);
    }
  };return (
    <>
      <div className="group relative bg-gradient-to-br from-gray-900/50 to-gray-800/30 backdrop-blur-sm border border-gray-700/50 rounded-xl overflow-hidden hover:border-blue-500/40 transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full shadow-lg hover:shadow-xl hover:shadow-blue-900/20">
        {/* Subtle animated accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute -inset-1 bg-grid-pattern opacity-0 group-hover:opacity-10 transition-opacity"></div>
        <div className="absolute -inset-px bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500"></div>
        
        <div className="p-3.5 sm:p-4.5 lg:p-6 flex flex-col flex-grow relative z-10">          <div className="flex flex-col gap-1">
            {/* Category as a very small badge above the title */}
            <div className="self-start bg-gradient-to-r from-blue-600/30 to-purple-600/20 border border-blue-500/30 text-blue-300 px-1.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-medium whitespace-nowrap backdrop-blur-sm group-hover:border-blue-400/40 transition-colors">
              {category}
            </div>
            
            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-white break-words group-hover:text-blue-400 transition-colors">{title}</h3>
              <p className="text-xs sm:text-sm text-gray-400 mt-1 flex items-center">
                <span className="text-gray-500 mr-1">by</span> 
                <span className="text-blue-400 hover:underline cursor-pointer truncate group-hover:text-blue-300 transition-colors">{username || owner}</span>
              </p>
            </div>
          </div>

          <div className="mt-3 sm:mt-3.5 flex items-center">
            {renderStars()}
          </div>

          <p className="mt-3 sm:mt-3.5 text-gray-300 text-sm leading-relaxed line-clamp-2 sm:line-clamp-3 group-hover:text-gray-200 transition-colors">
            {description}
          </p>

          <div className="mt-3.5 sm:mt-4.5 mb-3.5 sm:mb-4.5 flex flex-wrap gap-2">
            {tags.slice(0, 3).map((tag, index) => (
              <span 
                key={`extension-${id}-tag-${index}-${tag}`}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-gray-700/40 to-gray-600/30 border border-gray-600/30 text-gray-300 px-2 py-1 rounded-md text-xs backdrop-blur-sm hover:border-gray-500/40 transition-all transform group-hover:scale-105"
              >
                <Tag size={10} className="sm:w-3 sm:h-3 text-purple-400" />
                <span className="truncate max-w-20 sm:max-w-none">{tag}</span>
              </span>
            ))}
            {tags.length > 3 && (
              <span className="inline-flex items-center bg-gradient-to-r from-gray-700/40 to-gray-600/30 border border-gray-600/30 text-gray-400 px-2 py-1 rounded-md text-xs backdrop-blur-sm hover:border-gray-500/40 transition-all">
                +{tags.length - 3}
              </span>
            )}
          </div>

          <div className="mt-auto pt-3 border-t border-gray-700/30 flex flex-col space-y-2.5 sm:space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs sm:text-sm text-gray-400 italic">
                {formatDate(createdAt)}
              </div>
              <div>
                {price === 0 ? (
                  <span className="px-2.5 py-1 bg-green-500/20 text-green-400 font-medium text-sm sm:text-base rounded-md">Free</span>
                ) : (
                  <span className="px-2.5 py-1 bg-blue-500/20 rounded-md font-semibold text-white text-sm sm:text-base">{price} <span className="text-xs text-blue-400">CODON</span></span>
                )}
              </div>
            </div>
              <div className="flex justify-end gap-2">
              {/* If custom action buttons are provided, render those instead */}
              {customActionButtons ? (
                <>{customActionButtons}</>              ) : isPurchased ? (
                <div className="flex flex-wrap gap-2 justify-end max-w-full overflow-hidden">
                    {onRatingSubmit && (
                      <button
                        onClick={() => setShowRatingModal(true)}
                        className="flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg text-xs font-medium 
                          bg-gradient-to-r from-yellow-600/90 to-yellow-500/80 hover:from-yellow-600 hover:to-yellow-500 text-white transition-all duration-300 min-h-[36px] border border-yellow-500/30 shadow-md shadow-yellow-900/20 whitespace-nowrap"
                      >
                        <Star size={14} className="text-yellow-200" />
                        <span>Rate</span>
                      </button>
                    )}
                    
                    {canDownload && onDownloadClick && (
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onDownloadClick();
                        }}
                        disabled={isDownloading}
                        className="flex items-center justify-center gap-1 bg-gradient-to-r from-blue-600/90 to-blue-500/80 hover:from-blue-600 hover:to-blue-500 disabled:from-blue-800/50 disabled:to-blue-700/40 text-white px-3 py-1.5 rounded-lg text-xs transition-all duration-300 min-h-[36px] border border-blue-500/30 shadow-md shadow-blue-900/20 whitespace-nowrap"
                        title="Download extension"
                      >
                        {isDownloading ? (
                          <>
                            <div className="animate-spin rounded-full h-3 w-3 border-t border-b border-white"></div>
                            <span>Downloading...</span>
                          </>
                        ) : (
                          <>
                            <Download size={14} />
                            <span>Download</span>
                          </>
                        )}
                      </button>
                    )}                </div>              ) : ownedByCurrentUser ? (                <button
                  disabled={true}
                  className="flex items-center justify-center space-x-1 bg-gradient-to-r from-purple-600/40 to-blue-500/30 text-blue-300 px-4 py-2 sm:py-2 rounded-lg text-sm font-medium min-h-[44px] sm:min-h-0 w-full sm:w-auto border border-blue-600/30 cursor-not-allowed"
                >
                  <span>Owned by You</span>
                </button>
              ) : (
                <button                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onPurchaseClick(id);
                  }}
                  className="flex items-center justify-center space-x-1 bg-gradient-to-r from-purple-600/90 to-purple-500/80 hover:from-purple-600 hover:to-purple-500 text-white px-4 py-2 sm:py-2 rounded-lg text-sm font-medium transition-all duration-300 min-h-[44px] sm:min-h-0 w-full sm:w-auto border border-purple-500/30 shadow-md shadow-purple-900/20"
                >
                  <span>{price === 0 ? 'Get Free' : 'Buy'}</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>      {showRatingModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-4">
          <div className="bg-gradient-to-br from-gray-900/95 to-gray-800/90 backdrop-blur-xl p-4 sm:p-6 rounded-2xl shadow-2xl border border-gray-700/50 max-w-sm sm:max-w-md w-full mx-auto max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-5">
              <h3 className="text-lg sm:text-xl font-bold text-white">Rate this Extension</h3>
              <button 
                onClick={() => setShowRatingModal(false)}
                className="p-2 hover:bg-gray-800/50 rounded-lg transition-all duration-200 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:p-1 flex items-center justify-center border-gray-700/30 hover:border-gray-600/50"
              >
                <X size={20} className="text-gray-400 hover:text-gray-300" />
              </button>
            </div>
            
            <p className="text-gray-300 mb-6 text-sm sm:text-base">How would you rate {title}?</p>
            
            <div className="flex justify-center mb-6 gap-1 sm:gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={`rating-star-${star}`}
                  onClick={() => setUserRating(star)}
                  className="focus:outline-none p-1 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center hover:scale-110 transition-transform duration-200"
                >
                  <Star 
                    className={`w-6 h-6 sm:w-8 sm:h-8 transition-colors duration-200 ${
                      userRating >= star 
                        ? 'text-yellow-400 fill-yellow-400 drop-shadow-sm' 
                        : 'text-gray-500 hover:text-gray-400'
                    }`}
                  />
                </button>
              ))}
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handleRatingSubmit}
                disabled={isSubmittingRating || userRating === 0}
                className={`py-3 px-6 sm:py-2 rounded-lg font-medium text-white w-full sm:w-auto min-h-[44px] text-sm sm:text-base transition-all duration-300 border ${
                  isSubmittingRating || userRating === 0
                    ? 'bg-gray-700/50 cursor-not-allowed border-gray-600/30' 
                    : 'bg-gradient-to-r from-blue-600/90 to-blue-500/80 hover:from-blue-600 hover:to-blue-500 border-blue-500/30 shadow-lg shadow-blue-900/20'
                }`}
              >
                {isSubmittingRating ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ExtensionCardWrapper;
