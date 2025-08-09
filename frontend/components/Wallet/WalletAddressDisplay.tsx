'use client'

import { useState } from 'react';
import { Copy, CheckCircle, Eye, EyeOff } from 'lucide-react';

interface WalletAddressDisplayProps {
  address: string;
  copyable?: boolean;
}

export default function WalletAddressDisplay({ 
  address, 
  copyable = true 
}: WalletAddressDisplayProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  if (!address) {
    return <p className="text-xs font-mono text-gray-400">No wallet connected</p>;
  }

  // Truncate wallet address (show 6 characters at start and 4 at end)
  const truncateAddress = (addr: string) => {
    if (addr.length <= 14) return addr;
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleCopy = async () => {
    if (!address) return;
    await navigator.clipboard.writeText(address);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="relative">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <p className="text-xs font-mono text-gray-300 truncate">
          {isExpanded ? address : truncateAddress(address)}
        </p>
        <div className="flex">
          {copyable && (
            <button 
              onClick={(e) => {
                e.stopPropagation(); 
                handleCopy();
              }}
              className="ml-2 p-1 hover:bg-gray-800 rounded-md transition-colors"
              title="Copy address"
            >
              {isCopied ? (
                <CheckCircle className="w-3.5 h-3.5 text-green-500" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-gray-400 hover:text-gray-300" />
              )}
            </button>
          )}
          <button 
            className="ml-1 p-1 hover:bg-gray-800 rounded-md transition-colors"
            title={isExpanded ? "Show less" : "Show full address"}
          >
            {isExpanded ? (
              <EyeOff className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <Eye className="w-3.5 h-3.5 text-gray-400" />
            )}
          </button>
        </div>
      </div>
      {isExpanded && (
        <div className="mt-1 text-xs text-gray-400">
          <span className="text-gray-500">Click to collapse</span>
        </div>
      )}
    </div>
  );
}
