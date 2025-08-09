// 'use client';

// import { useState, useEffect } from 'react';
// import { toast } from 'react-hot-toast';
// import Cookies from 'js-cookie';
// import { getStoredToken } from '@/lib/auth-utils';
// import { authenticatedFetch } from '@/lib/api-utils';

// const useTestEnvironment = (sessionId?: string) => {
//   const [isTestFrameVisible, setIsTestFrameVisible] = useState(false);
//   const [testFrameUrl, setTestFrameUrl] = useState<string | null>(null);
//   const [isTestingExtension, setIsTestingExtension] = useState(false);
//   const [isFullScreenTest, setIsFullScreenTest] = useState(true);
  
//   const [testEnvironmentActive, setTestEnvironmentActive] = useState(false);
//   const [testEnvironmentExpiry, setTestEnvironmentExpiry] = useState<Date | null>(null);
//   const [testEnvironmentTimeLeft, setTestEnvironmentTimeLeft] = useState<number | null>(null);

//   const [testSetupFailed, setTestSetupFailed] = useState(false);
//   const [testFailureReason, setTestFailureReason] = useState<string | null>(null);

//   // Format time left helper
//   const formatTimeLeft = (seconds: number | null): string => {
//     if (seconds === null) return '';
//     const minutes = Math.floor(seconds / 60);
//     const remainingSeconds = seconds % 60;
//     return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
//   };

//   // Toggle fullscreen mode
//   const toggleFullScreenTest = () => {
//     setIsFullScreenTest(!isFullScreenTest);
//   };

//   // Reset test environment
//   const resetTestEnvironment = () => {
//     setTestEnvironmentActive(false);
//     setTestEnvironmentExpiry(null);
//     setTestEnvironmentTimeLeft(null);
//     setIsTestFrameVisible(false);
//     setTestFrameUrl(null);
//     setTestSetupFailed(false);
//     setTestFailureReason(null);
//   };

//   // Test environment timer effect
//   useEffect(() => {
//     let timerInterval: NodeJS.Timeout | null = null;
    
//     if (testEnvironmentActive && testEnvironmentExpiry) {
//       // Update time remaining every second
//       timerInterval = setInterval(() => {
//         const now = new Date();
//         const timeLeftMs = testEnvironmentExpiry.getTime() - now.getTime();
        
//         if (timeLeftMs <= 0) {
//           // Environment has expired
//           setTestEnvironmentActive(false);
//           setTestEnvironmentExpiry(null);
//           setTestEnvironmentTimeLeft(null);
          
//           // Optionally show notification
//           if (isTestFrameVisible) {
//             toast.error('Test environment has expired. Please start a new test.', {
//               duration: 5000
//             });
//             setIsTestFrameVisible(false);
//           }
//         } else {
//           // Update time left in seconds
//           setTestEnvironmentTimeLeft(Math.floor(timeLeftMs / 1000));
//         }
//       }, 1000);
//     }
    
//     return () => {
//       if (timerInterval) clearInterval(timerInterval);
//     };
//   }, [testEnvironmentActive, testEnvironmentExpiry, isTestFrameVisible]);

//   // Handle test extension action
//   const handleTestExtension = async () => {
//     if (!sessionId) return;
    
//     // Get the ID token
//     const user = Cookies.get('user') ? JSON.parse(Cookies.get('user') || '{}') : null;
//     const idToken = user?.idToken || getStoredToken();
    
//     if (!idToken) {
//       console.error('No authentication token available');
//       toast.error('Authentication error. Please sign in again.');
//       return;
//     }
    
//     try {
//       setTestSetupFailed(false);
//       setTestFailureReason(null);

//       // If we already have an active environment, just show it
//       if (testEnvironmentActive && testEnvironmentExpiry && new Date() < testEnvironmentExpiry) {
//         setIsTestFrameVisible(true);
//         return;
//       }

//       setIsTestingExtension(true);
//       toast.loading('Preparing test environment...');

//       // First get a download token for the session using authenticatedFetch
//       const tokenResponse = await authenticatedFetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/middleware/session/${sessionId}/token`
//       );
      
//       if (!tokenResponse.ok) {
//         throw new Error('Failed to retrieve download token');
//       }
      
//       const tokenData = await tokenResponse.json();
//       const downloadToken = tokenData.download_token;
      
//       if (!downloadToken) {
//         throw new Error('No download token available for this session');
//       }
      
//       // Now start the test environment
//       const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL}/extension/test`, {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({
//           session_id: sessionId,
//           download_token: downloadToken
//         })
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to initialize test environment');
//       }
      
//       const data = await response.json();
      
//       if (data.success && data.urls && data.urls.novnc) {
//         // Wait for container to initialize
//         await new Promise(resolve => setTimeout(resolve, 3000));
        
//         // Set up the environment
//         setTestFrameUrl(data.urls.novnc);
//         setIsTestFrameVisible(true);

//         // Set the expiry time (10 minutes from now)
//         const expiryTime = new Date();
//         expiryTime.setMinutes(expiryTime.getMinutes() + 10);
//         setTestEnvironmentActive(true);
//         setTestEnvironmentExpiry(expiryTime);

//         toast.dismiss();
//         toast.success('Test environment ready!');
//       } else {
//         throw new Error('Invalid response from server');
//       }
//     } catch (error) {
//       toast.dismiss();
//       toast.error('Failed to start test session');

//       setTestSetupFailed(true);
//       setTestFailureReason("The test environment could not be started. Please try again in a while.");
//     } finally {
//       setIsTestingExtension(false);
//     }
//   };

//   const handleStopSession = async () => {
//     if (!sessionId) return;
    
//     try {
//       // Only make the API call if the test environment is active
//       if (testEnvironmentActive) {
//         // Attempt to gracefully stop the session on the server
//         await authenticatedFetch(`${process.env.NEXT_PUBLIC_API_URL}/extension/test/stop`, {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json'
//           },
//           body: JSON.stringify({
//             session_id: sessionId
//           })
//         });
//       }
//     } catch (error) {
//       console.error('Error stopping test session:', error);
//     } finally {
//       // Reset all testing-related state
//       setTestEnvironmentActive(false);
//       setTestEnvironmentExpiry(null);
//       setTestEnvironmentTimeLeft(null);
//       setIsTestFrameVisible(false);
//       setTestFrameUrl(null);
//       setIsTestingExtension(false);
//       setTestSetupFailed(false);
//       setTestFailureReason(null);
      
//       // Show feedback to the user
//       toast.success('Test session stopped successfully');
//     }
//   };
  
//   return {
//     isTestFrameVisible,
//     testFrameUrl,
//     isTestingExtension,
//     isFullScreenTest,
//     testEnvironmentActive,
//     testEnvironmentTimeLeft,
//     testSetupFailed,
//     testFailureReason,
//     setIsTestFrameVisible,
//     setTestFrameUrl,
//     setIsFullScreenTest,
//     formatTimeLeft,
//     toggleFullScreenTest,
//     handleTestExtension,
//     resetTestEnvironment,
//     handleStopSession
//   };
// };

// export default useTestEnvironment;

'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { getStoredToken } from '@/lib/auth-utils';
import { authenticatedFetch } from '@/lib/api-utils';
import { getUserFromCookie } from '@/lib/cookie-utils';

const useTestEnvironment = (sessionId?: string) => {
  const [isTestFrameVisible, setIsTestFrameVisible] = useState(false);
  const [testFrameUrl, setTestFrameUrl] = useState<string | null>(null);
  const [isTestingExtension, setIsTestingExtension] = useState(false);
  const [isFullScreenTest, setIsFullScreenTest] = useState(true);
  
  const [testEnvironmentActive, setTestEnvironmentActive] = useState(false);
  const [testEnvironmentExpiry, setTestEnvironmentExpiry] = useState<Date | null>(null);
  const [testEnvironmentTimeLeft, setTestEnvironmentTimeLeft] = useState<number | null>(null);

  const [testSetupFailed, setTestSetupFailed] = useState(false);
  const [testFailureReason, setTestFailureReason] = useState<string | null>(null);

  // Format time left helper
  const formatTimeLeft = (seconds: number | null): string => {
    if (seconds === null) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Toggle fullscreen mode
  const toggleFullScreenTest = () => {
    setIsFullScreenTest(!isFullScreenTest);
  };

  // Reset test environment
  const resetTestEnvironment = () => {
    setTestEnvironmentActive(false);
    setTestEnvironmentExpiry(null);
    setTestEnvironmentTimeLeft(null);
    setIsTestFrameVisible(false);
    setTestFrameUrl(null);
    setTestSetupFailed(false);
    setTestFailureReason(null);
  };

  // Test environment timer effect
  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;
    
    if (testEnvironmentActive && testEnvironmentExpiry) {
      // Update time remaining every second
      timerInterval = setInterval(() => {
        const now = new Date();
        const timeLeftMs = testEnvironmentExpiry.getTime() - now.getTime();
        
        if (timeLeftMs <= 0) {
          // Environment has expired
          setTestEnvironmentActive(false);
          setTestEnvironmentExpiry(null);
          setTestEnvironmentTimeLeft(null);
          
          // Optionally show notification
          if (isTestFrameVisible) {
            toast.error('Test environment has expired. Please start a new test.', {
              duration: 5000
            });
            setIsTestFrameVisible(false);
          }
        } else {
          // Update time left in seconds
          setTestEnvironmentTimeLeft(Math.floor(timeLeftMs / 1000));
        }
      }, 1000);
    }
    
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [testEnvironmentActive, testEnvironmentExpiry, isTestFrameVisible]);

  // Handle test extension action
  const handleTestExtension = async () => {
    if (!sessionId) return;
    
    // Get the ID token using secure cookie method
    const userData = getUserFromCookie();
    const idToken = userData?.idToken || getStoredToken();
    
    if (!idToken) {
      // Handle gracefully without console.error
      toast.error('Authentication error. Please sign in again.');
      return;
    }
    
    try {
      setTestSetupFailed(false);
      setTestFailureReason(null);

      // If we already have an active environment, just show it
      if (testEnvironmentActive && testEnvironmentExpiry && new Date() < testEnvironmentExpiry) {
        setIsTestFrameVisible(true);
        return;
      }

      setIsTestingExtension(true);
      toast.loading('Preparing test environment...');

      // First get a download token for the session using authenticatedFetch
      const tokenResponse = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/middleware/session/${sessionId}/token`
      );
      
      if (!tokenResponse.ok) {
        throw new Error('Failed to retrieve download token');
      }
      
      const tokenData = await tokenResponse.json();
      const downloadToken = tokenData.download_token;
      
      if (!downloadToken) {
        throw new Error('No download token available for this session');
      }
      
      // Now start the test environment
      const response = await authenticatedFetch(`${process.env.NEXT_PUBLIC_TEST_URL}/api/extension/test`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          download_token: downloadToken
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to initialize test environment');
      }
      const data = await response.json();
      console.log('Test environment response:', data);
      
      if (data.success && data.urls && data.urls.novnc) {
        // Wait for container to initialize
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Set up the environment
        setTestFrameUrl(data.urls.novnc);
        setIsTestFrameVisible(true);

        // Set the expiry time (5 minutes from now)
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + 5);
        setTestEnvironmentActive(true);
        setTestEnvironmentExpiry(expiryTime);

        toast.dismiss();
        toast.success('Test environment ready!');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to start test session');

      setTestSetupFailed(true);
      setTestFailureReason("The test environment could not be started. Please try again in a while.");
    } finally {
      setIsTestingExtension(false);
    }
  };

  const handleStopSession = async () => {
    if (!sessionId) return;
    
    try {
      // Only make the API call if the test environment is active
      if (testEnvironmentActive) {
        // Attempt to gracefully stop the session on the server
        await authenticatedFetch(`${process.env.NEXT_PUBLIC_TEST_URL}/extension/test/stop`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            session_id: sessionId
          })
        });
      }
    } catch (error) {
      // Handle gracefully without console.error
    } finally {
      // Reset all testing-related state
      setTestEnvironmentActive(false);
      setTestEnvironmentExpiry(null);
      setTestEnvironmentTimeLeft(null);
      setIsTestFrameVisible(false);
      setTestFrameUrl(null);
      setIsTestingExtension(false);
      setTestSetupFailed(false);
      setTestFailureReason(null);
      
      // Show feedback to the user
      toast.success('Test session stopped successfully');
    }
  };
  
  return {
    isTestFrameVisible,
    testFrameUrl,
    isTestingExtension,
    isFullScreenTest,
    testEnvironmentActive,
    testEnvironmentTimeLeft,
    testSetupFailed,
    testFailureReason,
    setIsTestFrameVisible,
    setTestFrameUrl,
    setIsFullScreenTest,
    formatTimeLeft,
    toggleFullScreenTest,
    handleTestExtension,
    resetTestEnvironment,
    handleStopSession
  };
};

export default useTestEnvironment;