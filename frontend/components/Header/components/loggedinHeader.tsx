'use client';

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { User, LogOut, Plus, Menu, Bug, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/Chat/components/Sidebar';
import { generateUUID } from '@/lib/utils';
import toast from 'react-hot-toast';
import { authenticatedFetch } from '@/lib/api-utils';
import { getStoredToken } from '@/lib/auth-utils';
import { getUserFromCookie, setCookie, removeCookie } from '@/lib/cookie-utils';

interface UserData {
  uid: string;
  email?: string;
  displayName?: string;
  idToken?: string;
  currentSessionId?: string;
  debugMode?: boolean;
  credits?: number;
  [key: string]: any;
}

const LoggedInHeader = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadModalType, setUploadModalType] = useState<'debug'>('debug');
  const router = useRouter();
  const pathname = usePathname();
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  
  const [canAccessDebugFeature, setCanAccessDebugFeature] = useState(false); // Default to false
  
  // Loading states
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isNavigatingToMarketplace, setIsNavigatingToMarketplace] = useState(false);

  useEffect(() => {
    const userData = getUserFromCookie();
    if (userData) {
      setUser(userData);
      
      // Check if user has permissions for features
      checkFeaturePermissions(userData.uid);
    }
  }, []);

  const checkFeaturePermissions = async (userId: string) => {
    try {
        const response = await authenticatedFetch(
          `${process.env.NEXT_PUBLIC_API_URL}/middleware/user/features`
        );
      
      if (response.ok) {
        const data = await response.json();
        
        // Check feature flags
        const hasDebugging = data.has_debugging === true;
        
        // Set access state for debug feature
        setCanAccessDebugFeature(hasDebugging);
      } else {
        // Default to false if response is not ok
        setCanAccessDebugFeature(false);
      }
    } catch (error) {
      console.error('Error checking feature permissions:', error);
      // Default to false if there's an error
      setCanAccessDebugFeature(false);
    }
  };

  const handleDebugExtension = () => {
    // Generate a new unique session ID for the debug session
    const debugSessionId = generateUUID();
    
    // Update the current session ID in the user cookie
    if (user) {
      const updatedUser = {
        ...user,
        currentSessionId: debugSessionId,
        debugMode: true // Add flag to indicate this is a debug session
      };
      
      setCookie('user', updatedUser);
      setUser(updatedUser);
    }
    
    // Clear any previous debug data to avoid conflicts
    sessionStorage.removeItem('debugSessionId');
    sessionStorage.removeItem('debugFiles');
    sessionStorage.removeItem('debugAnalysis');
    sessionStorage.removeItem('conversionInProgress');
    
    // Show the upload modal for debug
    setShowUploadModal(true);
  };

  /** Toggle the user dropdown menu */
  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  /** Toggle the sidebar */
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  /** Close dropdown when clicking outside */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (dropdownOpen && !target.closest('.user-dropdown-container')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  /** Log the user out and remove cookie */
  const logout = async () => {
    setIsLoggingOut(true);
    try {
      // Add a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 500));
      removeCookie('user');
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
      setIsLoggingOut(false);
    }
  };

  /** Navigate to tokens with loading state */
  const handleMarketplaceNavigation = async () => {
    setIsNavigatingToMarketplace(true);
    try {
      // Add a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      router.push('/tokens/all');
    } catch (error) {
      console.error('Navigation error:', error);
      setIsNavigatingToMarketplace(false);
    }
  };

  /** Create a new chat when clicking the plus icon */
  const handleNewChat = () => {
    // Generate a new unique session ID
    const newSessionId = generateUUID();
    
    // Update the current session ID in the user cookie
    if (user) {
      const updatedUser = {
        ...user,
        currentSessionId: newSessionId
      };
      
      setCookie('user', updatedUser);
    setUser(updatedUser);
    }
    
    // Navigate to the new chat session
    router.push(`/chat/${newSessionId}`);
  };

  const clearProcessingState = () => {
    sessionStorage.removeItem('isProcessingExtension');
    window.dispatchEvent(new CustomEvent('extensionProcessingChange', {
      detail: { isProcessing: false }
    }));
  };

  // Show tooltip for a specific button
  const showTooltip = (tooltipId: string) => {
    setActiveTooltip(tooltipId);
  };

  // Hide tooltip
  const hideTooltip = () => {
    setActiveTooltip(null);
  };

  async function handleExtensionUpload(file: File) {
    if (!file || !user?.uid) return;
    
    // Validate extension is a zip file
    if (file.type !== 'application/zip' && !file.name.endsWith('.zip')) {
      toast.error('Please upload a valid ZIP file');
      return;
    }
    
    try {
      sessionStorage.setItem('isProcessingExtension', 'true');

      window.dispatchEvent(new CustomEvent('extensionProcessingChange', {
        detail: { isProcessing: true }
      }));
  
      toast.loading('Analyzing your extension...');
      
      // Create a new FormData object
      const formData = new FormData();
      formData.append('file', file);
      
      // Send the extension to the debug endpoint
      const endpoint = `${process.env.NEXT_PUBLIC_API_URL}/middleware/extension/debug`;
      
      const response = await authenticatedFetch(endpoint, 
        {
          method: 'POST',
          body: formData
        }
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        sessionStorage.removeItem('isProcessingExtension');
        clearProcessingState();

        throw new Error(errorData.error || 'Failed to upload extension');
      }
      
      const data = await response.json();
      
      if (!data.success) {
        sessionStorage.removeItem('isProcessingExtension');
        clearProcessingState();

        throw new Error(data.error || 'Failed to process extension');
      }
      
      // Check if the extension uses a framework we don't support yet
      if (data.is_framework_detected) {
        sessionStorage.removeItem('isProcessingExtension');
        clearProcessingState();

        toast.dismiss();
        toast.error('Framework-based extensions are not supported yet. Please use vanilla JavaScript extensions.');
        return;
      }
      
      toast.dismiss();
      toast.success('Extension uploaded successfully!');
      
      // Get the session ID 
      const sessionId = data.session_id;
      
      if (!sessionId) {
        sessionStorage.removeItem('isProcessingExtension');
        clearProcessingState();
        throw new Error('No session ID returned from server');
      }
      
      // Store information in sessionStorage based on operation type
      if (uploadModalType === 'debug' && data.files) {
        // Store the session ID alongside the debug data
        sessionStorage.setItem('debugSessionId', sessionId);
        sessionStorage.setItem('debugFiles', JSON.stringify(data.files));
        sessionStorage.setItem('debugAnalysis', data.analysis || '');
      } 
      // Don't set any special flags for conversion - let it behave like a normal chat
      
      // Store credit information if provided
      if (data.credits_remaining !== undefined) {
        sessionStorage.setItem('creditsRemaining', String(data.credits_remaining));
      }
      
      if (data.follow_ups_remaining !== undefined) {
        sessionStorage.setItem('followUpsRemaining', String(data.follow_ups_remaining));
      }
      
      // Update user cookie with the session ID
      const updatedUser = {
        ...user,
        currentSessionId: sessionId,
        debugMode: uploadModalType === 'debug',
        credits: data.credits_remaining !== undefined ? data.credits_remaining : user.credits
      };
      
      // Update cookie and state
      setCookie('user', updatedUser);
      setUser(updatedUser);
      
      // Clean up processing state
      sessionStorage.removeItem('isProcessingExtension');
      clearProcessingState();

      // Redirect to the chat with the session ID - this will connect to websocket 
      // and start the chat like a normal flow
      router.push(`/chat/${sessionId}`);
    } catch (error) {
      console.error('Extension upload error:', error);
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : 'Failed to upload extension');
      sessionStorage.removeItem('isProcessingExtension');
      clearProcessingState();
    }
  }

  return (
    <>
      {/* Dynamic background effects for header */}
      <div className="fixed top-0 left-0 w-full h-16 sm:h-[60px] md:h-[72px] overflow-hidden z-10 pointer-events-none">
        {/* Subtle aurora effects */}
        <div className="absolute -top-[50px] -left-[100px] w-[300px] h-[200px] bg-[radial-gradient(ellipse_at_center,hsla(217,100%,50%,0.08)_0%,transparent_70%)]" style={{animation: 'aurora-x 25s ease-in-out infinite'}} />
        <div className="absolute -top-[30px] -right-[80px] w-[250px] h-[200px] bg-[radial-gradient(ellipse_at_center,hsla(265,89%,60%,0.08)_0%,transparent_70%)]" style={{animation: 'aurora-y 20s ease-in-out infinite'}} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
      </div>

      {/* Fixed header container with logo and user profile */}
      <div className="fixed top-0 left-0 w-full px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex justify-between items-center z-20 bg-gradient-to-r from-gray-900/90 via-gray-900/80 to-gray-900/90 border-b border-gray-800/30 backdrop-blur-md">
        {/* Left Section: Sidebar Toggle + Logo */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <div className="relative">
            <button
              onClick={toggleSidebar}
              className="relative rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors group p-1.5 sm:p-2"
              aria-label="See your history"
              onMouseEnter={() => showTooltip('sidebar')}
              onMouseLeave={hideTooltip}
              onFocus={() => showTooltip('sidebar')}
              onBlur={hideTooltip}
            >
              {/* Button content */}
              <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-white group-hover:scale-105 transition-transform duration-300" />
            </button>
            {activeTooltip === 'sidebar' && (
              <div className="absolute left-0 top-full mt-1 px-2.5 py-1.5 bg-gray-800 text-xs font-medium rounded shadow-lg whitespace-nowrap z-50 border border-gray-700/80 text-white/90 shadow-black/50">
                See your history
              </div>
            )}
          </div>

          <Link href="/chat" className="flex items-center cursor-pointer">
            <span className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-purple-400 to-teal-400 animate-gradient-x transition-transform transform-gpu">
              CodEase
            </span>
          </Link>
        </div>

        {/* Right Section: Actions Menu */}
        <div className="flex items-center space-x-1 xs:space-x-1.5 sm:space-x-3">
          {/* Debug Extension Button - always rendered but conditionally enabled */}
          {/* COMMENTED OUT FOR THIS RELEASE - Debug feature will be added in future release */}
          {/* <div className="relative">
            <button
              onClick={canAccessDebugFeature ? handleDebugExtension : () => {
                toast('Purchase credits or a subscription to unlock this feature', { 
                  duration: 4000,
                  icon: '💡'
                });
                router.push('/pricing');
              }}
              className={`relative px-1.5 xs:px-2 sm:px-3 py-1 xs:py-1.5 sm:py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors group ${!canAccessDebugFeature ? 'opacity-50 cursor-pointer bg-blue-600/50 hover:bg-blue-600/50' : ''}`}
              aria-label="Debug Extension"
              onMouseEnter={() => showTooltip('debug')}
              onMouseLeave={hideTooltip}
              onFocus={() => showTooltip('debug')}
              onBlur={hideTooltip}
            >
              {/* Button content */}
              {/* <span className="flex items-center justify-center text-white font-medium group-hover:scale-105 transition-transform duration-300">
                <Bug className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
            </button>
            {activeTooltip === 'debug' && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2.5 py-1.5 bg-gray-800 text-xs font-medium rounded shadow-lg whitespace-nowrap z-50 border border-gray-700/80 text-white/90 shadow-black/50">
                {canAccessDebugFeature ? 'Debug your extension' : 'Buy credits or subscription to unlock this feature'}
              </div>
            )}
          </div> */}

          {/* New Chat Button */}
          <div className="relative">
            <button
              onClick={handleNewChat}
              className="relative px-1.5 xs:px-2 sm:px-3 py-1 xs:py-1.5 sm:py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors group"
              aria-label="New Chat"
              onMouseEnter={() => showTooltip('newchat')}
              onMouseLeave={hideTooltip}
              onFocus={() => showTooltip('newchat')}
              onBlur={hideTooltip}
            >
              {/* Button content */}
              <span className="flex items-center justify-center text-white font-medium group-hover:scale-105 transition-transform duration-300">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              </span>
            </button>
            {activeTooltip === 'newchat' && (
              <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2.5 py-1.5 bg-gray-800 text-xs font-medium rounded shadow-lg whitespace-nowrap z-50 border border-gray-700/80 text-white/90 shadow-black/50">
                Start a new chat
              </div>
            )}
          </div>

          {/* Tokens Button - Hidden when on tokens page */}
          {!pathname?.startsWith('/tokens') && (
            <div className="relative">
              <button
                onClick={handleMarketplaceNavigation}
                disabled={isNavigatingToMarketplace}
                className={`relative px-1.5 xs:px-2 sm:px-3 py-1 xs:py-1.5 sm:py-2 rounded-lg transition-all group marketplace-button ${
                  isNavigatingToMarketplace 
                    ? 'bg-purple-700 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700'
                }`}
                aria-label="Browse Tokens"
                onMouseEnter={() => !isNavigatingToMarketplace && showTooltip('marketplace')}
                onMouseLeave={hideTooltip}
                onFocus={() => !isNavigatingToMarketplace && showTooltip('marketplace')}
                onBlur={hideTooltip}
              >
                {/* Button content */}
                <span className={`flex items-center justify-center text-white font-medium transition-transform duration-300 ${
                  isNavigatingToMarketplace ? '' : 'group-hover:scale-105'
                }`}>
                  {isNavigatingToMarketplace ? (
                    <div className="animate-spin rounded-full h-4 w-4 sm:h-5 sm:w-5 border-2 border-white/30 border-t-white"></div>
                  ) : (
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                      <path d="m2 17 10 5 10-5"></path>
                      <path d="m2 12 10 5 10-5"></path>
                    </svg>
                  )}
                  <span className="text-xs sm:text-sm font-semibold ml-1">
                    {isNavigatingToMarketplace ? (
                      <span className="hidden sm:inline">Loading...</span>
                    ) : (
                      <>
                        <span className="hidden sm:inline">Tokens</span>
                        <span className="inline sm:hidden">Tokens</span>
                      </>
                    )}
                  </span>
                </span>
              </button>
              {activeTooltip === 'marketplace' && !isNavigatingToMarketplace && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 px-2.5 py-1.5 bg-gray-800 text-xs font-medium rounded shadow-lg whitespace-nowrap z-50 border border-gray-700/80 text-white/90 shadow-black/50">
                  <span className="flex items-center gap-1">
                    Browse tokens
                    <span className="text-[10px] text-purple-400 font-bold">NEW!</span>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* User Dropdown */}
          <div className="relative user-dropdown-container">
            <button
              onClick={toggleDropdown}
              className="relative px-1.5 xs:px-2 sm:px-3 py-1 xs:py-1.5 sm:py-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors group"
              aria-label="User menu"
              aria-expanded={dropdownOpen}
              onMouseEnter={() => showTooltip('user')}
              onMouseLeave={hideTooltip}
              onFocus={() => showTooltip('user')}
              onBlur={hideTooltip}
            >
              {/* Button content */}
              <span className="flex items-center justify-center text-white">
                <User className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-105 transition-transform duration-300" />
              </span>
            </button>
            {activeTooltip === 'user' && !dropdownOpen && (
              <div className="absolute right-0 top-full mt-1 px-2.5 py-1.5 bg-gray-800 text-xs font-medium rounded shadow-lg whitespace-nowrap z-50 border border-gray-700/80 text-white/90 shadow-black/50">
                Account menu
              </div>
            )}

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white text-black rounded-md shadow-lg overflow-hidden z-50">
                <div className="p-2 border-b">
                  <a href="/dashboard" className="block p-2 hover:bg-gray-100 rounded-md transition group">
                    <p className="font-medium text-sm sm:text-base truncate">
                      {user?.displayName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate group-hover:text-blue-500">
                      {user?.email}
                      <span className="text-xs ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500">(Go to Dashboard)</span>
                    </p>
                  </a>
                </div>
                <a
                  href="/dashboard"
                  className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 transition"
                >
                  <Zap className="w-4 h-4 mr-2" /> Go to Dashboard
                </a>
                <button
                  onClick={logout}
                  disabled={isLoggingOut}
                  className={`flex items-center w-full px-4 py-2 text-sm transition ${
                    isLoggingOut 
                      ? 'text-red-400 cursor-not-allowed' 
                      : 'text-red-600 hover:bg-gray-100'
                  }`}
                >
                  {isLoggingOut ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-red-400/30 border-t-red-400 mr-2"></div>
                  ) : (
                    <LogOut className="w-4 h-4 mr-2" />
                  )}
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Component */}
      <Sidebar isOpen={sidebarOpen} onClose={toggleSidebar} />
      
      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-2xl w-full max-w-md p-4 sm:p-6">
            <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4">
              Debug Your Extension
            </h3>
            
            <p className="text-gray-300 mb-4 sm:mb-6 text-sm sm:text-base">
              Upload your Chrome extension as a ZIP file. We'll analyze it and help you identify issues.
              <span className="block mt-2 text-xs sm:text-sm text-blue-400">
                Note: Currently we only support vanilla JavaScript extensions. React, Vue or other framework-based extensions are coming soon.
              </span>
            </p>
            
            <div className="mb-4 sm:mb-6">
              <div className="border-2 border-dashed border-blue-500/30 rounded-lg p-4 sm:p-8 text-center bg-blue-900/10 hover:bg-blue-900/20 transition cursor-pointer"
                onClick={() => {
                  const uploadInput = document.getElementById('extension-upload-file');
                  if (uploadInput) {
                    uploadInput.click();
                  }
                }}           
              >
                <Bug className="w-8 h-8 sm:w-12 sm:h-12 mx-auto text-blue-400 mb-2" />
                <p className="text-blue-300 font-medium text-sm sm:text-base">Click to select extension ZIP file</p>
                <p className="text-gray-400 text-xs sm:text-sm mt-2">or drag and drop here</p>
              </div>
              <input 
                type="file" 
                id="extension-upload-file" 
                className="hidden" 
                accept=".zip"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    // Handle file upload here
                    handleExtensionUpload(file);
                    setShowUploadModal(false);
                  }
                }}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setShowUploadModal(false)}
                className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-md transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add the animation styles */}
      <style jsx global>{`
        @keyframes gradient-x {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        .animate-gradient-x {
          background-size: 200% auto;
          animation: gradient-x 8s ease infinite;
        }
        
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
        
        @keyframes badge-glow {
          0%, 100% { 
            box-shadow: 0 0 8px rgba(59, 130, 246, 0.4), 0 0 16px rgba(20, 184, 166, 0.2);
            transform: scale(1);
          }
          50% { 
            box-shadow: 0 0 12px rgba(59, 130, 246, 0.6), 0 0 24px rgba(20, 184, 166, 0.4);
            transform: scale(1.05);
          }
        }
        
        @keyframes marketplace-breathe {
          0%, 100% { 
            transform: scale(1);
          }
          50% { 
            transform: scale(1.02);
          }
        }
        
        .marketplace-button {
          animation: marketplace-breathe 3s ease-in-out infinite;
        }
        
        .marketplace-button:hover {
          animation: none;
        }
        
        .new-badge {
          animation: badge-glow 2s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default LoggedInHeader;