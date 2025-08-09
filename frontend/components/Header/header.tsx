'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import LoggedInHeader from './components/loggedinHeader';
import GeneralLoggedInHeader from './components/generalLoggedInHeader';
import DefaultHeader from './components/DefaultHeader';
import { getUserFromCookie } from '@/lib/cookie-utils';

interface User {
  uid: string;
  email?: string;
  displayName?: string;
  idToken?: string;
  // Add other properties your user object has
}

const Header = () => {
  // Fix the type to accept either User or null
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    // Check for user data using secure cookie utility
    const userData = getUserFromCookie();
    if (userData) {
      setUser(userData);
    } else {
      setUser(null);
    }
  }, []);

  // Function to determine which header to display based on user status and current path
  const renderHeader = () => {
    // If user is not logged in, show default header for all pages
    if (!user) {
      return <DefaultHeader />;
    }

    // If user is logged in and on the chat page, show the chat-specific LoggedInHeader
    if (pathname?.startsWith('/chat')) {
      return <LoggedInHeader />;
    }

    // Otherwise, if user is logged in but not on chat page, show the general logged-in header
    return <GeneralLoggedInHeader />;
  };

  return renderHeader();
};

export default Header;