import React from 'react';
import { Coins, DollarSign, Users, Gift, Shield, Globe, Twitter, MessageSquare, TrendingUp, Star, Activity } from 'lucide-react';

interface TokenPreviewProps {
  tokenName: string;
  tokenSymbol: string;
  totalSupply: number;
  description: string;
  logoPreview?: string;
  socialTwitter?: string;
  socialDiscord?: string;
  socialTelegram?: string;
  bundleOptIn: boolean;
  earlyBuyerAirdrop: boolean;
  enableDaoVoting: boolean;
}

const TokenPreview: React.FC<TokenPreviewProps> = ({
  tokenName,
  tokenSymbol,
  totalSupply,
  description,
  logoPreview,
  socialTwitter,
  socialDiscord,
  socialTelegram,
  bundleOptIn,
  earlyBuyerAirdrop,
  enableDaoVoting
}) => {
  const hasTokenInfo = tokenName && tokenSymbol;
  const hasSocialLinks = socialTwitter || socialDiscord || socialTelegram;
  const hasFeatures = bundleOptIn || earlyBuyerAirdrop || enableDaoVoting;

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-6 border-b border-gray-700">
        <div className="flex items-center gap-4">
          {/* Token Logo */}
          <div className="w-16 h-16 rounded-xl bg-gray-800 border border-gray-600 flex items-center justify-center overflow-hidden">
            {logoPreview ? (
              <img 
                src={logoPreview} 
                alt="Token logo" 
                className="w-full h-full object-cover"
              />
            ) : (
              <Coins className="w-8 h-8 text-gray-400" />
            )}
          </div>
          
          {/* Token Info */}
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white mb-1">
              {tokenName || 'Token Name'}
            </h1>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-mono text-blue-400">
                ${tokenSymbol || 'SYMBOL'}
              </span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">
                Live on Hedera
              </span>
            </div>
            <p className="text-gray-300 text-sm">
              {description || 'Token description will appear here...'}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="p-6 border-b border-gray-700">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">
              0 HBAR
            </div>
            <div className="text-xs text-gray-400">Current Price</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-white mb-1">
              {totalSupply.toLocaleString('en-US')}
            </div>
            <div className="text-xs text-gray-400">Total Supply</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400 mb-1">
              0
            </div>
            <div className="text-xs text-gray-400">Holders</div>
          </div>
          
          <div className="bg-gray-800/50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400 mb-1">
              0.0
            </div>
            <div className="text-xs text-gray-400">Market Cap</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      {hasFeatures && (
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Token Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {bundleOptIn && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 flex items-center gap-3">
                <Users className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-sm font-medium text-blue-300">Bundle Ready</div>
                  <div className="text-xs text-gray-400">Available for cross-creator bundles</div>
                </div>
              </div>
            )}
            
            {earlyBuyerAirdrop && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-3">
                <Gift className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-sm font-medium text-green-300">Early Buyer Bonus</div>
                  <div className="text-xs text-gray-400">+10% airdrop for early adopters</div>
                </div>
              </div>
            )}
            
            {enableDaoVoting && (
              <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 flex items-center gap-3">
                <Shield className="w-5 h-5 text-purple-400" />
                <div>
                  <div className="text-sm font-medium text-purple-300">DAO Governance</div>
                  <div className="text-xs text-gray-400">Community voting enabled</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Social Links */}
      {hasSocialLinks && (
        <div className="p-6 border-b border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4">Community & Links</h3>
          <div className="flex flex-wrap gap-3">
            {socialTwitter && (
              <a 
                href="#" 
                className="flex items-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-lg transition-colors"
              >
                <Twitter className="w-4 h-4" />
                <span className="text-sm">Twitter</span>
              </a>
            )}
            
            {socialDiscord && (
              <a 
                href="#" 
                className="flex items-center gap-2 px-3 py-2 bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-400 rounded-lg transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">Discord</span>
              </a>
            )}
            
            {socialTelegram && (
              <a 
                href="#" 
                className="flex items-center gap-2 px-3 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-lg transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-sm">Telegram</span>
              </a>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <button className="flex items-center justify-center gap-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium">
            <DollarSign className="w-4 h-4" />
            Buy Token
          </button>
          
          <button className="flex items-center justify-center gap-2 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors font-medium">
            <TrendingUp className="w-4 h-4" />
            View Charts
          </button>
        </div>
        
        {/* Revenue Sharing removed as requested */}
      </div>

      {/* Preview Notice */}
      <div className="bg-gray-800/50 border-t border-gray-700 p-4">
        <div className="flex items-center justify-center gap-2 text-gray-400 text-sm">
          <Star className="w-4 h-4" />
          This is a preview of how your token page will look
        </div>
      </div>
    </div>
  );
};

export default TokenPreview; 