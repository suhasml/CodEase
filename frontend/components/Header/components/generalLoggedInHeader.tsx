// 'use client';

// import React, { useEffect, useState } from 'react';
// import Cookies from 'js-cookie';
// import { User, LogOut, Zap } from 'lucide-react';
// import Link from 'next/link';
// import { useRouter } from 'next/navigation';

// const GeneralLoggedInHeader = () => {
//   const [user, setUser] = useState<any>(null);
//   const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [showTooltip, setShowTooltip] = useState(false);
//   const router = useRouter();

//   useEffect(() => {
//     const storedUser = Cookies.get('user');
//     if (storedUser) {
//       const userData = JSON.parse(storedUser);
//       setUser(userData);
//     }
//   }, []);

//   /** Toggle the user dropdown menu */
//   const toggleDropdown = () => {
//     setDropdownOpen((prev) => !prev);
//   };

//   /** Close dropdown when clicking outside */
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       const target = event.target as HTMLElement;
//       if (dropdownOpen && !target.closest('.user-dropdown-container')) {
//         setDropdownOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, [dropdownOpen]);

//   /** Log the user out and remove cookie */
//   const logout = () => {
//     Cookies.remove('user');
//     sessionStorage.clear();

//     router.push('/');
//   };

//   /** Navigate to the chat interface */
//   const handleGoToChat = () => {
//     router.push('/chat');
//   };

//   return (
//     <>
//       {/* Dynamic background effects for header */}
//       <div className="fixed top-0 left-0 w-full h-16 sm:h-[60px] md:h-[72px] overflow-hidden z-40 pointer-events-none">
//         {/* Subtle aurora effects */}
//         <div className="absolute -top-[50px] -left-[100px] w-[300px] h-[200px] bg-[radial-gradient(ellipse_at_center,hsla(217,100%,50%,0.08)_0%,transparent_70%)]" style={{animation: 'aurora-x 25s ease-in-out infinite'}} />
//         <div className="absolute -top-[30px] -right-[80px] w-[250px] h-[200px] bg-[radial-gradient(ellipse_at_center,hsla(265,89%,60%,0.08)_0%,transparent_70%)]" style={{animation: 'aurora-y 20s ease-in-out infinite'}} />
        
//         {/* Grid pattern overlay */}
//         <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
//       </div>

//       {/* Fixed header container with logo and user profile */}
//       <div className="fixed top-0 left-0 w-full px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex justify-between items-center z-50 bg-gradient-to-r from-gray-900/90 via-gray-900/80 to-gray-900/90 border-b border-gray-800/30 backdrop-blur-md">
//         {/* Logo - Fixed at left top end */}
//         <div className="flex items-center z-50">
//           <Link href="/chat" className="flex items-center cursor-pointer">
//             <span className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-purple-400 to-teal-400 animate-gradient-x transition-transform transform-gpu">
//               CodEase
//             </span>
//           </Link>
//         </div>

//         {/* User menu and actions - Fixed at right top end */}
//         <div className="flex items-center z-50 space-x-2 sm:space-x-3">
//           {/* Go to Chat Button */}
//           <button
//             onClick={handleGoToChat}
//             className="relative px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg overflow-hidden group"
//             aria-label="Go to Chat"
//           >
//             {/* Button background with animated gradient */}
//             <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 transition-all duration-500 group-hover:blur-sm"></span>
//             <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-teal-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:animate-gradient-x"></span>
            
//             {/* Button content */}
//             <span className="relative flex items-center justify-center z-10 text-white font-medium group-hover:scale-105 transition-transform duration-300">
//               <span className="hidden sm:inline">Go to Chat</span>
//               <span className="inline sm:hidden">Chat</span>
//               <Zap className="ml-1 w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:animate-pulse" />
//             </span>
            
//             {/* Subtle glow effect */}
//             <span className="absolute inset-0 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 shadow-blue-500/30 transition-opacity"></span>
//           </button>

//           {/* User Dropdown */}
//           <div className="relative user-dropdown-container">
//             <button
//               onClick={toggleDropdown}
//               onMouseEnter={() => setShowTooltip(true)}
//               onMouseLeave={() => setShowTooltip(false)}
//               className="relative px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg overflow-hidden group"
//               aria-label="User Menu"
//               aria-expanded={dropdownOpen}
//             >
//               {/* Button background with animated gradient */}
//               <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 transition-all duration-500 group-hover:blur-sm"></span>
//               <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-teal-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:animate-gradient-x"></span>
              
//               {/* Button content */}
//               <span className="relative flex items-center justify-center z-10 text-white">
//                 <User className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-105 transition-transform duration-300" />
//               </span>
              
//               {/* Subtle glow effect */}
//               <span className="absolute inset-0 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 shadow-blue-500/30 transition-opacity"></span>
//             </button>

//             {/* Tooltip */}
//             {showTooltip && !dropdownOpen && (
//               <div className="absolute right-0 top-full mt-2 px-3 py-1.5 bg-white text-gray-800 text-xs rounded-md shadow-lg whitespace-nowrap z-50">
//                 View Profile
//               </div>
//             )}

//             {/* Dropdown Menu */}
//             {dropdownOpen && (
//               <div className="absolute right-0 top-full mt-2 w-44 sm:w-48 bg-white text-black rounded-md shadow-lg overflow-hidden">
//                 <div className="p-2 border-b">
//                   <a 
//                     href="/dashboard" 
//                     className="block p-2 hover:bg-gray-100 rounded-md transition group"
//                     title="Go to Dashboard"
//                   >
//                     <p className="font-medium text-sm sm:text-base truncate">
//                       {user?.displayName || 'User'}
//                     </p>
//                     <p className="text-xs text-gray-500 truncate group-hover:text-blue-500">
//                       {user?.email}
//                       <span className="text-xs ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500">(Dashboard)</span>
//                     </p>
//                   </a>
//                 </div>
//                 <a
//                   href="/dashboard"
//                   className="flex items-center w-full px-4 py-2 text-sm hover:bg-gray-100 transition"
//                 >
//                   <Zap className="w-4 h-4 mr-2" /> Go to Dashboard
//                 </a>
//                 <button
//                   onClick={logout}
//                   className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 transition"
//                 >
//                   <LogOut className="w-4 h-4 mr-2" /> Logout
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Add the animation styles */}
//       <style jsx global>{`
//         @keyframes gradient-x {
//           0% { background-position: 0% 50%; }
//           50% { background-position: 100% 50%; }
//           100% { background-position: 0% 50%; }
//         }
        
//         .animate-gradient-x {
//           background-size: 200% auto;
//           animation: gradient-x 8s ease infinite;
//         }
        
//         @keyframes aurora-x {
//           0%, 100% { transform: translateX(0) rotate(0); opacity: 0.8; }
//           50% { transform: translateX(30px) rotate(5deg); opacity: 1; }
//         }
        
//         @keyframes aurora-y {
//           0%, 100% { transform: translateY(0) rotate(0); opacity: 0.7; }
//           50% { transform: translateY(30px) rotate(-5deg); opacity: 1; }
//         }
        
//         @keyframes aurora-pulse {
//           0%, 100% { opacity: 0.3; transform: scale(1); }
//           50% { opacity: 0.5; transform: scale(1.1); }
//         }
        
//         /* Large Screen adjustments */
//         @media (min-width: 1536px) {
//           .header-text {
//             font-size: 1.25rem;
//           }
//           .header-icon {
//             width: 1.5rem;
//             height: 1.5rem;
//           }
//         }

//         /* Ultra Large Screens (TVs) */
//         @media (min-width: 2560px) {
//           .header-text {
//             font-size: 1.5rem;
//           }
//           .header-icon {
//             width: 1.75rem;
//             height: 1.75rem;
//           }
//         }
//       `}</style>
//     </>
//   );
// };

// export default GeneralLoggedInHeader;

'use client';

import React, { useEffect, useState } from 'react';
import { User, LogOut, Zap } from 'lucide-react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getUserFromCookie } from '@/lib/cookie-utils';

interface UserData {
  uid?: string;
  email?: string;
  displayName?: string;
  idToken?: string;
  [key: string]: any;
}

const GeneralLoggedInHeader = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  // Loading states
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isNavigatingToChat, setIsNavigatingToChat] = useState(false);
  const [isNavigatingToMarketplace, setIsNavigatingToMarketplace] = useState(false);

  useEffect(() => {
    const userData = getUserFromCookie();
    if (userData) {
      setUser(userData);
    }
  }, []);

  /** Toggle the user dropdown menu */
  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
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
      // Use document.cookie to remove the user cookie securely
      document.cookie = 'user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=strict';
      sessionStorage.clear();
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
  const handleGoToChat = async () => {
    setIsNavigatingToChat(true);
    try {
      // Add a small delay to show the loading state
      await new Promise(resolve => setTimeout(resolve, 300));
      router.push('/chat');
    } catch (error) {
      console.error('Navigation error:', error);
      setIsNavigatingToChat(false);
    }
  };

  return (
    <>
      {/* Dynamic background effects for header */}
      <div className="fixed top-0 left-0 w-full h-16 sm:h-[60px] md:h-[72px] overflow-hidden z-40 pointer-events-none">
        {/* Subtle aurora effects */}
        <div className="absolute -top-[50px] -left-[100px] w-[300px] h-[200px] bg-[radial-gradient(ellipse_at_center,hsla(217,100%,50%,0.08)_0%,transparent_70%)]" style={{animation: 'aurora-x 25s ease-in-out infinite'}} />
        <div className="absolute -top-[30px] -right-[80px] w-[250px] h-[200px] bg-[radial-gradient(ellipse_at_center,hsla(265,89%,60%,0.08)_0%,transparent_70%)]" style={{animation: 'aurora-y 20s ease-in-out infinite'}} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:20px_20px]" />
      </div>

      {/* Fixed header container with logo and user profile */}
      <div className="fixed top-0 left-0 w-full px-3 sm:px-4 md:px-6 py-2 sm:py-3 md:py-4 flex justify-between items-center z-50 bg-gradient-to-r from-gray-900/90 via-gray-900/80 to-gray-900/90 border-b border-gray-800/30 backdrop-blur-md">
        {/* Logo - Fixed at left top end */}
        <div className="flex items-center z-50">
          <Link href="/chat" className="flex items-center cursor-pointer">
            <span className="text-xl sm:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-purple-400 to-teal-400 animate-gradient-x transition-transform transform-gpu">
              CodEase
            </span>
          </Link>
        </div>

        {/* User menu and actions - Fixed at right top end */}
        <div className="flex items-center z-50 space-x-2 sm:space-x-3">
          {/* Go to Chat Button */}
          <button
            onClick={handleGoToChat}
            disabled={isNavigatingToChat}
            className={`relative px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg overflow-hidden group ${
              isNavigatingToChat ? 'cursor-not-allowed' : ''
            }`}
            aria-label="Go to Chat"
          >
            {/* Button background with animated gradient */}
            <span className={`absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 transition-all duration-500 ${
              isNavigatingToChat ? '' : 'group-hover:blur-sm'
            }`}></span>
            <span className={`absolute inset-0 bg-gradient-to-r from-blue-600 via-teal-500 to-blue-500 opacity-0 transition-all duration-500 ${
              isNavigatingToChat ? '' : 'group-hover:opacity-100 group-hover:animate-gradient-x'
            }`}></span>
            
            {/* Button content */}
            <span className={`relative flex items-center justify-center z-10 text-white font-medium transition-transform duration-300 ${
              isNavigatingToChat ? '' : 'group-hover:scale-105'
            }`}>
              {isNavigatingToChat ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 sm:h-3.5 sm:w-3.5 border-2 border-white/30 border-t-white mr-1"></div>
                  <span className="hidden sm:inline">Loading...</span>
                  <span className="inline sm:hidden">Loading...</span>
                </>
              ) : (
                <>
                  <span className="hidden sm:inline">Go to Chat</span>
                  <span className="inline sm:hidden">Chat</span>
                  <Zap className="ml-1 w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:animate-pulse" />
                </>
              )}
            </span>
            
            {/* Subtle glow effect */}
            <span className={`absolute inset-0 rounded-lg shadow-xl transition-opacity shadow-blue-500/30 ${
              isNavigatingToChat ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
            }`}></span>
          </button>

          {/* Tokens Button - Hidden when on tokens page */}
          {!pathname?.startsWith('/tokens') && (
            <div className="relative">
              <button
                onClick={handleMarketplaceNavigation}
                disabled={isNavigatingToMarketplace}
                className={`relative px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 text-xs sm:text-sm rounded-lg overflow-hidden group marketplace-button ${
                  isNavigatingToMarketplace ? 'cursor-not-allowed' : ''
                }`}
                aria-label="Browse Tokens"
              >
                {/* Button background with animated gradient */}
                <span className={`absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-500 to-pink-500 transition-all duration-500 ${
                  isNavigatingToMarketplace ? '' : 'group-hover:blur-sm'
                }`}></span>
                <span className={`absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-500 opacity-0 transition-all duration-500 ${
                  isNavigatingToMarketplace ? '' : 'group-hover:opacity-100 group-hover:animate-gradient-x'
                }`}></span>
                
                {/* Button content */}
                <span className={`relative flex items-center justify-center z-10 text-white font-medium transition-transform duration-300 ${
                  isNavigatingToMarketplace ? '' : 'group-hover:scale-105'
                }`}>
                  {isNavigatingToMarketplace ? (
                    <div className="animate-spin rounded-full h-3 w-3 sm:h-3.5 sm:w-3.5 border-2 border-white/30 border-t-white"></div>
                  ) : (
                    <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
                
                {/* Subtle glow effect */}
                <span className={`absolute inset-0 rounded-lg shadow-xl transition-opacity shadow-purple-500/30 ${
                  isNavigatingToMarketplace ? 'opacity-0' : 'opacity-0 group-hover:opacity-100'
                }`}></span>
              </button>
            </div>
          )}

          {/* User Dropdown */}
          <div className="relative user-dropdown-container">
            <button
              onClick={toggleDropdown}
              disabled={isLoggingOut}
              onMouseEnter={() => !isLoggingOut && setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
              className={`relative px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg overflow-hidden group ${
                isLoggingOut ? 'cursor-not-allowed' : ''
              }`}
              aria-label="User Menu"
              aria-expanded={dropdownOpen}
            >


              {/* Button background with animated gradient */}
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 transition-all duration-500 group-hover:blur-sm"></span>
              <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-teal-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:animate-gradient-x"></span>
              
              {/* Button content */}
              <span className="relative flex items-center justify-center z-10 text-white">
                <User className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-105 transition-transform duration-300" />
              </span>
              
              {/* Subtle glow effect */}
              <span className="absolute inset-0 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 shadow-blue-500/30 transition-opacity"></span>
            </button>

            {/* Tooltip */}
            {showTooltip && !dropdownOpen && !isLoggingOut && (
              <div className="absolute right-0 top-full mt-2 px-3 py-1.5 bg-white text-gray-800 text-xs rounded-md shadow-lg whitespace-nowrap z-50">
                View Profile
              </div>
            )}

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-44 sm:w-48 bg-white text-black rounded-md shadow-lg overflow-hidden">
                <div className="p-2 border-b">
                  <a 
                    href="/dashboard" 
                    className="block p-2 hover:bg-gray-100 rounded-md transition group"
                    title="Go to Dashboard"
                  >
                    <p className="font-medium text-sm sm:text-base truncate">
                      {user?.displayName || 'User'}
                    </p>
                    <p className="text-xs text-gray-500 truncate group-hover:text-blue-500">
                      {user?.email}
                      <span className="text-xs ml-1 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500">(Dashboard)</span>
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
        

        
        /* Large Screen adjustments */
        @media (min-width: 1536px) {
          .header-text {
            font-size: 1.25rem;
          }
          .header-icon {
            width: 1.5rem;
            height: 1.5rem;
          }
        }

        /* Ultra Large Screens (TVs) */
        @media (min-width: 2560px) {
          .header-text {
            font-size: 1.5rem;
          }
          .header-icon {
            width: 1.75rem;
            height: 1.75rem;
          }
        }
      `}</style>
    </>
  );
};

export default GeneralLoggedInHeader;