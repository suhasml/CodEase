import { useState, useEffect } from 'react';
import { X, Gift, Star, Sparkles, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WelcomeModal({ isOpen, onClose }: WelcomeModalProps) {
  const router = useRouter();

  // Prevent scrolling when the modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    
    // Clean up function to restore scrolling when the modal closes
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Auto-close after a certain time (optional)
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        onClose();
      }, 15000); // Auto close after 15 seconds
      
      return () => clearTimeout(timer);
    }
  }, [isOpen, onClose]);

  // Handler for closing the modal
  const handleClose = () => {
    // console.log("Close button clicked");
    onClose();
  };

  // Handler for navigating to pricing page
  const handlePricingClick = () => {
    // console.log("Pricing link clicked");
    onClose();
    // Use a setTimeout to ensure the modal is closed before navigating
    setTimeout(() => {
      router.push('/pricing');
    }, 100);
  };

  // Don't render anything if not open
  if (!isOpen) return null;

  return (
    // Portal container that attaches directly to document body
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      onClick={(e) => {
        // Close the modal when clicking the backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      // Improved stacking context and highest z-index
      style={{ 
        position: 'fixed',
        zIndex: 999999, // Super high z-index
        isolation: 'isolate',
        transform: 'translateZ(0)'
      }}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-md shadow-2xl relative overflow-hidden pointer-events-auto"
        onClick={(e) => e.stopPropagation()} // Prevent clicks from bubbling to the backdrop
      >
        {/* Animated background elements - make them ignore pointer events */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[200px] -left-[100px] w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,hsla(217,100%,50%,0.15)_0%,transparent_70%)]" style={{animation: 'aurora-x 25s ease-in-out infinite'}} />
          <div className="absolute -top-[100px] -right-[100px] w-[350px] h-[350px] bg-[radial-gradient(ellipse_at_center,hsla(265,89%,60%,0.15)_0%,transparent_70%)]" style={{animation: 'aurora-y 20s ease-in-out infinite'}} />
          <div className="absolute -bottom-[100px] -left-[50px] w-[300px] h-[300px] bg-[radial-gradient(ellipse_at_center,hsla(190,95%,50%,0.1)_0%,transparent_70%)]" style={{animation: 'aurora-pulse 30s ease infinite'}} />
        </div>
        
        {/* Close button */}
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 z-10 pointer-events-auto"
          aria-label="Close modal"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
        
        {/* Content */}
        <div className="p-6 pt-10 relative z-20">
          {/* Gift icon with animation */}
          <div className="flex justify-center mb-6 pointer-events-none">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/30 animate-pulse">
                <Gift className="w-10 h-10 text-white" />
              </div>
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  delay: 0.5, 
                  type: 'spring',
                  stiffness: 300,
                  damping: 15
                }}
                className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-yellow-500 flex items-center justify-center shadow-lg"
              >
                <span className="text-gray-900 font-bold text-sm">1</span>
              </motion.div>
            </div>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 pointer-events-none">
            Welcome to CodEase!
          </h2>
          
          <p className="text-gray-300 text-center mb-6 pointer-events-none">
            Thanks for joining! We've added your welcome bonus:
          </p>
          
          {/* Credits information */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-xl p-5 mb-6 border border-blue-700/30 pointer-events-none"
          >
            <div className="flex items-center mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-600/30 border border-blue-500/50 flex items-center justify-center mr-4">
                <Star className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">1 Free Credit</h3>
                <p className="text-gray-400 text-sm">Create your first extension</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-purple-600/30 border border-purple-500/50 flex items-center justify-center mr-4">
                <MessageSquare className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">2 Follow-ups</h3>
                <p className="text-gray-400 text-sm">Perfect your extension with follow-up messages</p>
              </div>
            </div>
          </motion.div>
          
          {/* CTA button - ensure it's clickable with pointer-events-auto */}
          <div className="relative z-30 pointer-events-auto">
            <motion.button
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              onClick={handleClose}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium flex items-center justify-center space-x-2 transition-all duration-300 shadow-xl shadow-blue-600/20 cursor-pointer pointer-events-auto"
            >
              <span>Let's Get Started</span>
              <Sparkles className="w-5 h-5" />
            </motion.button>
          </div>
          
          {/* Pricing link container - ensure it's clickable */}
          <div className="text-gray-500 text-xs text-center mt-4 relative z-30 pointer-events-auto">
            Need more? Check out our{' '}
            <button 
              onClick={handlePricingClick}
              className="text-blue-400 hover:underline hover:text-blue-300 transition-all cursor-pointer relative z-30 pointer-events-auto"
            >
              pricing plans
            </button>{' '}
            for additional credits.
          </div>
        </div>
      </motion.div>
      
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
      `}</style>
    </div>
  );
}