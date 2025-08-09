'use client';

import React from 'react';
import { X } from 'lucide-react';

interface AlertBannerProps {
  type: 'error' | 'warning' | 'info' | 'success';
  message: string;
  description?: string;
  onClose: () => void;
}

const AlertBanner: React.FC<AlertBannerProps> = ({
  type,
  message,
  description,
  onClose
}) => {
  const getBannerStyles = () => {
    switch (type) {
      case 'error':
        return {
          container: 'from-red-900/40 to-red-600/20 border-red-500/30 shadow-red-500/5',
          dot: 'bg-red-400',
          title: 'text-red-300',
          description: 'text-red-200/80',
          note: 'text-gray-400'
        };
      case 'warning':
        return {
          container: 'from-yellow-900/30 to-yellow-600/10 border-yellow-500/30 shadow-yellow-500/5',
          dot: 'bg-yellow-400',
          title: 'text-yellow-300',
          description: 'text-yellow-200/80',
          note: 'text-gray-400'
        };
      case 'success':
        return {
          container: 'from-green-900/30 to-green-600/10 border-green-500/30 shadow-green-500/5',
          dot: 'bg-green-400',
          title: 'text-green-300',
          description: 'text-green-200/80',
          note: 'text-gray-400'
        };
      case 'info':
      default:
        return {
          container: 'from-blue-900/30 to-blue-600/10 border-blue-500/30 shadow-blue-500/5',
          dot: 'bg-blue-400',
          title: 'text-blue-300',
          description: 'text-blue-200/80',
          note: 'text-gray-400'
        };
    }
  };

  const styles = getBannerStyles();

  return (
    <div className="max-w-3xl mx-auto mt-3 px-4 mb-3">
      <div className={`flex items-start justify-between px-4 py-3 bg-gradient-to-r ${styles.container} border rounded-lg shadow-lg`}>
        <div className="flex items-start">
          <div className={`w-2 h-2 rounded-full ${styles.dot} animate-pulse mr-2.5 mt-1.5`}></div>
          <div>
            <span className={`font-medium ${styles.title}`}>{message}</span>
            {description && (
              <p className={`text-sm mt-1 ${styles.description}`}>{description}</p>
            )}
            {type === 'error' && message.includes('framework') && (
              <p className="text-xs mt-2 italic text-gray-400">
                Support for React, Vue and other frameworks is coming soon. Currently, we only support vanilla JavaScript extensions.
              </p>
            )}
          </div>
        </div>
        <button 
          onClick={onClose} 
          className={`${styles.title} hover:text-white mt-1`}
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default AlertBanner;