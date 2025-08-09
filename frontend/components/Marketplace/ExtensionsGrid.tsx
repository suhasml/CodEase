'use client';

import React from 'react';
import { X, Package } from 'lucide-react';
import ExtensionCardWrapper from './ExtensionCardWrapper';
import { ExtensionsGridProps } from './types';

const ExtensionsGrid: React.FC<ExtensionsGridProps> = ({
  isLoading,
  filteredExtensions,
  extensions,
  downloadingExtensions,
  selectedCategory,
  searchTerm,
  clearFilters,
  handlePurchaseClick,
  handleRatingSubmit,
  handleDownloadExtension,
  setError,
  renderActions,
  customEmptyState,
  pagination,
  isLoadingMore,
  onLoadMore
}) => {if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 sm:py-24 relative">
        {/* Loading background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/5 to-purple-900/5 rounded-2xl"></div>
        <div className="absolute w-32 h-32 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        
        <div className="relative z-10 mb-5 flex flex-col items-center">
          {/* Enhanced loader with gradient border */}
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-[spin_3s_linear_infinite] blur-[3px]"></div>
            <div className="absolute inset-[3px] rounded-full bg-gray-900 flex items-center justify-center">
              <div className="w-5 h-5 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-bounce"></div>
            </div>
          </div>
          <p className="text-gray-300 text-sm sm:text-base font-medium animate-pulse">Loading amazing extensions...</p>
        </div>
      </div>
    );
  }
    if (filteredExtensions.length > 0) {
    return (
      <>
        {/* Responsive Grid with Optimized Spacing and Animation */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 4xl:grid-cols-6 gap-4 sm:gap-5 lg:gap-6 xl:gap-7 relative">
          {/* Grid background effects */}
          <div className="absolute -inset-6 bg-gradient-to-br from-blue-600/5 to-purple-600/5 rounded-3xl -z-10 blur-xl"></div>
              {filteredExtensions.map((extension, index) => {
            return (
              <div key={`marketplace-extension-${extension.extension_id || extension.id || index}`} 
                   className="animate-fadeIn" 
                   style={{
                     animationDelay: `${index * 50}ms`,
                     animationFillMode: 'both'
                   }}>
                <ExtensionCardWrapper
                  id={extension.id}
                  title={extension.title}
                  description={extension.description}
                  owner={extension.owner}
                  username={extension.username}
                  price={extension.price_codon}
                  rating={extension.rating}
                  category={extension.category}                            tags={extension.tags}
                  isPurchased={extension.purchased}
                  ownedByCurrentUser={extension.owned_by_current_user}
                  onPurchaseClick={handlePurchaseClick}                                
                  onRatingSubmit={(id: string, rating: number) => {
                    try {
                      handleRatingSubmit(id, rating);
                    } catch (error) {
                      setError('Failed to submit rating. Please try again.');
                    }
                  }}
                  createdAt={extension.created_at}
                  canDownload={extension.purchased && !!extension.access_key && !!extension.resource_identifier}
                  onDownloadClick={() => handleDownloadExtension(extension)}
                  isDownloading={downloadingExtensions.has(extension.id)}
                  customActionButtons={renderActions ? renderActions(extension) : undefined}
                />              </div>            );
          })}
        </div>
        
        {/* Clear Filters Button when filters are active */}
        {(searchTerm || selectedCategory) && (
          <div className="flex justify-center mt-6">
            <button
              onClick={clearFilters}
              className="group py-2.5 px-6 bg-gradient-to-r from-purple-600/90 to-purple-700/80 hover:from-purple-500 hover:to-purple-600 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-all duration-300 shadow-lg hover:shadow-purple-900/30 relative overflow-hidden"
            >
              {/* Button effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-purple-300/10 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="absolute -inset-1 bg-purple-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
              
              <X size={14} className="relative z-10 transform group-hover:rotate-90 transition-transform duration-300" />
              <span className="relative z-10">Clear Filters</span>
            </button>
          </div>
        )}
        
          {/* Load More Button */}
        {pagination && onLoadMore && pagination.currentPage < pagination.totalPages && !(searchTerm || selectedCategory) && (
          <div className="flex justify-center mt-8">
            <button
              onClick={onLoadMore}
              disabled={isLoadingMore}
              className="group py-3.5 px-8 bg-gradient-to-r from-blue-600/90 to-blue-700/80 hover:from-blue-500 hover:to-blue-600 disabled:from-gray-600/90 disabled:to-gray-700/80 text-white rounded-xl flex items-center gap-3 text-sm sm:text-base font-medium transition-all duration-300 shadow-lg hover:shadow-blue-900/30 disabled:hover:shadow-none relative overflow-hidden disabled:cursor-not-allowed"
            >
              {/* Button effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-300/10 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
              <div className="absolute -inset-1 bg-blue-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
              
              {isLoadingMore ? (
                <>
                  <div className="relative z-10 w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span className="relative z-10">Loading...</span>
                </>
              ) : (
                <>
                  <span className="relative z-10">Load More Extensions</span>
                  <span className="relative z-10 text-xs bg-white/20 px-2 py-1 rounded-full">
                    {pagination.currentPage} of {pagination.totalPages}
                  </span>
                </>
              )}
            </button>
          </div>
        )}
      </>
    );
  }// Enhanced empty state with better visuals
  return (
    <div className="flex flex-col items-center justify-center py-16 sm:py-24 bg-gradient-to-b from-gray-800/30 to-gray-900/20 border border-gray-700/60 rounded-2xl relative overflow-hidden group">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 group-hover:opacity-10 transition-opacity duration-500"></div>
      <div className="absolute -inset-px bg-gradient-to-r from-blue-500/3 to-purple-500/3 opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500"></div>
      <div className="absolute w-96 h-96 rounded-full bg-gradient-to-b from-blue-900/10 to-transparent blur-3xl opacity-60"></div>
      
      {/* Icon container with animated gradient */}
      <div className="relative mb-8 transform group-hover:scale-105 transition-transform duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 rounded-full blur-md animate-pulse"></div>
        <div className="relative bg-gradient-to-b from-gray-700/60 to-gray-800/60 border border-gray-600/30 p-6 rounded-full backdrop-blur-sm shadow-xl">
          {customEmptyState?.icon || <Package className="w-14 h-14 sm:w-18 sm:h-18 text-gray-400 animate-float" />}
        </div>
      </div>
      
      <h3 className="text-xl sm:text-2xl font-bold text-transparent bg-gradient-to-r from-white to-blue-100 bg-clip-text mb-4">
        {customEmptyState?.title || "No extensions found"}
      </h3>
      
      <p className="text-gray-300 text-sm sm:text-base text-center px-6 max-w-md leading-relaxed">
        {customEmptyState?.description || 
          (searchTerm || selectedCategory 
            ? "Try adjusting your search terms or filters to find what you're looking for"
            : "Be the first to publish an extension to the marketplace!"
          )
        }
      </p>
      
      {(searchTerm || selectedCategory) && (
        <button
          onClick={clearFilters}
          className="group mt-8 py-3.5 px-7 bg-gradient-to-r from-blue-600/90 to-blue-700/80 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl flex items-center gap-3 text-sm sm:text-base font-medium transition-all duration-300 shadow-lg hover:shadow-blue-900/30 relative overflow-hidden"
        >
          {/* Button effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-300/10 opacity-0 group-hover:opacity-50 transition-opacity duration-300"></div>
          <div className="absolute -inset-1 bg-blue-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500"></div>
          
          <X size={16} className="relative z-10 transform group-hover:rotate-90 transition-transform duration-300" />
          <span className="relative z-10">Clear All Filters</span>
        </button>
      )}
    </div>
  );
};

export default ExtensionsGrid;
