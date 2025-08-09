'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  getAuth,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  GithubAuthProvider,
  TwitterAuthProvider,
  signInWithPopup,
  AuthProvider,
  onIdTokenChanged,
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub, FaXTwitter } from 'react-icons/fa6';
import { Sparkles, ArrowRight } from 'lucide-react';
import { generateUUID } from '@/lib/utils';
import { updateStoredToken } from '@/lib/auth-utils';
import Link from 'next/link';
import { setCookie, getUserFromCookie } from '@/lib/cookie-utils';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const MIDDLEWARE_URL = process.env.NEXT_PUBLIC_API_URL;

interface CursorPosition {
  x: number;
  y: number;
}

interface CreateUserResponse {
  success: boolean;
  message?: string;
  user?: any;
  is_new?: boolean;
}

interface UserCreditsResponse {
  success: boolean;
  credits_remaining: number;
  has_subscription: boolean;
  unlimited_credits: boolean;
}

// Create a client component for the actual form
const SignInForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get('redirect');
  
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cursorPosition, setCursorPosition] = useState<CursorPosition>({ x: 0, y: 0 });
  const [isClient, setIsClient] = useState<boolean>(false);
  const [screenWidth, setScreenWidth] = useState<number>(0);
  
  useEffect(() => {
    setIsClient(true);
    setScreenWidth(window.innerWidth);
    
    // Add resize listener
    const handleResize = () => {
      setScreenWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    
    const userData = getUserFromCookie();
    if (userData) {
      // Handle redirection based on the redirect parameter
      if (redirectPath === 'subscription') {
        router.push('/subscription');
      } else if (redirectPath && redirectPath.startsWith('/token/')) {
        // If redirect is a token page, go back to that token
        router.push(redirectPath);
      } else {
        // Normal flow: redirect to chat
        const sessionId = generateUUID();
        router.push(`/chat/${sessionId}`);
      }
    }
    // Set up token refresh listener
        const unsubscribe = onIdTokenChanged(auth, async (user) => {
          if (user) {
            try {
              const idToken = await user.getIdToken();
              updateStoredToken(idToken);
            } catch (error) {
              // Handle gracefully - token refresh failure is not critical
              // The app will handle authentication on next request
            }
          }
        });

    return () => {
      unsubscribe();
      window.removeEventListener('resize', handleResize);
    };
  }, [router, redirectPath]);

  // Get session storage items only on client side
  const pendingCheckout = isClient ? sessionStorage.getItem('pendingCheckout') : null;
  const selectedPlanId = isClient ? sessionStorage.getItem('selectedPlanId') : null;

  // Handle cursor movement for the spotlight effect
  const handleMouseMove = (e: React.MouseEvent): void => {
    setCursorPosition({
      x: e.clientX,
      y: e.clientY
    });
  };

  // Function to create user in the database via middleware
  const createUserInDb = async (uid: string, email: string, idToken: string): Promise<CreateUserResponse> => {
    try {
      const response = await fetch(`${MIDDLEWARE_URL}/middleware/create_user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ uid, email }),
      });

      const data: CreateUserResponse = await response.json();
      if (!data.success) {
        // Handle gracefully - don't log to console
        return { success: false, message: data.message || 'Failed to create user account' };
      }
      return data;
    } catch (error) {
      // Handle gracefully - don't log to console
      return { success: false, message: 'Unable to create user account. Please try again.' };
    }
  };

  // Function to check user credits
  const checkUserCredits = async (idToken: string): Promise<UserCreditsResponse | null> => {
    try {
      const response = await fetch(`${MIDDLEWARE_URL}/middleware/user/credits`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
      });

      if (!response.ok) {
        // Handle gracefully - return null to indicate failure
        return null;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // Handle gracefully - return null to indicate failure
      return null;
    }
  };

  // Handle redirection after successful authentication
  const handlePostAuthRedirect = async (idToken: string, isNewUser: boolean) => {
    try {
      // First check for redirectAfterLogin in sessionStorage (saved when auth fails)
      const savedRedirectPath = isClient ? sessionStorage.getItem('redirectAfterLogin') : null;
      if (savedRedirectPath) {
        // Clear the saved path
        sessionStorage.removeItem('redirectAfterLogin');
        // Redirect the user to the saved path
        router.push(savedRedirectPath);
        return;
      }

      // Check for direct redirect parameter (like from token page)
      if (redirectPath && redirectPath.startsWith('/token/')) {
        router.push(redirectPath);
        return;
      }
      
      // Check for pending checkout from pricing page
      
      // If we have a pending checkout with selected plan, redirect to checkout
      if (pendingCheckout === 'true' && selectedPlanId) {
        // Clear the pending flag but keep the plan selection
        if (isClient) sessionStorage.removeItem('pendingCheckout');
        router.push('/checkout');
        return;
      }
      
      // Check if the redirect is for subscription/checkout (including CODON checkout)
      if (redirectPath === 'checkout' || redirectPath === 'subscription' || redirectPath === 'codon-checkout') {
        // If this is specifically a CODON checkout redirect, always go to checkout page
        if (redirectPath === 'codon-checkout') {
          router.push('/checkout');
          return;
        }
        
        // For normal checkout/subscription paths, use the selectedPlanId logic
        if (selectedPlanId) {
          router.push('/checkout');
        } else {
          router.push('/subscription');
        }
        return;
      }
      
      // Check user credits
      const creditsData = await checkUserCredits(idToken);
      
      // For users with no credits and no subscription, redirect to dashboard
      if (creditsData && 
          creditsData.success && 
          creditsData.credits_remaining <= 0 && 
          !creditsData.has_subscription && 
          !creditsData.unlimited_credits) {
        router.push('/dashboard');
        return;
      }
      
      // Default behavior - create a new chat session
      const sessionId = generateUUID();
      
      // For new users, set the is_new flag in session storage
      if (isNewUser) {
        sessionStorage.setItem('is_new_user', 'true');
      }
      
      router.push(`/chat/${sessionId}${isNewUser ? '?is_new=true' : ''}`);
    } catch (error) {
      // Handle gracefully - provide fallback behavior without console errors
      
      // Fall back behavior based on context
      if (pendingCheckout === 'true' && selectedPlanId) {
        if (isClient) sessionStorage.removeItem('pendingCheckout');
        router.push('/checkout');
      } else if (redirectPath === 'checkout' || redirectPath === 'subscription' || redirectPath === 'codon-checkout') {
        // For CODON checkout, always go to checkout
        if (redirectPath === 'codon-checkout') {
          router.push('/checkout');
        } else {
          router.push('/subscription');
        }
      } else {
        const sessionId = generateUUID();
        router.push(`/chat/${sessionId}`);
      }
    }
  };

  const handleEmailSignIn = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      
      // Get the ID token from Firebase
      const idToken = await user.getIdToken();

      // Create user in database with ID token
      const userResponse = await createUserInDb(user.uid, user.email || '', idToken);

      // Check if user creation failed and show appropriate error
      if (!userResponse.success) {
        setError(userResponse.message || 'Failed to create your account. Please try again.');
        return;
      }

      const sessionId = generateUUID();

      setCookie('user', {
        uid: user.uid,
        email: user.email,
        currentSessionId: sessionId,
        idToken: idToken
      });

      // Handle redirection based on credits
      await handlePostAuthRedirect(idToken, userResponse.is_new || false);
    } catch (error) {
      setError('Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSignIn = async (provider: AuthProvider): Promise<void> => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Get the ID token from Firebase
      const idToken = await user.getIdToken();

      // Create user in database with ID token
      const userResponse = await createUserInDb(user.uid, user.email || '', idToken);

      // Check if user creation failed and show appropriate error
      if (!userResponse.success) {
        setError(userResponse.message || 'Failed to create your account. Please try again.');
        return;
      }

      const sessionId = generateUUID();

      setCookie('user', {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        currentSessionId: sessionId,
        idToken: idToken
      });

      // Handle redirection based on credits
      await handlePostAuthRedirect(idToken, userResponse.is_new || false);
    } catch (error) {
      setError('Error signing in with provider.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render social buttons based on screen size
  const renderSocialButtons = () => {
    // For mobile screens
    if (screenWidth < 640) {
      return (
        <div className="flex flex-col space-y-3 mb-6">
          <button
            onClick={() => handleProviderSignIn(new GoogleAuthProvider())}
            className="flex items-center justify-center text-black bg-white border rounded-md py-2.5 shadow-sm hover:shadow-blue-500/10 hover:bg-gray-100 hover:-translate-y-0.5 transition-all duration-300"
            disabled={isLoading}
            type="button"
          >
            <FcGoogle className="text-xl mr-2" />
            <span className="text-sm font-medium">Sign in with Google</span>
          </button>

          <button
            onClick={() => handleProviderSignIn(new GithubAuthProvider())}
            className="flex items-center justify-center bg-gray-800 text-white rounded-md py-2.5 border border-gray-700 hover:bg-gray-700 hover:border-gray-600 hover:-translate-y-0.5 transition-all duration-300"
            disabled={isLoading}
            type="button"
          >
            <FaGithub className="text-xl mr-2" />
            <span className="text-sm font-medium">Sign in with GitHub</span>
          </button>

          <button
            onClick={() => handleProviderSignIn(new TwitterAuthProvider())}
            className="flex items-center justify-center bg-black text-white rounded-md py-2.5 hover:bg-gray-900 hover:-translate-y-0.5 transition-all duration-300"
            disabled={isLoading}
            type="button"
          >
            <FaXTwitter className="text-xl mr-2" />
            <span className="text-sm font-medium">Sign in with X</span>
          </button>
        </div>
      );
    }
    
    // For larger screens
    return (
      <div className="flex justify-between space-x-2 mb-6">
        <button
          onClick={() => handleProviderSignIn(new GoogleAuthProvider())}
          className="flex-1 flex items-center justify-center text-black bg-white border rounded-md py-2.5 shadow-sm hover:shadow-blue-500/10 hover:bg-gray-100 hover:-translate-y-0.5 transition-all duration-300"
          disabled={isLoading}
          type="button"
        >
          <FcGoogle className="text-xl mr-2" />
          <span className="text-sm font-medium">Google</span>
        </button>

        <button
          onClick={() => handleProviderSignIn(new GithubAuthProvider())}
          className="flex-1 flex items-center justify-center bg-gray-800 text-white rounded-md py-2.5 border border-gray-700 hover:bg-gray-700 hover:border-gray-600 hover:-translate-y-0.5 transition-all duration-300"
          disabled={isLoading}
          type="button"
        >
          <FaGithub className="text-xl mr-2" />
          <span className="text-sm font-medium">GitHub</span>
        </button>

        <button
          onClick={() => handleProviderSignIn(new TwitterAuthProvider())}
          className="flex-1 flex items-center justify-center bg-black text-white rounded-md py-2.5 hover:bg-gray-900 hover:-translate-y-0.5 transition-all duration-300"
          disabled={isLoading}
          type="button"
        >
          <FaXTwitter className="text-xl mr-2" />
          <span className="text-sm font-medium"></span>
        </button>
      </div>
    );
  };

  return (
    <div 
      className="min-h-screen bg-gray-950 text-white overflow-hidden flex items-center justify-center relative px-4 py-6 sm:px-0 sm:py-0"
      onMouseMove={handleMouseMove}
    >
      {/* Interactive background with spotlight effect */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Spotlight gradient that follows cursor */}
        {isClient && (
          <div 
            className="absolute w-[500px] sm:w-[800px] h-[500px] sm:h-[800px] rounded-full opacity-30 pointer-events-none transition-transform duration-100 ease-out"
            style={{
              background: 'radial-gradient(circle, rgba(56,182,255,0.15) 0%, rgba(38,161,240,0.08) 40%, transparent 70%)',
              left: `${cursorPosition.x - (screenWidth < 640 ? 250 : 400)}px`,
              top: `${cursorPosition.y - (screenWidth < 640 ? 250 : 400)}px`,
              transform: 'translate3d(0, 0, 0)'
            }}
          />
        )}
      
        {/* Dynamic aurora effects with more subtle animations */}
        <div className="absolute -top-[300px] sm:-top-[500px] -left-[200px] sm:-left-[400px] w-[600px] sm:w-[1000px] h-[600px] sm:h-[1000px] bg-[radial-gradient(ellipse_at_center,hsla(217,100%,50%,0.12)_0%,transparent_70%)]" style={{ animation: isClient ? 'aurora-x 25s ease-in-out infinite' : 'none' }} />
        <div className="absolute -top-[200px] sm:-top-[300px] -right-[200px] sm:-right-[300px] w-[500px] sm:w-[800px] h-[500px] sm:h-[800px] bg-[radial-gradient(ellipse_at_center,hsla(265,89%,60%,0.12)_0%,transparent_70%)]" style={{ animation: isClient ? 'aurora-y 20s ease-in-out infinite' : 'none' }} />
        <div className="absolute bottom-[10%] sm:bottom-[20%] left-[5%] sm:left-[10%] w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-[radial-gradient(ellipse_at_center,hsla(190,95%,50%,0.06)_0%,transparent_70%)]" style={{ animation: isClient ? 'aurora-pulse 30s ease infinite' : 'none' }} />
        
        {/* Enhanced grid effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        
        {/* Subtle gradient overlay */}
        <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-gray-900 via-gray-900/40 to-transparent" />
      </div>

      <div className="relative z-10 bg-gray-900/60 backdrop-blur-md p-5 sm:p-8 rounded-xl shadow-2xl w-full max-w-md border border-gray-700/50 overflow-hidden group hover:border-blue-500/30 transition-all duration-500">
        {/* Animated accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-purple-500 to-teal-500 animate-gradient-x"></div>
        
        {/* Top corner accent */}
        <div className="absolute top-0 right-0 w-16 sm:w-24 h-16 sm:h-24 -translate-x-6 -translate-y-6 bg-blue-500/10 rounded-full blur-xl"></div>
        
        <div className="mb-4 sm:mb-6 flex justify-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700 hover:border-blue-500/50 transition-all duration-300 group">
            <Sparkles className="w-3 h-3 mr-2 text-blue-400" />
            <span className="text-xs font-semibold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">CodEase Account</span>
          </div>
        </div>

        <h2 className="text-xl sm:text-2xl font-bold text-center mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">Sign In</h2>
        <p className="text-center text-gray-400 mb-5 sm:mb-6 text-sm">
          Sign in to your CodEase account
          {redirectPath === 'subscription' && ' to continue with your subscription'}
          {redirectPath === 'checkout' && ' to continue with your purchase'}
          {redirectPath === 'codon-checkout' && ' to continue with your CODON purchase'}
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 text-center">
            {error}
          </div>
        )}

        {/* Social Sign-in Buttons - Responsive */}
        {renderSocialButtons()}

        <div className="flex items-center my-5 sm:my-6">
          <div className="flex-grow h-px bg-gray-700/50"></div>
          <div className="px-3 text-xs text-gray-500">or continue with email</div>
          <div className="flex-grow h-px bg-gray-700/50"></div>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); handleEmailSignIn(); }} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email Address</label>
            <div className="relative">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-800/50 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label htmlFor="password" className="block text-sm font-medium text-gray-300">Password</label>
              <Link href="/forgot-password" className="text-xs sm:text-sm text-blue-400 hover:text-blue-300 transition-colors">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-gray-800/50 border border-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            className="relative w-full py-2.5 rounded-md font-medium text-white overflow-hidden group"
            disabled={isLoading}
          >
            {/* Button background with animated gradient on hover */}
            <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 transition-all duration-500"></span>
            <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-teal-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-500 animate-gradient-x"></span>
            
            {/* Button content */}
            <span className="relative flex items-center justify-center z-10 group-hover:scale-105 transition-transform duration-300">
              {isLoading ? (
                <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              ) : null}
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4 ml-2 opacity-70 group-hover:translate-x-1 transition-transform" />
            </span>
          </button>
        </form>
          
        {/* Sign Up Link */}
        <p className="mt-5 sm:mt-6 text-center text-gray-400 text-xs sm:text-sm">
          Don't have an account?{' '}
          <Link href="/signup" className="text-blue-400 hover:text-blue-300 transition-colors">
            Create one now
          </Link>
        </p>
      </div>
      
      {/* CSS animations */}
      <style jsx global>{`
        @keyframes aurora-x {
          0%, 100% { transform: translateX(0) rotate(0); opacity: 0.8; }
          50% { transform: translateX(30px) rotate(5deg); opacity: 1; }
        }
        
        @keyframes aurora-y {
          0%, 100% { transform: translateY(0) rotate(0); opacity: 0.7; }
          50% { transform: translateY(30px) rotate(-5deg); opacity: 1; }
        }
        
        @keyframes aurora-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient-x {
          background-size: 200% auto;
          animation: gradient-x 8s ease infinite;
        }
        
        /* For very small screens */
        @media (max-width: 320px) {
          input, button {
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
};

// Create a loading component
const SignInLoading = () => {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
};

// Main page component with Suspense boundary
const SignIn = () => {
  return (
    <Suspense fallback={<SignInLoading />}>
      <SignInForm />
    </Suspense>
  );
};

export default SignIn;