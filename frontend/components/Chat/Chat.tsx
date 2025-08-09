'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getStoredToken } from '@/lib/auth-utils';
import { getUserFromCookie } from '@/lib/cookie-utils';
import { authenticatedFetch } from '@/lib/api-utils';
import { safeAuthenticatedFetch, withErrorHandling } from '@/lib/error-handling';
import ChatPanel from './components/ChatPanel';
import WelcomeModal from '../Modal/WelcomeModal';

interface ChatProps {
  sessionId?: string;
}

const Chat: React.FC<ChatProps> = ({ sessionId }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [canAccessTestFeature, setCanAccessTestFeature] = useState(false);
  
  useEffect(() => {
    const checkAuthentication = async () => {
      setIsCheckingAuth(true);
      
      // Check for user using secure cookie method
      const userData = getUserFromCookie();
      if (!userData) {
        router.push('/signin');
        return;
      }

      // Get the ID token from user data or storage
      const idToken = userData.idToken || getStoredToken();
      if (!idToken) {
        // Handle gracefully without console.error
        router.push('/signin');
        return;
      }

      setIsAuthenticated(true);
      
      // Check for new user parameter (is_new=true) which comes from sign-up flow
      const isNewUser = searchParams?.get('is_new') === 'true';
      
      // Also check if we have this stored in session storage as a backup
      const isNewUserFromStorage = sessionStorage.getItem('is_new_user') === 'true';
      
      if (isNewUser || isNewUserFromStorage) {
        // Show welcome modal for new users
        setShowWelcomeModal(true);
        
        // Clear the flag from storage so it doesn't show again on reload
        if (isNewUserFromStorage) {
          sessionStorage.removeItem('is_new_user');
        }
      }

      // Check if user has permission for testing feature
      checkTestPermissions(userData.uid);
      
      setIsCheckingAuth(false);
    };
    
    checkAuthentication();
  }, [router, searchParams]);

  // Check if user has permission for the testing feature
  const checkTestPermissions = async (userId: string) => {
    const { data, error } = await safeAuthenticatedFetch(
      `${process.env.NEXT_PUBLIC_API_URL}/middleware/user/features`,
      {},
      { silent: true, showToast: false } // Silent since this is a background check
    );
    
    if (data && data.has_testing === true) {
      setCanAccessTestFeature(true);
    } else {
      setCanAccessTestFeature(false);
    }
    
    // Note: We don't show an error toast here since this is optional functionality
    // and shouldn't interrupt the user experience
  };

  // Handle close of welcome modal
  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
    // You could track that the user has seen the welcome message
    localStorage.setItem('has_seen_welcome', 'true');
  };

  if (isCheckingAuth) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-66px)] w-full">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Router will handle redirection
  }

  return (
    <div className="h-[calc(100vh-66px)] w-full">
      <ChatPanel sessionId={sessionId} canAccessTestFeature={canAccessTestFeature} />
      
      {/* Welcome modal for new users */}
      <WelcomeModal 
        isOpen={showWelcomeModal} 
        onClose={handleCloseWelcomeModal} 
      />
    </div>
  );
};

export default Chat;