// 'use client';

// import { useState, useEffect, useCallback } from 'react';
// import { toast } from 'react-hot-toast';
// import { getStoredToken } from '@/lib/auth-utils';
// import { authenticatedFetch } from '@/lib/api-utils';
// import { getUserFromCookie } from '@/lib/cookie-utils';

// const useCredits = () => {
//   const [creditsRemaining, setCreditsRemaining] = useState(0);
//   const [followUpsRemaining, setFollowUpsRemaining] = useState(0);

//   // Fetch user's credit balance with token authentication
//   const fetchUserCredits = useCallback(async () => {
//     try {
//       // Get the ID token using secure cookie method
//       const userData = getUserFromCookie();
//       const idToken = userData?.idToken || getStoredToken();
      
//       if (!idToken) {
//         console.error('No authentication token available');
//         return;
//       }

//       const response = await authenticatedFetch(
//         `${process.env.NEXT_PUBLIC_API_URL}/middleware/user/credits`
//       );
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch credits');
//       }
      
//       const data = await response.json();
      
//       if (data.success && typeof data.credits_remaining === 'number') {
//         setCreditsRemaining(data.credits_remaining);
//       }
      
//       // Some APIs might also return follow-ups remaining
//       if (data.success && typeof data.follow_ups_per_extension === 'number') {
//         setFollowUpsRemaining(data.follow_ups_per_extension);
//       }
//     } catch (error) {
//       console.error('Error fetching user credits:', error);
//       // Only show toast if it's not an auth error, to prevent spamming the user
//       if (!(error instanceof Error && error.message.includes('authentication'))) {
//         toast.error('Failed to fetch credits remaining');
//       }
//     }
//   }, []);

//   // Update credits on component mount and periodically
//   useEffect(() => {
//     // Initial fetch
//     fetchUserCredits();
    
//     // Set up interval to check credits periodically (every 20 minutes)
//     const interval = setInterval(fetchUserCredits, 1200000);
    
//     return () => clearInterval(interval);
//   }, [fetchUserCredits]);

//   // Function to update follow-ups (used by API responses)
//   const updateFollowUps = (remaining: number) => {
//     setFollowUpsRemaining(remaining);
//   };

//   return {
//     creditsRemaining,
//     followUpsRemaining,
//     fetchUserCredits,
//     updateFollowUps,
//     setCreditsRemaining,
//     setFollowUpsRemaining
//   };
// };

// export default useCredits;

'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import { getStoredToken } from '@/lib/auth-utils';
import { authenticatedFetch } from '@/lib/api-utils';
import { getUserFromCookie } from '@/lib/cookie-utils';

const useCredits = (sessionId?: string) => {
  const [creditsRemaining, setCreditsRemaining] = useState(0);
  const [followUpsRemaining, setFollowUpsRemaining] = useState(0);
  const [followUpsTotal, setFollowUpsTotal] = useState(0);
  const [isUnlimitedCredits, setIsUnlimitedCredits] = useState(false);
  const [messagesCount, setMessagesCount] = useState(0);
  const [sessionTitle, setSessionTitle] = useState('');
  const [publishedToMarketplace, setPublishedToMarketplace] = useState(false);
  const [marketplaceListingId, setMarketplaceListingId] = useState<string | null>(null);
  const [isTokenized, setIsTokenized] = useState(false);
  const [tokenName, setTokenName] = useState<string | null>(null);
  const [tokenSymbol, setTokenSymbol] = useState<string | null>(null);
  const [tokenId, setTokenId] = useState<string | null>(null);

  // Fetch session-specific credit information
  const fetchSessionInfo = useCallback(async () => {
    try {
      // If no session ID is provided, return early
      if (!sessionId) {
        // Fallback to general user credits only when no session exists
        await fetchUserCredits();
        return;
      }

      const userData = getUserFromCookie();
      const idToken = userData?.idToken || getStoredToken();
      
      if (!idToken) {
        // Handle gracefully without console.error
        return;
      }

      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/middleware/user/session/${sessionId}/info`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch session information');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCreditsRemaining(data.credits_remaining);
        setFollowUpsRemaining(data.follow_ups_remaining);
        setFollowUpsTotal(data.follow_ups_total);
        setIsUnlimitedCredits(data.unlimited_credits);
        setMessagesCount(data.messages_count);
        setSessionTitle(data.title || 'Untitled Extension');
        setPublishedToMarketplace(data.published_to_marketplace || false);
        setMarketplaceListingId(data.marketplace_listing_id || null);
        setIsTokenized(data.is_tokenized || false);
        setTokenName(data.token_name || null);
        setTokenSymbol(data.token_symbol || null);
        setTokenId(data.token_id || null);
      } else {
        // Handle gracefully without console.error
      }
    } catch (error) {
      // Handle gracefully without console.error
    }
  }, [sessionId]);

  // Fallback to fetch user's general credit balance
  const fetchUserCredits = useCallback(async () => {
    try {
      const userData = getUserFromCookie();
      const idToken = userData?.idToken || getStoredToken();
      
      if (!idToken) {
        // Handle gracefully without console.error
        return;
      }

      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/middleware/user/credits`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch credits');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setCreditsRemaining(data.credits_remaining);
        setFollowUpsRemaining(data.follow_ups_remaining);
        setIsUnlimitedCredits(data.unlimited_credits || false);
      } else {
        // Handle gracefully without console.error
      }
    } catch (error) {
      // Handle gracefully without console.error
    }
  }, []);

  // Trigger fetch whenever sessionId changes
  useEffect(() => {
    fetchSessionInfo();
  }, [sessionId, fetchSessionInfo]);

  return { 
    creditsRemaining,
    followUpsRemaining,
    followUpsTotal,
    isUnlimitedCredits,
    messagesCount,
    sessionTitle,
    publishedToMarketplace,
    marketplaceListingId,
    isTokenized,
    tokenName,
    tokenSymbol,
    tokenId,
    fetchSessionInfo
  };
};

export default useCredits;