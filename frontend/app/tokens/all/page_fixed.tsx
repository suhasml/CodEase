'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Clock, 
  Coins,
  Star,
  Users,
  BarChart3,
  AlertCircle,
  X,
  ExternalLink,
  Copy,
  CheckCircle,
  Globe,
  Twitter,
  MessageCircle,
  Send
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Header from '@/components/Header/header';
import Footer from '@/components/Footer/footer';
import TokensFilterPanel from '@/components/Tokens/TokensFilterPanel';
import MobileFilterToggle from '@/components/Tokens/MobileFilterToggle';
import { authenticatedFetch } from '@/lib/api-utils';

interface Token {
  extension_id: string;
  token_id: string;
  token_name: string;
  token_symbol: string;
  creator_wallet: string;
  hedera_transaction_id: string;
  total_supply: number;
  initial_price: number;
  description: string;
  logo_url?: string;
  extension_link: string;
  social_links: {
    twitter?: string;
    discord?: string;
    telegram?: string;
  };
  features: {
    bundle_opt_in: boolean;
    early_buyer_airdrop: boolean;
    enable_dao_voting: boolean;
  };
  created_at: string;
  status: string;
}

interface TokenFilters {
  search: string;
  filter: 'all' | 'trending';
  sortBy: 'newest' | 'oldest' | 'supply' | 'name';
}

// Loading component
function TokensLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <Header />
      <div className="max-w-[1900px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16 py-4 sm:py-6 lg:py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading tokens...</p>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

// Token Card Component
function TokenCard({ token }: { token: Token }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  
  const copyTokenAddress = async () => {
    try {
      await navigator.clipboard.writeText(token.token_id);
      setCopied(true);
      toast.success('Token ID copied!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy token ID');
    }
  };

  const formatSupply = (supply: number) => {
    if (supply >= 1e9) return (supply / 1e9).toFixed(1) + 'B';
    if (supply >= 1e6) return (supply / 1e6).toFixed(1) + 'M';
    if (supply >= 1e3) return (supply / 1e3).toFixed(1) + 'K';
    return supply.toLocaleString();
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const created = new Date(dateString);
    const diffMs = now.getTime() - created.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    
    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return new Date(created).toLocaleDateString();
  };

  const isTrending = () => {
    // Consider tokens trending if created in last 24 hours
    const now = new Date();
    const created = new Date(token.created_at);
    const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return diffHours <= 24;
  };

  const handleTokenClick = () => {
    router.push(`/token/${token.token_name.toLowerCase().replace(/\s+/g, '-')}`);
  };

  return (
    <div 
      className="group relative bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 rounded-lg hover:border-purple-500/30 transition-all duration-200 hover:bg-gray-900/80 cursor-pointer" 
      onClick={handleTokenClick}
    >
      {/* Trending Badge */}
      {isTrending() && (
        <div className="absolute -top-1 -right-1 px-2 py-0.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          HOT
        </div>
      )}

      <div className="p-4">
        {/* Token Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center border border-purple-500/20">
              {token.logo_url ? (
                <img src={token.logo_url} alt={token.token_name} className="w-6 h-6 rounded-full" />
              ) : (
                <Coins className="w-5 h-5 text-purple-400" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-white text-base group-hover:text-purple-400 transition-colors truncate max-w-[120px]">
                {token.token_name}
              </h3>
              <p className="text-gray-400 text-sm font-mono">{token.token_symbol}</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-gray-400 text-xs">Supply</p>
            <p className="text-white font-mono text-sm">{formatSupply(token.total_supply)}</p>
          </div>
        </div>

        {/* Token Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="bg-gray-800/30 rounded-lg p-2">
            <p className="text-gray-400 text-xs">Creator</p>
            <p className="text-white text-xs font-mono truncate" title={token.creator_wallet}>
              {token.creator_wallet.slice(0, 6)}...{token.creator_wallet.slice(-4)}
            </p>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-2">
            <p className="text-gray-400 text-xs">Age</p>
            <p className="text-white text-xs">{getTimeAgo(token.created_at)}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-xs mb-3 line-clamp-2 leading-relaxed">
          {token.description}
        </p>

        {/* Features Pills */}
        {(token.features.bundle_opt_in || token.features.early_buyer_airdrop || token.features.enable_dao_voting) && (
          <div className="flex flex-wrap gap-1 mb-3">
            {token.features.bundle_opt_in && (
              <span className="px-2 py-0.5 bg-blue-900/20 text-blue-400 text-xs rounded border border-blue-700/20">
                Bundle
              </span>
            )}
            {token.features.early_buyer_airdrop && (
              <span className="px-2 py-0.5 bg-green-900/20 text-green-400 text-xs rounded border border-green-700/20">
                Airdrop
              </span>
            )}
            {token.features.enable_dao_voting && (
              <span className="px-2 py-0.5 bg-purple-900/20 text-purple-400 text-xs rounded border border-purple-700/20">
                DAO
              </span>
            )}
          </div>
        )}

        {/* Action Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-800/50">
          <div className="flex gap-1">
            {/* Social Links */}
            {token.social_links.twitter && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(token.social_links.twitter, '_blank');
                }}
                className="p-1.5 bg-blue-900/20 hover:bg-blue-900/40 text-blue-400 rounded transition-colors"
                title="Twitter"
              >
                <Twitter className="w-3 h-3" />
              </button>
            )}
            {token.social_links.telegram && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(token.social_links.telegram, '_blank');
                }}
                className="p-1.5 bg-cyan-900/20 hover:bg-cyan-900/40 text-cyan-400 rounded transition-colors"
                title="Telegram"
              >
                <Send className="w-3 h-3" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyTokenAddress();
              }}
              className="p-1.5 bg-gray-700/30 hover:bg-gray-700/50 text-gray-400 hover:text-white rounded transition-colors"
              title="Copy Token ID"
            >
              {copied ? (
                <CheckCircle className="w-3 h-3 text-green-400" />
              ) : (
                <Copy className="w-3 h-3" />
              )}
            </button>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://hashscan.io/mainnet/token/${token.token_id}`, '_blank');
              }}
              className="px-3 py-1.5 bg-gray-700/30 hover:bg-gray-700/50 text-gray-400 hover:text-white rounded text-xs transition-colors flex items-center gap-1"
              title="View on HashScan"
            >
              <ExternalLink className="w-3 h-3" />
              HashScan
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/token/${token.token_name.toLowerCase().replace(/\s+/g, '-')}`);
              }}
              className="px-3 py-1.5 bg-gradient-to-r from-purple-600/80 to-purple-700/80 hover:from-purple-500 hover:to-purple-600 text-white rounded text-xs transition-all duration-200 flex items-center gap-1 font-medium"
            >
              View Token
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Tokens Content Component
function TokensContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [tokens, setTokens] = useState<Token[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFilters] = useState<TokenFilters>({
    search: '',
    filter: 'all',
    sortBy: 'newest'
  });

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      search: '',
      filter: 'all',
      sortBy: 'newest'
    });
  };

  // Fetch tokens from real API
  const fetchTokens = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/middleware/hedera/public/tokenizations`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tokens: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && Array.isArray(data.tokenizations)) {
        setTokens(data.tokenizations);
        setFilteredTokens(data.tokenizations);
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err) {
      console.error('Error fetching tokens:', err);
      setError('Failed to load tokens. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and sort tokens
  useEffect(() => {
    let filtered = [...tokens];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(token =>
        token.token_name.toLowerCase().includes(searchLower) ||
        token.token_symbol.toLowerCase().includes(searchLower) ||
        token.description.toLowerCase().includes(searchLower) ||
        token.creator_wallet.toLowerCase().includes(searchLower)
      );
    }

    // Apply trending filter (tokens created in last 24 hours)
    if (filters.filter === 'trending') {
      const now = new Date();
      filtered = filtered.filter(token => {
        const created = new Date(token.created_at);
        const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
        return diffHours <= 24;
      });
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case 'supply':
        filtered.sort((a, b) => b.total_supply - a.total_supply);
        break;
      case 'name':
        filtered.sort((a, b) => a.token_name.localeCompare(b.token_name));
        break;
    }

    setFilteredTokens(filtered);
  }, [tokens, filters]);

  // Load tokens on mount
  useEffect(() => {
    fetchTokens();
  }, []);

  // Get trending count
  const trendingCount = tokens.filter(token => {
    const now = new Date();
    const created = new Date(token.created_at);
    const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
    return diffHours <= 24;
  }).length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <Header />
      
      {/* Background Effects */}
      <div className="relative overflow-hidden -z-10">
        <div className="absolute -top-[500px] -left-[400px] w-[1400px] h-[1000px] bg-[radial-gradient(ellipse_at_center,hsla(280,100%,50%,0.12)_0%,transparent_70%)] pointer-events-none" 
             style={{ animation: 'aurora-x 25s ease-in-out infinite' }} />
        <div className="absolute -top-[300px] -right-[300px] w-[1200px] h-[800px] bg-[radial-gradient(ellipse_at_center,hsla(320,89%,60%,0.12)_0%,transparent_70%)] pointer-events-none" 
             style={{ animation: 'aurora-y 20s ease-in-out infinite' }} />
        <div className="absolute bottom-[20%] left-[10%] w-[900px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsla(190,95%,50%,0.06)_0%,transparent_70%)] pointer-events-none" 
             style={{ animation: 'aurora-pulse 30s ease infinite' }} />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_85%)] pointer-events-none" />
      </div>

      <div className="max-w-[1900px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10 2xl:px-12 3xl:px-16 pt-20 sm:pt-24 md:pt-28 lg:pt-32 pb-4 sm:pb-6 lg:pb-8 relative z-10">
        {/* Error Banner */}
        {error && (
          <div className="mb-4 sm:mb-6 p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-red-900/30 to-red-800/20 border border-red-500/30 rounded-xl backdrop-blur-sm shadow-lg">
            <div className="flex items-start gap-3">
              <div className="text-red-400 mt-0.5 flex-shrink-0">
                <AlertCircle size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-red-400 text-sm sm:text-base break-words">{error}</p>
                <p className="text-xs sm:text-sm text-red-500/80 mt-1">
                  Please try again in a while. If the issue persists, contact support.
                </p>
              </div>
              <button 
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-400 flex-shrink-0 p-1 rounded-md hover:bg-red-900/30 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-600 bg-clip-text text-transparent mb-4">
            Token Listings
          </h1>
          <p className="text-gray-400 text-base sm:text-lg mb-2">
            Professional token listings and analytics platform
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-purple-400">
            <Clock className="w-4 h-4" />
            <span>Live data • Real-time updates</span>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6 sm:mb-8">
          <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-800/40 rounded-lg p-3 hover:border-purple-500/20 transition-colors">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-900/20 rounded">
                <Coins className="w-4 h-4 text-purple-400" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Listed Tokens</p>
                <p className="text-white font-semibold text-base">{tokens.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-800/40 rounded-lg p-3 hover:border-orange-500/20 transition-colors">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-900/20 rounded">
                <TrendingUp className="w-4 h-4 text-orange-400" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Trending (24h)</p>
                <p className="text-white font-semibold text-base">{trendingCount}</p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-800/40 rounded-lg p-3 hover:border-green-500/20 transition-colors">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-900/20 rounded">
                <BarChart3 className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Total Supply</p>
                <p className="text-white font-semibold text-base">
                  {(tokens.reduce((acc, token) => acc + token.total_supply, 0) / 1e9).toFixed(1)}B
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-900/40 backdrop-blur-sm border border-gray-800/40 rounded-lg p-3 hover:border-blue-500/20 transition-colors">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-900/20 rounded">
                <Users className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <p className="text-gray-400 text-xs">Live Projects</p>
                <p className="text-white font-semibold text-base">{tokens.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <MobileFilterToggle
          showMobileFilters={showMobileFilters}
          setShowMobileFilters={setShowMobileFilters}
          searchTerm={filters.search}
          setSearchTerm={(term) => setFilters(prev => ({ ...prev, search: term }))}
          filter={filters.filter}
          setFilter={(filter) => setFilters(prev => ({ ...prev, filter }))}
        />

        {/* Main Content Area with Filters and Grid */}
        <div className="lg:flex gap-4 xl:gap-6 2xl:gap-8 3xl:gap-10">
          {/* Filter Panel */}
          <TokensFilterPanel
            searchTerm={filters.search}
            setSearchTerm={(term) => setFilters(prev => ({ ...prev, search: term }))}
            filter={filters.filter}
            setFilter={(filter) => setFilters(prev => ({ ...prev, filter }))}
            sortBy={filters.sortBy}
            setSortBy={(sort) => setFilters(prev => ({ ...prev, sortBy: sort }))}
            clearFilters={clearFilters}
            showMobileFilters={showMobileFilters}
            setShowMobileFilters={setShowMobileFilters}
          />

          {/* Tokens Grid */}
          <div className="flex-grow">
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-gray-400">
                Showing {filteredTokens.length} token{filteredTokens.length !== 1 ? 's' : ''}
                {filters.search && ` matching "${filters.search}"`}
                {filters.filter === 'trending' && ' (trending in last 24h)'}
              </p>
            </div>

            {/* Tokens Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-3">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-800/40 rounded-lg p-4 h-64 border border-gray-800/40"></div>
                  </div>
                ))}
              </div>
            ) : filteredTokens.length === 0 ? (
              <div className="text-center py-12">
                <div className="bg-gray-900/40 rounded-lg p-8 max-w-md mx-auto border border-gray-800/40">
                  <Coins className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">No tokens found</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    {filters.search ? 'Try adjusting your search terms' : 'No tokens match your current filters'}
                  </p>
                  {tokens.length === 0 && (
                    <button
                      onClick={fetchTokens}
                      className="px-4 py-2 bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg transition-colors text-sm"
                    >
                      Refresh Data
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-3">
                {filteredTokens.map((token) => (
                  <TokenCard key={token.token_id} token={token} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx global>{`
        @keyframes aurora-x {
          0%, 100% { transform: translateX(0) rotate(0); opacity: 0.8; }
          50% { transform: translateX(30px) rotate(5deg); opacity: 1; }
        }
        
        @keyframes aurora-y {
          0%, 100% { transform: translateY(0) rotate(0); opacity: 0.7; }
          50% { transform: translateY(30px) rotate(-5deg); opacity: 1; }
        }
        
        @keyframes aurora-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .bg-grid-pattern {
          background-image: 
            linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 20px 20px;
        }
      `}</style>
    </div>
  );
}

// Main export with Suspense boundary
export default function TokensPage() {
  return (
    <Suspense fallback={<TokensLoading />}>
      <TokensContent />
    </Suspense>
  );
}
