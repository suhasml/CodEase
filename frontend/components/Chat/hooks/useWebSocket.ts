// 'use client';

// import { useState, useEffect, useCallback, useRef } from 'react';
// import { toast } from 'react-hot-toast';
// import { getStoredToken } from '@/lib/auth-utils';
// import { getUserFromCookie } from '@/lib/cookie-utils';
// import { WebSocketMessage } from '../components/ChatPanel';

// const useWebSocket = (sessionId?: string, onMessage?: (data: WebSocketMessage) => void) => {
//   const [websocket, setWebsocket] = useState<WebSocket | null>(null);
//   const [isConnecting, setIsConnecting] = useState(false);
//   const reconnectAttempts = useRef(0);
//   const maxReconnectAttempts = 5;
//   const reconnectTimeout = useRef<NodeJS.Timeout | null>(null);
//   const connectionRef = useRef<WebSocket | null>(null);
//   const currentSessionId = useRef<string | undefined>(sessionId);
//   const unmountingRef = useRef(false);
  
//   // Update the WebSocket URL to use port 8002 instead of 8000
//   const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8002';
  
//   // Clear any existing reconnect timers when unmounting
//   useEffect(() => {
//     return () => {
//       if (reconnectTimeout.current) {
//         clearTimeout(reconnectTimeout.current);
//       }
//       // Mark as unmounting to prevent further reconnection attempts
//       unmountingRef.current = true;
//     };
//   }, []);

//   // Helper to get the authentication token
//   const getAuthToken = useCallback(() => {
//     const userData = getUserFromCookie();
//     const idToken = userData?.idToken || getStoredToken();
//     if (!idToken) {
//       console.error('No authentication token available for WebSocket');
//       toast.error('Authentication error. Please try signing in again.');
//     }
//     return idToken;
//   }, []);

//   // Create WebSocket connection
//   const createWebSocketConnection = useCallback(() => {
//     if (!sessionId) return null;
    
//     // Get the ID token for authentication
//     const idToken = getAuthToken();
//     if (!idToken) return null;
    
//     // Don't create a new connection if we already have one for this session
//     if (connectionRef.current && 
//         connectionRef.current.readyState === WebSocket.OPEN && 
//         currentSessionId.current === sessionId) {
//       return connectionRef.current;
//     }
    
//     try {
//       // Include the token in the URL for authentication
//       const ws = new WebSocket(`${wsUrl}/ws/${sessionId}?token=${encodeURIComponent(idToken)}`);
      
//       ws.onopen = () => {
//         reconnectAttempts.current = 0;
//         setWebsocket(ws);
//         connectionRef.current = ws;
//       };
      
//       ws.onmessage = (event: MessageEvent) => {
//         try {
//           const data: WebSocketMessage = JSON.parse(event.data);
          
//           if (onMessage) {
//             onMessage(data);
//           }
//         } catch (error) {
//           console.error('Error parsing WebSocket message:', error);
//         }
//       };
      
//       ws.onerror = (error) => {
//         console.error('WebSocket error:', error);
//       };
      
//       ws.onclose = (event) => {
        
//         // Check if closure was due to auth error (e.g., token expired)
//         if (event.code === 1008 || event.reason.includes('auth')) {
//           // Try to refresh the token
//           toast.error('Authentication error. Trying to reconnect...');
//           // The next connection attempt will use a fresh token via getAuthToken
//         }
        
//         // Only null the refs if this is the current connection and we're not unmounting
//         if (connectionRef.current === ws) {
//           setWebsocket(null);
          
//           // Only attempt to reconnect if it wasn't a normal closure and we haven't exceeded max attempts
//           if (event.code !== 1000 && !unmountingRef.current && reconnectAttempts.current < maxReconnectAttempts) {
//             const delay = Math.min(1000 * (2 ** reconnectAttempts.current), 30000);
            
//             reconnectTimeout.current = setTimeout(() => {
//               if (!unmountingRef.current) {
//                 reconnectAttempts.current += 1;
//                 connectionRef.current = createWebSocketConnection();
//               }
//             }, delay);
//           } else if (reconnectAttempts.current >= maxReconnectAttempts && !unmountingRef.current) {
//             connectionRef.current = null;
//             toast.error('Connection failed. Please refresh the page.');
//           }
//         }
//       };
      
//       return ws;
//     } catch (error) {
//       console.error('Error creating WebSocket connection:', error);
//       return null;
//     }
//   }, [sessionId, onMessage, wsUrl, getAuthToken]);

//   // Initialize WebSocket connection - only when sessionId changes
//   useEffect(() => {
//     if (!sessionId) return;
    
//     // Only close and recreate if the session ID has changed
//     if (currentSessionId.current !== sessionId && connectionRef.current) {
//       try {
//         const ws = connectionRef.current;
//         ws.close(1000, 'Session changed');
//         connectionRef.current = null;
//       } catch (e) {
//         console.error('Error closing WebSocket on session change:', e);
//         connectionRef.current = null;
//       }
//     }
    
//     // Update current session ID
//     currentSessionId.current = sessionId;
    
//     // Create new connection if needed
//     if (!connectionRef.current || 
//         connectionRef.current.readyState === WebSocket.CLOSED || 
//         connectionRef.current.readyState === WebSocket.CLOSING) {
//       const ws = createWebSocketConnection();
//       if (ws) {
//         connectionRef.current = ws;
//       }
//     }
    
//     // Keep the connection alive with periodic pings
//     const pingInterval = setInterval(() => {
//       if (connectionRef.current && connectionRef.current.readyState === WebSocket.OPEN) {
//         try {
//           connectionRef.current.send(JSON.stringify({
//             action: 'ping',
//             timestamp: Date.now()
//           }));
//         } catch (e) {
//           console.error('Error sending ping:', e);
//         }
//       }
//     }, 30000);
    
//     return () => {
//       clearInterval(pingInterval);
//       // Don't close connections on effect cleanup when it's just a re-render
//     };
//   }, [sessionId, createWebSocketConnection]);

//   // Helper function to ensure WebSocket is connected
//   const ensureWebSocketConnection = useCallback(async (): Promise<WebSocket> => {
//     // If WebSocket is already connected, return it
//     if (connectionRef.current && connectionRef.current.readyState === WebSocket.OPEN) {
//       return connectionRef.current;
//     }
    
//     // Prevent multiple connection attempts
//     if (isConnecting) {
//       throw new Error('WebSocket connection is already in progress');
//     }
    
//     setIsConnecting(true);
    
//     try {
//       // Close existing websocket if it exists but isn't in OPEN state
//       if (connectionRef.current && 
//          (connectionRef.current.readyState === WebSocket.CLOSING || 
//           connectionRef.current.readyState === WebSocket.CLOSED)) {
//         connectionRef.current = null;
//       }
      
//       // Get a fresh ID token
//       const idToken = getAuthToken();
//       if (!idToken) {
//         throw new Error('No authentication token available');
//       }
      
//       // Create a new WebSocket connection
//       return await new Promise((resolve, reject) => {
//         if (!sessionId) {
//           reject(new Error('No session ID provided'));
//           return;
//         }
        
//         if (connectionRef.current && connectionRef.current.readyState === WebSocket.OPEN) {
//           resolve(connectionRef.current);
//           return;
//         }
        
//         const ws = new WebSocket(`${wsUrl}/ws/${sessionId}?token=${encodeURIComponent(idToken)}`);
//         const timeout = setTimeout(() => {
//           reject(new Error('WebSocket connection timeout'));
//         }, 10000);
        
//         ws.onopen = () => {
//           clearTimeout(timeout);
//           setWebsocket(ws);
//           connectionRef.current = ws;
//           resolve(ws);
//         };
        
//         ws.onmessage = (event: MessageEvent) => {
//           try {
//             const data: WebSocketMessage = JSON.parse(event.data);
//             if (onMessage) {
//               onMessage(data);
//             }
//           } catch (error) {
//             console.error('Error parsing WebSocket message during reconnect:', error);
//           }
//         };
        
//         ws.onerror = (error) => {
//           clearTimeout(timeout);
//           console.error('WebSocket reconnection error:', error);
//           reject(new Error('Failed to connect WebSocket'));
//         };
        
//         ws.onclose = () => {
//           clearTimeout(timeout);
//           reject(new Error('WebSocket closed during connection attempt'));
//         };
//       });
//     } catch (error) {
//       console.error('Error ensuring WebSocket connection:', error);
//       throw error;
//     } finally {
//       setIsConnecting(false);
//     }
//   }, [sessionId, isConnecting, onMessage, wsUrl, getAuthToken]);

//   // Add logging to help diagnose connection issues
//   useEffect(() => {
//     if (connectionRef.current) {
//       const stateMap = {
//         0: 'CONNECTING',
//         1: 'OPEN',
//         2: 'CLOSING', 
//         3: 'CLOSED'
//       };
//     } else {
//       // console.log('No WebSocket connection exists');
//     }
//   }, [websocket, connectionRef.current]);

//   return {
//     websocket: connectionRef.current || websocket,
//     ensureWebSocketConnection
//   };
// };

// export default useWebSocket;

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { getStoredToken } from '@/lib/auth-utils';
import { getUserFromCookie } from '@/lib/cookie-utils';
import { WebSocketMessage } from '../components/ChatPanel';

const useWebSocket = (sessionId?: string, onMessage?: (data: WebSocketMessage) => void) => {
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const connectionRef = useRef<WebSocket | null>(null);
  const currentSessionId = useRef<string | undefined>(sessionId);
  const unmountingRef = useRef(false);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Update the WebSocket URL to use port 8000 (same as backend API)
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000';

  // Clear any existing reconnect timers and ping intervals when unmounting
  useEffect(() => {
    return () => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      // Close any existing connection on unmount
      if (connectionRef.current && connectionRef.current.readyState === WebSocket.OPEN) {
        connectionRef.current.close(1000, 'Component unmounting');
      }
      // Mark as unmounting to prevent further reconnection attempts
      unmountingRef.current = true;
    };
  }, []);

  // Helper to get the authentication token
  const getAuthToken = useCallback(() => {
    const userData = getUserFromCookie();
    const idToken = userData?.idToken || getStoredToken();
    if (!idToken) {
      // Handle gracefully without console.error
      toast.error('Authentication error. Please try signing in again.');
    }
    return idToken;
  }, []);

  // Create WebSocket connection - but don't automatically connect
  const createWebSocketConnection = useCallback(() => {
    if (!sessionId) return null;
    
    // Get the ID token for authentication
    const idToken = getAuthToken();
    if (!idToken) return null;
    
    try {
      // Include the token in the URL for authentication
      const ws = new WebSocket(`${wsUrl}/ws/${sessionId}?token=${encodeURIComponent(idToken)}`);
      
      ws.onopen = () => {
        reconnectAttempts.current = 0;
        setWebsocket(ws);
        connectionRef.current = ws;
        
        // Start ping interval ONLY when connection is established
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
        }
        
        pingIntervalRef.current = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            try {
              ws.send(JSON.stringify({
                action: 'ping',
                timestamp: Date.now()
              }));
            } catch (e) {
              // Handle gracefully without console.error
              clearInterval(pingIntervalRef.current!);
            }
          } else {
            // Clear interval if connection is closed
            if (pingIntervalRef.current) {
              clearInterval(pingIntervalRef.current);
            }
          }
        }, 30000);
      };
      
      ws.onmessage = (event: MessageEvent) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          
          if (onMessage) {
            onMessage(data);
          }
        } catch (error) {
          // Handle gracefully without console.error
        }
      };
      
      ws.onerror = (error) => {
        // Handle gracefully without console.error
      };
      
      ws.onclose = (event) => {
        // Clear ping interval on close
        if (pingIntervalRef.current) {
          clearInterval(pingIntervalRef.current);
          pingIntervalRef.current = null;
        }
        
        // Only null the refs if this is the current connection and we're not unmounting
        if (connectionRef.current === ws) {
          setWebsocket(null);
          
          // Check if closure was due to auth error (e.g., token expired)
          if (event.code === 1008 || (event.reason && event.reason.includes('auth'))) {
            toast.error('Authentication error. Reconnect when needed.');
          }
        }
      };
      
      return ws;
    } catch (error) {
      // Handle gracefully without console.error
      return null;
    }
  }, [sessionId, onMessage, wsUrl, getAuthToken]);

  // Helper function to ensure WebSocket is connected
  const ensureWebSocketConnection = useCallback(async (): Promise<WebSocket> => {
    // If WebSocket is already connected, return it
    if (connectionRef.current && connectionRef.current.readyState === WebSocket.OPEN) {
      return connectionRef.current;
    }
    
    // Prevent multiple connection attempts
    if (isConnecting) {
      throw new Error('WebSocket connection is already in progress');
    }
    
    setIsConnecting(true);
    
    try {
      // Close existing websocket if it exists but isn't in OPEN state
      if (connectionRef.current && 
         (connectionRef.current.readyState === WebSocket.CLOSING || 
          connectionRef.current.readyState === WebSocket.CLOSED)) {
        connectionRef.current = null;
      }
      
      // Create a new WebSocket connection
      return await new Promise((resolve, reject) => {
        if (!sessionId) {
          reject(new Error('No session ID provided'));
          return;
        }
        
        if (connectionRef.current && connectionRef.current.readyState === WebSocket.OPEN) {
          resolve(connectionRef.current);
          return;
        }
        
        const ws = createWebSocketConnection();
        if (!ws) {
          reject(new Error('Failed to create WebSocket connection'));
          return;
        }
        
        const timeout = setTimeout(() => {
          reject(new Error('WebSocket connection timeout'));
        }, 10000);
        
        const openHandler = () => {
          clearTimeout(timeout);
          resolve(ws);
        };
        
        const errorHandler = (error: Event) => {
          clearTimeout(timeout);
          reject(new Error('Failed to connect WebSocket'));
          ws.removeEventListener('open', openHandler);
        };
        
        const closeHandler = (event: CloseEvent) => {
          clearTimeout(timeout);
          reject(new Error('WebSocket closed during connection attempt'));
          ws.removeEventListener('open', openHandler);
          ws.removeEventListener('error', errorHandler);
        };
        
        ws.addEventListener('open', openHandler);
        ws.addEventListener('error', errorHandler);
        ws.addEventListener('close', closeHandler);
      });
    } catch (error) {
      // Handle gracefully without console.error
      throw error;
    } finally {
      setIsConnecting(false);
    }
  }, [sessionId, isConnecting, createWebSocketConnection]);
  
  // Expose function to close the connection when it's no longer needed
  const closeConnection = useCallback(() => {
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    
    if (connectionRef.current && connectionRef.current.readyState === WebSocket.OPEN) {
      connectionRef.current.close(1000, 'User inactive');
      connectionRef.current = null;
      setWebsocket(null);
    }
  }, []);

  return {
    websocket: connectionRef.current || websocket,
    ensureWebSocketConnection,
    closeConnection // Export the function to close connection
  };
};

export default useWebSocket;