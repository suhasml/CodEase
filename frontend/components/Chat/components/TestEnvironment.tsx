'use client';

import React, { useState, useEffect } from 'react';
import { X, Maximize2, Minimize2, Play, StopCircle, RefreshCw, AlertCircle, Server, Package, Loader, CheckCircle, Clock } from 'lucide-react';

interface TestEnvironmentProps {
  isVisible: boolean;
  url: string | null;
  isFullScreen: boolean;
  isActive: boolean;
  timeLeft: number | null;
  isLoading: boolean;
  onClose: () => void;
  onToggleFullScreen: () => void;
  formatTimeLeft: (seconds: number | null) => string;
  onStopSession?: () => void; 
  // Add new props for failure state
  testSetupFailed?: boolean;
  failureReason?: string | null;
  onRetry?: () => void;
}

const TestEnvironment: React.FC<TestEnvironmentProps> = ({
  isVisible,
  url,
  isFullScreen,
  isActive,
  timeLeft,
  isLoading,
  onClose,
  onToggleFullScreen,
  formatTimeLeft,
  onStopSession,
  testSetupFailed,
  failureReason,
  onRetry
}) => {
  // Loading stages state
  const [currentStage, setCurrentStage] = useState(0);
  const [showFallbackMessage, setShowFallbackMessage] = useState(false);

  const loadingStages = [
    {
      icon: Server,
      title: "Setting up sandbox environment",
      description: "Initializing secure testing container...",
      duration: 3000
    },
    {
      icon: Package,
      title: "Setting up extension",
      description: "Installing your extension files...",
      duration: 4000
    },
    {
      icon: Loader,
      title: "Loading extension",
      description: "Configuring extension permissions...",
      duration: 3000
    },
    {
      icon: CheckCircle,
      title: "Finalizing setup",
      description: "Almost ready! Preparing test environment...",
      duration: 3000
    }
  ];

  // Handle stage progression
  useEffect(() => {
    if (!isLoading) {
      setCurrentStage(0);
      setShowFallbackMessage(false);
      return;
    }

    const timer = setTimeout(() => {
      if (currentStage < loadingStages.length - 1) {
        setCurrentStage(currentStage + 1);
      } else {
        // After all stages complete, show fallback message after 5 seconds
        setTimeout(() => {
          setShowFallbackMessage(true);
        }, 5000);
      }
    }, loadingStages[currentStage]?.duration || 3000);

    return () => clearTimeout(timer);
  }, [isLoading, currentStage]);

  // Show the loading overlay if the test environment is being set up
  if (isLoading) {
    const CurrentIcon = loadingStages[currentStage]?.icon || Loader;
    const progress = ((currentStage + 1) / loadingStages.length) * 100;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center">
        <div className="bg-[#111] p-8 rounded-xl shadow-2xl border border-gray-800 max-w-lg w-full mx-4">
          {/* Icon and spinner */}
          <div className="flex items-center justify-center mb-6">
            <div className="relative">
              <div className="w-16 h-16 rounded-full border-4 border-t-blue-500 border-r-transparent border-b-blue-500 border-l-transparent animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <CurrentIcon size={24} className="text-blue-400" />
              </div>
            </div>
          </div>

          {/* Stage title */}
          <h3 className="text-xl font-bold text-center text-white mb-2">
            {loadingStages[currentStage]?.title || "Setting Up Test Environment"}
          </h3>

          {/* Stage description */}
          <p className="text-gray-400 text-center text-sm mb-6">
            {loadingStages[currentStage]?.description || "Please wait while we prepare your extension for testing..."}
          </p>

          {/* Progress bar */}
          <div className="space-y-4">
            <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-1000 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            {/* Stage indicators */}
            <div className="flex justify-between items-center">
              {loadingStages.map((stage, index) => {
                const StageIcon = stage.icon;
                const isCompleted = index < currentStage;
                const isCurrent = index === currentStage;
                
                return (
                  <div key={index} className="flex flex-col items-center space-y-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-500 ${
                      isCompleted ? 'bg-green-600 text-white' : 
                      isCurrent ? 'bg-blue-600 text-white' : 
                      'bg-gray-700 text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle size={16} />
                      ) : (
                        <StageIcon size={16} />
                      )}
                    </div>
                    <div className={`text-xs transition-colors duration-500 ${
                      isCompleted ? 'text-green-400' : 
                      isCurrent ? 'text-blue-400' : 
                      'text-gray-500'
                    }`}>
                      Step {index + 1}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Fallback message after all stages */}
            {showFallbackMessage && (
              <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Clock size={16} className="text-yellow-400" />
                  <p className="text-yellow-200 text-sm">
                    Setup is taking longer than usual. Please hold on while we finalize your test environment...
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Show failure state
  // if (testSetupFailed) {
  //   return (
  //     <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center">
  //       <div className="bg-[#111] p-8 rounded-xl shadow-2xl border border-red-800/30 max-w-md w-full">
  //         <div className="flex items-center justify-center mb-6">
  //           <div className="w-16 h-16 rounded-full bg-red-900/20 border border-red-700/30 flex items-center justify-center">
  //             <AlertCircle size={36} className="text-red-500" />
  //           </div>
  //         </div>
  //         <h3 className="text-xl font-bold text-center text-white mb-3">Test Environment Setup Failed</h3>
  //         <div className="space-y-4">
  //           <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
  //             <p className="text-red-300 text-sm">{failureReason || "Failed to set up test environment. This could be due to high server load or a temporary issue."}</p>
  //           </div>
  //           <div className="text-gray-300 text-sm text-center">
  //             Please try again in a few minutes or contact support if this issue persists.
  //           </div>
  //           <div className="flex justify-center space-x-4 pt-2">
  //             <button 
  //               onClick={onClose}
  //               className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center"
  //             >
  //               <X size={16} className="mr-2" />
  //               Close
  //             </button>
  //             {onRetry && (
  //               <button 
  //                 onClick={onRetry}
  //                 className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
  //               >
  //                 <RefreshCw size={16} className="mr-2" />
  //                 Retry
  //               </button>
  //             )}
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  // Update the failure state UI to use onStopSession for close button instead of onClose

// Show failure state
if (testSetupFailed) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center">
      <div className="bg-[#111] p-8 rounded-xl shadow-2xl border border-red-800/30 max-w-md w-full">
        <div className="flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-red-900/20 border border-red-700/30 flex items-center justify-center">
            <AlertCircle size={36} className="text-red-500" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-center text-white mb-3">Test Environment Setup Failed</h3>
        <div className="space-y-4">
          <div className="p-4 bg-red-900/20 border border-red-700/30 rounded-lg">
            <p className="text-red-300 text-sm">{failureReason || "Failed to set up test environment. This could be due to high server load or a temporary issue."}</p>
          </div>
          <div className="text-gray-300 text-sm text-center">
            Please try again in a few minutes or contact support if this issue persists.
          </div>
          <div className="flex justify-center space-x-4 pt-2">
            <button 
              onClick={onStopSession || onClose} // Use onStopSession if available, otherwise fall back to onClose
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center"
            >
              <X size={16} className="mr-2" />
              Close
            </button>
            {onRetry && (
              <button 
                onClick={onRetry}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center"
              >
                <RefreshCw size={16} className="mr-2" />
                Retry
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

  // Show the test frame
  if (isVisible && url) {
    return (
      <div className={`fixed z-50 transition-all duration-300 bg-black/80 backdrop-blur-md ${
        isFullScreen 
          ? 'inset-0' 
          : 'top-[10%] left-[10%] right-[10%] bottom-[10%]'
      }`}>
        {/* Move timer to top left */}
        {isActive && timeLeft !== null && (
          <div className="absolute top-2 left-2 z-10">
            <div className="px-3 py-1.5 bg-gray-800/90 backdrop-blur-sm rounded-full flex items-center">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse mr-2"></div>
              <span className={`text-xs font-medium ${
                timeLeft < 300 ? 'text-yellow-400' : 'text-gray-300'
              }`}>
                {formatTimeLeft(timeLeft)}
              </span>
            </div>
          </div>
        )}
        
        {/* Keep controls on top right */}
        <div className="absolute top-2 right-2 flex space-x-2 z-10">
          {onStopSession && (
            <button
              onClick={onStopSession}
              className="p-2 bg-gray-800 hover:bg-red-600 rounded-full text-white transition-colors"
              title="Stop Testing Session"
            >
              <StopCircle size={18} />
            </button>
          )}
          <button
            onClick={onToggleFullScreen}
            className="p-2 bg-gray-800 hover:bg-gray-700 rounded-full text-white transition-colors"
            title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullScreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-gray-800 hover:bg-red-700 rounded-full text-white transition-colors"
            title="Close Test"
          >
            <X size={18} />
          </button>
        </div>
        
        <iframe
          src={url}
          className="w-full h-full border-0"
          title="Extension Test Environment"
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          allowFullScreen
          onLoad={(e) => {
            try {
              // Type-cast to HTMLIFrameElement
              const iframe = e.target as HTMLIFrameElement;
              // Now we can safely access contentWindow
              iframe.contentWindow?.postMessage({ type: 'IFRAME_LOADED' }, '*');
              try {
                if (iframe.contentDocument) {
                  iframe.contentDocument.documentElement.style.userSelect = 'text';
                  iframe.contentDocument.documentElement.style.webkitUserSelect = 'text';
                }
              } catch (err) {
                // Silently fail if we can't access contentDocument due to CORS
              }
            } catch (err) {
              console.log('Cannot communicate with iframe due to cross-origin policies');
            }
          }}
        ></iframe>
      </div>
    );
  }


  return null;
};

export default TestEnvironment;