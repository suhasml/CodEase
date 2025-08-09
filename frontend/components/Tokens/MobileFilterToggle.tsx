'use client';

import React from 'react';
import { Filter, Search, X } from 'lucide-react';

interface MobileFilterToggleProps {
  showMobileFilters: boolean;
  setShowMobileFilters: (show: boolean) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filter: 'all' | 'trending';
  setFilter: (filter: 'all' | 'trending') => void;
}

const MobileFilterToggle: React.FC<MobileFilterToggleProps> = ({
  showMobileFilters,
  setShowMobileFilters,
  searchTerm,
  setSearchTerm,
  filter,
  setFilter
}) => {
  return (
    <div className="lg:hidden mb-6">
      {/* Mobile Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search tokens..."
            className="w-full bg-gray-800/60 border border-gray-600/50 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700/50 rounded-full"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Mobile Filter Buttons */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
            filter === 'all'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
              : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-700/60 border border-gray-600/50'
          }`}
        >
          All Tokens
        </button>
        <button
          onClick={() => setFilter('trending')}
          className={`px-4 py-2 rounded-lg font-medium transition-all text-sm ${
            filter === 'trending'
              ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
              : 'bg-gray-800/60 text-gray-400 hover:text-white hover:bg-gray-700/60 border border-gray-600/50'
          }`}
        >
          Trending
        </button>
      </div>

      {/* Mobile Filter Toggle Button */}
      <button
        onClick={() => setShowMobileFilters(!showMobileFilters)}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-gray-800/60 border border-gray-600/50 rounded-lg text-white hover:bg-gray-700/60 transition-all"
      >
        <Filter className="w-4 h-4" />
        <span className="font-medium">
          {showMobileFilters ? 'Hide Filters' : 'Show More Filters'}
        </span>
      </button>
    </div>
  );
};

export default MobileFilterToggle; 