// import React from 'react';
// import { Download, AlertCircle, RefreshCw } from 'lucide-react';

// interface DownloadOverlayProps {
//   isVisible: boolean;
//   hasError?: boolean;
//   errorMessage?: string;
//   onRetry?: () => void;
// }

// const DownloadOverlay: React.FC<DownloadOverlayProps> = ({ 
//   isVisible, 
//   hasError = false,
//   errorMessage = "Download failed. Please try again later.",
//   onRetry 
// }) => {
//   if (!isVisible) return null;

//   return (
//     <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center">
//       <div className="bg-[#111] p-8 rounded-xl shadow-2xl border border-gray-800 max-w-md w-full">
//         {!hasError ? (
//           // Success state - downloading
//           <>
//             <div className="flex items-center justify-center mb-6">
//               <div className="w-14 h-14 rounded-full bg-blue-900/30 border border-blue-700/50 flex items-center justify-center">
//                 <Download className="h-8 w-8 text-blue-400 animate-pulse" />
//               </div>
//             </div>
//             <h3 className="text-xl font-bold text-center text-white mb-3">Preparing Download</h3>
//             <div className="space-y-4">
//               <div className="w-full bg-gray-800 h-2.5 rounded-full overflow-hidden">
//                 <div className="bg-blue-500 h-full w-4/5 animate-pulse rounded-full"></div>
//               </div>
//               <p className="text-gray-300 text-center">
//                 Packaging your extension files for download...
//               </p>
//               <div className="flex justify-center mt-2">
//                 <div className="inline-flex gap-1.5">
//                   <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
//                   <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
//                   <div className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
//                 </div>
//               </div>
//             </div>
//           </>
//         ) : (
//           // Error state
//           <>
//             <div className="flex items-center justify-center mb-6">
//               <div className="w-14 h-14 rounded-full bg-red-900/30 border border-red-700/50 flex items-center justify-center">
//                 <AlertCircle className="h-8 w-8 text-red-400" />
//               </div>
//             </div>
//             <h3 className="text-xl font-bold text-center text-white mb-3">Download Failed</h3>
//             <div className="space-y-4">
//               <p className="text-gray-300 text-center">
//                 {errorMessage}
//               </p>
//               {onRetry && (
//                 <div className="flex justify-center mt-4">
//                   <button 
//                     onClick={onRetry}
//                     className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow transition-colors flex items-center"
//                   >
//                     <RefreshCw size={18} className="mr-2" />
//                     Try Again
//                   </button>
//                 </div>
//               )}
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default DownloadOverlay;

import React, { useState, useEffect } from 'react';
import { Download, AlertCircle, RefreshCw, Upload, Check } from 'lucide-react';
import PublishForm from '@/components/Marketplace/PublishForm';

interface DownloadOverlayProps {
  isVisible: boolean;
  hasError?: boolean;
  errorMessage?: string;
  onRetry?: () => void;
  sessionId?: string; 
  onPublishSuccess?: () => void;
}

const DownloadOverlay: React.FC<DownloadOverlayProps> = ({ 
  isVisible, 
  hasError = false,
  errorMessage = "Download failed. Please try again later.",
  onRetry,
  sessionId,
  onPublishSuccess
}) => {
  const [showPublishForm, setShowPublishForm] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  
  // Set download complete state after 3 seconds to simulate completion
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isVisible && !hasError && !showPublishForm) {
      timer = setTimeout(() => {
        setDownloadComplete(true);
      }, 3000);
    } else if (!isVisible) {
      setDownloadComplete(false);
    }
      
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isVisible, hasError, showPublishForm]);
  
  if (!isVisible) return null;

  const handlePublishClick = () => {
    setShowPublishForm(true);
  };

  const handlePublishSuccess = () => {
    if (onPublishSuccess) {
      onPublishSuccess();
    }
    setShowPublishForm(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className={`bg-[#111] p-4 sm:p-6 md:p-8 rounded-xl shadow-2xl border border-gray-800 ${showPublishForm ? 'max-w-4xl' : 'max-w-md'} w-full mx-auto`}>
        {showPublishForm ? (
          // Show publish form
          <>
            {sessionId && (
              <div className="max-w-full">
                <PublishForm extensionId={sessionId} onSuccess={handlePublishSuccess} onCancel={() => setShowPublishForm(false)} />
              </div>
            )}
          </>
        ) : !hasError ? (
          // Success state - downloading or download complete
          <>
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-blue-900/30 border border-blue-700/50 flex items-center justify-center">
                {downloadComplete ? (
                  <Check className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
                ) : (
                  <Download className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400 animate-pulse" />
                )}
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-center text-white mb-2 sm:mb-3">
              {downloadComplete ? 'Download Complete' : 'Preparing Download'}
            </h3>
            <div className="space-y-3 sm:space-y-4">
              {!downloadComplete ? (
                <>
                  <div className="w-full bg-gray-800 h-2 sm:h-2.5 rounded-full overflow-hidden">
                    <div className="bg-blue-500 h-full w-4/5 animate-pulse rounded-full"></div>
                  </div>
                  <p className="text-sm sm:text-base text-gray-300 text-center">
                    Packaging your extension files for download...
                  </p>
                  <div className="flex justify-center mt-2">
                    <div className="inline-flex gap-1.5">
                      <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-sm sm:text-base text-gray-300 text-center mb-6">
                    Your extension has been successfully downloaded.
                  </p>
                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button 
                      onClick={handlePublishClick}
                      className="flex items-center justify-center gap-2 py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                    >
                      <Upload size={18} />
                      Publish to Marketplace
                    </button>
                  </div>
                </>
              )}
            </div>
          </>
        ) : (
          // Error state
          <>
            <div className="flex items-center justify-center mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-red-900/30 border border-red-700/50 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-400" />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-center text-white mb-2 sm:mb-3">Download Failed</h3>
            <div className="space-y-3 sm:space-y-4">
              <p className="text-sm sm:text-base text-gray-300 text-center">
                {errorMessage}
              </p>
              {onRetry && (
                <div className="flex justify-center mt-3 sm:mt-4">
                  <button 
                    onClick={onRetry}
                    className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base rounded-lg shadow transition-colors flex items-center"
                  >
                    <RefreshCw size={16} className="mr-1.5 sm:mr-2 sm:size-18" />
                    Try Again
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DownloadOverlay;