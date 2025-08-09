'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

/**
 * A custom hook for handling API errors in a user-friendly way.
 * This prevents Next.js from showing its default error banner by handling
 * errors gracefully and displaying toast notifications instead.
 */
export default function useErrorHandler() {
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Reset error state on unmount
  useEffect(() => {
    return () => {
      setIsError(false);
      setErrorMessage(null);
    };
  }, []);

  // Function to safely handle API responses
  const handleApiResponse = async <T,>(promise: Promise<Response>): Promise<T | null> => {
    try {
      const response = await promise;
      
      if (!response.ok) {
        // Try to parse error message from response
        const errorData = await response.json().catch(() => ({}));
        const message = errorData.message || `Error: ${response.status} ${response.statusText}`;
        throw new Error(message);
      }
      
      return await response.json() as T;
    } catch (error: any) {
      const message = error.message || 'Something went wrong. Please try again.';
      setIsError(true);
      setErrorMessage(message);
      toast.error(message);
      return null;
    }
  };

  // Function to handle asynchronous operations with error handling
  const safeAsync = async <T,>(asyncFn: () => Promise<T>, errorMsg: string = 'An error occurred'): Promise<T | null> => {
    try {
      return await asyncFn();
    } catch (error: any) {
      const message = error.message || errorMsg;      setIsError(true);
      setErrorMessage(message);
      toast.error(message);
      // Handle gracefully without console.error
      return null;
    }
  };
  // Function to handle wallet-related errors
  const handleWalletError = (error: any): string => {
    // Handle gracefully without console.error
    
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.message?.includes('User rejected')) {
      return 'Transaction was rejected by the user';
    }
    
    if (error?.message?.includes('timeout')) {
      return 'The operation timed out. Please try again.';
    }
    
    if (error?.message) {
      return error.message;
    }
    
    return 'An error occurred with your wallet connection';
  };

  // Clear any existing errors
  const clearError = () => {
    setIsError(false);
    setErrorMessage(null);
  };

  return {
    isError,
    errorMessage,
    handleApiResponse,
    safeAsync,
    handleWalletError,
    clearError
  };
}
