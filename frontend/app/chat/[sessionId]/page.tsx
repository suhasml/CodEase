// 'use client';

// import React, { useEffect } from 'react';
// import Chat from '@/components/Chat/Chat';
// import Header from '@/components/Header/header';
// import { useRouter, useParams } from 'next/navigation';
// import Cookies from 'js-cookie';
// import { getStoredToken } from '@/lib/auth-utils';

// const ChatSessionPage = () => {
//   const router = useRouter();
//   const params = useParams();
//   const sessionId = params.sessionId as string;

//   useEffect(() => {
//     const user = Cookies.get('user') ? JSON.parse(Cookies.get('user') as string) : null;

//     if (!user) {
//       router.push('/signin'); // Redirect if the user is not logged in
//       return;
//     }
    
//     // Check for a valid ID token
//     const idToken = user.idToken || getStoredToken();
//     if (!idToken) {
//       console.error('No authentication token available');
//       router.push('/signin');
//       return;
//     }
    
//     // Optionally: Update the user's current session in the cookie
//     if (user && (!user.currentSessionId || user.currentSessionId !== sessionId)) {
//       user.currentSessionId = sessionId;
//       Cookies.set('user', JSON.stringify({
//         ...user,
//         currentSessionId: sessionId
//       }), { expires: 30 });
//     }
//   }, [router, sessionId]);

//   return (
//     <>
//       <Header />
//       <Chat sessionId={sessionId} />
//     </>
//   );
// };

// export default ChatSessionPage;

'use client';

import React, { useEffect } from 'react';
import Chat from '@/components/Chat/Chat';
import Header from '@/components/Header/header';
import { useRouter, useParams } from 'next/navigation';
import { getStoredToken } from '@/lib/auth-utils';
import { getUserFromCookie, setCookie } from '@/lib/cookie-utils';

const ChatSessionPage = () => {
  const router = useRouter();
  const params = useParams();
  const sessionId = params.sessionId as string;

  useEffect(() => {
    // Use the secure utility to get user data
    const user = getUserFromCookie();

    if (!user) {
      router.push('/signin'); // Redirect if the user is not logged in
      return;
    }
    
    // Check for a valid ID token
    const idToken = user.idToken || getStoredToken();
    if (!idToken) {
      router.push('/signin');
      return;
    }
    
    // Optionally: Update the user's current session in the cookie
    if (user && (!user.currentSessionId || user.currentSessionId !== sessionId)) {
      // Use the setCookie function with proper security settings
      setCookie('user', {
        ...user,
        currentSessionId: sessionId
      });
    }
  }, [router, sessionId]);

  return (
    <>
      <Header />
      <Chat sessionId={sessionId} />
    </>
  );
};

export default ChatSessionPage;