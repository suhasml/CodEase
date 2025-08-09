import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import TokenizationForm from './TokenizationForm';

interface TokenizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  extensionId: string;
  onSuccess?: () => void;
}

const TokenizationModal: React.FC<TokenizationModalProps> = ({ 
  isOpen, 
  onClose, 
  extensionId, 
  onSuccess 
}) => {
  const handleSuccess = () => {
    if (onSuccess) onSuccess();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center overflow-y-auto z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onClose();
            }
          }}
          style={{ 
            position: 'fixed',
            zIndex: 999999,
            isolation: 'isolate',
            transform: 'translateZ(0)'
          }}
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-gray-900 border border-gray-700 rounded-xl w-full h-full relative overflow-hidden pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div 
                className="absolute -top-[200px] -left-[100px] w-[400px] h-[400px] bg-[radial-gradient(ellipse_at_center,hsla(217,100%,50%,0.15)_0%,transparent_70%)]" 
                style={{animation: 'aurora-x 25s ease-in-out infinite'}} 
              />
              <div 
                className="absolute -top-[100px] -right-[100px] w-[350px] h-[350px] bg-[radial-gradient(ellipse_at_center,hsla(265,89%,60%,0.15)_0%,transparent_70%)]" 
                style={{animation: 'aurora-y 20s ease-in-out infinite'}} 
              />
              <div 
                className="absolute -bottom-[100px] -left-[50px] w-[300px] h-[300px] bg-[radial-gradient(ellipse_at_center,hsla(190,95%,50%,0.1)_0%,transparent_70%)]" 
                style={{animation: 'aurora-pulse 30s ease infinite'}} 
              />
            </div>
            
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all duration-200 group"
              aria-label="Close modal"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-200" />
            </button>
            
            {/* Modal content with scrollable area */}
            <div className="relative z-10 overflow-y-auto max-h-[90vh] p-6">
              <TokenizationForm 
                extensionId={extensionId}
                onSuccess={handleSuccess}
                onCancel={onClose}
              />
            </div>
          </motion.div>
          
          {/* Custom animations styles */}
          <style jsx>{`
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
      )}
    </AnimatePresence>
  );
};

export default TokenizationModal; 