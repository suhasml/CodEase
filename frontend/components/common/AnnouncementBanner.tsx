'use client'

import React, { useState, useEffect } from 'react';
import { X, Share2, Users, Globe } from 'lucide-react';

const AnnouncementBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    // Check if user has dismissed this announcement before
    const dismissalData = localStorage.getItem('codease-share-announcement-v1');
    
    if (!dismissalData) {
      // Show banner after a brief delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true);
        // Set CSS variable for header positioning - different heights for mobile vs desktop
        const isMobile = window.innerWidth < 640; // sm breakpoint
        const height = isMobile ? '48px' : '52px';
        document.documentElement.style.setProperty('--announcement-height', height);
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      try {
        const { timestamp } = JSON.parse(dismissalData);
        const currentTime = Date.now();
        const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds
        
        // If more than 1 hour has passed, show the banner again
        if (currentTime - timestamp > oneHour) {
          const timer = setTimeout(() => {
            setIsVisible(true);
            // Set CSS variable for header positioning - different heights for mobile vs desktop
            const isMobile = window.innerWidth < 640; // sm breakpoint
            const height = isMobile ? '48px' : '52px';
            document.documentElement.style.setProperty('--announcement-height', height);
          }, 1000);
          
          return () => clearTimeout(timer);
        }
      } catch (error) {
        // If parsing fails (old format), treat as if not dismissed
        const timer = setTimeout(() => {
          setIsVisible(true);
          // Set CSS variable for header positioning - different heights for mobile vs desktop
          const isMobile = window.innerWidth < 640; // sm breakpoint
          const height = isMobile ? '48px' : '52px';
          document.documentElement.style.setProperty('--announcement-height', height);
        }, 1000);
        
        return () => clearTimeout(timer);
      }
    }
  }, []);

  // Update CSS variable when banner visibility changes
  useEffect(() => {
    const updateHeight = () => {
      if (isVisible && !isAnimatingOut) {
        const isMobile = window.innerWidth < 640; // sm breakpoint
        const height = isMobile ? '48px' : '52px';
        document.documentElement.style.setProperty('--announcement-height', height);
      } else {
        document.documentElement.style.setProperty('--announcement-height', '0px');
      }
    };

    updateHeight();

    // Update height on window resize
    window.addEventListener('resize', updateHeight);
    
    return () => {
      window.removeEventListener('resize', updateHeight);
    };
  }, [isVisible, isAnimatingOut]);

  const handleDismiss = () => {
    setIsAnimatingOut(true);
    
    // Store dismissal with timestamp in localStorage
    const dismissalData = {
      dismissed: true,
      timestamp: Date.now()
    };
    localStorage.setItem('codease-share-announcement-v1', JSON.stringify(dismissalData));
    
    // Update CSS variable immediately when dismissing
    document.documentElement.style.setProperty('--announcement-height', '0px');
    
    // Hide after animation completes
    setTimeout(() => {
      setIsVisible(false);
      setIsAnimatingOut(false);
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className={`
      fixed top-0 left-0 right-0 z-[60] 
      bg-gradient-to-r from-gray-900/95 to-gray-800/95 backdrop-blur-md 
      border-b border-gray-700/50 shadow-lg shadow-blue-500/10
      transform transition-all duration-300 ease-out
      ${isAnimatingOut ? 'translate-y-[-100%] opacity-0' : 'translate-y-0 opacity-100'}
    `}>
      <div className="container mx-auto px-4 py-2 sm:py-3">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          {/* Announcement content */}
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1">
            {/* Animated share icon */}
            <div className="relative">
              <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 animate-pulse" />
              <div className="absolute inset-0 w-4 h-4 sm:w-5 sm:h-5 text-cyan-400 animate-ping opacity-20">
                <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
            </div>
            
            {/* Main announcement text */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2">
              <span className="text-xs sm:text-sm font-semibold text-white">
                🚀 Share Your Extensions!
              </span>
              <span className="text-[10px] sm:text-xs text-gray-300">
                You can now share your generated extensions with the public
              </span>
            </div>

            {/* Feature icons - hidden on mobile for space */}
            <div className="hidden md:flex items-center space-x-4 ml-6">
              <div className="flex items-center space-x-1.5 bg-blue-500/10 px-2 py-1 rounded-full">
                <Globe className="w-3 h-3 text-blue-400" />
                <span className="text-xs text-blue-300 font-medium">Public</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-purple-500/10 px-2 py-1 rounded-full">
                <Users className="w-3 h-3 text-purple-400" />
                <span className="text-xs text-purple-300 font-medium">Community</span>
              </div>
              <div className="flex items-center space-x-1.5 bg-green-500/10 px-2 py-1 rounded-full">
                <Share2 className="w-3 h-3 text-green-400" />
                <span className="text-xs text-green-300 font-medium">Share</span>
              </div>
            </div>
          </div>

          {/* Dismiss button */}
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={handleDismiss}
              className="p-1.5 text-gray-400 hover:text-white transition-colors duration-200 
                       hover:bg-gray-700/50 rounded-full group"
              aria-label="Dismiss announcement"
            >
              <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
