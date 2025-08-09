// import { getAuth } from 'firebase/auth';
// import { initializeFirebaseIfNeeded } from './firebase-config';
// import { getUserFromCookie, setCookie } from './cookie-utils';

// // Get current user from cookie or memory
// export async function getCurrentUser() {
//   try {
//     await initializeFirebaseIfNeeded();
//     const auth = getAuth();
//     if (auth.currentUser) return auth.currentUser;
//   } catch (error) {
//     console.error('Error initializing Firebase:', error);
//   }
  
//   // Use secure cookie utility instead of js-cookie
//   return getUserFromCookie();
// }

// // Get the stored ID token
// export function getStoredToken() {
//   // Use secure cookie utility instead of js-cookie
//   const user = getUserFromCookie();
//   if (!user) return null;
  
//   try {
//     return user.idToken;
//   } catch (e) {
//     console.error('Error accessing user token data', e);
//     return null;
//   }
// }

// // Update token in cookie
// export function updateStoredToken(token: string) {
//   // Use secure cookie utility instead of js-cookie
//   const user = getUserFromCookie();
//   if (!user) return;
  
//   try {
//     // Update the token and save using secure cookie method
//     const updatedUser = {
//       ...user,
//       idToken: token
//     };
    
//     setCookie('user', updatedUser);
//   } catch (e) {
//     console.error('Error updating token', e);
//   }
// }

// // Create authenticated fetch function
// export async function fetchWithAuth(url: string, options: RequestInit = {}) {
//   try {
//     await initializeFirebaseIfNeeded();
//   } catch (error) {
//     console.error('Error initializing Firebase:', error);
//   }
  
//   const token = getStoredToken();
//   if (!token) {
//     throw new Error('No authentication token available');
//   }
  
//   const headers = {
//     ...options.headers,
//     'Authorization': `Bearer ${token}`
//   };
  
//   return fetch(url, {
//     ...options,
//     headers
//   });
// }

import { getAuth } from 'firebase/auth';
import { setCookie, getUserFromCookie } from './cookie-utils';
import { initializeFirebaseIfNeeded } from './firebase-config';

// Store token expiration time
let tokenExpiryTime: number | null = null;

/**
 * Updates the stored authentication token and sets its expiry time
 * @param token Firebase ID token
 */
export function updateStoredToken(token: string): void {
  // Store token in localStorage
  localStorage.setItem('authToken', token);
  
  // Set expiry time (55 minutes from now to provide buffer before the default 60 min expiry)
  tokenExpiryTime = Date.now() + 55 * 60 * 1000;
}

/**
 * Retrieves the stored authentication token
 */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('authToken');
}

/**
 * Checks if the current token is expiring soon (within 5 minutes)
 */
export function isTokenExpiringSoon(): boolean {
  if (!tokenExpiryTime) return true;
  
  // Check if token will expire in the next 5 minutes
  const FIVE_MINUTES = 5 * 60 * 1000;
  return Date.now() > tokenExpiryTime - FIVE_MINUTES;
}

/**
 * Refreshes the authentication token if needed
 * @returns The current or refreshed token
 */
export async function refreshTokenIfNeeded(): Promise<string | null> {
  try {
    // Check if token needs refreshing
    if (!isTokenExpiringSoon()) {
      const currentToken = getStoredToken();
      if (currentToken) return currentToken;
    }
    
    // Initialize Firebase and get current user
    await initializeFirebaseIfNeeded();
    const auth = getAuth();
    const currentUser = auth.currentUser;
    
    if (!currentUser) {
      return null;
    }
    
    // Force token refresh
    const newToken = await currentUser.getIdToken(true);
    updateStoredToken(newToken);
    
    // Update in cookies too
    const user = getUserFromCookie();
    if (user) {
      setCookie('user', {
        ...user,
        idToken: newToken
      });
    }
    
    return newToken;
  } catch (error) {
    // Handle gracefully without console.error
    return getStoredToken(); // Return existing token if refresh fails
  }
}

/**
 * Sets up periodic token refresh
 */
export function setupTokenRefresh(): void {
  // Check token every 30 minutes
  const REFRESH_INTERVAL = 30 * 60 * 1000;
  
  // Perform initial token refresh
  refreshTokenIfNeeded().catch(error => {
    // Handle gracefully without console.error  
  });
  
  // Set up periodic refresh
  setInterval(() => {
    refreshTokenIfNeeded().catch(error => {
      // Handle gracefully without console.error
    });
  }, REFRESH_INTERVAL);
}