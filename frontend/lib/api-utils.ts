// import { getAuth } from 'firebase/auth';
// import { updateStoredToken, getStoredToken, isTokenExpiringSoon, refreshTokenIfNeeded } from '@/lib/auth-utils';
// import { getUserFromCookie, setCookie, removeCookie } from '@/lib/cookie-utils';
// import { initializeFirebaseIfNeeded } from '@/lib/firebase-config';
// import { toast } from 'react-hot-toast'; // Assuming you're using react-hot-toast

// /**
//  * Makes an authenticated API request and handles token refresh if needed
//  * @param url API endpoint
//  * @param options Fetch options
//  * @param maxRetries Maximum number of retries (default: 3)
//  * @param silentFailure Whether to silently redirect on auth failures without showing errors
//  */
// export async function authenticatedFetch(
//   url: string, 
//   options: RequestInit = {}, 
//   maxRetries: number = 3,
//   silentFailure: boolean = false
// ): Promise<Response> {
//   try {
//     // Proactively refresh token if it's expiring soon
//     let idToken = await refreshTokenIfNeeded();
//     const user = getUserFromCookie();
    
//     // If refreshTokenIfNeeded fails, fall back to stored token or cookie
//     if (!idToken) {
//       idToken = user?.idToken || getStoredToken();
//     }
    
//     // If still no token, handle the auth error gracefully
//     if (!idToken) {
//       // Only log the error, don't throw it
//       console.error('No authentication token available');
      
//       // Handle redirection or notification asynchronously to not disrupt current operation
//       setTimeout(() => {
//         handleAuthFailure(silentFailure);
//       }, 0);
      
//       // Return a mock response instead of throwing
//       return new Response(JSON.stringify({ 
//         success: false, 
//         error: 'Authentication required',
//         requiresAuth: true 
//       }), { status: 401 });
//     }
    
//     // Setup headers with token
//     const headers = {
//       ...(options.headers || {}),
//       'Authorization': `Bearer ${idToken}`
//     };
    
//     // Make the request
//     const response = await fetch(url, {
//       ...options,
//       headers
//     });
    
//     // If unauthorized (token refresh didn't work or token invalid)
//     if (response.status === 401 && maxRetries > 0) {
//       // Try to force refresh token
//       try {
//         // Ensure Firebase is initialized before getting auth
//         await initializeFirebaseIfNeeded();
//         const auth = getAuth();
//         const currentUser = auth.currentUser;
        
//         if (currentUser) {
//           try {
//             // Force token refresh
//             idToken = await currentUser.getIdToken(true);
            
//             // Update stored token
//             updateStoredToken(idToken);
            
//             // Update in cookies too using secure method
//             if (user) {
//               setCookie('user', {
//                 ...user,
//                 idToken
//               });
//             }
            
//             // Retry the request with new token
//             return authenticatedFetch(url, options, maxRetries - 1, silentFailure);
//           } catch (error) {
//             console.error('Token refresh failed:', error);
            
//             // Handle auth failure gracefully
//             setTimeout(() => {
//               handleAuthFailure(silentFailure);
//             }, 0);
            
//             // Return a mock response
//             return new Response(JSON.stringify({ 
//               success: false, 
//               error: 'Session expired',
//               requiresAuth: true 
//             }), { status: 401 });
//           }
//         } else {
//           // User not authenticated
//           setTimeout(() => {
//             handleAuthFailure(silentFailure);
//           }, 0);
          
//           // Return a mock response
//           return new Response(JSON.stringify({ 
//             success: false, 
//             error: 'User not authenticated',
//             requiresAuth: true 
//           }), { status: 401 });
//         }
//       } catch (firebaseError) {
//         console.error('Firebase initialization error:', firebaseError);
        
//         // Handle auth failure gracefully
//         setTimeout(() => {
//           handleAuthFailure(silentFailure);
//         }, 0);
        
//         // Return a mock response
//         return new Response(JSON.stringify({ 
//           success: false, 
//           error: 'Authentication service unavailable',
//           requiresAuth: true 
//         }), { status: 401 });
//       }
//     }
    
//     return response;
//   } catch (error) {
//     console.error('API request failed:', error);
    
//     // For non-auth related errors, still return a response object rather than throwing
//     return new Response(JSON.stringify({ 
//       success: false, 
//       error: 'Request failed' 
//     }), { status: 500 });
//   }
// }

// /**
//  * Handle authentication failures by redirecting to sign-in
//  * @param silentFailure Whether to show a notification or silently redirect
//  */
// function handleAuthFailure(silentFailure: boolean = false) {
//   // Clear auth state
//   removeCookie('user');
  
//   // Show a notification if not silent
//   if (!silentFailure) {
//     toast.error("Your session has expired. Please sign in again.", {
//       id: "auth-expired", // Prevents duplicate toasts
//       duration: 5000
//     });
//   }
  
//   // Save current URL to redirect back after login
//   if (typeof window !== 'undefined') {
//     const currentPath = window.location.pathname;
//     if (currentPath !== '/signin' && currentPath !== '/signup') {
//       sessionStorage.setItem('redirectAfterLogin', currentPath);
//     }
    
//     // Redirect to sign-in page
//     window.location.href = '/signin';
//   }
// }

import { getAuth } from 'firebase/auth';
import { updateStoredToken, getStoredToken, isTokenExpiringSoon, refreshTokenIfNeeded } from '@/lib/auth-utils';
import { getUserFromCookie, setCookie, removeCookie } from '@/lib/cookie-utils';
import { initializeFirebaseIfNeeded } from '@/lib/firebase-config';
import { toast } from 'react-hot-toast'; // Assuming you're using react-hot-toast

/**
 * Makes an authenticated API request and handles token refresh if needed
 * @param url API endpoint
 * @param options Fetch options
 * @param maxRetries Maximum number of retries (default: 3)
 * @param silentFailure Whether to silently redirect on auth failures without showing errors
 * @param timeoutMs Timeout in milliseconds (default: 12000000ms = 12000 seconds)
 */
export async function authenticatedFetch(
  url: string, 
  options: RequestInit = {}, 
  maxRetries: number = 3,
  silentFailure: boolean = false,
  timeoutMs: number = 12000000
): Promise<Response> {
  try {
    // Proactively refresh token if it's expiring soon
    let idToken = await refreshTokenIfNeeded();
    const user = getUserFromCookie();
    
    // If refreshTokenIfNeeded fails, fall back to stored token or cookie
    if (!idToken) {
      idToken = user?.idToken || getStoredToken();
    }
    
    // If still no token, handle the auth error gracefully
    if (!idToken) {
      // Handle redirection or notification asynchronously to not disrupt current operation
      setTimeout(() => {
        handleAuthFailure(silentFailure);
      }, 0);
      
      // Return a mock response instead of throwing
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Authentication required',
        requiresAuth: true 
      }), { status: 401 });
    }
    
    // Setup headers with token
    const headers = {
      ...(options.headers || {}),
      'Authorization': `Bearer ${idToken}`
    };
    
    // Create an AbortController to handle timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    
    try {
      // Make the request with timeout
      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal
      });
      
      // Clear the timeout as we got a response
      clearTimeout(timeoutId);
      
      // If unauthorized (token refresh didn't work or token invalid)
      if (response.status === 401 && maxRetries > 0) {
        // Try to force refresh token
        try {
          // Ensure Firebase is initialized before getting auth
          await initializeFirebaseIfNeeded();
          const auth = getAuth();
          const currentUser = auth.currentUser;
          
          if (currentUser) {
            try {
              // Force token refresh
              idToken = await currentUser.getIdToken(true);
              
              // Update stored token
              updateStoredToken(idToken);
              
              // Update in cookies too using secure method
              if (user) {
                setCookie('user', {
                  ...user,
                  idToken
                });
              }
              
              // Retry the request with new token
              return authenticatedFetch(url, options, maxRetries - 1, silentFailure, timeoutMs);
            } catch (error) {
              // Handle auth failure gracefully
              setTimeout(() => {
                handleAuthFailure(silentFailure);
              }, 0);
              
              // Return a mock response
              return new Response(JSON.stringify({ 
                success: false, 
                error: 'Session expired',
                requiresAuth: true 
              }), { status: 401 });
            }
          } else {
            // User not authenticated
            setTimeout(() => {
              handleAuthFailure(silentFailure);
            }, 0);
            
            // Return a mock response
            return new Response(JSON.stringify({ 
              success: false, 
              error: 'User not authenticated',
              requiresAuth: true 
            }), { status: 401 });
          }
        } catch (firebaseError) {
          // Handle auth failure gracefully
          setTimeout(() => {
            handleAuthFailure(silentFailure);
          }, 0);
          
          // Return a mock response
          return new Response(JSON.stringify({ 
            success: false, 
            error: 'Authentication service unavailable',
            requiresAuth: true 
          }), { status: 401 });
        }
      }
      
      return response;
    } catch (fetchError: unknown) {
      // Clear the timeout in case of an error
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return new Response(JSON.stringify({
          success: false,
          error: 'Request timed out'
        }), { status: 408 }); // 408 Request Timeout
      }
      
      throw fetchError; // Re-throw other fetch errors
    }
  } catch (error) {
    // For non-auth related errors, still return a response object rather than throwing
    return new Response(JSON.stringify({ 
      success: false, 
      error: 'Request failed' 
    }), { status: 500 });
  }
}

/**
 * Handle authentication failures by redirecting to sign-in
 * @param silentFailure Whether to show a notification or silently redirect
 */
function handleAuthFailure(silentFailure: boolean = false) {
  // Clear auth state
  removeCookie('user');
  
  // Show a notification if not silent
  if (!silentFailure) {
    toast.error("Your session has expired. Please sign in again.", {
      id: "auth-expired", // Prevents duplicate toasts
      duration: 5000
    });
  }
  
  // Save current URL to redirect back after login
  if (typeof window !== 'undefined') {
    const currentPath = window.location.pathname;
    if (currentPath !== '/signin' && currentPath !== '/signup') {
      sessionStorage.setItem('redirectAfterLogin', currentPath);
    }
    
    // Redirect to sign-in page
    window.location.href = '/signin';
  }
}