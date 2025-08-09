'use client';

import { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { getStoredToken } from '@/lib/auth-utils';
import { authenticatedFetch } from '@/lib/api-utils';
import { getUserFromCookie } from '@/lib/cookie-utils';
import { FileState } from '../components/ChatPanel';

const useFiles = (sessionId?: string) => {
  const [files, setFiles] = useState<FileState>({});
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [hasFiles, setHasFiles] = useState(false);
  const [isFilesLoading, setIsFilesLoading] = useState(false);
  const [isEditorCollapsed, setIsEditorCollapsed] = useState(false);
  const [isMobileEditorVisible, setIsMobileEditorVisible] = useState(false);
  const [editorKey, setEditorKey] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isDownloadComplete, setIsDownloadComplete] = useState(false);

  const filesProcessedRef = useRef(false);

  // Process debug files from sessionStorage
  useEffect(() => {
    // Don't re-process if we've already done it for this session
    if (filesProcessedRef.current) return;
    
    const debugFiles = sessionStorage.getItem('debugFiles');
    const debugAnalysis = sessionStorage.getItem('debugAnalysis');
    const debugSessionId = sessionStorage.getItem('debugSessionId');
    const currentSessionId = sessionId;
    
    if (debugFiles && currentSessionId && debugSessionId === currentSessionId) {
      try {
        // Parse the files
        const parsedFiles = JSON.parse(debugFiles);
        
        setFiles(parsedFiles);
        setHasFiles(true);
        setIsEditorCollapsed(false);
        
        // Force editor to re-render
        setEditorKey(prev => prev + 1);
             
        // Select first file
        const fileKeys = Object.keys(parsedFiles);
        if (fileKeys.length > 0) {
          setSelectedFile(fileKeys[0]);
        }
        
        // On mobile, make sure the editor is visible
        if (window.innerWidth < 1024) {
          setIsMobileEditorVisible(true);
        }
        
        // Mark as processed for this session
        filesProcessedRef.current = true;
      } catch (error) {
        // Silent error handling, just log to console
        console.log('Error parsing debug files');
      }
    }
  }, [sessionId]);

  // Cleanup when session changes
  useEffect(() => {
    // Store current session ID for reference in cleanup
    const currentSessionId = sessionId;
    
    return () => {
      // Only clean up if we're actually changing to a different session
      const newSessionId = sessionId;
      if (currentSessionId && newSessionId && currentSessionId !== newSessionId) {
        setFiles({});
        setSelectedFile(null);
        setHasFiles(false);
        filesProcessedRef.current = false;
      }
    };
  }, []);

  // Handle file download with authenticated fetch
  const handleDownload = async () => {
    if (!sessionId) return;
    
    try {
      setIsDownloading(true);
      setDownloadError(null);
      toast.loading('Preparing download...');
      
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/middleware/extension/download`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            session_id: sessionId
          })
        }
      );
      
      if (!response.ok) {
        throw new Error('Download failed');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'extension.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast.dismiss();
      toast.success('Download complete!');
      setIsDownloadComplete(true);
    } catch (error) {
      toast.dismiss();
      toast.error('Download failed. Please try again.');
      setDownloadError("Download failed, please try again in a while");
    } finally {
      if(!downloadError) {
        setIsDownloading(false);
      }
    }
  };

  // Fetch files from Firebase storage with authenticated fetch
  const fetchFilesFromFirebase = async () => {
    if (!sessionId) return;
    
    try {
      setIsFilesLoading(true);
      toast.loading('Loading saved files...');
      
      // Get the ID token using secure cookie method
      const userData = getUserFromCookie();
      const idToken = userData?.idToken || getStoredToken();
      
      if (!idToken) {
        // Handle gracefully without console.error
        toast.error('Authentication error. Please sign in again.');
        return;
      }
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/sessions/${sessionId}/firebase-files`, {
        headers: {
          'Authorization': `Bearer ${idToken}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch files');
      }
      
      const data = await response.json();
      
      if (data.files) {
        // Update files state with fetched files
        setFiles(data.files);
        
        // If files exist, update hasFiles state and select the first file
        const fileNames = Object.keys(data.files);
        if (fileNames.length > 0) {
          setHasFiles(true);
          setSelectedFile(fileNames[0]);
        }
      }
      
      toast.dismiss();
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to load saved files');
    } finally {
      setIsFilesLoading(false);
    }
  };

  // Get language from file name for code editor
  const getLanguageFromFileName = (fileName: string): string => {
    const extension = fileName.split('.').pop()?.toLowerCase() || '';
    
    switch (extension) {
      case 'js':
        return 'javascript';
      case 'ts':
        return 'typescript';
      case 'jsx':
      case 'tsx':
        return 'tsx';
      case 'py':
        return 'python';
      case 'html':
        return 'html';
      case 'css':
        return 'css';
      case 'json':
        return 'json';
      case 'md':
        return 'markdown';
      default:
        return 'javascript';
    }
  };

  return {
    files,
    selectedFile, 
    hasFiles,
    isFilesLoading,
    isDownloading,
    isEditorCollapsed,
    isMobileEditorVisible,
    editorKey,
    downloadError,
    isDownloadComplete,
    setDownloadError,
    retryDownload: () => {
      setDownloadError(null);
      setIsDownloading(false);
      handleDownload();
    },
    resetDownloadState: () => {
      setIsDownloading(false);
      setDownloadError(null);
      setIsDownloadComplete(false);
    },
    setFiles,
    setSelectedFile, 
    setHasFiles,
    setIsEditorCollapsed,
    setIsMobileEditorVisible,
    handleDownload,
    fetchFilesFromFirebase,
    getLanguageFromFileName
  };
};

export default useFiles;