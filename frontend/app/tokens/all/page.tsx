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
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 overflow-x-hidden">
      {/* Local DEX top bar skeleton */}
      <div className="sticky top-0 z-30 w-full bg-gray-950/70 backdrop-blur supports-[backdrop-filter]:bg-gray-950/50 border-b border-gray-800/40">
        <div className="max-w-[2560px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-6 2xl:px-6 3xl:px-6 h-12 sm:h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-purple-500/70 to-blue-500/70" />
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-600 bg-clip-text text-transparent">CodEase DEX</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-gray-400">Network</span>
            <span className="px-2 py-1 rounded-md border border-gray-800/50 text-xs text-gray-300 bg-gray-900/50">Hedera</span>
          </div>
        </div>
      </div>
      <div className="max-w-[2560px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-6 2xl:px-6 3xl:px-6 py-4 sm:py-6 lg:py-8">
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
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Load token logo from Firebase
  useEffect(() => {
    const loadLogo = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/middleware/hedera/get-logo/${token.extension_id}`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.logo_url) {
            setLogoUrl(data.logo_url);
          }
        }
      } catch (error) {
        // Silently fail - tokens without logos are expected
      }
    };

    if (token.extension_id) {
      loadLogo();
    }
  }, [token.extension_id]);
  
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
      className="group relative bg-gray-900/60 backdrop-blur-sm border border-gray-800/60 rounded-xl hover:border-purple-500/40 transition-all duration-200 hover:bg-gray-900/80 hover:shadow-lg hover:shadow-purple-500/10 cursor-pointer overflow-hidden h-full min-h-[340px] md:min-h-[380px]" 
      onClick={handleTokenClick}
    >
      {/* Trending Badge */}
      {isTrending() && (
        <div className="absolute -top-1 -right-1 px-2.5 py-1 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs md:text-sm font-bold rounded-full flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          HOT
        </div>
      )}

      <div className="p-5 md:p-6 flex h-full flex-col">
        {/* Token Header */}
        <div className="flex-1 min-h-0">
        <div className="flex items-center justify-between mb-4 md:mb-5">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-full flex items-center justify-center border border-purple-500/20 overflow-hidden">
              {logoUrl ? (
                <img src={logoUrl} alt={token.token_name} className="w-full h-full object-cover rounded-full" />
              ) : (
                <Coins className="w-7 h-7 text-purple-400" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-white text-lg md:text-xl group-hover:text-purple-400 transition-colors truncate max-w-full">
                {token.token_name}
              </h3>
              <p className="text-gray-400 text-sm md:text-base font-mono">{token.token_symbol}</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-gray-400 text-sm">Supply</p>
            <p className="text-white font-mono text-base">{formatSupply(token.total_supply)}</p>
          </div>
        </div>

        {/* Token Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800/30 rounded-lg p-3">
            <p className="text-gray-400 text-sm">Creator</p>
            <p className="text-white text-sm font-mono truncate" title={token.creator_wallet}>
              {token.creator_wallet.slice(0, 6)}...{token.creator_wallet.slice(-4)}
            </p>
          </div>
          <div className="bg-gray-800/30 rounded-lg p-3">
            <p className="text-gray-400 text-sm">Age</p>
            <p className="text-white text-sm">{getTimeAgo(token.created_at)}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm md:text-base mb-4 line-clamp-3 leading-relaxed break-words">
          {token.description}
        </p>

        {/* Features Pills */}
        {(token.features.bundle_opt_in || token.features.early_buyer_airdrop || token.features.enable_dao_voting) && (
          <div className="flex flex-wrap gap-2 mb-4">
            {token.features.bundle_opt_in && (
              <span className="px-2.5 py-1 bg-blue-900/20 text-blue-400 text-xs md:text-sm rounded border border-blue-700/20">
                Bundle
              </span>
            )}
            {token.features.early_buyer_airdrop && (
              <span className="px-2.5 py-1 bg-green-900/20 text-green-400 text-xs md:text-sm rounded border border-green-700/20">
                Airdrop
              </span>
            )}
            {token.features.enable_dao_voting && (
              <span className="px-2.5 py-1 bg-purple-900/20 text-purple-400 text-xs md:text-sm rounded border border-purple-700/20">
                DAO
              </span>
            )}
          </div>
        )}
        </div>

        {/* Action Bar */}
        <div className="pt-3 md:pt-4 border-t border-gray-800/50">
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://hashscan.io/testnet/token/${token.token_id}`, '_blank');
              }}
              className="inline-flex items-center justify-center h-10 md:h-11 px-4 bg-gray-700/30 hover:bg-gray-700/50 text-gray-300 hover:text-white rounded text-sm transition-colors gap-2 w-full"
              title="View on HashScan"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="whitespace-nowrap">HashScan</span>
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/token/${token.token_name.toLowerCase().replace(/\s+/g, '-')}`);
              }}
              className="inline-flex items-center justify-center h-10 md:h-11 px-4 bg-gradient-to-r from-purple-600/80 to-purple-700/80 hover:from-purple-500 hover:to-purple-600 text-white rounded text-sm md:text-base transition-all duration-200 gap-2 w-full font-medium"
            >
              <span className="whitespace-nowrap">View Token</span>
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
      {/* Local DEX Top Bar */}
      <div className="sticky top-0 z-30 w-full bg-gray-950/70 backdrop-blur supports-[backdrop-filter]:bg-gray-950/50 border-b border-gray-800/40">
        <div className="max-w-[2560px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-6 2xl:px-6 3xl:px-6 h-12 sm:h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-gradient-to-br from-purple-500/70 to-blue-500/70 shadow-[0_0_20px_rgba(147,51,234,0.35)]" />
            <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-purple-600 bg-clip-text text-transparent">CodEase DEX</span>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-gray-400">Network</span>
            <span className="px-2 py-1 rounded-md border border-gray-800/50 text-xs text-gray-300 bg-gray-900/50">Hedera</span>
          </div>
        </div>
      </div>
      
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

      <div className="max-w-[2560px] mx-auto px-3 sm:px-4 md:px-6 lg:px-8 xl:px-6 2xl:px-6 3xl:px-6 pt-6 sm:pt-8 md:pt-10 lg:pt-12 pb-4 sm:pb-6 lg:pb-8 relative z-10">
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

        {/* DEX Hero */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-blue-400 to-purple-600 bg-clip-text text-transparent">
            CodEase DEX
          </h1>
          <p className="mt-2 text-gray-300 text-sm sm:text-base">
            Extensions are now tokenized — discover markets, back creators, and invest early.
          </p>
          <div className="mt-2 flex items-center justify-center gap-2 text-xs sm:text-sm text-purple-300/80">
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

        {/* Trending Ticker */}
        <div className="mb-6 hidden sm:block">
          <div className="relative overflow-hidden rounded-lg border border-gray-800/40 bg-gray-900/30">
            <div className="absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-gray-900/80 to-transparent pointer-events-none" />
            <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-gray-900/80 to-transparent pointer-events-none" />
            <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-800/40 text-xs text-gray-400">
              <TrendingUp className="w-4 h-4 text-orange-400" />
              <span>Trending tokens</span>
            </div>
            <div className="whitespace-nowrap overflow-hidden">
              <div className="inline-flex gap-6 py-2 px-3 animate-marquee">
                {tokens
                  .filter(t => {
                    const now = new Date();
                    const created = new Date(t.created_at);
                    const diffHours = (now.getTime() - created.getTime()) / (1000 * 60 * 60);
                    return diffHours <= 24;
                  })
                  .slice(0, 20)
                  .map(t => (
                    <span key={t.token_id} className="text-sm text-gray-300">
                      <span className="text-purple-400 font-medium">{t.token_symbol}</span>
                      <span className="mx-2 text-gray-600">•</span>
                      {t.token_name}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Market Presets & Filters */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilters(prev => ({ ...prev, filter: 'all' }))}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              filters.filter === 'all' ? 'bg-purple-600/30 border-purple-500/40 text-white' : 'bg-gray-900/40 border-gray-800/60 text-gray-300 hover:border-gray-700'
            }`}
          >
            All Markets
          </button>
          <button
            onClick={() => setFilters(prev => ({ ...prev, filter: 'trending' }))}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              filters.filter === 'trending' ? 'bg-orange-600/20 border-orange-500/40 text-white' : 'bg-gray-900/40 border-gray-800/60 text-gray-300 hover:border-gray-700'
            }`}
          >
            Trending 24h
          </button>
          <button
            onClick={() => setFilters(prev => ({ ...prev, sortBy: 'newest' }))}
            className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
              filters.sortBy === 'newest' ? 'bg-blue-600/20 border-blue-500/40 text-white' : 'bg-gray-900/40 border-gray-800/60 text-gray-300 hover:border-gray-700'
            }`}
          >
            New Listings
          </button>
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
            setSortBy={(sort: TokenFilters['sortBy']) => setFilters(prev => ({ ...prev, sortBy: sort }))}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="bg-gray-800/40 rounded-xl p-5 md:p-6 h-80 md:h-96 border border-gray-800/40"></div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-3 3xl:grid-cols-4 gap-6">
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

        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: inline-flex;
          min-width: 200%;
          animation: marquee 30s linear infinite;
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
