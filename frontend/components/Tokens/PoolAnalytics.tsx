'use client';

import React, { useState, useEffect } from 'react';
import { 
  Droplets, 
  ExternalLink, 
  TrendingUp, 
  BarChart3, 
  DollarSign,
  Users,
  Activity,
  RefreshCw
} from 'lucide-react';

interface PoolData {
  success: boolean;
  tokenId: string;
  tokenAddress: string;
  pairAddress: string;
  reserves: {
    tokenReserve: string;
    whbarReserve: string;
    totalSupply: string;
  };
  pricing: {
    currentPrice: string;
    priceInUsd: string;
    marketCap: string;
    liquidity: string;
  };
  poolInfo: {
    token0: string;
    token1: string;
    isToken0: boolean;
    factory: string;
    router: string;
    tradingUrl: string;
  };
  trading?: {
    volume24h: number;
    trades24h: number;
    holders: number;
    priceChange24h: number;
  };
}

interface PoolAnalyticsProps {
  tokenId: string;
  tokenSymbol: string;
  className?: string;
}

export default function PoolAnalytics({ tokenId, tokenSymbol, className }: PoolAnalyticsProps) {
  const [poolData, setPoolData] = useState<PoolData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPoolData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Convert Hedera token ID to EVM address
      const tokenNum = parseInt(tokenId.split('.')[2]);
      const tokenAddress = `0x${tokenNum.toString(16).padStart(40, '0')}`;

      console.log('Fetching pool analytics for:', tokenId, 'address:', tokenAddress);

      // Fetch HeliSwap pool data
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HEDERA_API_URL || 'http://localhost:3003'}/token-analytics/${tokenAddress}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setPoolData(data);
        console.log('✅ Pool data loaded:', data);
      } else {
        setError(data.message || 'No pool data available');
      }
    } catch (err) {
      console.error('❌ Error fetching pool data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load pool data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPoolData(); // initial load
    const interval = setInterval(fetchPoolData, 10 * 60 * 1000); // refresh every 10 minutes
    return () => clearInterval(interval);
  }, [tokenId]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className={`bg-gray-900/50 border border-gray-800 rounded-xl p-6 ${className}`}>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin">
            <RefreshCw className="w-6 h-6 text-blue-400" />
          </div>
          <span className="ml-2 text-gray-400">Loading pool data...</span>
        </div>
      </div>
    );
  }

  if (error || !poolData) {
    return (
      <div className={`bg-gray-900/50 border border-gray-800 rounded-xl p-6 ${className}`}>
        <div className="text-center">
          <BarChart3 className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-gray-400 text-sm">
            {error || 'No HeliSwap pool found'}
          </p>
          <button
            onClick={fetchPoolData}
            className="mt-2 px-3 py-1 text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Pool Overview */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Droplets className="w-5 h-5 text-blue-400" />
            HeliSwap Pool
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400"></div>
            <span className="text-green-400 text-sm">Active</span>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-lg font-bold text-white">
              {parseFloat(poolData.pricing.currentPrice).toFixed(6)} HBAR
            </div>
            <div className="text-sm text-gray-400">Current Price</div>
            {poolData.trading?.priceChange24h !== undefined && (
              <div className={`text-xs flex items-center gap-1 mt-1 ${
                poolData.trading.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                <TrendingUp className="w-3 h-3" />
                {Math.abs(poolData.trading.priceChange24h).toFixed(2)}% (24h)
              </div>
            )}
          </div>

          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="text-lg font-bold text-white">
              {parseFloat(poolData.pricing.liquidity).toFixed(2)} HBAR
            </div>
            <div className="text-sm text-gray-400">Total Liquidity</div>
            <div className="text-xs text-gray-500 mt-1">
              ${poolData.pricing.marketCap}
            </div>
          </div>
        </div>

        {/* Trading Stats */}
        {poolData.trading && (
          <div className="grid grid-cols-3 gap-3 mb-4">
            <div className="bg-gray-800/30 rounded-lg p-2 text-center">
              <div className="text-sm font-semibold text-white">
                {formatNumber(poolData.trading.volume24h)}
              </div>
              <div className="text-xs text-gray-400">24h Volume</div>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-2 text-center">
              <div className="text-sm font-semibold text-white">
                {poolData.trading.trades24h}
              </div>
              <div className="text-xs text-gray-400">24h Trades</div>
            </div>
            <div className="bg-gray-800/30 rounded-lg p-2 text-center">
              <div className="text-sm font-semibold text-white">
                {poolData.trading.holders}
              </div>
              <div className="text-xs text-gray-400">Holders</div>
            </div>
          </div>
        )}

        {/* Pool Reserves */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gray-800/30 rounded-lg p-3">
            <div className="text-sm font-medium text-white">
              {formatNumber(parseFloat(poolData.reserves.tokenReserve))}
            </div>
            <div className="text-xs text-gray-400">{tokenSymbol} Reserve</div>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-3">
            <div className="text-sm font-medium text-white">
              {parseFloat(poolData.reserves.whbarReserve).toFixed(2)}
            </div>
            <div className="text-xs text-gray-400">HBAR Reserve</div>
          </div>
        </div>

        {/* Action Button */}
        <a
          href={poolData.poolInfo.tradingUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          Trade on HeliSwap
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Pool Details */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
        <h4 className="text-sm font-medium text-white mb-3">Pool Details</h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-gray-400">Pair Address:</span>
            <span className="text-white font-mono truncate ml-2" title={poolData.pairAddress}>
              {poolData.pairAddress.slice(0, 6)}...{poolData.pairAddress.slice(-4)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">LP Tokens:</span>
            <span className="text-white">{formatNumber(parseFloat(poolData.reserves.totalSupply))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Trading Fee:</span>
            <span className="text-white">0.3%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
