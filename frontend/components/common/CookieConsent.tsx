'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cookie, X, ChevronDown, ChevronUp } from 'lucide-react';

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem('cookie-consent');
    if (!hasAccepted) {
      // Small delay to show the banner after page loads
      const timer = setTimeout(() => {
        setShowConsent(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('cookie-consent', 'true');
    setShowConsent(false);
  };

  const declineCookies = () => {
    // You might want to implement a different behavior for declining cookies
    // For now, we'll just close the banner without setting the consent in localStorage
    setShowConsent(false);
  };

  return (
    <AnimatePresence>
      {showConsent && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 25 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:max-w-md md:right-4 z-50"
        >
          <div className="bg-gray-800/90 backdrop-blur-sm border border-gray-700 rounded-lg p-4 shadow-lg">
            <div className="flex items-start gap-3">
              <Cookie className="h-5 w-5 text-blue-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h4 className="font-medium text-white mb-2">Cookie Notice</h4>
                <p className="text-sm text-gray-300 mb-3">
                  We use cookies to enhance your experience on our website, analyze site traffic, provide social media features, and personalize content.
                </p>
                
                {/* Cookie details section */}
                <div className="mb-4">
                  <button 
                    onClick={() => setShowDetails(!showDetails)}
                    className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    {showDetails ? (
                      <>
                        <ChevronUp className="w-4 h-4 mr-1" />
                        Hide details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-4 h-4 mr-1" />
                        Show details
                      </>
                    )}
                  </button>
                  
                  <AnimatePresence>
                    {showDetails && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 border-t border-gray-700 pt-3 space-y-2 text-xs text-gray-400">
                          <div>
                            <span className="font-medium text-gray-300">Essential Cookies:</span> These are necessary for the website to function properly.
                          </div>
                          <div>
                            <span className="font-medium text-gray-300">Analytics Cookies:</span> Help us understand how you interact with our site.
                          </div>
                          <div>
                            <span className="font-medium text-gray-300">Session Cookies:</span> Store temporary information during your browser session.
                          </div>
                          <div>
                            <span className="font-medium text-gray-300">Preference Cookies:</span> Remember your settings and preferences.
                          </div>
                          <p className="pt-1">
                            For more information, please visit our <a href="/privacy" className="text-blue-400 hover:underline">Privacy Policy</a>.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={acceptCookies}
                    className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-md text-white text-sm font-medium transition-all hover:shadow-lg hover:shadow-blue-500/30"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={declineCookies}
                    className="px-4 py-2 bg-gray-700 rounded-md text-white text-sm font-medium hover:bg-gray-600"
                  >
                    Decline
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowConsent(false)}
                className="text-gray-400 hover:text-white"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}