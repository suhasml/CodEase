'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

type TradeDirection = 'buy' | 'sell';

interface TradeModalProps {
  open: boolean;
  tokenSymbol?: string;
  connectedWallet: string;
  tradeDirection: TradeDirection;
  tradeAmount: string;
  estimatedPrice: string;
  tradeLoading: boolean;
  tradeError: string;
  needsAssociation?: boolean;
  tokenId?: string;
  marketRateText?: string; // e.g., `Rate: 1 XYZ = 0.123456 HBAR`
  onClose: () => void;
  onSwitchWallet?: () => void;
  onChangeDirection: (dir: TradeDirection) => void;
  onChangeAmount: (value: string) => void;
  onSubmit: () => void;
}

export default function TradeModal({
  open,
  tokenSymbol,
  connectedWallet,
  tradeDirection,
  tradeAmount,
  estimatedPrice,
  tradeLoading,
  tradeError,
  needsAssociation,
  tokenId,
  marketRateText,
  onClose,
  onSwitchWallet,
  onChangeDirection,
  onChangeAmount,
  onSubmit,
}: TradeModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Trade {tokenSymbol}</h3>
          <div className="flex items-center gap-2">
            {connectedWallet && onSwitchWallet && (
              <button
                onClick={onSwitchWallet}
                className="text-xs px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700"
              >
                Switch wallet
              </button>
            )}
            <span className="text-[10px] px-2 py-0.5 rounded bg-gray-700/40 text-gray-300 border border-gray-600/50">
              Connect HashPack (coming soon)
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Trading Mode Selector */}
          <div className="flex gap-2 p-1 bg-gray-800 rounded-lg">
            <button
              onClick={() => onChangeDirection('buy')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tradeDirection === 'buy' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Buy Tokens
            </button>
            <button
              onClick={() => onChangeDirection('sell')}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tradeDirection === 'sell' ? 'bg-red-600 text-white' : 'text-gray-400 hover:text-white'
              }`}
            >
              Sell Tokens
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              {tradeDirection === 'buy' ? 'HBAR Amount to Spend' : `${tokenSymbol} Amount to Sell`}
            </label>
            <div className="relative">
              <input
                type="number"
                value={tradeAmount}
                onChange={(e) => onChangeAmount(e.target.value)}
                placeholder={tradeDirection === 'buy' ? 'Enter HBAR amount' : 'Enter token amount'}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              />
              <span className="absolute right-3 top-3 text-gray-400 text-sm">
                {tradeDirection === 'buy' ? 'HBAR' : tokenSymbol}
              </span>
            </div>
          </div>

          {/* Price Estimation */}
          {tradeAmount && parseFloat(tradeAmount) > 0 && (
            <div className="p-4 bg-gray-800/50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">
                  {tradeDirection === 'buy' ? 'You will receive:' : 'You will get:'}
                </span>
                <span className="text-white font-semibold">
                  {estimatedPrice} {tradeDirection === 'buy' ? tokenSymbol : 'HBAR'}
                </span>
              </div>
              {marketRateText && (
                <div className="text-xs text-blue-400 mt-1">{marketRateText}</div>
              )}
            </div>
          )}

          {/* Info copy */}
          <div className="p-3 bg-blue-900/20 border border-blue-800/30 rounded-lg text-xs text-gray-300">
            Powered by our custom AMM router and bonding curve.
          </div>

          {/* Errors */}
          {tradeError && (
            <div className="p-3 rounded-lg border border-red-800/40 bg-red-900/20">
              <div className="text-xs text-red-400">{tradeError}</div>
              {needsAssociation && connectedWallet && tokenId && (
                <div className="space-y-2 text-xs text-gray-300 mt-2">
                  <div className="text-yellow-400">Your account isn’t associated with this token.</div>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>
                      Open HashPack Web: <a href="https://wallet.hashpack.app/" target="_blank" rel="noopener noreferrer" className="text-blue-400 underline">wallet.hashpack.app</a>
                    </li>
                    <li>Login or create an account if you haven’t already</li>
                    <li>Click "Add Token"</li>
                    <li className="flex items-center gap-2">
                      Paste this Token ID and associate:
                      <span className="font-mono text-white">{tokenId}</span>
                    </li>
                    <li>Return here and complete your buy</li>
                  </ol>
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button onClick={onClose} className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors">
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={!tradeAmount || parseFloat(tradeAmount) <= 0 || tradeLoading}
              className={`flex-1 px-4 py-3 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                tradeDirection === 'buy' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {tradeLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {connectedWallet ? 'Executing Trade...' : 'Connecting Wallet...'}
                </>
              ) : (
                <>
                  {tradeDirection === 'buy' ? '🛒' : '💰'}
                  {connectedWallet ? `${tradeDirection === 'buy' ? 'Buy' : 'Sell'} ${tradeDirection === 'buy' ? 'Tokens' : tokenSymbol}` : 'Connect Wallet to Trade'}
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


