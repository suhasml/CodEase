'use client';

import React from 'react';

interface ProcessingOverlayProps {
  isVisible: boolean;
  message?: string;
}

const ProcessingOverlay: React.FC<ProcessingOverlayProps> = ({
  isVisible,
  message = 'Processing Extension'
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center">
      <div className="bg-[#111] p-8 rounded-xl shadow-2xl border border-gray-800 max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <div className="w-14 h-14 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></div>
        </div>
        <h3 className="text-xl font-bold text-center text-white mb-3">{message}</h3>
        <div className="space-y-4">
          <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
            <div className="bg-blue-500 h-full w-2/3 animate-pulse rounded-full"></div>
          </div>
          <p className="text-gray-300 text-center">
            Please wait while we analyze your extension and prepare the debugging environment...
          </p>
          <div className="flex justify-center mt-2">
            <div className="inline-flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProcessingOverlay;