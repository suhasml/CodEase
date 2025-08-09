'use client';

import React from 'react';
import { Search, ArrowUpDown, Tag, X } from 'lucide-react';
import { FilterPanelProps } from './types';

const FilterPanel: React.FC<FilterPanelProps> = ({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
  categories,
  clearFilters,
  showMobileFilters,
  setShowMobileFilters
}) => {  return (    <div className={`w-full lg:w-64 xl:w-72 2xl:w-80 3xl:w-84 shrink-0 ${showMobileFilters ? 'block' : 'hidden lg:block'} relative z-20`}>
      <div className="bg-gradient-to-b from-gray-800/40 to-gray-900/30 border border-gray-700/60 rounded-xl p-5 sm:p-6 backdrop-blur-md shadow-xl relative group overflow-hidden transition-all duration-300 hover:border-gray-600/70">
        {/* Animated Accent */}
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700 pointer-events-none"></div>
        <div className="absolute -inset-1 bg-grid-pattern opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"></div>
          {/* Search Section */}
        <div className="mb-6 relative z-30">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
            <div className="bg-blue-500/20 p-2 rounded-lg mr-3">
              <Search className="w-5 h-5 text-blue-400" />
            </div>
            <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Search Extensions</span>
          </h3>
          <div className="relative group/search z-30">
            <div className="absolute left-0 right-0 top-0 bottom-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-xl opacity-0 group-focus-within/search:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within/search:text-blue-400 transition-colors duration-300 pointer-events-none z-10" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Find your perfect extension..."
              className="w-full bg-black/40 border border-gray-600/70 rounded-xl py-3 sm:py-3.5 pl-12 pr-12 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/30 text-sm sm:text-base transition-all duration-200 min-h-[48px] shadow-inner group-hover/search:bg-black/50 relative z-20"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200 p-1 hover:bg-gray-700/50 rounded-full z-30"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>        {/* Sort By Section */}
        <div className="mb-6 relative z-30">
          <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
            <div className="bg-purple-500/20 p-1.5 rounded-lg mr-2">
              <ArrowUpDown className="w-4 h-4 text-purple-400" />
            </div>
            <span className="bg-gradient-to-r from-white to-purple-100 bg-clip-text text-transparent">Sort By</span>
          </h4>
          <div className="relative group/sort z-30">
            <div className="absolute left-0 right-0 top-0 bottom-0 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-xl opacity-0 group-focus-within/sort:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full bg-black/40 border border-gray-600/70 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/30 text-sm sm:text-base transition-all duration-200 min-h-[48px] shadow-inner appearance-none group-hover/sort:bg-black/50 relative z-20"
            >
              <option value="created_at">Newest First</option>
              <option value="popularity">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
            </select>
            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none z-10">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </div>
          </div>
        </div>        {/* Enhanced Categories Section */}        <div className="mb-6 relative z-30">
          <h4 className="text-sm font-semibold text-gray-300 mb-4 flex items-center">
            <div className="bg-blue-500/20 p-1.5 rounded-lg mr-2">
              <Tag className="w-4 h-4 text-blue-400" />
            </div>
            <span className="bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">Categories</span>
          </h4>
          <div className="space-y-2 pr-1 relative z-20">{/* All Categories option */}
            <button 
              onClick={() => setSelectedCategory("")}
              className={`group w-full text-left px-4 py-3 rounded-lg flex justify-between items-center transition-all duration-300 text-sm sm:text-base min-h-[44px] relative overflow-hidden z-10 ${
                selectedCategory === "" 
                  ? 'bg-gradient-to-r from-blue-600/30 to-blue-500/20 text-blue-300 border border-blue-500/40 shadow-lg shadow-blue-900/10' 
                  : 'hover:bg-gray-700/50 text-gray-300 hover:text-white border border-transparent hover:border-gray-600/50'
              }`}
            >
              {/* Hover effect */}
              <div className={`absolute inset-0 bg-gradient-to-r from-blue-600/10 to-blue-500/5 opacity-0 ${selectedCategory === "" ? 'opacity-100' : 'group-hover:opacity-50'} transition-opacity duration-300 pointer-events-none`}></div>
              
              <span className="font-medium relative z-10">All Categories</span>
              {selectedCategory === "" && (
                <div className="bg-blue-500/30 p-1 rounded-full relative z-10">
                  <Tag size={16} className="text-blue-300" />
                </div>
              )}
            </button>
              {/* Category List */}
            {categories.map((category) => (
              <button 
                key={`category-${category}`}
                onClick={() => setSelectedCategory(category)}
                className={`group w-full text-left px-4 py-3 rounded-lg flex justify-between items-center transition-all duration-300 text-sm sm:text-base min-h-[44px] relative overflow-hidden z-10 ${
                  selectedCategory === category 
                    ? 'bg-gradient-to-r from-blue-600/30 to-blue-500/20 text-blue-300 border border-blue-500/40 shadow-lg shadow-blue-900/10' 
                    : 'hover:bg-gray-700/50 text-gray-300 hover:text-white border border-transparent hover:border-gray-600/50'
                }`}
              >
                {/* Hover effect */}
                <div className={`absolute inset-0 bg-gradient-to-r from-blue-600/10 to-blue-500/5 opacity-0 ${selectedCategory === category ? 'opacity-100' : 'group-hover:opacity-50'} transition-opacity duration-300 pointer-events-none`}></div>
                
                <span className="truncate font-medium relative z-10">{category}</span>
                {selectedCategory === category && (
                  <div className="bg-blue-500/30 p-1 rounded-full relative z-10">
                    <Tag size={16} className="text-blue-300" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>        {/* Clear Filters */}
        {(searchTerm || selectedCategory) && (
          <button
            onClick={clearFilters}
            className="group w-full py-3 px-4 bg-gradient-to-r from-red-600/20 to-red-700/20 hover:from-red-600/30 hover:to-red-700/30 text-red-400 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 text-sm sm:text-base border border-red-500/30 min-h-[48px] relative overflow-hidden hover:shadow-lg hover:shadow-red-900/10 hover:text-red-300 z-20"
          >
            {/* Hover effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-600/10 to-red-500/5 opacity-0 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none"></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              <X size={16} className="group-hover:rotate-90 transition-transform duration-300" />
              <span>Clear All Filters</span>
            </span>
          </button>
        )}        {/* Mobile: Apply Filters Button */}
        <div className="lg:hidden mt-6 pt-6 border-t border-gray-700/60 relative z-20">
          <button
            onClick={() => setShowMobileFilters(false)}
            className="group w-full py-3.5 px-4 bg-gradient-to-r from-blue-600/90 to-blue-700/80 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl transition-all duration-300 text-sm font-medium shadow-lg hover:shadow-blue-900/30 min-h-[48px] relative overflow-hidden z-10"
          >
            {/* Button effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-300/10 opacity-0 group-hover:opacity-50 transition-opacity duration-300 pointer-events-none"></div>
            <div className="absolute -inset-1 bg-blue-500/20 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 pointer-events-none"></div>
            
            <span className="relative flex items-center justify-center gap-2">
              <span className="transform group-hover:-translate-y-px transition-transform duration-200">Apply Filters & View Results</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
