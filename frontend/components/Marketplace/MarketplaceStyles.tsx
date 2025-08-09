'use client';

import React from 'react';

const MarketplaceStyles: React.FC = () => {
  return (
    <style jsx global>{`
      /* Hide scrollbars but keep functionality */
      .scrollbar-hide {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
      .scrollbar-hide::-webkit-scrollbar {
        display: none;
      }
      
      /* Thin scrollbars for filter sections */
      .scrollbar-thin {
        scrollbar-width: thin;
      }
      .scrollbar-thin::-webkit-scrollbar {
        width: 6px;
      }
      .scrollbar-thumb-gray-600::-webkit-scrollbar-thumb {
        background-color: rgb(75 85 99);
        border-radius: 3px;
      }
      .scrollbar-track-gray-800::-webkit-scrollbar-track {
        background-color: rgb(31 41 55);
      }
      
      /* Animations for card and UI elements */
      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0); }
        50% { transform: translateY(-10px); }
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 0.6; transform: scale(1); }
        50% { opacity: 1; transform: scale(1.05); }
      }
      
      @keyframes shimmer {
        0% { background-position: -1000px 0; }
        100% { background-position: 1000px 0; }
      }
      
      .animate-fadeIn {
        animation: fadeIn 0.6s ease-out forwards;
      }
      
      .animate-float {
        animation: float 6s ease-in-out infinite;
      }
      
      .animate-pulse {
        animation: pulse 3s ease-in-out infinite;
      }
      
      /* Background grid pattern */
      .bg-grid-pattern {
        background-image: linear-gradient(to right, rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                          linear-gradient(to bottom, rgba(59, 130, 246, 0.1) 1px, transparent 1px);
        background-size: 20px 20px;
      }
      
      /* Smooth animations for mobile interactions */
      .transition-all {
        transition-property: all;
        transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
      }
      
      /* Enhanced focus styles for accessibility */
      .focus-visible {
        outline: 2px solid rgb(59 130 246);
        outline-offset: 2px;
      }
      
      /* Glass morphism effects */
      .glass-card {
        background: rgba(17, 25, 40, 0.75);
        backdrop-filter: blur(12px);
        border: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      /* Mobile-optimized backdrop blur */
      @supports (backdrop-filter: blur(8px)) {
        .backdrop-blur-sm {
          backdrop-filter: blur(8px);
        }
        .backdrop-blur-md {
          backdrop-filter: blur(12px);
        }
        .backdrop-blur-lg {
          backdrop-filter: blur(16px);
        }
      }
      
      /* Enhanced card hover effects */
      .card-hover {
        transition: all 0.3s ease;
      }
      
      .card-hover:hover {
        transform: translateY(-5px);
        box-shadow: 0 10px 25px -5px rgba(30, 64, 175, 0.3);
      }
      
      /* Touch-friendly minimum sizes */
      @media (max-width: 640px) {
        button {
          min-height: 44px;
        }
        input, select {
          min-height: 48px;
        }
      }
    `}</style>
  );
};

export default MarketplaceStyles;
