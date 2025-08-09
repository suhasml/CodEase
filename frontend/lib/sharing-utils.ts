import { toast } from 'react-hot-toast';
import { authenticatedFetch } from './api-utils';

export interface ShareResponse {
  success: boolean;
  share_id?: string;
  share_url?: string;
  message?: string;
  error?: string;
}

export interface SharedExtension {
  _id: string;
  share_id: string;
  session_id: string;
  title: string;
  description?: string;
  is_public: boolean;
  is_active: boolean;
  access_count: number;
  created_at: string;
  share_url: string;
  is_expired: boolean;
  is_max_access_reached: boolean;
}

/**
 * Creates a shareable link for an extension
 */
export async function createShareableLink(
  sessionId: string,
  title?: string,
  description?: string,
  isPublic: boolean = true
): Promise<ShareResponse> {
  try {
    const response = await authenticatedFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/middleware/extension/share`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: sessionId,
          title,
          description,
          is_public: isPublic
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 400) {
        throw new Error(errorData.detail || 'Invalid request data');
      } else if (response.status === 401) {
        throw new Error('Authentication required');
      } else if (response.status === 403) {
        throw new Error('Permission denied');
      } else if (response.status === 429) {
        throw new Error('Too many requests. Please wait and try again.');
      } else {
        throw new Error(errorData.detail || 'Failed to create share link');
      }
    }

    const data: ShareResponse = await response.json();
    return data;
  } catch (error) {
    // Handle errors gracefully without console logging
    let errorMessage = 'Failed to create shareable link';
    
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Gets information about a shared extension (public endpoint)
 */
export async function getSharedExtensionInfo(shareId: string) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/middleware/public/extension/share/${shareId}/info`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 404) {
        throw new Error('Shared extension not found');
      } else if (response.status === 410) {
        throw new Error('Shared extension has expired');
      } else {
        throw new Error(errorData.detail || 'Failed to fetch extension info');
      }
    }

    return await response.json();
  } catch (error) {
    // Re-throw with proper error handling, no console logging
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch extension information');
  }
}

/**
 * Gets detailed information about a shared extension (requires authentication)
 */
export async function getSharedExtensionData(shareId: string) {
  try {
    const response = await authenticatedFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/middleware/extension/share/${shareId}`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 404) {
        throw new Error('Shared extension not found');
      } else if (response.status === 410) {
        throw new Error('Shared extension has expired or reached access limit');
      } else if (response.status === 403) {
        throw new Error('Access denied to this shared extension');
      } else {
        throw new Error(errorData.detail || 'Failed to fetch extension data');
      }
    }

    return await response.json();
  } catch (error) {
    // Re-throw with proper error handling, no console logging
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to fetch extension data');
  }
}

/**
 * Deactivates a shared extension link
 */
export async function deactivateSharedLink(shareId: string): Promise<boolean> {
  try {
    const response = await authenticatedFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/middleware/extension/share/${shareId}`,
      {
        method: 'DELETE'
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 404) {
        // Link already doesn't exist, consider it deactivated
        return true;
      } else if (response.status === 403) {
        throw new Error('Permission denied to deactivate this link');
      } else {
        throw new Error(errorData.detail || 'Failed to deactivate share link');
      }
    }

    const data = await response.json();
    return data.success;
  } catch (error) {
    // Handle errors gracefully without console logging
    return false;
  }
}

/**
 * Gets all shared extensions created by the current user
 */
export async function getUserSharedExtensions(): Promise<SharedExtension[]> {
  try {
    const response = await authenticatedFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/middleware/user/shared-extensions`
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        throw new Error('Authentication required');
      } else {
        throw new Error(errorData.detail || 'Failed to fetch shared extensions');
      }
    }

    const data = await response.json();
    return data.shared_extensions || [];
  } catch (error) {
    // Handle errors gracefully without console logging
    return [];
  }
}

/**
 * Starts a test environment for a shared extension
 */
export async function testSharedExtension(shareId: string) {
  try {
    const response = await authenticatedFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/middleware/extension/share/${shareId}/test`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 404) {
        throw new Error('Shared extension not found');
      } else if (response.status === 410) {
        throw new Error('Shared extension has expired or reached access limit');
      } else if (response.status === 403) {
        throw new Error('Access denied to test this extension');
      } else if (response.status === 503) {
        throw new Error('Test environment unavailable. Please try again later.');
      } else {
        throw new Error(errorData.detail || 'Failed to start test environment');
      }
    }

    return await response.json();
  } catch (error) {
    // Re-throw with proper error handling, no console logging
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to start test environment');
  }
}

/**
 * Generates a shareable URL from a share ID
 * 
 * Configuration:
 * - For development: Set NEXT_PUBLIC_FRONTEND_URL=http://localhost:3000 in .env.local
 * - For production: Set NEXT_PUBLIC_FRONTEND_URL=https://codease.pro in .env.local
 * - Falls back to current domain if not set
 */
export function generateShareUrl(shareId: string): string {
  try {
    // Priority: Environment variable > Current domain > localhost fallback
    const baseUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || 
                    (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');
    
    return `${baseUrl}/share/${shareId}`;
  } catch (error) {
    // Fallback to localhost if anything goes wrong
    return `http://localhost:3000/share/${shareId}`;
  }
}

/**
 * Extracts share ID from a shareable URL
 */
export function extractShareIdFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/');
    const shareIndex = pathParts.indexOf('share');
    
    if (shareIndex !== -1 && shareIndex < pathParts.length - 1) {
      return pathParts[shareIndex + 1];
    }
    
    return null;
  } catch (error) {
    // Handle URL parsing errors gracefully
    return null;
  }
}

/**
 * Copies text to clipboard with fallback for older browsers
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      // Fallback for older browsers or non-secure contexts
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      return successful;
    }
  } catch (error) {
    // Handle clipboard errors gracefully
    return false;
  }
}

/**
 * Creates a shareable link and copies it to clipboard
 */
export async function createAndCopyShareLink(
  sessionId: string,
  title?: string,
  description?: string
): Promise<string | null> {
  try {
    const response = await createShareableLink(sessionId, title, description);
    
    if (response.success && response.share_url) {
      const copied = await copyToClipboard(response.share_url);
      
      if (copied) {
        toast.success('Share link copied to clipboard!');
      } else {
        toast.success('Share link created successfully!');
      }
      
      return response.share_url;
    } else {
      toast.error(response.error || 'Failed to create share link');
      return null;
    }
  } catch (error) {
    // Handle errors gracefully
    toast.error('Failed to create share link');
    return null;
  }
}

/**
 * Validates if a string is a valid share URL
 */
export function isValidShareUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const pathRegex = /^\/share\/[a-f0-9-]+$/i;
    return pathRegex.test(urlObj.pathname);
  } catch (error) {
    // Handle URL validation errors gracefully
    return false;
  }
}

/**
 * Formats date for display in sharing interfaces
 */
export function formatShareDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Unknown date';
    }
    
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (error) {
    // Handle date formatting errors gracefully
    return 'Unknown date';
  }
}

/**
 * Share via Web Share API (if supported) or fallback to clipboard
 */
export async function shareExtension(
  title: string,
  url: string,
  description?: string
): Promise<boolean> {
  // Check if Web Share API is supported and available
  if (navigator.share && navigator.canShare && navigator.canShare({ url })) {
    try {
      await navigator.share({
        title: `Check out this extension: ${title}`,
        text: description || `Test this Chrome extension shared on CodEase`,
        url: url
      });
      return true;
    } catch (error) {
      // User cancelled or error occurred, fall back to clipboard silently
      // No console logging - this is expected behavior when user cancels
    }
  }
  
  // Fallback to copying to clipboard
  const copied = await copyToClipboard(url);
  if (copied) {
    toast.success('Share link copied to clipboard!');
  } else {
    toast.error('Failed to copy share link');
  }
  
  return copied;
} 