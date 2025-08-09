'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

import ChatInput from './ChatInput';
import ChatMessageList from './ChatMessageList';
import CodeEditorPanel from './CodeEditorPanel';
import TestEnvironment from './TestEnvironment';
import ProcessingOverlay from './ProcessingOverlay';
import DownloadOverlay from './DownloadOverlay';
import AlertBanner from './AlertBanner';
import ShareButton from './ShareButton';

import useWebSocket from '../hooks/useWebSocket';
import useCredits from '../hooks/useCredits';
import useFiles from '../hooks/useFiles';
import useTestEnvironment from '../hooks/useTestEnvironment';
import { useFileStreaming } from '../hooks/useFileStreaming';
import { authenticatedFetch } from '@/lib/api-utils';
import { safeAuthenticatedFetch, withErrorHandling } from '@/lib/error-handling';
import { getStoredToken } from '@/lib/auth-utils';
import { getUserFromCookie } from '@/lib/cookie-utils';

// Generate a unique ID for messages
const generateId = () => Math.random().toString(36).substring(2, 15);

export interface ChatMessage {
  id: string;
  sender: 'You' | 'AI';
  text: string;
  status?: 'idle' | 'thinking' | 'error';
  code?: {
    fileName?: string;
    content?: string;
  };
}

export interface WebSocketMessage {
  action: string;
  file_name: string;
  content: string | null;
  files: FileState;
  message: string;
}

export interface FileState {
  [key: string]: string; // Key is the file name, value is the file content
}

interface ChatPanelProps {
  sessionId?: string;
  canAccessTestFeature?: boolean;
}

const ChatPanel: React.FC<ChatPanelProps> = ({ sessionId, canAccessTestFeature = false }) => {
  const router = useRouter();
  
  // State for messages
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isStoppingGeneration, setIsStoppingGeneration] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isProcessingExtension, setIsProcessingExtension] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  
  // Reference for session ID to prevent infinite loops
  const sessionIdRef = useRef(sessionId);
  
  // Custom hooks
  // const { creditsRemaining, followUpsRemaining, fetchUserCredits } = useCredits();
  const { 
    creditsRemaining, 
    followUpsRemaining, 
    followUpsTotal,
    isUnlimitedCredits,
    messagesCount,
    sessionTitle,
    fetchSessionInfo 
  } = useCredits(sessionId);

  const { 
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
    retryDownload,
    resetDownloadState,
    setFiles,
    setSelectedFile, 
    setHasFiles,
    setIsEditorCollapsed,
    setIsMobileEditorVisible,
    handleDownload,
    fetchFilesFromFirebase,
    getLanguageFromFileName
  } = useFiles(sessionId);

  const {
    testEnvironmentActive,
    testEnvironmentTimeLeft,
    isTestFrameVisible,
    testFrameUrl,
    isTestingExtension,
    isFullScreenTest,
    testSetupFailed,
    testFailureReason,
    setIsTestFrameVisible,
    setIsFullScreenTest,
    formatTimeLeft,
    handleTestExtension,
    toggleFullScreenTest,
    resetTestEnvironment,
    handleStopSession
  } = useTestEnvironment(sessionId);

  // Define the content update callback first to maintain hook order
  const onContentUpdate = useCallback((fileName: string, content: string) => {
    // This callback will be triggered during streaming to handle auto-scroll
    // The scroll logic is now handled in the CodeEditor component itself
    // This is mainly for future extensibility
  }, []);

  // Add file streaming hook with scroll callback
  const {
    streamingFiles,
    startStreaming,
    stopStreaming,
    stopAllStreaming,
    clearFile,
    getFileContent,
    isFileStreaming
  } = useFileStreaming({
    onContentUpdate
  });

// WebSocket message handler with streaming
const handleWebSocketMessage = useCallback((data: WebSocketMessage) => {
  // Handle progress messages
  if (data.action === 'progress') {
    // Find the most recent AI message with 'thinking' status and update it
    setMessages(current => {
      // Create a copy of the messages array
      const updatedMessages = [...current];
      
      // Find the LAST thinking message (most recent AI message) - search from the end
      let thinkingMsgIndex = -1;
      for (let i = updatedMessages.length - 1; i >= 0; i--) {
        if (updatedMessages[i].sender === 'AI' && updatedMessages[i].status === 'thinking') {
          thinkingMsgIndex = i;
          break;
        }
      }
      
      if (thinkingMsgIndex !== -1) {
        // Update the thinking message with the new text from WebSocket
        updatedMessages[thinkingMsgIndex] = {
          ...updatedMessages[thinkingMsgIndex],
          text: data.message || 'Thinking...',
          status: 'thinking' // Keep status as thinking
        };
      }
      
      return updatedMessages;
    });
  }
  
  // Handle file updates with streaming
  if (data.action === 'update') {
    if (data.content === null) {
      // Remove file when content is null
      clearFile(data.file_name);
      setFiles(prev => {
        const newFiles = { ...prev };
        delete newFiles[data.file_name];
        return newFiles;
      });
      
      if (selectedFile === data.file_name) {
        const remainingFiles = Object.keys(files).filter(name => name !== data.file_name);
        setSelectedFile(remainingFiles.length > 0 ? remainingFiles[0] : null);
      }
    } else {
      // Start streaming the new file content
      startStreaming(data.file_name, data.content as string);
      
      // Set the file in state but let streaming handle the display
      setFiles(prev => ({
        ...prev,
        [data.file_name]: data.content as string
      }));
      setSelectedFile(data.file_name);
      setHasFiles(true);
      
      // Update AI message with code if it's the most recent one
      setMessages(current => {
        const lastAiMessageIndex = [...current].reverse().findIndex(msg => msg.sender === 'AI');
        
        if (lastAiMessageIndex !== -1) {
          const actualIndex = current.length - 1 - lastAiMessageIndex;
          const updatedMessages = [...current];
          updatedMessages[actualIndex] = {
            ...updatedMessages[actualIndex],
            code: {
              fileName: data.file_name,
              content: data.content as string
            }
          };
          return updatedMessages;
        }
        
        return current;
      });
    }
  }
}, [files, selectedFile, setFiles, setSelectedFile, setHasFiles, startStreaming, clearFile]);

// Update the useWebSocket hook to pass in our message handler
const { websocket, ensureWebSocketConnection } = useWebSocket(sessionId, handleWebSocketMessage);

  // Get user ID from cookies
  useEffect(() => {
    const userData = getUserFromCookie();
    if (userData && userData.uid) {
      setUserId(userData.uid);
    } else {
      // Redirect to sign in if no user found
      router.push('/signin');
    }
  }, [router]);

  // Extension processing check
  useEffect(() => {
    // Check sessionStorage for indicator that extension processing is happening
    const isProcessing = sessionStorage.getItem('isProcessingExtension') === 'true';
    
    if (isProcessing) {
      setIsProcessingExtension(true);
      
      // Clear the flag after the extension is processed or if it takes too long
      const processingTimeout = setTimeout(() => {
        sessionStorage.removeItem('isProcessingExtension');
        setIsProcessingExtension(false);
      }, 60000); // Timeout after 60 seconds maximum
      
      return () => clearTimeout(processingTimeout);
    }
  }, []);

  useEffect(() => {
    // Create a function to handle storage events
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'isProcessingExtension') {
        setIsProcessingExtension(event.newValue === 'true');
      }
    };
    
    // Check the initial value when component mounts
    setIsProcessingExtension(sessionStorage.getItem('isProcessingExtension') === 'true');
    
    // Add event listener for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event listener for same-tab communication
    window.addEventListener('extensionProcessingChange', ((e: CustomEvent) => {
      setIsProcessingExtension(e.detail.isProcessing);
    }) as EventListener);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('extensionProcessingChange', ((e: CustomEvent) => {}) as EventListener);
    };
  }, []);

  // Fetch session messages
  const fetchSessionMessages = useCallback(async () => {
    if (!sessionId) return;
  
    const { data, error } = await safeAuthenticatedFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/middleware/sessions/${sessionId}/messages`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      },
      { 
        silent: true, // Don't show error toast for 404s (new sessions)
        showToast: false 
      }
    );

    // Handle 404 gracefully (new session)
    if (error && error.status === 404) {
      return; // Early return without showing error
    }

    // Handle other errors gracefully
    if (error) {
      // Only show toast for non-404 errors
      if (error.status !== 404) {
        toast.error('Failed to load previous messages');
      }
      return;
    }
    
    if (data?.success && Array.isArray(data.messages) && data.messages.length > 0) {
      // Convert the API messages to our local message format
      const convertedMessages: ChatMessage[] = [];
      
      data.messages.forEach((msg: any) => {
        if (msg.role === 'user') {
          convertedMessages.push({
            id: generateId(),
            sender: 'You',
            text: msg.content,
            status: 'idle'
          });
        } else if (msg.role === 'assistant') {
          convertedMessages.push({
            id: generateId(),
            sender: 'AI',
            text: msg.content,
            status: 'idle',
            code: msg.download_token ? {} : undefined // Add code property if download_token exists
          });
          
          // If there's a download token, set hasFiles to true
          if (msg.download_token) {
            setHasFiles(true);
          }
        }
      });
      
      // Set the messages
      if (convertedMessages.length > 0) {
        setMessages(convertedMessages);
      }
    }
    await fetchSessionInfo();
  }, [sessionId, setHasFiles, fetchSessionInfo]);

  useEffect(() => {      const loadSessionData = async () => {
        if (!sessionId) return;
        
        // Reset states for new session
        setMessages([]);
        setHasFiles(false);
        
        setIsLoadingHistory(true);
        await Promise.all([
          withErrorHandling(
            () => fetchSessionMessages(),
            'loading session messages'
          ),
          withErrorHandling(
            () => fetchFilesFromFirebase(),
            'loading session files'
          )
        ]);
        setIsLoadingHistory(false);
      };
    
    loadSessionData();
  }, [sessionId]); 

  // Handle sending a message
  const handleSendMessage = async (newMessage: string) => {
    if (newMessage.trim() === '' || isGenerating) return;
    
    resetTestEnvironment();

    const userMessageId = generateId();
    const aiMessageId = generateId();
    
    // Add user message
    setMessages(prev => [
      ...prev,
      { 
        id: userMessageId, 
        sender: 'You', 
        text: newMessage,
        status: 'idle'
      }
    ]);
    
    // Add AI thinking message
    setMessages(prev => [
      ...prev,
      { 
        id: aiMessageId, 
        sender: 'AI', 
        text: 'Thinking...',
        status: 'thinking'
      }
    ]);
    
    // Set generating state
    setIsGenerating(true);
    
    // Close mobile editor view if it's open
    if (isMobileEditorVisible) {
      setIsMobileEditorVisible(false);
    }
    
    try {
      await ensureWebSocketConnection();
      // Make API call to get AI response using safeAuthenticatedFetch
      const { data, error } = await safeAuthenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/middleware/extension/make`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: newMessage,
            session_id: sessionId,
          })
        },
        {
          onRetry: () => handleSendMessage(newMessage), // Allow retry
          showToast: false // We'll handle the error display ourselves
        }
      );
      
      if (error) {
        // Handle different error types gracefully
        let userMessage = "I'm sorry, I couldn't process your request. Please try again!";
        
        if (error.type === 'rate_limit') {
          userMessage = "You're sending requests too quickly. Please wait a moment and try again.";
        } else if (error.type === 'validation') {
          userMessage = "There was an issue with your request. Please try rephrasing your question.";
        } else if (error.type === 'auth') {
          userMessage = "Your session has expired. Please refresh the page and sign in again.";
        } else if (error.type === 'server') {
          userMessage = "Our servers are experiencing issues. Please try again in a few moments.";
        }
        
        throw new Error(userMessage);
      }
      
      if (data?.success) {
        // Update credits and follow-ups
        await fetchSessionInfo();
        
        // Check if there's a download token to indicate files are available
        if (data.download_token) {
          setHasFiles(true);
        }
        
        // Update AI message with success
        setMessages(prev => 
          prev.map(msg => 
            msg.id === aiMessageId ? {
              ...msg,
              text: data.answer || 'I have processed your request.',
              status: 'idle'
            } : msg
          )
        );
      } else {
        // Handle application errors with friendlier messages
        const userFriendlyMessage = "Something went wrong, it's not you, it's me. Please try again!";
        throw new Error(userFriendlyMessage);
      }
    } catch (error) {
      // Update AI message with user-friendly error
      const errorMessage = error instanceof Error ? error.message : "I'm sorry, I couldn't process your request. Please try again!";
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === aiMessageId ? {
            ...msg,
            text: errorMessage,
            status: 'error'
          } : msg
        )
      );
      
      // Only show toast for unexpected errors, not user-friendly ones
      if (!(error instanceof Error) || error.message.includes('unexpected')) {
        toast.error('Unable to process your request');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle stopping generation
  const handleStop = async () => {
    setIsStoppingGeneration(true);
    
    // Stop all file streaming immediately
    stopAllStreaming();
    
    const { data, error } = await safeAuthenticatedFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/middleware/stop`,
      {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          session_id: sessionId 
        })
      },
      { 
        silent: true, // Handle errors gracefully
        showToast: false // Custom toast below
      }
    );

    if (error) {
      toast.error("Unable to stop generation. Please try again.");
    } else {
      toast("Generation stopped by user.", {
        icon: '💬',
        style: {
          background: '#3498db',
          color: '#fff',
        },
      });
    }

    setMessages(current => 
      current.map(msg => 
        msg.status === 'thinking' ? {
          ...msg,
          text: 'I stopped working on this response. Feel free to ask another question or rephrase your request.',
          status: 'error'
        } : msg
      )
    );
    
    setIsGenerating(false);
    setIsStoppingGeneration(false);
  };

  // Handle retry message
  const handleRetry = async (messageId: string) => {
    resetTestEnvironment();

    const failedMessage = messages.find(msg => msg.id === messageId);
    if (!failedMessage || !sessionId) return;
    
    // Find the user message that preceded this AI message
    const messageIndex = messages.findIndex(msg => msg.id === messageId);
    if (messageIndex <= 0) return;
    
    const userMessage = messages[messageIndex - 1];
    if (!userMessage || userMessage.sender !== 'You') return;
    
    // Update the failed message to thinking state
    setMessages(prev => 
      prev.map(msg => 
        msg.id === messageId ? {
          ...msg,
          text: 'Thinking...',
          status: 'thinking'
        } : msg
      )
    );
    
    setIsGenerating(true);
    
    try {
      // Ensure WebSocket connection before proceeding
      await ensureWebSocketConnection();
      
      // Make the API call using safeAuthenticatedFetch
      const { data, error } = await safeAuthenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/middleware/extension/make`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: userMessage.text,
            session_id: sessionId,
          })
        },
        {
          onRetry: () => handleRetry(messageId), // Allow retry
          showToast: false // We'll handle the error display ourselves
        }
      );
      
      if (error) {
        // Handle different error types gracefully
        let userMessage = "I'm sorry, I couldn't process your request. Please try again!";
        
        if (error.type === 'rate_limit') {
          userMessage = "You're sending requests too quickly. Please wait a moment and try again.";
        } else if (error.type === 'validation') {
          userMessage = "There was an issue with your request. Please try rephrasing your question.";
        } else if (error.type === 'auth') {
          userMessage = "Your session has expired. Please refresh the page and sign in again.";
        } else if (error.type === 'server') {
          userMessage = "Our servers are experiencing issues. Please try again in a few moments.";
        }
        
        throw new Error(userMessage);
      }
      
      if (data?.success) {
        await fetchSessionInfo();
        
        setMessages(prev => 
          prev.map(msg => 
            msg.id === messageId ? {
              ...msg,
              text: data.answer || 'I have processed your request.',
              status: 'idle'
            } : msg
          )
        );
      } else {
        const userFriendlyMessage = "Something went wrong, it's not you, it's me. Please try again!";
        throw new Error(userFriendlyMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "I'm sorry, I couldn't process your request. Please try again!";
      
      setMessages(prev => 
        prev.map(msg => 
          msg.id === messageId ? {
            ...msg,
            text: errorMessage,
            status: 'error'
          } : msg
        )
      );
      
      // Only show toast for unexpected errors, not user-friendly ones
      if (!(error instanceof Error) || error.message.includes('unexpected')) {
        toast.error('Unable to retry request');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-gradient-to-b from-[#111111] to-[#1a1a1a]">
      {/* Main Content Area */}
      <div className="flex flex-1 h-full w-full overflow-hidden relative">
        {/* Chat Area */}
        <div className="flex flex-col h-full w-full overflow-hidden relative">
          {/* Messages container */}
          <ChatMessageList 
            messages={messages}
            hasFiles={hasFiles}
            isLoading={isLoadingHistory}
            onRetry={handleRetry}
            onDownload={handleDownload}
            onTest={handleTestExtension}
            sessionId={sessionId}
            testEnvironmentActive={testEnvironmentActive}
            testEnvironmentTimeLeft={formatTimeLeft(testEnvironmentTimeLeft)}
            canAccessTestFeature={canAccessTestFeature}
            isDownloadComplete={isDownloadComplete}
          />
          
          {/* Upload error alert */}
          {uploadError && (
            <AlertBanner 
              type="error"
              message={uploadError}
              onClose={() => setUploadError(null)}
            />
          )}
          
          {/* Input area */}
          <ChatInput 
            onSendMessage={handleSendMessage}
            onStopGeneration={handleStop}
            isGenerating={isGenerating}
            isStoppingGeneration={isStoppingGeneration}
            userId={userId}
            creditsRemaining={creditsRemaining}
            followUpsRemaining={followUpsRemaining}
            messageCount={messages.length}
          />
        </div>
        
        {/* Code Editor Panel */}
        {hasFiles && (
          <CodeEditorPanel 
            files={files}
            selectedFile={selectedFile}
            isEditorCollapsed={isEditorCollapsed}
            isMobileEditorVisible={isMobileEditorVisible}
            isFilesLoading={isFilesLoading}
            isDownloading={isDownloading}
            onSelectFile={setSelectedFile}
            onToggleCollapse={() => setIsEditorCollapsed(!isEditorCollapsed)}
            onToggleMobileView={() => setIsMobileEditorVisible(!isMobileEditorVisible)}
            onDownload={handleDownload}
            getLanguageFromFileName={getLanguageFromFileName}
            // Add streaming props
            streamingFiles={streamingFiles}
            getFileContent={getFileContent}
            isFileStreaming={isFileStreaming}
            stopAllStreaming={stopAllStreaming}
          />
        )}
      </div>
      
      {/* Test Environment */}
      <TestEnvironment 
        isVisible={isTestFrameVisible}
        url={testFrameUrl}
        isFullScreen={isFullScreenTest}
        isActive={testEnvironmentActive}
        timeLeft={testEnvironmentTimeLeft}
        isLoading={isTestingExtension}
        onClose={() => {
          setIsTestFrameVisible(false);
          if (testSetupFailed) {
            // Also reset failure state when closing
            resetTestEnvironment();
          }
        }}
        onToggleFullScreen={toggleFullScreenTest}
        formatTimeLeft={formatTimeLeft}
        onStopSession={handleStopSession}
        testSetupFailed={testSetupFailed}
        failureReason={testFailureReason}
        onRetry={handleTestExtension}
      />

      {/* Processing Overlay */}
      <ProcessingOverlay isVisible={isProcessingExtension} />

      {/* Download Overlay */}
      <DownloadOverlay 
        isVisible={isDownloading} 
        hasError={!!downloadError}
        errorMessage={downloadError || "Download failed. Please try again later."}
        onRetry={retryDownload}
        sessionId={sessionId}
        onPublishSuccess={() => {
          // Reset download state and show success message
          resetDownloadState();
          toast.success('Extension published to marketplace successfully!');
        }}
      />
    </div>
  );
};

export default ChatPanel;