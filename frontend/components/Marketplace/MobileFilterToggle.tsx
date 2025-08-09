'use client';

import React from 'react';
import { Filter, ArrowUpDown, X } from 'lucide-react';

interface MobileFilterToggleProps {
  showMobileFilters: boolean;
  setShowMobileFilters: (value: boolean) => void;
  searchTerm: string;
  selectedCategory: string;
  setSearchTerm: (value: string) => void;
  setSelectedCategory: (value: string) => void;
}

const MobileFilterToggle: React.FC<MobileFilterToggleProps> = ({
  showMobileFilters,
  setShowMobileFilters,
  searchTerm,
  selectedCategory,
  setSearchTerm,
  setSelectedCategory
}) => {  return (
    <div className="lg:hidden mb-4 sm:mb-6">
      <button
        onClick={() => setShowMobileFilters(!showMobileFilters)}
        className="group w-full flex items-center justify-between px-5 sm:px-6 py-4 bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700/60 rounded-xl text-white hover:from-gray-700/60 hover:to-gray-800/60 transition-all duration-300 shadow-lg hover:shadow-blue-900/10 min-h-[56px] relative overflow-hidden"
      >
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute -inset-1 bg-grid-pattern opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
        
        <div className="flex items-center gap-3 relative z-10">
          <div className="bg-gradient-to-br from-purple-500/20 to-blue-500/20 p-2 rounded-lg">
            <Filter className="w-5 h-5 text-purple-400 group-hover:text-purple-300 transition-colors duration-300" />
          </div>
          <div className="text-left">
            <span className="font-medium text-base group-hover:text-blue-100 transition-colors duration-300">Filters & Search</span>
            {(searchTerm || selectedCategory) && (
              <div className="text-xs text-gray-400 mt-0.5 group-hover:text-gray-300 transition-colors duration-300">
                {searchTerm && `"${searchTerm}"`} {selectedCategory && `in ${selectedCategory}`}
              </div>
            )}
          </div>
          {(searchTerm || selectedCategory) && (
            <span className="bg-gradient-to-r from-blue-600/80 to-blue-500/80 text-white text-xs px-2.5 py-1 rounded-full font-medium border border-blue-400/30 shadow-inner shadow-blue-500/20">
              Active
            </span>
          )}
        </div>
        <ArrowUpDown className={`w-5 h-5 transition-transform duration-300 text-blue-400 group-hover:text-blue-300 ${showMobileFilters ? 'rotate-180' : ''}`} />
      </button>
      
      {/* Quick Filter Pills for Mobile */}
      {!showMobileFilters && (searchTerm || selectedCategory) && (
        <div className="mt-3.5 flex flex-wrap gap-2.5 animate-fadeIn">
          {searchTerm && (
            <span className="group inline-flex items-center gap-1.5 bg-gradient-to-r from-blue-600/30 to-blue-500/20 text-blue-300 px-3.5 py-1.5 rounded-full text-sm border border-blue-500/40 shadow-sm shadow-blue-900/10 transition-all duration-200">
              <span className="opacity-70 mr-0.5 text-xs">Search:</span> "{searchTerm}"
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchTerm('');
                }}
                className="hover:text-blue-100 ml-1 p-1 hover:bg-blue-500/30 rounded-full transition-all duration-200"
              >
                <X size={14} className="transform hover:rotate-90 transition-transform duration-200" />
              </button>
            </span>
          )}
          {selectedCategory && (
            <span className="group inline-flex items-center gap-1.5 bg-gradient-to-r from-purple-600/30 to-purple-500/20 text-purple-300 px-3.5 py-1.5 rounded-full text-sm border border-purple-500/40 shadow-sm shadow-purple-900/10 transition-all duration-200">
              <span className="opacity-70 mr-0.5 text-xs">Category:</span> {selectedCategory}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCategory('');
                }}
                className="hover:text-purple-100 ml-1 p-1 hover:bg-purple-500/30 rounded-full transition-all duration-200"
              >
                <X size={14} className="transform hover:rotate-90 transition-transform duration-200" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileFilterToggle;
