'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface WalletModalProps {
  open: boolean;
  tokenSymbol?: string;
  connectedWallet: string;
  connectedEvm: string;
  onClose: () => void;
  onDisconnect: () => void;
  onChangeAccountId: (value: string) => void;
  onChangeEvm: (value: string) => void;
  onConnect: (walletAddress: string) => void;
}

export default function WalletModal({
  open,
  tokenSymbol,
  connectedWallet,
  connectedEvm,
  onClose,
  onDisconnect,
  onChangeAccountId,
  onChangeEvm,
  onConnect,
}: WalletModalProps) {
  if (!open) return null;

  const canConnect = Boolean(connectedWallet && connectedEvm);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-gray-900 border border-gray-800 rounded-xl p-6 w-full max-w-md"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Connect Wallet</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-4">
          {/* Current Wallet Status */}
          {connectedWallet && connectedEvm ? (
            <div className="p-4 bg-green-900/20 border border-green-800/30 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-green-400 font-medium">✅ Wallet Connected</div>
                  <div className="text-white font-mono text-sm mt-1">{connectedWallet}</div>
                </div>
                <button
                  onClick={onDisconnect}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded font-medium transition-colors"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-300 text-sm">
              Connect your Hedera wallet to trade {tokenSymbol} tokens
            </p>
          )}

          {/* Manual Address Inputs */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hedera Account ID (0.0.x)
              </label>
              <input
                type="text"
                placeholder="0.0.123456"
                value={connectedWallet || ''}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                onChange={(e) => onChangeAccountId(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                EVM Address (0x...)
              </label>
              <input
                type="text"
                placeholder="0x..."
                value={connectedEvm || ''}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 font-mono"
                onChange={(e) => onChangeEvm(e.target.value)}
              />
            </div>
          </div>

          {/* Connection Options */}
          <div className="space-y-3">
            <button
              onClick={() => onConnect(connectedWallet)}
              disabled={!canConnect}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
            >
              Connect Wallet
            </button>

            <button
              disabled
              className="w-full px-4 py-3 bg-gray-700/50 text-gray-300 rounded-lg font-medium cursor-not-allowed"
            >
              Connect your HashPack (coming soon)
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


