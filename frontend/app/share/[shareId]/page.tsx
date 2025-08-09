'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Header from '@/components/Header/header';
import TestEnvironment from '@/components/Chat/components/TestEnvironment';
import { authenticatedFetch } from '@/lib/api-utils';
import { getUserFromCookie } from '@/lib/cookie-utils';
import { getStoredToken } from '@/lib/auth-utils';
import { Play, Info, User, Clock, Shield, Home, ArrowRight, Sparkles, Zap } from 'lucide-react';

interface SharedExtensionData {
  success: boolean;
  extension_title?: string;
  extension_description?: string;
  owner_name?: string;
  download_token?: string;
  session_id?: string;
  can_test: boolean;
  error?: string;
}

interface ExtensionInfo {
  success: boolean;
  title?: string;
  description?: string;
  owner_name?: string;
  requires_login: boolean;
}

const SharedExtensionPage = () => {
  const params = useParams();
  const router = useRouter();
  const shareId = params.shareId as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [extensionData, setExtensionData] = useState<SharedExtensionData | null>(null);
  const [extensionInfo, setExtensionInfo] = useState<ExtensionInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Test environment state
  const [isTestFrameVisible, setIsTestFrameVisible] = useState(false);
  const [testFrameUrl, setTestFrameUrl] = useState<string | null>(null);
  const [isTestingExtension, setIsTestingExtension] = useState(false);
  const [isFullScreenTest, setIsFullScreenTest] = useState(true);
  const [testEnvironmentActive, setTestEnvironmentActive] = useState(false);
  const [testEnvironmentExpiry, setTestEnvironmentExpiry] = useState<Date | null>(null);
  const [testEnvironmentTimeLeft, setTestEnvironmentTimeLeft] = useState<number | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const userData = getUserFromCookie();
        const token = userData?.idToken || getStoredToken();
        
        if (token) {
          setIsAuthenticated(true);
          await loadExtensionData();
        } else {
          await loadExtensionInfo();
        }
      } catch (error) {
        // Handle authentication check errors gracefully
        setError('Authentication check failed. Please refresh the page.');
      } finally {
        setIsLoading(false);
      }
    };

    if (shareId) {
      checkAuth();
    } else {
      setError('Invalid share link');
      setIsLoading(false);
    }
  }, [shareId]);

  // Timer effect for test environment
  useEffect(() => {
    let timerInterval: NodeJS.Timeout | null = null;
    
    if (testEnvironmentActive && testEnvironmentExpiry) {
      timerInterval = setInterval(() => {
        const now = new Date();
        const timeLeftMs = testEnvironmentExpiry.getTime() - now.getTime();
        
        if (timeLeftMs <= 0) {
          setTestEnvironmentActive(false);
          setTestEnvironmentExpiry(null);
          setTestEnvironmentTimeLeft(null);
          
          if (isTestFrameVisible) {
            toast.error('Test environment has expired. Please start a new test.', {
              duration: 5000
            });
            setIsTestFrameVisible(false);
          }
        } else {
          setTestEnvironmentTimeLeft(Math.floor(timeLeftMs / 1000));
        }
      }, 1000);
    }
    
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [testEnvironmentActive, testEnvironmentExpiry, isTestFrameVisible]);

  // Load extension data for authenticated users
  const loadExtensionData = async () => {
    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/middleware/extension/share/${shareId}`
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 404) {
          throw new Error('This shared extension was not found or is no longer available.');
        } else if (response.status === 410) {
          throw new Error('This shared extension has expired or reached its access limit.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to access this shared extension.');
        } else {
          throw new Error(errorData.detail || 'Failed to load extension data.');
        }
      }

      const data = await response.json();
      setExtensionData(data);
    } catch (error) {
      // Handle all errors gracefully without console logging
      let errorMessage = 'Failed to load extension. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setError(errorMessage);
    }
  };

  // Load basic extension info for non-authenticated users
  const loadExtensionInfo = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/middleware/public/extension/share/${shareId}/info`
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('This shared extension was not found.');
        } else if (response.status === 410) {
          throw new Error('This shared extension has expired.');
        } else {
          throw new Error('Failed to load extension information.');
        }
      }

      const data = await response.json();
      setExtensionInfo(data);
    } catch (error) {
      // Handle all errors gracefully without console logging
      let errorMessage = 'Failed to load extension information. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      setError(errorMessage);
    }
  };

  // Handle sign in redirect
  const handleSignIn = () => {
    try {
      router.push(`/signin?redirect=${encodeURIComponent(window.location.pathname)}`);
    } catch (error) {
      // Fallback to direct signin if redirect fails
      router.push('/signin');
    }
  };

  // Handle extension testing
  const handleTestExtension = async () => {
    if (!extensionData?.session_id) {
      toast.error('Extension data not available. Please try refreshing the page.');
      return;
    }

    try {
      setIsTestingExtension(true);
      toast.loading('Preparing test environment...');

      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/middleware/extension/share/${shareId}/test`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 404) {
          throw new Error('This shared extension is no longer available.');
        } else if (response.status === 410) {
          throw new Error('This shared extension has expired or reached its access limit.');
        } else if (response.status === 403) {
          throw new Error('You do not have permission to test this extension.');
        } else if (response.status === 503) {
          throw new Error('Test environment is currently unavailable. Please try again later.');
        } else {
          throw new Error(errorData.detail || 'Failed to start test environment.');
        }
      }

      const data = await response.json();
      
      if (data.success && data.urls && data.urls.novnc) {
        // Wait for container to initialize
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        setTestFrameUrl(data.urls.novnc);
        setIsTestFrameVisible(true);

        // Set the expiry time (10 minutes from now)
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + 10);
        setTestEnvironmentActive(true);
        setTestEnvironmentExpiry(expiryTime);

        toast.dismiss();
        toast.success('Test environment ready!');
      } else {
        throw new Error('Invalid response from test service.');
      }
    } catch (error) {
      toast.dismiss();
      
      // Handle all errors gracefully without console logging
      let errorMessage = 'Failed to start test session. Please try again.';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsTestingExtension(false);
    }
  };

  const formatTimeLeft = (seconds: number | null): string => {
    if (seconds === null) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const toggleFullScreenTest = () => {
    setIsFullScreenTest(!isFullScreenTest);
  };

  const handleStopSession = async () => {
    setTestEnvironmentActive(false);
    setTestEnvironmentExpiry(null);
    setTestEnvironmentTimeLeft(null);
    setIsTestFrameVisible(false);
    setTestFrameUrl(null);
    toast.success('Test session stopped successfully');
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-950 flex items-center justify-center">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-12 h-12 border-3 border-blue-400/40 border-t-blue-400 rounded-full animate-spin mx-auto"></div>
              <div className="w-8 h-8 border-2 border-purple-400/40 border-t-purple-400 rounded-full animate-spin absolute top-2 left-1/2 transform -translate-x-1/2"></div>
            </div>
            <div className="space-y-2">
              <h2 className="text-lg font-medium text-white">Loading Extension</h2>
              <p className="text-gray-400 text-sm">Preparing your shared extension...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <div className="bg-gray-800/80 backdrop-blur-sm border border-red-500/30 rounded-xl p-6 shadow-xl">
              <div className="text-center">
                <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Extension Not Available</h3>
                <p className="text-gray-300 mb-4 text-sm leading-relaxed">{error}</p>
                <button
                  onClick={() => router.push('/')}
                  className="group flex items-center justify-center space-x-2 w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-all duration-200 font-medium transform hover:scale-105"
                >
                  <Home className="w-4 h-4" />
                  <span>Go Home</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show extension info when not authenticated
  if (!isAuthenticated && extensionInfo) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-950 py-4 sm:py-8 px-4">
          <div className="max-w-2xl mx-auto pt-12 sm:pt-16 md:pt-20">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="relative inline-block mb-3 sm:mb-4">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {extensionInfo.title}
                </h1>
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 animate-pulse" />
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm">
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Shared by</span>
                <span className="font-medium text-blue-400">{extensionInfo.owner_name}</span>
              </div>
            </div>

            {/* Main card */}
            <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 sm:p-6 shadow-lg mb-4 sm:mb-6">
              {extensionInfo.description && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-sm sm:text-base font-medium text-gray-200 mb-2 sm:mb-3 flex items-center">
                    <Info className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-400" />
                    About this Extension
                  </h3>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed bg-gray-700/30 rounded-lg p-3 border border-gray-600/30">
                    {extensionInfo.description}
                  </p>
                </div>
              )}

              {/* Sign in notice */}
              <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-blue-300 font-medium mb-1 text-sm sm:text-base">Secure Testing Required</h4>
                    <p className="text-gray-300 text-xs leading-relaxed">
                      Sign in to test this extension in our secure playground environment.
                    </p>
                  </div>
                </div>
              </div>

              {/* Mobile desktop-only notice */}
              <div className="block sm:hidden bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-3 mb-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <Info className="w-3 h-3 text-yellow-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-yellow-300 font-medium mb-1 text-sm">Desktop Required</h4>
                    <p className="text-yellow-100 text-xs leading-relaxed">
                      Extension testing is only available on desktop browsers. Please use a computer to test this extension.
                    </p>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleSignIn}
                  className="group w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all duration-200 font-medium transform hover:scale-105 flex items-center justify-center space-x-2"
                >
                  <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-sm sm:text-base">Sign In to Test</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                </button>
                <button
                  onClick={() => router.push('/chat')}
                  className="w-full px-4 py-2.5 bg-gray-700/60 hover:bg-gray-600/60 text-gray-300 rounded-lg transition-colors border border-gray-600/40 hover:border-gray-500/40 flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-sm sm:text-base">Build Your Own Extension Now</span>
                </button>
              </div>
            </div>

            {/* Features showcase */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-lg p-2 sm:p-3 text-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500/20 rounded-lg flex items-center justify-center mx-auto mb-1 sm:mb-2">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-green-400" />
                </div>
                <h4 className="text-xs font-medium text-gray-200 mb-1">Secure</h4>
                <p className="text-xs text-gray-400">Protected</p>
              </div>
              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-lg p-2 sm:p-3 text-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mx-auto mb-1 sm:mb-2">
                  <Zap className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                </div>
                <h4 className="text-xs font-medium text-gray-200 mb-1">Fast</h4>
                <p className="text-xs text-gray-400">Instant</p>
              </div>
              <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/30 rounded-lg p-2 sm:p-3 text-center">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-1 sm:mb-2">
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                </div>
                <h4 className="text-xs font-medium text-gray-200 mb-1">Full</h4>
                <p className="text-xs text-gray-400">Featured</p>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Show extension testing interface when authenticated
  if (isAuthenticated && extensionData) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-950 py-4 sm:py-8 px-4">
          <div className="max-w-3xl mx-auto pt-12 sm:pt-16 md:pt-20">
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <div className="relative inline-block mb-3 sm:mb-4">
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  {extensionData.extension_title}
                </h1>
                <Sparkles className="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 text-yellow-400 animate-pulse" />
              </div>
              <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm">
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <span>Shared by</span>
                <span className="font-medium text-blue-400">{extensionData.owner_name}</span>
              </div>
            </div>

            {/* Main testing interface */}
            <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-xl p-4 sm:p-6 shadow-lg">
              {extensionData.extension_description && (
                <div className="mb-4 sm:mb-6">
                  <h3 className="text-sm sm:text-base font-medium text-gray-200 mb-2 sm:mb-3 flex items-center">
                    <Info className="w-3 h-3 sm:w-4 sm:h-4 mr-2 text-blue-400" />
                    About this Extension
                  </h3>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed bg-gray-700/30 rounded-lg p-3 border border-gray-600/30">
                    {extensionData.extension_description}
                  </p>
                </div>
              )}

              {/* Mobile desktop-only notice */}
              <div className="block sm:hidden bg-yellow-900/30 border border-yellow-500/30 rounded-lg p-3 mb-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <Info className="w-3 h-3 text-yellow-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-yellow-300 font-medium mb-1 text-sm">Desktop Required</h4>
                    <p className="text-yellow-100 text-xs leading-relaxed">
                      Extension testing is only available on desktop browsers. Please use a computer to test this extension.
                    </p>
                  </div>
                </div>
              </div>

              {/* Test button and status */}
              <div className="flex flex-col space-y-3 mb-4 sm:mb-6">
                <button
                  onClick={handleTestExtension}
                  disabled={isTestingExtension}
                  className={`group w-full px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center justify-center space-x-2 hidden sm:flex ${
                    testEnvironmentActive
                      ? 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg'
                      : isTestingExtension
                      ? 'bg-gray-600 text-gray-300 cursor-not-allowed transform-none hover:scale-100'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
                  }`}
                >
                  {isTestingExtension ? (
                    <>
                      <div className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-t-white border-r-transparent border-b-white border-l-transparent animate-spin"></div>
                      <span className="text-sm sm:text-base">Preparing...</span>
                    </>
                  ) : testEnvironmentActive ? (
                    <>
                      <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                      <span className="text-sm sm:text-base">Resume Test</span>
                      <span className="bg-green-700/50 px-2 py-1 rounded text-xs">
                        {formatTimeLeft(testEnvironmentTimeLeft)}
                      </span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="text-sm sm:text-base">Test Extension</span>
                      <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </button>

                <button
                  onClick={() => router.push('/chat')}
                  className="w-full px-4 py-2.5 bg-gray-700/60 hover:bg-gray-600/60 text-gray-300 rounded-lg transition-colors border border-gray-600/40 hover:border-gray-500/40 flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="text-sm sm:text-base">Build Your Own Extension Now</span>
                </button>
              </div>

              {/* Security notice */}
              <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-3 sm:p-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <Shield className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-400" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-yellow-300 font-medium mb-1 text-sm sm:text-base">Secure Testing Environment</h4>
                    <p className="text-yellow-100 text-xs leading-relaxed">
                      This extension runs in our isolated playground environment for your safety.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Environment */}
        <TestEnvironment 
          isVisible={isTestFrameVisible}
          url={testFrameUrl}
          isFullScreen={isFullScreenTest}
          isActive={testEnvironmentActive}
          timeLeft={testEnvironmentTimeLeft}
          isLoading={isTestingExtension}
          onClose={() => setIsTestFrameVisible(false)}
          onToggleFullScreen={toggleFullScreenTest}
          formatTimeLeft={formatTimeLeft}
          onStopSession={handleStopSession}
          testSetupFailed={false}
          failureReason={null}
          onRetry={handleTestExtension}
        />
      </>
    );
  }

  return null;
};

export default SharedExtensionPage; 