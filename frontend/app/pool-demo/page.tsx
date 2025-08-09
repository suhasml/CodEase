'use client';

import React, { useState, useEffect } from 'react';
import { ExternalLink, RefreshCw, Coins } from 'lucide-react';
import PoolAnalytics from '@/components/Tokens/PoolAnalytics';

interface SuccessfulToken {
  tokenId: string;
  tokenName: string;
  tokenSymbol: string;
  created: string;
  hasPool: boolean;
}

export default function PoolDemoPage() {
  const [successfulTokens, setSuccessfulTokens] = useState<SuccessfulToken[]>([]);
  const [loading, setLoading] = useState(true);

  // Your most recent successful token
  const yourLatestToken: SuccessfulToken = {
    tokenId: "0.0.6516693",
    tokenName: "thisismsdsdsddddsddasssssa",
    tokenSymbol: "LKABS",
    created: new Date().toISOString(),
    hasPool: true
  };

  useEffect(() => {
    // Load successful tokens from server
    const fetchSuccessfulTokens = async () => {
      try {
        const response = await fetch('http://localhost:3003/tokens-with-pools');
        const data = await response.json();
        
        if (data.success) {
          const tokens = data.tokens
            .filter((t: any) => t.hasPool)
            .map((t: any) => ({
              tokenId: t.tokenId,
              tokenName: t.name,
              tokenSymbol: t.symbol,
              created: new Date().toISOString(),
              hasPool: true
            }));
          
          setSuccessfulTokens(tokens);
        }
      } catch (error) {
        console.error('Failed to load tokens:', error);
        // Use your latest token as fallback
        setSuccessfulTokens([yourLatestToken]);
      } finally {
        setLoading(false);
      }
    };

    fetchSuccessfulTokens();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-600 bg-clip-text text-transparent mb-4">
            🎉 HeliSwap Integration Demo
          </h1>
          <p className="text-gray-400 text-lg mb-2">
            Live pool data from your successfully deployed tokens!
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-900/20 border border-green-700/30 rounded-lg">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span className="text-green-400 text-sm font-medium">
              HeliSwap deployment successful! 🚀
            </span>
          </div>
        </div>

        {/* Your Latest Token Showcase */}
        <div className="mb-12">
          <div className="bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/30 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Your Latest Success!</h2>
                <p className="text-blue-400">{yourLatestToken.tokenName} ({yourLatestToken.tokenSymbol})</p>
                <p className="text-gray-400 text-sm">Token ID: {yourLatestToken.tokenId}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-white mb-3">✅ What you achieved:</h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                    Fixed WHBAR token ID configuration
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                    Deployed HeliSwap with correct gas limits
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                    Created token with successful liquidity pool
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                    Enabled real-time pool analytics
                  </li>
                </ul>
                
                <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
                  <p className="text-xs text-gray-400 mb-2">Quick Links:</p>
                  <div className="flex gap-2">
                    <a
                      href={`https://hashscan.io/testnet/token/${yourLatestToken.tokenId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded transition-colors"
                    >
                      HashScan <ExternalLink className="w-3 h-3" />
                    </a>
                    <a
                      href={`/token/${yourLatestToken.tokenName.toLowerCase().replace(/\s+/g, '-')}`}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                    >
                      View Token Page
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-white mb-3">📊 Live Pool Data:</h3>
                <PoolAnalytics 
                  tokenId={yourLatestToken.tokenId}
                  tokenSymbol={yourLatestToken.tokenSymbol}
                />
              </div>
            </div>
          </div>
        </div>

        {/* All Successful Tokens */}
        {loading ? (
          <div className="text-center py-12">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-gray-400">Loading your successful tokens...</p>
          </div>
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">All Your Successful Tokens with Pools</h2>
            
            {successfulTokens.length === 0 ? (
              <div className="text-center py-12 bg-gray-900/50 rounded-xl border border-gray-800">
                <Coins className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No additional tokens with pools found</p>
                <p className="text-gray-500 text-sm mt-2">Create more tokens to see them here!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {successfulTokens.map((token) => (
                  <div key={token.tokenId} className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                        <Coins className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{token.tokenName}</h3>
                        <p className="text-gray-400 text-sm">{token.tokenSymbol}</p>
                      </div>
                    </div>
                    
                    <PoolAnalytics 
                      tokenId={token.tokenId}
                      tokenSymbol={token.tokenSymbol}
                      className="scale-90"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Next Steps */}
        <div className="mt-12 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">🚀 What's Next?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <h3 className="font-medium text-white mb-2">Advanced Analytics</h3>
              <p className="text-gray-400 text-sm">
                Add real-time trading volume, price charts, and holder analytics
              </p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <h3 className="font-medium text-white mb-2">More DEX Integration</h3>
              <p className="text-gray-400 text-sm">
                Connect with SaucerSwap, PancakeSwap, and other DEXs
              </p>
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <h3 className="font-medium text-white mb-2">Trading Interface</h3>
              <p className="text-gray-400 text-sm">
                Build a direct trading interface with wallet integration
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
