// 'use client';

// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import Cookies from 'js-cookie';
// import { generateUUID } from '@/lib/utils';
// import { getStoredToken } from '@/lib/auth-utils';

// const ChatRedirectPage = () => {
//   const router = useRouter();

//   useEffect(() => {
//     const user = Cookies.get('user') ? JSON.parse(Cookies.get('user') as string) : null;

//     if (!user) {
//       router.push('/signin');
//       return;
//     }
    
//     // Check if we have an ID token
//     const idToken = user.idToken || getStoredToken();
//     if (!idToken) {
//       console.error('No authentication token available');
//       router.push('/signin');
//       return;
//     }
    
//     // Create a new session ID if one doesn't exist
//     const sessionId = user.currentSessionId || generateUUID();
    
//     // Update the cookie if needed
//     if (!user.currentSessionId) {
//       user.currentSessionId = sessionId;
//       Cookies.set('user', JSON.stringify({
//         ...user,
//         currentSessionId: sessionId
//       }), { expires: 30 });
//     }
    
//     // Redirect to the specific session
//     router.push(`/chat/${sessionId}`);
//   }, [router]);

//   // Return a loading state while redirecting
//   return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
// };

// export default ChatRedirectPage;

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { generateUUID } from '@/lib/utils';
import { getStoredToken } from '@/lib/auth-utils';
import { getUserFromCookie, setCookie } from '@/lib/cookie-utils';

const ChatRedirectPage = () => {
  const router = useRouter();

  useEffect(() => {
    // Use the secure utility to get user data
    const user = getUserFromCookie();

    if (!user) {
      router.push('/signin');
      return;
    }
    
    // Check if we have an ID token
    const idToken = user.idToken || getStoredToken();
    if (!idToken) {
      router.push('/signin');
      return;
    }
    
    // Create a new session ID if one doesn't exist
    const sessionId = user.currentSessionId || generateUUID();
    
    // Update the cookie if needed using the secure utility
    if (!user.currentSessionId) {
      // Use the setCookie function with proper security settings
      setCookie('user', {
        ...user,
        currentSessionId: sessionId
      });
    }
    
    // Redirect to the specific session
    router.push(`/chat/${sessionId}`);
  }, [router]);

  // Return a loading state while redirecting
  return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
};

export default ChatRedirectPage;