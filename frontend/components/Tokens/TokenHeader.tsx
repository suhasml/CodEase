'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Coins, Globe, MessageSquare, Menu, X } from 'lucide-react';

interface TokenHeaderProps {
  tokenName: string;
  tokenSymbol: string;
  status: string;
  logoUrl?: string | null;
  onBuyClick: () => void;
  isLoggedIn: boolean;
  connectedWallet: string;
  userBalance: number;
  tokenDisplaySymbol: string;
  onDisconnect: () => void;
  onOpenWallet: () => void;
}

export default function TokenHeader({
  tokenName,
  tokenSymbol,
  status,
  logoUrl,
  onBuyClick,
  isLoggedIn,
  connectedWallet,
  userBalance,
  tokenDisplaySymbol,
  onDisconnect,
  onOpenWallet,
}: TokenHeaderProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const tokenPath = `/token/${encodeURIComponent(tokenName)}`;
  
  const truncate = (addr: string) => {
    if (!addr) return '';
    if (addr.length <= 14) return addr;
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <div className="bg-gray-900/50 border-b border-gray-800 relative">
      <div className="max-w-full px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Token Info */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-blue-500/20 flex items-center justify-center overflow-hidden ring-1 ring-white/10">
              {logoUrl ? (
                <img src={logoUrl} alt={tokenName} className="w-full h-full object-cover rounded-full" />
              ) : (
                <Coins className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-white truncate">{tokenName}</h1>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 font-mono text-sm truncate">{tokenSymbol}</span>
                <span
                  className={`px-2 py-1 rounded text-xs font-medium ${
                    status === 'success' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}
                >
                  {status === 'success' ? 'live' : status}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons and Wallet - Always on the right */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Desktop Navigation */}
            <div className="hidden lg:flex gap-2">
              <Link href="/chat" className="flex items-center gap-2 px-4 py-2 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-500/30 rounded-xl transition-all backdrop-blur-sm text-sm">
                <MessageSquare className="w-4 h-4" />
                Back to Chat
              </Link>
              <Link href="/tokens/all" className="flex items-center gap-2 px-4 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 border border-emerald-500/30 rounded-xl transition-all backdrop-blur-sm text-sm">
                <Globe className="w-4 h-4" />
                See All Tokens
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="lg:hidden flex items-center justify-center p-2 bg-gray-800/50 hover:bg-gray-800/70 text-gray-300 border border-gray-700/50 rounded-xl transition-colors"
              aria-label="Toggle menu"
            >
              {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            {/* Buy/Sell Button */}
            <button
              onClick={onBuyClick}
              disabled={!isLoggedIn}
              className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition-all font-semibold shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              <span className="hidden sm:inline">Buy/Sell Tokens</span>
              <span className="sm:hidden">Trade</span>
            </button>

            {/* Unified Wallet / Auth Component */}
            <div className="flex items-center">
              {connectedWallet ? (
                <div className="flex items-center gap-1 sm:gap-2 px-3 py-2 rounded-xl bg-gray-800/70 border border-gray-700/50 backdrop-blur-sm">
                  {/* Wallet Address and Balance - Unified Display */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-400">Wallet:</span>
                      <span className="font-mono text-white">{truncate(connectedWallet)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-gray-400">Balance:</span>
                      <span className="text-emerald-300 font-semibold">
                        {userBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })} {tokenDisplaySymbol}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={onDisconnect}
                    className="ml-2 px-2 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-600/30 text-xs transition-colors"
                    aria-label="Disconnect wallet"
                  >
                    ×
                  </button>
                </div>
              ) : (
                isLoggedIn ? (
                  <button 
                    onClick={onOpenWallet} 
                    className="px-4 py-2 rounded-xl bg-blue-500/20 hover:bg-blue-500/30 text-blue-200 border border-blue-500/30 text-sm backdrop-blur-sm transition-colors"
                  >
                    <span className="hidden sm:inline">Connect Wallet</span>
                    <span className="sm:hidden">Connect</span>
                  </button>
                ) : (
                  <Link
                    href={{ pathname: '/signin', query: { redirect: tokenPath } }}
                    className="px-3 py-1.5 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white text-sm transition-colors"
                  >
                    Sign in
                  </Link>
                )
              )}
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown - Positioned relative to menu button */}
        {showMobileMenu && (
          <div className="lg:hidden absolute top-full right-4 mt-2 w-48 z-50">
            <div className="p-3 bg-gray-800/95 border border-gray-700/50 rounded-xl backdrop-blur-sm shadow-xl">
              <div className="flex flex-col gap-2">
                <Link 
                  href="/chat" 
                  className="flex items-center gap-2 px-3 py-2 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 border border-cyan-500/30 rounded-lg transition-all text-sm"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <MessageSquare className="w-4 h-4" />
                  Back to Chat
                </Link>
                <Link 
                  href="/tokens/all" 
                  className="flex items-center gap-2 px-3 py-2 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 border border-emerald-500/30 rounded-lg transition-all text-sm"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <Globe className="w-4 h-4" />
                  See All Tokens
                </Link>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
  );
}


