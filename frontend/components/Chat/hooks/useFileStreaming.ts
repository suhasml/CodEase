'use client';

import { useState, useRef, useCallback } from 'react';

interface StreamingFile {
  fileName: string;
  content: string;
  isStreaming: boolean;
  targetContent: string;
}

interface UseFileStreamingOptions {
  onContentUpdate?: (fileName: string, content: string) => void;
}

export const useFileStreaming = (options?: UseFileStreamingOptions) => {
  const [streamingFiles, setStreamingFiles] = useState<Record<string, StreamingFile>>({});
  const streamingTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
  const scrollTimeouts = useRef<Record<string, NodeJS.Timeout>>({});

  const startStreaming = useCallback((fileName: string, targetContent: string) => {
    // Clear any existing timeout for this file
    if (streamingTimeouts.current[fileName]) {
      clearTimeout(streamingTimeouts.current[fileName]);
    }
    if (scrollTimeouts.current[fileName]) {
      clearTimeout(scrollTimeouts.current[fileName]);
    }

    // Initialize streaming state
    setStreamingFiles(prev => ({
      ...prev,
      [fileName]: {
        fileName,
        content: '',
        isStreaming: true,
        targetContent
      }
    }));

    // Stream the content with larger chunks for faster speed
    let currentIndex = 0;
    let updateCounter = 0;
    
    // Check if file has more than 50 lines to increase speed
    const lineCount = targetContent.split('\n').length;
    const isLargeFile = lineCount > 50;
    
    const streamNextChunk = () => {
      if (currentIndex < targetContent.length) {
        // Use larger chunks for faster streaming, 2x speed for files over 50 lines
        const baseChunkSize = Math.floor(Math.random() * 10) + 5;
        const chunkSize = isLargeFile ? baseChunkSize * 2 : baseChunkSize; // 2x speed for large files
        currentIndex += chunkSize;
        
        // Ensure we don't go beyond the content length
        const actualIndex = Math.min(currentIndex, targetContent.length);
        const newContent = targetContent.slice(0, actualIndex);

        setStreamingFiles(prev => ({
          ...prev,
          [fileName]: {
            ...prev[fileName],
            content: newContent
          }
        }));

        // Throttled scroll trigger - only every 5th update (reduce scroll frequency)
        updateCounter++;
        if (updateCounter % 5 === 0 && options?.onContentUpdate) {
          // Clear any pending scroll timeout
          if (scrollTimeouts.current[fileName]) {
            clearTimeout(scrollTimeouts.current[fileName]);
          }
          
          // Schedule scroll with a slight delay to batch multiple updates
          scrollTimeouts.current[fileName] = setTimeout(() => {
            options.onContentUpdate?.(fileName, newContent);
            delete scrollTimeouts.current[fileName];
          }, 16); // 16ms = 60fps
        }

        // 2x faster delay for large files (1-4ms instead of 2-8ms)
        const baseDelay = Math.floor(Math.random() * 6) + 2;
        const delay = isLargeFile ? Math.floor(baseDelay / 2) + 1 : baseDelay;
        streamingTimeouts.current[fileName] = setTimeout(streamNextChunk, delay);
      } else {
        // Streaming complete - final scroll update
        setStreamingFiles(prev => ({
          ...prev,
          [fileName]: {
            ...prev[fileName],
            isStreaming: false
          }
        }));
        
        // Final scroll to end
        if (options?.onContentUpdate) {
          options.onContentUpdate(fileName, targetContent);
        }
        
        delete streamingTimeouts.current[fileName];
        if (scrollTimeouts.current[fileName]) {
          clearTimeout(scrollTimeouts.current[fileName]);
          delete scrollTimeouts.current[fileName];
        }
      }
    };

    // Start streaming immediately
    streamingTimeouts.current[fileName] = setTimeout(streamNextChunk, 10);
  }, [options]);

  const stopStreaming = useCallback((fileName: string) => {
    if (streamingTimeouts.current[fileName]) {
      clearTimeout(streamingTimeouts.current[fileName]);
      delete streamingTimeouts.current[fileName];
    }
    if (scrollTimeouts.current[fileName]) {
      clearTimeout(scrollTimeouts.current[fileName]);
      delete scrollTimeouts.current[fileName];
    }

    setStreamingFiles(prev => {
      if (prev[fileName]) {
        return {
          ...prev,
          [fileName]: {
            ...prev[fileName],
            content: prev[fileName].targetContent,
            isStreaming: false
          }
        };
      }
      return prev;
    });
  }, []);

  const clearFile = useCallback((fileName: string) => {
    if (streamingTimeouts.current[fileName]) {
      clearTimeout(streamingTimeouts.current[fileName]);
      delete streamingTimeouts.current[fileName];
    }
    if (scrollTimeouts.current[fileName]) {
      clearTimeout(scrollTimeouts.current[fileName]);
      delete scrollTimeouts.current[fileName];
    }

    setStreamingFiles(prev => {
      const newFiles = { ...prev };
      delete newFiles[fileName];
      return newFiles;
    });
  }, []);

  const stopAllStreaming = useCallback(() => {
    // Stop all timeouts
    Object.keys(streamingTimeouts.current).forEach(fileName => {
      clearTimeout(streamingTimeouts.current[fileName]);
    });
    Object.keys(scrollTimeouts.current).forEach(fileName => {
      clearTimeout(scrollTimeouts.current[fileName]);
    });
    streamingTimeouts.current = {};
    scrollTimeouts.current = {};

    // Complete all streaming files immediately
    setStreamingFiles(prev => {
      const updatedFiles: Record<string, StreamingFile> = {};
      Object.keys(prev).forEach(fileName => {
        updatedFiles[fileName] = {
          ...prev[fileName],
          content: prev[fileName].targetContent,
          isStreaming: false
        };
      });
      return updatedFiles;
    });
  }, []);

  const getFileContent = useCallback((fileName: string): string => {
    return streamingFiles[fileName]?.content || '';
  }, [streamingFiles]);

  const isFileStreaming = useCallback((fileName: string): boolean => {
    return streamingFiles[fileName]?.isStreaming || false;
  }, [streamingFiles]);

  return {
    streamingFiles,
    startStreaming,
    stopStreaming,
    stopAllStreaming,
    clearFile,
    getFileContent,
    isFileStreaming
  };
};
