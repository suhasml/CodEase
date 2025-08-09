'use client';

import { toast } from 'react-hot-toast';

// Error types for different scenarios
export interface ApiError {
  status: number;
  message: string;
  type: 'api' | 'network' | 'auth' | 'validation' | 'rate_limit' | 'server';
  retry?: boolean;
}

// User-friendly error messages for different status codes
const ERROR_MESSAGES: Record<number, string> = {
  400: 'Invalid request. Please check your input and try again.',
  401: 'Your session has expired. Please sign in again.',
  403: 'You don\'t have permission to perform this action.',
  404: 'The requested resource was not found.',
  408: 'Request timed out. Please check your connection and try again.',
  409: 'There was a conflict with your request. Please try again.',
  413: 'The file you\'re trying to upload is too large.',
  422: 'The data you provided is invalid. Please check and try again.',
  429: 'You\'re making requests too quickly. Please wait a moment and try again.',
  500: 'Something went wrong on our end. Please try again later.',
  502: 'Service temporarily unavailable. Please try again in a few moments.',
  503: 'Service is currently under maintenance. Please try again later.',
  504: 'Request timed out. Please try again.',
};

// Generic fallback messages
const FALLBACK_MESSAGES = {
  network: 'Connection failed. Please check your internet connection and try again.',
  generic: 'Something unexpected happened. Please try again.',
  auth: 'Authentication failed. Please sign in again.',
  timeout: 'Request timed out. Please try again.',
};

/**
 * Parse and handle API errors gracefully
 */
export async function handleApiError(response: Response): Promise<ApiError> {
  let errorData: any = {};
  let errorMessage = '';

  // Try to parse error response
  try {
    const text = await response.text();
    if (text) {
      errorData = JSON.parse(text);
    }
  } catch {
    // Ignore JSON parse errors
  }

  // Determine error type
  let errorType: ApiError['type'] = 'api';
  if (response.status === 401) errorType = 'auth';
  else if (response.status === 429) errorType = 'rate_limit';
  else if (response.status >= 500) errorType = 'server';
  else if (response.status === 422 || response.status === 400) errorType = 'validation';

  // Get user-friendly error message
  if (errorData.message && typeof errorData.message === 'string') {
    errorMessage = errorData.message;
  } else if (errorData.error && typeof errorData.error === 'string') {
    errorMessage = errorData.error;
  } else if (ERROR_MESSAGES[response.status]) {
    errorMessage = ERROR_MESSAGES[response.status];
  } else {
    errorMessage = FALLBACK_MESSAGES.generic;
  }

  return {
    status: response.status,
    message: errorMessage,
    type: errorType,
    retry: response.status >= 500 || response.status === 429 || response.status === 408
  };
}

/**
 * Handle network errors (fetch failures, timeouts, etc.)
 */
export function handleNetworkError(error: Error): ApiError {
  let message = FALLBACK_MESSAGES.network;
  let type: ApiError['type'] = 'network';

  if (error.message.includes('timeout') || error.name === 'AbortError') {
    message = FALLBACK_MESSAGES.timeout;
    type = 'network';
  } else if (error.message.includes('fetch')) {
    message = FALLBACK_MESSAGES.network;
  } else if (error.message) {
    // Use the error message if it's user-friendly
    const isUserFriendly = !error.message.includes('TypeError') && 
                          !error.message.includes('NetworkError') &&
                          error.message.length < 200;
    
    if (isUserFriendly) {
      message = error.message;
    }
  }

  return {
    status: 0,
    message,
    type,
    retry: true
  };
}

/**
 * Display error to user based on error type
 */
export function displayError(error: ApiError, options?: { 
  silent?: boolean; 
  autoRetry?: boolean;
  onRetry?: () => void;
}) {
  const { silent = false, autoRetry = false, onRetry } = options || {};

  if (silent) return;

  // Don't show toast for auth errors if they're being handled by redirect
  if (error.type === 'auth') return;

  // Configure toast based on error type
  const toastOptions: any = {
    duration: error.type === 'rate_limit' ? 8000 : 5000,
    id: `error-${error.status}-${error.type}`, // Prevent duplicate toasts
  };

  // Add retry button for retryable errors
  if (error.retry && onRetry && !autoRetry) {
    toastOptions.action = {
      label: 'Retry',
      onClick: onRetry,
    };
  }

  // Use appropriate toast type
  if (error.type === 'rate_limit') {
    toast.error(error.message, {
      ...toastOptions,
      icon: '⏳',
    });
  } else if (error.type === 'validation') {
    toast.error(error.message, {
      ...toastOptions,
      icon: '⚠️',
    });
  } else if (error.type === 'server') {
    toast.error(error.message, {
      ...toastOptions,
      icon: '🔧',
    });
  } else {
    toast.error(error.message, toastOptions);
  }
}

/**
 * Wrapper for authenticatedFetch with proper error handling
 */
export async function safeAuthenticatedFetch(
  url: string, 
  options: RequestInit = {},
  errorOptions?: { 
    silent?: boolean; 
    onRetry?: () => void;
    showToast?: boolean;
  }
): Promise<{ data: any; error: ApiError | null }> {
  const { silent = false, onRetry, showToast = true } = errorOptions || {};

  try {
    // Import here to avoid circular dependencies
    const { authenticatedFetch } = await import('@/lib/api-utils');
    
    const response = await authenticatedFetch(url, options, 3, silent);
    
    if (!response.ok) {
      const error = await handleApiError(response);
      
      if (showToast) {
        displayError(error, { silent, onRetry });
      }
      
      return { data: null, error };
    }

    const data = await response.json();
    return { data, error: null };
    
  } catch (networkError) {
    const error = handleNetworkError(networkError as Error);
    
    if (showToast) {
      displayError(error, { silent, onRetry });
    }
    
    return { data: null, error };
  }
}

/**
 * Enhanced error boundary for React components
 */
export class EnhancedErrorBoundary extends Error {
  constructor(
    public readonly userMessage: string,
    public readonly originalError?: Error,
    public readonly context?: string
  ) {
    super(userMessage);
    this.name = 'EnhancedErrorBoundary';
  }
}

/**
 * Graceful error handler for async operations
 */
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string,
  fallback?: T
): Promise<T | null> {
  try {
    return await operation();
  } catch (error) {
    // Silently handle errors without any console logging
    
    if (fallback !== undefined) {
      return fallback;
    }
    
    return null;
  }
}

/**
 * Validation for common input types
 */
export function validateInput(value: string, type: 'email' | 'url' | 'required'): { valid: boolean; message?: string } {
  switch (type) {
    case 'required':
      if (!value || value.trim().length === 0) {
        return { valid: false, message: 'This field is required.' };
      }
      break;
    case 'email':
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        return { valid: false, message: 'Please enter a valid email address.' };
      }
      break;
    case 'url':
      try {
        new URL(value);
      } catch {
        return { valid: false, message: 'Please enter a valid URL.' };
      }
      break;
  }
  return { valid: true };
}
