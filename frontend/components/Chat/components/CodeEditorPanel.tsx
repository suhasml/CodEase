// 'use client';

// import React, { useRef, useEffect } from 'react';
// import { Code, FileText, Download, ChevronRight, ChevronLeft, X } from 'lucide-react';
// import CodeEditor from './CodeEditor';
// import { FileState } from './ChatPanel';

// interface CodeEditorPanelProps {
//   files: FileState;
//   selectedFile: string | null;
//   isEditorCollapsed: boolean;
//   isMobileEditorVisible: boolean;
//   isFilesLoading: boolean;
//   isDownloading: boolean;
//   onSelectFile: (fileName: string) => void;
//   onToggleCollapse: () => void;
//   onToggleMobileView: () => void;
//   onDownload: () => void;
//   getLanguageFromFileName: (fileName: string) => string;
// }

// const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({
//   files,
//   selectedFile,
//   isEditorCollapsed,
//   isMobileEditorVisible,
//   isFilesLoading,
//   isDownloading,
//   onSelectFile,
//   onToggleCollapse,
//   onToggleMobileView,
//   onDownload,
//   getLanguageFromFileName,
// }) => {
//   const fileScrollRef = useRef<HTMLDivElement>(null);
//   const editorKey = Object.keys(files).length + (selectedFile || 'none');

//   // Scroll file tabs into view when selected
//   useEffect(() => {
//     if (selectedFile && fileScrollRef.current) {
//       const selectedFileElement = document.getElementById(`file-tab-${selectedFile}`);
//       if (selectedFileElement) {
//         const container = fileScrollRef.current;
//         const scrollLeft = selectedFileElement.offsetLeft - container.offsetLeft;
//         container.scrollTo({ left: scrollLeft - 20, behavior: 'smooth' });
//       }
//     }
//   }, [selectedFile]);

//   // Helper function to get file icon by extension
//   const getFileIcon = (fileName: string) => {
//     const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
//     switch (extension) {
//       case 'js':
//       case 'jsx':
//       case 'ts':
//       case 'tsx':
//         return <FileText size={16} className="text-yellow-400" />;
//       case 'html':
//         return <FileText size={16} className="text-orange-400" />;
//       case 'css':
//         return <FileText size={16} className="text-blue-400" />;
//       case 'json':
//         return <FileText size={16} className="text-green-400" />;
//       case 'md':
//         return <FileText size={16} className="text-purple-400" />;
//       default:
//         return <FileText size={16} className="text-gray-400" />;
//     }
//   };

//   return (
//     <div 
//       key={`editor-container-${editorKey}`}
//       className={`
//         ${isMobileEditorVisible ? 'fixed inset-0 z-30' : 'hidden lg:block lg:fixed'} 
//         lg:top-16 lg:bottom-24 lg:right-6 
//         ${isEditorCollapsed ? 'lg:w-12' : 'lg:w-[40%]'}
//         bg-[#0c0c0c] rounded-xl shadow-2xl border border-gray-800/50
//         transition-all duration-300 ease-in-out overflow-hidden
//       `}
//     >
//       {isEditorCollapsed ? (
//         // Collapsed state - show only expand button
//         <div className="h-full flex items-center justify-center">
//           <button 
//             onClick={onToggleCollapse}
//             className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-md transition-colors"
//           >
//             <ChevronLeft size={18} />
//           </button>
//         </div>
//       ) : (
//         // Expanded state
//         <div className="flex flex-col h-full">
//           {/* Header with actions */}
//           <div className="flex items-center justify-between py-3 px-4 bg-[#0a0a0a] border-b border-gray-800/50 rounded-t-xl">
//             <div className="flex items-center">
//               <Code className="mr-2 text-blue-500" />
//               <h3 className="text-white font-medium">Generated Files</h3>
//               <div className="ml-2 px-2 py-0.5 bg-blue-900/30 border border-blue-700/30 rounded-full text-xs text-blue-400 font-medium">
//                 {Object.keys(files).length}
//               </div>
//             </div>
//             <div className="flex space-x-2">
//               {/* <button 
//                 onClick={onDownload}
//                 className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-md transition-colors flex items-center border border-transparent hover:border-blue-800/50"
//                 disabled={isFilesLoading}
//               >
//                 <Download size={16} className="mr-1.5" />
//                 <span className="text-xs font-medium">Download</span>
//               </button> */}
//               <button
//                 onClick={onDownload}
//                 className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-md transition-colors flex items-center border border-transparent hover:border-blue-800/50"
//                 disabled={isFilesLoading || isDownloading}
//               >
//                 {isDownloading ? (
//                   <>
//                     <div className="h-3 w-3 rounded-full border-2 border-t-blue-400 border-r-transparent border-b-blue-400 border-l-transparent animate-spin mr-1.5"></div>
//                     <span className="text-xs font-medium">Downloading...</span>
//                   </>
//                 ) : (
//                   <>
//                     <Download size={16} className="mr-1.5" />
//                     <span className="text-xs font-medium">Download</span>
//                   </>
//                 )}
//               </button>
//               <button 
//                 onClick={onToggleCollapse} 
//                 className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors lg:block hidden"
//               >
//                 <ChevronRight size={18} />
//               </button>
//               <button 
//                 onClick={onToggleMobileView}
//                 className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors lg:hidden"
//               >
//                 <X size={18} />
//               </button>
//             </div>
//           </div>
          
//           {/* Horizontal file tabs */}
//           <div 
//             ref={fileScrollRef}
//             className="flex items-center px-1.5 overflow-x-auto py-1 bg-[#151515] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
//           >
//             {isFilesLoading ? (
//               // Loading skeleton for file tabs
//               <div className="flex items-center space-x-3 px-2 py-1.5">
//                 {[1, 2, 3].map(i => (
//                   <div key={i} className="h-6 w-24 bg-gray-800 animate-pulse rounded-md"></div>
//                 ))}
//               </div>
//             ) : (
//               Object.keys(files).map((fileName) => (
//                 <div 
//                   key={fileName}
//                   id={`file-tab-${fileName}`}
//                   onClick={() => onSelectFile(fileName)}
//                   className={`
//                     flex items-center whitespace-nowrap py-1.5 px-3 mx-0.5 rounded-t-md cursor-pointer
//                     text-xs font-mono border-b-2 flex-shrink-0 transition-all
//                     ${selectedFile === fileName 
//                       ? 'bg-[#1c1c1c] text-white border-blue-500 shadow-sm' 
//                       : 'hover:bg-[#1a1a1a] text-gray-400 border-transparent'}
//                   `}
//                 >
//                   {getFileIcon(fileName)}
//                   <span className="ml-1.5 truncate max-w-xs">{fileName}</span>
//                 </div>
//               ))
//             )}
//           </div>
          
//           {/* Code Editor with modernistic styling */}
//           <div className="flex-1 overflow-hidden">
//             {isFilesLoading ? (
//               // File Loading Skeleton
//               <div className="h-full flex flex-col">
//                 <div className="px-4 py-2 bg-[#151515] border-b border-gray-800/50 flex items-center justify-between">
//                   <div className="h-5 w-32 bg-gray-800 animate-pulse rounded-md"></div>
//                   <div className="h-5 w-20 bg-gray-800 animate-pulse rounded-md"></div>
//                 </div>
//                 <div className="flex-1 min-h-0 overflow-auto shadow-inner bg-[#0a0a0a] p-4">
//                   <div className="h-4 w-3/4 bg-gray-800 animate-pulse rounded mb-3"></div>
//                   <div className="h-4 w-full bg-gray-800 animate-pulse rounded mb-3"></div>
//                   <div className="h-4 w-2/3 bg-gray-800 animate-pulse rounded mb-3"></div>
//                   <div className="h-4 w-5/6 bg-gray-800 animate-pulse rounded mb-3"></div>
//                   <div className="h-4 w-1/2 bg-gray-800 animate-pulse rounded mb-3"></div>
//                   <div className="h-4 w-4/5 bg-gray-800 animate-pulse rounded mb-3"></div>
//                   <div className="h-4 w-full bg-gray-800 animate-pulse rounded mb-3"></div>
//                   <div className="h-4 w-2/3 bg-gray-800 animate-pulse rounded mb-3"></div>
//                   <div className="h-4 w-3/4 bg-gray-800 animate-pulse rounded mb-3"></div>
//                   <div className="h-4 w-full bg-gray-800 animate-pulse rounded mb-3"></div>
//                   <div className="h-4 w-1/2 bg-gray-800 animate-pulse rounded mb-3"></div>
//                   <div className="opacity-70 text-center text-sm text-blue-400 mt-6 font-medium">
//                     Loading files...
//                   </div>
//                 </div>
//               </div>
//             ) : selectedFile ? (
//               <div className="h-full flex flex-col">
//                 <div className="px-4 py-2 bg-[#151515] border-b border-gray-800/50 flex items-center justify-between">
//                   <div className="flex items-center">
//                     <span className="text-xs font-mono text-gray-400">
//                       {selectedFile}
//                     </span>
//                   </div>
//                   <div className="flex items-center space-x-2">
//                     <span className="px-2 py-0.5 bg-[#252525] text-xs text-gray-400 rounded-md font-mono">
//                       {getLanguageFromFileName(selectedFile)}
//                     </span>
//                   </div>
//                 </div>
//                 {/* Added min-h-0 to force the container to respect flex parent height */}
//                 <div className="flex-1 min-h-0 overflow-auto shadow-inner bg-[#0a0a0a]">
//                   <CodeEditor 
//                     code={files[selectedFile] || ''}
//                     language={getLanguageFromFileName(selectedFile)}
//                     onChange={(content) => {
//                       // This will be handled by the parent component via useFiles hook
//                     }}
//                     readOnly={false}
//                   />
//                 </div>
//               </div>
//             ) : (
//               <div className="flex items-center justify-center h-full bg-[#0d0d0d] text-gray-500">
//                 <div className="text-center p-6">
//                   <div className="w-14 h-14 rounded-full bg-[#1a1a1a] border border-gray-800 mx-auto mb-4 flex items-center justify-center">
//                     <Code className="w-7 h-7 text-gray-500 opacity-60" />
//                   </div>
//                   <h3 className="text-lg font-medium text-gray-400">No File Selected</h3>
//                   <p className="mt-2 text-sm text-gray-500 max-w-xs">
//                     Select a file from the list above to view and edit its content
//                   </p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CodeEditorPanel;

'use client';

import React, { useRef, useEffect } from 'react';
import { Code, FileText, Download, ChevronRight, ChevronLeft, X } from 'lucide-react';
import CodeEditor from './CodeEditor';
import { FileState } from './ChatPanel';

interface StreamingFile {
  fileName: string;
  content: string;
  isStreaming: boolean;
  targetContent: string;
}

interface CodeEditorPanelProps {
  files: FileState;
  selectedFile: string | null;
  isEditorCollapsed: boolean;
  isMobileEditorVisible: boolean;
  isFilesLoading: boolean;
  isDownloading: boolean;
  onSelectFile: (fileName: string) => void;
  onToggleCollapse: () => void;
  onToggleMobileView: () => void;
  onDownload: () => void;
  getLanguageFromFileName: (fileName: string) => string;
  // New streaming props
  streamingFiles?: Record<string, StreamingFile>;
  getFileContent?: (fileName: string) => string;
  isFileStreaming?: (fileName: string) => boolean;
  stopAllStreaming?: () => void;
}

const CodeEditorPanel: React.FC<CodeEditorPanelProps> = ({
  files,
  selectedFile,
  isEditorCollapsed,
  isMobileEditorVisible,
  isFilesLoading,
  isDownloading,
  onSelectFile,
  onToggleCollapse,
  onToggleMobileView,
  onDownload,
  getLanguageFromFileName,
  // New streaming props
  streamingFiles = {},
  getFileContent = () => '',
  isFileStreaming = () => false,
  stopAllStreaming = () => {},
}) => {
  const fileScrollRef = useRef<HTMLDivElement>(null);
  const editorKey = Object.keys(files).length + (selectedFile || 'none');

  // Scroll file tabs into view when selected
  useEffect(() => {
    if (selectedFile && fileScrollRef.current) {
      const selectedFileElement = document.getElementById(`file-tab-${selectedFile}`);
      if (selectedFileElement) {
        const container = fileScrollRef.current;
        const scrollLeft = selectedFileElement.offsetLeft - container.offsetLeft;
        container.scrollTo({ left: scrollLeft - 20, behavior: 'smooth' });
      }
    }
  }, [selectedFile]);

  // Helper function to get file icon by extension
  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
      case 'js':
      case 'jsx':
      case 'ts':
      case 'tsx':
        return <FileText size={16} className="text-yellow-400" />;
      case 'html':
        return <FileText size={16} className="text-orange-400" />;
      case 'css':
        return <FileText size={16} className="text-blue-400" />;
      case 'json':
        return <FileText size={16} className="text-green-400" />;
      case 'md':
        return <FileText size={16} className="text-purple-400" />;
      default:
        return <FileText size={16} className="text-gray-400" />;
    }
  };

  // Get the content to display (streaming or final)
  const getDisplayContent = (fileName: string): string => {
    if (streamingFiles[fileName] && streamingFiles[fileName].isStreaming) {
      return getFileContent(fileName);
    }
    return files[fileName] || '';
  };

  return (
    <div 
      key={`editor-container-${editorKey}`}
      className={`
        ${isMobileEditorVisible ? 'fixed inset-0 z-30' : 'hidden lg:block lg:fixed'} 
        lg:top-24 lg:bottom-24 lg:right-6 
        ${isEditorCollapsed ? 'lg:w-12' : 'lg:w-[40%]'}
        bg-[#0c0c0c] rounded-xl shadow-2xl border border-gray-800/50
        transition-all duration-300 ease-in-out overflow-hidden
      `}
    >
      {isEditorCollapsed ? (
        // Collapsed state - show only expand button
        <div className="h-full flex items-center justify-center">
          <button 
            onClick={onToggleCollapse}
            className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-md transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
        </div>
      ) : (
        // Expanded state
        <div className="flex flex-col h-full">
          {/* Header with actions */}
          <div className="flex items-center justify-between py-3 px-4 bg-[#0a0a0a] border-b border-gray-800/50 rounded-t-xl">
            <div className="flex items-center">
              <Code className="mr-2 text-blue-500" />
              <h3 className="text-white font-medium">Generated Files</h3>
              <div className="ml-2 px-2 py-0.5 bg-blue-900/30 border border-blue-700/30 rounded-full text-xs text-blue-400 font-medium">
                {Object.keys(files).length}
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={onDownload}
                className="p-1.5 text-gray-400 hover:text-blue-400 hover:bg-blue-900/20 rounded-md transition-colors flex items-center border border-transparent hover:border-blue-800/50"
                disabled={isFilesLoading || isDownloading}
              >
                {isDownloading ? (
                  <>
                    <div className="h-3 w-3 rounded-full border-2 border-t-blue-400 border-r-transparent border-b-blue-400 border-l-transparent animate-spin mr-1.5"></div>
                    <span className="text-xs font-medium">Downloading...</span>
                  </>
                ) : (
                  <>
                    <Download size={16} className="mr-1.5" />
                    <span className="text-xs font-medium">Download</span>
                  </>
                )}
              </button>
              <button 
                onClick={onToggleCollapse} 
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors lg:block hidden"
              >
                <ChevronRight size={18} />
              </button>
              <button 
                onClick={onToggleMobileView}
                className="p-1.5 text-gray-400 hover:text-white hover:bg-gray-800 rounded-md transition-colors lg:hidden"
              >
                <X size={18} />
              </button>
            </div>
          </div>
          
          {/* Horizontal file tabs */}
          <div 
            ref={fileScrollRef}
            className="flex items-center px-1.5 overflow-x-auto py-1 bg-[#151515] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent"
          >
            {isFilesLoading ? (
              // Loading skeleton for file tabs
              <div className="flex items-center space-x-3 px-2 py-1.5">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-6 w-24 bg-gray-800 animate-pulse rounded-md"></div>
                ))}
              </div>
            ) : (
              Object.keys(files).map((fileName) => (
                <div 
                  key={fileName}
                  id={`file-tab-${fileName}`}
                  onClick={() => onSelectFile(fileName)}
                  className={`
                    flex items-center whitespace-nowrap py-1.5 px-3 mx-0.5 rounded-t-md cursor-pointer
                    text-xs font-mono border-b-2 flex-shrink-0 transition-all
                    ${selectedFile === fileName 
                      ? 'bg-[#1c1c1c] text-white border-blue-500 shadow-sm' 
                      : 'hover:bg-[#1a1a1a] text-gray-400 border-transparent'}
                  `}
                >
                  {getFileIcon(fileName)}
                  <span className="ml-1.5 truncate max-w-xs">{fileName}</span>
                  {/* Add streaming indicator */}
                  {isFileStreaming(fileName) && (
                    <div className="ml-2 flex items-center">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="ml-1 text-xs text-green-400">Generating...</span>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
          
          {/* Code Editor with modernistic styling */}
          <div className="flex-1 overflow-hidden">
            {isFilesLoading ? (
              // File Loading Skeleton
              <div className="h-full flex flex-col">
                <div className="px-4 py-2 bg-[#151515] border-b border-gray-800/50 flex items-center justify-between">
                  <div className="h-5 w-32 bg-gray-800 animate-pulse rounded-md"></div>
                  <div className="h-5 w-20 bg-gray-800 animate-pulse rounded-md"></div>
                </div>
                <div className="flex-1 min-h-0 overflow-auto shadow-inner bg-[#0a0a0a] p-4">
                  <div className="h-4 w-3/4 bg-gray-800 animate-pulse rounded mb-3"></div>
                  <div className="h-4 w-full bg-gray-800 animate-pulse rounded mb-3"></div>
                  <div className="h-4 w-2/3 bg-gray-800 animate-pulse rounded mb-3"></div>
                  <div className="h-4 w-5/6 bg-gray-800 animate-pulse rounded mb-3"></div>
                  <div className="h-4 w-1/2 bg-gray-800 animate-pulse rounded mb-3"></div>
                  <div className="h-4 w-4/5 bg-gray-800 animate-pulse rounded mb-3"></div>
                  <div className="h-4 w-full bg-gray-800 animate-pulse rounded mb-3"></div>
                  <div className="h-4 w-2/3 bg-gray-800 animate-pulse rounded mb-3"></div>
                  <div className="h-4 w-3/4 bg-gray-800 animate-pulse rounded mb-3"></div>
                  <div className="h-4 w-full bg-gray-800 animate-pulse rounded mb-3"></div>
                  <div className="h-4 w-1/2 bg-gray-800 animate-pulse rounded mb-3"></div>
                  <div className="opacity-70 text-center text-sm text-blue-400 mt-6 font-medium">
                    Loading files...
                  </div>
                </div>
              </div>
            ) : selectedFile ? (
              <div className="h-full flex flex-col">
                <div className="px-4 py-2 bg-[#151515] border-b border-gray-800/50 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-xs font-mono text-gray-400">
                      {selectedFile}
                    </span>
                    {/* Show streaming status */}
                    {isFileStreaming(selectedFile) && (
                      <div className="ml-3 flex items-center text-green-400">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse mr-1"></div>
                        <span className="text-xs">Generating content...</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-[#252525] text-xs text-gray-400 rounded-md font-mono">
                      {getLanguageFromFileName(selectedFile)}
                    </span>
                  </div>
                </div>
                {/* Added min-h-0 to force the container to respect flex parent height */}
                <div className="flex-1 min-h-0 overflow-auto shadow-inner bg-[#0a0a0a]">
                  <CodeEditor 
                    code={getDisplayContent(selectedFile)}
                    language={getLanguageFromFileName(selectedFile)}
                    onChange={(content) => {
                      // This will be handled by the parent component via useFiles hook
                    }}
                    readOnly={false}
                    isStreaming={isFileStreaming(selectedFile)}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full bg-[#0d0d0d] text-gray-500">
                <div className="text-center p-6">
                  <div className="w-14 h-14 rounded-full bg-[#1a1a1a] border border-gray-800 mx-auto mb-4 flex items-center justify-center">
                    <Code className="w-7 h-7 text-gray-500 opacity-60" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-400">No File Selected</h3>
                  <p className="mt-2 text-sm text-gray-500 max-w-xs">
                    Select a file from the list above to view and edit its content
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditorPanel;