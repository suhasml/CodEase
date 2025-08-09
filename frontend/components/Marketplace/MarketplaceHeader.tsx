'use client';

import React from 'react';
import { Store, ArrowLeft, MessageSquare, Grid, User, AlertCircle, X } from 'lucide-react';
import { MarketplaceHeaderProps } from './types';

const MarketplaceHeader: React.FC<MarketplaceHeaderProps> = ({
  extensionsCount,
  publishExtensionId,
  router,
  error,
  setError,
  activeTab,
  setActiveTab
}) => {
  return (
    <>
      {/* Error Banner */}
      {error && (
        <div className="mb-4 sm:mb-6 p-4 sm:p-5 bg-red-900/20 border border-red-800 rounded-xl">
          <div className="flex items-start gap-3">
            <div className="text-red-400 mt-0.5 flex-shrink-0">
              <AlertCircle size={20} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-red-400 text-sm sm:text-base break-words">{error}</p>
              <p className="text-xs sm:text-sm text-red-500/80 mt-1">
                Please try again in a while. If the issue persists, contact support.
              </p>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-500 hover:text-red-400 flex-shrink-0 p-1 rounded-md hover:bg-red-900/30 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      )}
      
      {/* Enhanced Mobile-First Header */}
      <div className="space-y-4 sm:space-y-6 mb-6 sm:mb-8">
        {/* Title Section */}
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-2 sm:mb-3">
            Extension Marketplace
          </h1>
          <p className="text-gray-400 text-sm sm:text-base lg:text-lg leading-relaxed">
            Discover and purchase Chrome extensions created by the CodEase community
          </p>
        </div>
        
        {/* Stats and Navigation - Improved Mobile Layout */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
          {/* Stats Badge */}
          <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-xl px-4 py-3 text-white flex items-center justify-center sm:justify-start text-sm sm:text-base">
            <Store className="w-5 h-5 mr-3 text-purple-400 flex-shrink-0" />
            <span className="font-medium">{extensionsCount} Extensions Available</span>
          </div>
          
          {/* Back to Chat Button - Enhanced Mobile Design */}
          <button 
            onClick={() => router.push(`/chat/${publishExtensionId || ''}`)}
            className="flex items-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl text-white transition-all duration-200 text-sm sm:text-base font-medium shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 min-h-[48px]"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            <MessageSquare className="w-4 h-4 flex-shrink-0" />
            <span>Back to Chat</span>
          </button>
        </div>
      </div>
      
      {/* Enhanced Mobile-First Tab Navigation */}
      <div className="mb-6 sm:mb-8">
        <div className="flex border-b border-gray-800 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 font-medium text-sm sm:text-base whitespace-nowrap transition-all duration-200 min-h-[48px] ${
              activeTab === 'browse' 
                ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/5' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <Grid size={18} className="sm:w-5 sm:h-5" />
            <span>Browse Extensions</span>
          </button>
          <button
            onClick={() => setActiveTab('my-extensions')}
            className={`px-4 sm:px-6 py-3 sm:py-4 flex items-center gap-2 sm:gap-3 font-medium text-sm sm:text-base whitespace-nowrap transition-all duration-200 min-h-[48px] ${
              activeTab === 'my-extensions' 
                ? 'text-blue-400 border-b-2 border-blue-500 bg-blue-500/5' 
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            <User size={18} className="sm:w-5 sm:h-5" />
            <span>My Published Extensions</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default MarketplaceHeader;
