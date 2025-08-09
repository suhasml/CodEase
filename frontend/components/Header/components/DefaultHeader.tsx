'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Zap, Menu, X } from 'lucide-react';

export const DefaultHeader = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'How It Works', href: '/#demo' },
    { label: 'Features', href: '/#features' },
    { label: 'Tokens', href: '/tokens/all' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Testimony', href: '/#testimonials' },
    { label: 'FAQ', href: '/#faq' }
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);

   // Handle navigation for any link
   const handleNavClick = (href: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    
    const isAnchorLink = href.startsWith('/#') || href === '/';
    const targetId = isAnchorLink ? (href === '/' ? 'hero' : href.substring(2)) : null; // Use 'hero' for home navigation
    const isSamePageNavigation = pathname === '/' && isAnchorLink; // Check if navigating within the landing page

    if (isSamePageNavigation && targetId) {
      const element = document.getElementById(targetId);
      const header = document.querySelector('[data-header]') as HTMLElement;
      const headerHeight = header ? header.offsetHeight : 0;
      
      if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.scrollY;
        const offsetPosition = elementPosition - headerHeight - 10; // Added small buffer (10px)

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      } else if (href === '/') { // Special case for 'Home' link - scroll to top with header offset
        window.scrollTo({ 
          top: 0, 
          behavior: 'smooth' 
        });
      }
    } else {
      // Use standard router navigation for different pages or non-anchor links
      router.push(href);
    }
    
    // Close mobile menu if open
    if (isMobileMenuOpen) {
      toggleMobileMenu();
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Prevent scrolling when mobile menu is open
    if (!isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  };

  // Clean up the body overflow style when component unmounts
  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <>
      {/* Main header container */}
      <div
      data-header // Ensure this attribute exists
      className={`fixed top-0 left-0 w-full px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center z-40 transition-all duration-300 ${
        scrolled ? 'bg-gray-900/90 backdrop-blur-md shadow-lg' : 'bg-transparent'
      }`}
      >
        {/* Logo */}
        <div className="flex items-center z-50">
          <Link 
            href="/" 
            className="flex items-center cursor-pointer"
            onClick={(e) => handleNavClick('/', e)} // Pass event here too
          >
            <span className="text-2xl sm:text-3xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-purple-400 to-teal-400 animate-gradient-x transition-transform transform-gpu hover:scale-105 transition-all duration-300">
              CodEase
            </span>
          </Link>
        </div>

        {/* Desktop Navigation - Only visible on large screens */}
        <div className="hidden lg:flex items-center justify-center absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2">
          <div className={`px-16 py-3 rounded-xl shadow-lg transition-all duration-300 min-w-[750px] xl:min-w-[850px] ${
            scrolled 
              ? 'bg-gray-900/80 backdrop-blur-md border border-gray-700/50' 
              : 'bg-gradient-to-br from-gray-900/70 to-gray-950/80 backdrop-blur-md border border-gray-800/40 shadow-xl shadow-blue-500/5'
          }`}>
            <nav className="flex items-center justify-between">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(item.href, e)} // Pass event here
                  className={`
                    text-white text-sm xl:text-base 2xl:text-lg px-5 py-2 xl:px-6 xl:py-3 whitespace-nowrap
                    hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:via-teal-400 hover:to-blue-500 
                    font-medium transition-all duration-300 rounded-lg hover:shadow-lg hover:shadow-blue-500/20
                    ${pathname === item.href ? "font-semibold bg-blue-500/10" : ""}
                  `}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Sign In Button and Mobile Menu Toggle */}
        <div className="flex items-center z-50">
          {/* Sign In Button */}
          <button
            onClick={() => router.push('/signin')}
            className="relative px-3 py-2 sm:px-6 sm:py-3 text-sm sm:text-base rounded-lg overflow-hidden group"
          >
            {/* Button background with animated gradient */}
            <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500 transition-all duration-500 group-hover:blur-sm"></span>
            <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-teal-500 to-blue-500 opacity-0 group-hover:opacity-100 transition-all duration-500 group-hover:animate-gradient-x"></span>
            
            {/* Button content */}
            <span className="relative flex items-center justify-center z-10 text-white font-bold group-hover:scale-105 transition-transform duration-300">
              Sign In <Zap className="ml-1 sm:ml-2 w-3 h-3 sm:w-4 sm:h-4 group-hover:animate-pulse" />
            </span>
            
            {/* Subtle glow effect */}
            <span className="absolute inset-0 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 shadow-blue-500/30 transition-opacity"></span>
          </button>

          {/* Mobile/Tablet Menu Toggle Button */}
          <button
            className="lg:hidden ml-2 sm:ml-4 px-3 py-2 sm:p-2 rounded-lg bg-gradient-to-br from-blue-600 to-teal-500 hover:opacity-90 transition-opacity"
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            ) : (
              <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Menu - Improved for iPads and smaller screens */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden flex items-start justify-center bg-black bg-opacity-90 pt-20">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 w-11/12 max-w-md">
            <nav className="flex flex-col items-center">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={(e) => handleNavClick(item.href, e)} // Pass event here
                  className={`
                    text-lg text-white hover:text-blue-400 font-medium 
                    transition-colors w-full text-center py-4 border-b border-gray-700/50
                    ${pathname === item.href ? "text-blue-400 font-semibold" : ""}
                  `}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  router.push('/signin');
                  toggleMobileMenu();
                }}
                className="relative mt-6 px-6 py-3 rounded-lg overflow-hidden group w-full"
              >
                {/* Button background with animated gradient */}
                <span className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-500 to-teal-500"></span>
                
                {/* Button content */}
                <span className="relative flex items-center justify-center z-10 text-white font-bold">
                  Sign In <Zap className="ml-2 w-5 h-5" />
                </span>
              </button>
            </nav>
          </div>
        </div>
      )}
      
      {/* Animation styles */}
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
      `}</style>
    </>
  );
};

export default DefaultHeader;