'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, 
  Edit, 
  Check, 
  X, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  Shield,
  DollarSign
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { authenticatedFetch } from '@/lib/api-utils';

interface HederaWalletManagerProps {
  className?: string;
}

const HederaWalletManager: React.FC<HederaWalletManagerProps> = ({ className = '' }) => {
  const [walletId, setWalletId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newWalletId, setNewWalletId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tokenizations, setTokenizations] = useState<any[]>([]);
  const [loadingTokenizations, setLoadingTokenizations] = useState(false);

  // Load wallet info on mount
  useEffect(() => {
    loadWalletInfo();
    loadTokenizations();
  }, []);

  const loadWalletInfo = async () => {
    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/middleware/hedera/get-wallet`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setWalletId(data.hedera_wallet_id);
          setNewWalletId(data.hedera_wallet_id);
        }
      }
    } catch (error) {
      console.error('Error loading wallet info:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTokenizations = async () => {
    setLoadingTokenizations(true);
    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/middleware/hedera/tokenizations`
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setTokenizations(data.tokenizations);
        }
      }
    } catch (error) {
      console.error('Error loading tokenizations:', error);
    } finally {
      setLoadingTokenizations(false);
    }
  };

  const handleSave = async () => {
    if (!/^\d+\.\d+\.\d+$/.test(newWalletId)) {
      toast.error('Please enter a valid Hedera wallet ID (format: 0.0.123456)');
      return;
    }

    setSaving(true);
    try {
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/middleware/hedera/set-wallet`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hedera_wallet_id: newWalletId })
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setWalletId(newWalletId);
          setIsEditing(false);
          toast.success('Hedera wallet updated successfully!');
        } else {
          toast.error(data.message);
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.detail || 'Failed to update wallet');
      }
    } catch (error) {
      console.error('Error updating wallet:', error);
      toast.error('Failed to update wallet');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setNewWalletId(walletId || '');
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 ${className}`}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          <span className="ml-3 text-gray-300">Loading wallet info...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-xl p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-lg">
            <Wallet className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Hedera Wallet</h3>
            <p className="text-sm text-gray-400">Manage your Hedera network address</p>
          </div>
        </div>
        
        {walletId && !isEditing && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsEditing(true)}
            className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-all duration-200"
          >
            <Edit className="w-4 h-4" />
          </motion.button>
        )}
      </div>

      {/* Wallet Address Section */}
      <div className="space-y-4">
        {!walletId && !isEditing ? (
          // No wallet set - show setup prompt
          <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-orange-400 font-medium mb-1">No Hedera Wallet Set</h4>
                <p className="text-gray-300 text-sm mb-3">
                  Set your Hedera wallet address to receive creator fees from token trades and create tokenized extensions.
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm rounded-lg transition-all duration-200"
                >
                  Set Wallet Address
                </motion.button>
              </div>
            </div>
          </div>
        ) : isEditing ? (
          // Editing mode
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Hedera Wallet ID
              </label>
              <input
                type="text"
                value={newWalletId}
                onChange={(e) => setNewWalletId(e.target.value)}
                placeholder="0.0.123456"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                disabled={saving}
              />
              <p className="text-xs text-gray-400 mt-1">
                Enter your Hedera wallet address in format: 0.0.123456
              </p>
            </div>
            
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={saving || !newWalletId}
                className={`flex-1 px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                  saving || !newWalletId
                    ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white'
                }`}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save
                  </>
                )}
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded-lg transition-all duration-200 flex items-center gap-2"
              >
                <X className="w-4 h-4" />
                Cancel
              </motion.button>
            </div>
          </div>
        ) : (
          // Display mode
          <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 font-medium">Connected</span>
                </div>
                <p className="text-white font-mono text-lg">{walletId}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                  <div className="flex items-center gap-1">
                    <Shield className="w-3 h-3" />
                    <span>Secure Hedera Network</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    <span>9% Creator Fees</span>
                  </div>
                </div>
              </div>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={`https://hashscan.io/mainnet/account/${walletId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-all duration-200"
              >
                <ExternalLink className="w-4 h-4" />
              </motion.a>
            </div>
          </div>
        )}
      </div>

      {/* Tokenizations Section */}
      {walletId && (
        <div className="mt-6 pt-6 border-t border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-md font-medium text-white">Your Tokenized Extensions</h4>
            {!loadingTokenizations && (
              <span className="text-sm text-gray-400">{tokenizations.length} tokens</span>
            )}
          </div>
          
          {loadingTokenizations ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span className="ml-2 text-gray-400 text-sm">Loading tokenizations...</span>
            </div>
          ) : tokenizations.length === 0 ? (
            <div className="text-center py-6">
              <Wallet className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-400 text-sm">No tokenized extensions yet</p>
              <p className="text-gray-500 text-xs mt-1">Create your first token from any extension chat</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {tokenizations.map((token, index) => (
                <motion.div
                  key={token.extension_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-800/50 border border-gray-700 rounded-lg p-3"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium">{token.token_name}</span>
                        <span className="text-gray-400 text-sm">({token.token_symbol})</span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          token.status === 'success' 
                            ? 'bg-green-500/20 text-green-400' 
                            : token.status === 'failed'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {token.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                        <span>Supply: {token.total_supply.toLocaleString('en-US')}</span>
                        <span>Price: {token.initial_price} HBAR</span>
                        {token.token_id && (
                          <span>ID: {token.token_id}</span>
                        )}
                      </div>
                    </div>
                    {token.token_id && (
                      <motion.a
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        href={`https://hashscan.io/mainnet/token/${token.token_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white rounded transition-all duration-200"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </motion.a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HederaWalletManager; 