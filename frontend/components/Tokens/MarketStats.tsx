'use client';

import React from 'react';
import { ArrowDownRight, ArrowUpRight, BarChart3, Droplets, ExternalLink, LineChart, Target, Volume2 } from 'lucide-react';

interface HeliswapData {
  pricing: {
    currentPrice: string;
    priceInUsd: string;
    marketCap: string;
    liquidity: string;
  };
  reserves: {
    tokenReserve: string;
    whbarReserve: string;
    totalSupply: string;
  };
  poolInfo: {
    tradingUrl: string;
  };
  charts?: {
    priceHistory: Array<{ timestamp: number; price: number; volume: number }>
  };
  tokenInfo?: { address: string };
}

interface CustomAmmData {
  status: { isGraduated: boolean; tradingActive: boolean };
  priceInfo?: { currentPrice: string; priceFor1000Tokens: string };
  reserves: { tokenReserve: string; hbarReserve: string };
  poolInfo: { startPrice: string; slope: string; sold: string; creatorFeeAcc: string; creatorFeeBps: string };
}

interface MarketStatsProps {
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  liquidity: number;
  holders: number;
  totalTrades: number;
  heliswap?: HeliswapData | null;
  customAmm?: CustomAmmData | null;
  formatNumber: (num: number) => string;
  tokenId: string;
  tokenSymbol: string;
}

export default function MarketStats({
  price,
  priceChange24h,
  marketCap,
  volume24h,
  liquidity,
  holders,
  totalTrades,
  heliswap,
  customAmm,
  formatNumber,
  tokenId,
  tokenSymbol,
}: MarketStatsProps) {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
      {/* Left Sidebar - Market Stats */}
      <div className="xl:col-span-1">
        <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            Market Stats
          </h2>

          <div className="space-y-4">
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="text-xl font-bold text-white">${price.toFixed(4)}</div>
              <div className="text-sm text-gray-400">Current Price</div>
              <div className={`text-sm flex items-center gap-1 mt-1 ${priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {priceChange24h >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(priceChange24h)}% (24h)
              </div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="text-xl font-bold text-white">${formatNumber(marketCap)}</div>
              <div className="text-sm text-gray-400">Market Cap</div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="text-xl font-bold text-white">${formatNumber(volume24h)}</div>
              <div className="text-sm text-gray-400">24h Volume</div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="text-xl font-bold text-white">${formatNumber(liquidity)}</div>
              <div className="text-sm text-gray-400">Liquidity</div>
            </div>

            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="text-xl font-bold text-white">{formatNumber(holders)}</div>
              <div className="text-sm text-gray-400">Holders</div>
            </div>
          </div>
        </div>

        {/* HeliSwap DEX Info */}
        {heliswap && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mt-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-400" />
              HeliSwap DEX Pool
            </h3>

            <div className="space-y-4">
              {/* Pool Status */}
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Pool Status</span>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400"></div>
                    <span className="text-white">Active</span>
                  </div>
                </div>
              </div>

              {/* Current Price */}
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="text-xl font-bold text-white">{parseFloat(heliswap.pricing.currentPrice).toFixed(6)} HBAR</div>
                <div className="text-sm text-gray-400">Price per Token</div>
                <div className="text-sm text-gray-500 mt-1">${heliswap.pricing.priceInUsd} USD</div>
              </div>

              {/* Pool Reserves */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-lg font-bold text-white">{formatNumber(parseFloat(heliswap.reserves.tokenReserve))}</div>
                  <div className="text-sm text-gray-400">Token Reserve</div>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-lg font-bold text-white">{parseFloat(heliswap.reserves.whbarReserve).toFixed(2)} HBAR</div>
                  <div className="text-sm text-gray-400">HBAR Reserve</div>
                </div>
              </div>

              {/* HeliSwap Pool Info */}
              <div className="p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-blue-400">View on HeliSwap</div>
                    <div className="text-xs text-gray-400">Uniswap V2 compatible DEX</div>
                  </div>
                  <a
                    href={heliswap.poolInfo.tradingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    Trade Now
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Custom AMM / Bonding Curve Info */}
        {customAmm && (
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mt-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-orange-400" />
              Bonding Curve AMM
            </h3>

            <div className="space-y-4">
              {/* Status */}
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Status</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${customAmm.status.tradingActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <span className="text-white">
                      {customAmm.status.isGraduated ? 'Graduated' : customAmm.status.tradingActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Price */}
              {customAmm.priceInfo && (
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-xl font-bold text-white">{customAmm.priceInfo.currentPrice} HBAR</div>
                  <div className="text-sm text-gray-400">Price per Token</div>
                  <div className="text-sm text-gray-500 mt-1">1000 tokens = {customAmm.priceInfo.priceFor1000Tokens} HBAR</div>
                </div>
              )}

              {/* Pool Reserves */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-lg font-bold text-white">{formatNumber(parseFloat(customAmm.reserves.tokenReserve || '0'))}</div>
                  <div className="text-sm text-gray-400">Token Reserve</div>
                </div>
                <div className="p-4 bg-gray-800/50 rounded-lg">
                  <div className="text-lg font-bold text-white">{parseFloat(customAmm.reserves.hbarReserve || '0').toFixed(2)} HBAR</div>
                  <div className="text-sm text-gray-400">HBAR Reserve</div>
                </div>
              </div>

              {/* Bonding Curve Parameters */}
              <div className="p-4 bg-gray-800/50 rounded-lg">
                <div className="text-sm font-medium text-white mb-2">Bonding Curve Details</div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-400">Start Price:</span>
                    <span className="text-white ml-2">{parseFloat(customAmm.poolInfo.startPrice || '0') / 1e18} HBAR</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Price Slope:</span>
                    <span className="text-white ml-2">{parseFloat(customAmm.poolInfo.slope || '0') / 1e18} HBAR</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Tokens Sold:</span>
                    <span className="text-white ml-2">{formatNumber(parseFloat(customAmm.poolInfo.sold || '0'))}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Total Fee:</span>
                    <span className="text-white ml-2">{parseFloat(customAmm.poolInfo.creatorFeeBps || '0') / 100}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Right Content Placeholder for charts & details - left to parent */}
      <div className="xl:col-span-3">
        {/* Parent should render charts and token details here */}
      </div>
    </div>
  );
}


