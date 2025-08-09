'use client';

import React, { useState, useEffect, use } from 'react';
import { motion } from 'framer-motion';
import { 
  ExternalLink, 
  Download, 
  Globe, 
  Twitter, 
  MessageSquare,
  Coins,
  TrendingUp,
  Users,
  Shield,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  Calendar,
  Hash,
  DollarSign,
  BarChart3,
  Play,
  ShoppingCart,
  User,
  Mail,
  Activity,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Volume2,
  Droplets,
  Target,
  Settings,
  LineChart
} from 'lucide-react';
import { FaXTwitter } from 'react-icons/fa6';
import { FaTelegramPlane, FaDiscord } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import { ethers } from 'ethers';
// HashConnect lazy-load suggestion: full SDK integration can be moved to a dedicated hook later
import PriceChart from '@/components/Tokens/PriceChart';
import CandleChart from '@/components/Tokens/CandleChart';
import AreaChart from '@/components/Tokens/AreaChart';
import WalletModal from '@/components/Tokens/WalletModal';
import TradeModal from '@/components/Tokens/TradeModal';
import TokenHeader from '@/components/Tokens/TokenHeader';
import { useHashConnect } from '@/lib/useHashConnect';

// Prevent console noise in production
const devLog = (...args: unknown[]) => {
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
};

interface TokenPageProps {
  params: Promise<{ token_name: string }>;
}

interface TokenInfo {
  token_id: string;
  token_name: string;
  token_symbol: string;
  creator_wallet: string;
  creator_email?: string;
  total_supply: number;
  initial_price: number;
  description: string;
  logo_url?: string;
  extension_link: string;
  extension_id: string;
  social_links?: {
      twitter?: string;
      discord?: string;
      telegram?: string;
    };
  features?: {
    bundle_opt_in?: boolean;
    early_buyer_airdrop?: boolean;
    enable_dao_voting?: boolean;
  };
  hedera_transaction_id: string;
  created_at: string;
  status: string;
}

interface ExtensionInfo {
  title: string;
  extension_details?: {
    name: string;
    version: string;
    description: string;
    permissions: string[];
  };
  files: Array<{
    name: string;
    size: number;
  }>;
  file_count: number;
}

interface MarketData {
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  liquidity: number;
  holders: number;
  totalTrades: number;
  // HeliSwap DEX specific data
  heliswap?: {
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
    charts?: {
      priceHistory: Array<{
        timestamp: number;
        price: number;
        volume: number;
      }>;
    };
    tokenInfo?: {
      address: string;
      name: string;
      symbol: string;
      decimals: number;
      totalSupply: string;
    };
    whbarInfo?: {
      address: string;
      name: string;
      symbol: string;
      decimals: number;
    };
    lastUpdated?: string;
  };
  // Custom AMM specific data (fallback)
  customAmm?: {
    poolInfo: {
      reserveToken: string;
      reserveHBAR: string;
      startPrice: string;
      slope: string;
      sold: string;
      feeBps: string;
      creatorFeeBps: string;
      creatorFeeAcc: string;
      platformFeeAcc: string;
      graduated: boolean;
      exists: boolean;
    };
    reserves: {
      tokenReserve: string;
      hbarReserve: string;
    };
    status: {
      isGraduated: boolean;
      tradingActive: boolean;
    };
    priceInfo?: {
      currentPrice: string;
      priceFor1000Tokens: string;
    };
  };
}

interface UserStats {
  totalTests: number;
  totalDownloads: number;
  recentActivity: Array<{
    type: 'test' | 'download' | 'buy';
    user: string;
    timestamp: string;
    amount?: number;
  }>;
}

// Mock market data - will be replaced with real data
const getMockMarketData = (): MarketData => ({
  price: 0.0042,
  priceChange24h: 12.5,
  marketCap: 125420,
  volume24h: 8942,
  liquidity: 45210,
  holders: 234,
  totalTrades: 1829
});

// Enhanced HeliSwap pool data fetching with comprehensive endpoints
const fetchHeliSwapData = async (tokenId: string): Promise<MarketData | null> => {
  try {
    // Convert Hedera token ID to EVM address
    const tokenNum = parseInt(tokenId.split('.')[2]);
    const tokenAddress = `0x${tokenNum.toString(16).padStart(40, '0')}`;
    
    devLog('Fetching enhanced HeliSwap data for token');
    
    // Use the HeliSwap pool endpoint (original working endpoint)
    const heliswapResponse = await fetch(
      `${process.env.NEXT_PUBLIC_HEDERA_API_URL || 'http://localhost:3003'}/heliswap-pool/${tokenAddress}`
    );
    
    if (!heliswapResponse.ok) {
      return fetchCustomAmmData(tokenId);
    }

    const heliswapData = await heliswapResponse.json();
    devLog('HeliSwap pool response received');
    
    if (!heliswapData || !heliswapData.success) {
      devLog('No HeliSwap pool found, using fallback data');
      return fetchCustomAmmData(tokenId);
    }

    // Validate enhanced response structure
    if (!heliswapData.pricing || !heliswapData.pricing.currentPrice) {
      return fetchCustomAmmData(tokenId);
    }

    // Fetch comprehensive analytics including trading data and charts
    const analyticsResponse = await fetch(
      `${process.env.NEXT_PUBLIC_HEDERA_API_URL || 'http://localhost:3003'}/token-analytics/${tokenAddress}`
    );
    let analyticsData = { success: false, analytics: null };
    
    if (analyticsResponse.ok) {
      analyticsData = await analyticsResponse.json();
      devLog('Analytics response received');
    } else {
      console.warn('Analytics API failed:', analyticsResponse.status);
    }

    // Extract data with proper fallbacks
    const analytics = analyticsData.success ? (analyticsData as any).analytics : null;
    const trading = analytics?.trading || {};
    const charts = analytics?.charts || {};

    const marketData: MarketData = {
      price: parseFloat(heliswapData.pricing.currentPrice) || 0,
      priceChange24h: trading.priceChange24h || 0,
      marketCap: parseFloat(heliswapData.pricing.marketCap) || 0,
      volume24h: trading.volume24h || 0,
      liquidity: parseFloat(heliswapData.pricing.liquidity) || 0,
      holders: trading.holders || 1,
      totalTrades: trading.trades24h || 0,
      // Enhanced HeliSwap specific data
      heliswap: {
        pairAddress: heliswapData.pairAddress || '',
        reserves: {
          tokenReserve: heliswapData.reserves.tokenReserve || '0',
          whbarReserve: heliswapData.reserves.whbarReserve || '0',
          totalSupply: heliswapData.reserves.totalSupply || '0'
        },
        pricing: {
          currentPrice: heliswapData.pricing.currentPrice || '0',
          priceInUsd: heliswapData.pricing.priceInUsd || '0',
          marketCap: heliswapData.pricing.marketCap || '0',
          liquidity: heliswapData.pricing.liquidity || '0'
        },
        poolInfo: {
          token0: heliswapData.poolInfo.token0 || '',
          token1: heliswapData.poolInfo.token1 || '',
          isToken0: heliswapData.poolInfo.isToken0 || false,
          factory: heliswapData.poolInfo.factory || '',
          router: heliswapData.poolInfo.router || '',
          tradingUrl: heliswapData.poolInfo.tradingUrl || `https://app.heliswap.io/swap?inputCurrency=HBAR&outputCurrency=${tokenAddress}`
        },
        charts: charts.priceHistory ? { priceHistory: charts.priceHistory } : undefined,
        tokenInfo: heliswapData.tokenInfo,
        whbarInfo: heliswapData.whbarInfo,
        lastUpdated: heliswapData.lastUpdated
      }
    };

    devLog('Enhanced HeliSwap data loaded');
    return marketData;
    
  } catch (_) {
    return fetchCustomAmmData(tokenId);
  }
};

// Real Custom AMM data fetching (fallback)
const fetchCustomAmmData = async (tokenId: string): Promise<MarketData | null> => {
  try {
    // Convert Hedera token ID to EVM address
    const tokenNum = parseInt(tokenId.split('.')[2]);
    const tokenAddress = `0x${tokenNum.toString(16).padStart(40, '0')}`;
    
    devLog('Fetching custom AMM data for token');
    
    // Fetch pool info
    const poolResponse = await fetch(`${process.env.NEXT_PUBLIC_HEDERA_API_URL || 'http://localhost:3003'}/custom-pool/${tokenAddress}`);
    const poolData = await poolResponse.json();
    
    if (!poolData.success) {
      devLog('No pools found, using mock data');
      return getMockMarketData();
    }
    
    // Fetch price for 1000 tokens
    const priceResponse = await fetch(`${process.env.NEXT_PUBLIC_HEDERA_API_URL || 'http://localhost:3003'}/custom-price/${tokenAddress}/1000`);
    const priceData = await priceResponse.json();
    
    // Calculate market data from custom AMM
    const reserveHBAR = parseFloat(poolData.poolInfo.reserveHBAR || '0');
    const reserveToken = parseFloat(poolData.poolInfo.reserveToken || '0');
    const currentPrice = priceData.success ? parseFloat(priceData.priceInHbar) / 1000 : 0;
    
    return {
      price: currentPrice,
      priceChange24h: 0, // TODO: Calculate from historical data
      marketCap: currentPrice * reserveToken,
      volume24h: 0, // TODO: Calculate from trading events
      liquidity: reserveHBAR,
      holders: 1, // TODO: Get from Hedera API
      totalTrades: parseInt(poolData.poolInfo.sold || '0'),
      customAmm: {
        poolInfo: poolData.poolInfo,
        reserves: poolData.reserves,
        status: poolData.status,
        priceInfo: priceData.success ? {
          currentPrice: currentPrice.toFixed(6),
          priceFor1000Tokens: priceData.priceInHbar
        } : undefined
      }
    };
  } catch (_) {
    return getMockMarketData();
  }
};

// Mock user stats for creators
const getMockUserStats = (): UserStats => ({
  totalTests: 156,
  totalDownloads: 89,
  recentActivity: [
    { type: 'test', user: '0.0.1234567', timestamp: '2 hours ago' },
    { type: 'download', user: '0.0.2345678', timestamp: '4 hours ago' },
    { type: 'buy', user: '0.0.3456789', timestamp: '6 hours ago', amount: 1000 },
    { type: 'test', user: '0.0.4567890', timestamp: '8 hours ago' },
    { type: 'download', user: '0.0.5678901', timestamp: '12 hours ago' },
  ]
});

export default function TokenPage({ params }: TokenPageProps) {
  const { token_name } = use(params);
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
  const [extensionInfo, setExtensionInfo] = useState<ExtensionInfo | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [chartData, setChartData] = useState<Array<{ timestamp: number; open: number; high: number; low: number; close: number; volume?: number }>>([]);
  const [tradeData, setTradeData] = useState<Array<{ time: number; price: number; hbar?: number; token?: number; side?: 'buy' | 'sell' | null; mc?: number }>>([]);
  const [analyticsMetrics, setAnalyticsMetrics] = useState<{ price?: number; marketCap?: number; liquidity?: number; tokenReserve?: number; whbarReserve?: number } | null>(null);
  const [analyticsTrading, setAnalyticsTrading] = useState<{ volume24h?: number; trades24h?: number; holders?: number } | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<Array<{ type: 'test' | 'download' | 'buy'; user?: string; timestamp: string; amount?: number }>>([]);
  const [lastEventTimes, setLastEventTimes] = useState<{ test?: string; download?: string; buy?: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageError, setPageError] = useState<{ code?: 'NOT_FOUND' | 'GENERAL'; message: string } | null>(null);
  const [copiedStates, setCopiedStates] = useState<{[key: string]: boolean}>({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [userWallet, setUserWallet] = useState<string>('');
  const [userBalance, setUserBalance] = useState<number>(0);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [interactionCounts, setInteractionCounts] = useState<{ tests: number; downloads: number }>({ tests: 0, downloads: 0 });
  const [lastBurn, setLastBurn] = useState<{ time?: string; reason?: string; status?: string; txId?: string; consensusTimestamp?: string } | null>(null);
  const [burnHistory, setBurnHistory] = useState<Array<{ createdAt?: string; reasonAction?: string; interactionCountAt?: number; status?: string; txId?: string; consensusTimestamp?: string; amount?: number }>>([]);
  const [burnHistoryLoading, setBurnHistoryLoading] = useState<boolean>(false);
  const [feeFeed, setFeeFeed] = useState<Array<{ timestamp: string; creator?: string; creatorTokens?: number; platformTokens?: number; tokenDelta?: number; tx?: any }>>([]);
  const [feeFeedLoading, setFeeFeedLoading] = useState<boolean>(false);
  const [socialInputs, setSocialInputs] = useState<{ twitter?: string; telegram?: string; discord?: string }>({});
  const [savingSocials, setSavingSocials] = useState(false);
  
  // Trading modal state
  const [showTradeModal, setShowTradeModal] = useState(false);
  const [tradeAmount, setTradeAmount] = useState<string>('');
  const [tradeLoading, setTradeLoading] = useState(false);
  const [estimatedPrice, setEstimatedPrice] = useState<string>('0');
  const [tradeDirection, setTradeDirection] = useState<'buy' | 'sell'>('buy');
  const [tradeError, setTradeError] = useState<string>('');
  const [needsAssociation, setNeedsAssociation] = useState<boolean>(false);
  // Fixed slippage (hidden from UI)
  const [slippage] = useState<number>(35); // default 35%
  const [autoAssociating, setAutoAssociating] = useState<boolean>(false);
  
  // Wallet connection state
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState<string>('');
  const [connectedEvm, setConnectedEvm] = useState<string>('');
  const WALLET_TTL_MS = 60 * 60 * 1000; // 60 minutes

  // Restore short-lived wallet session on refresh (<= 60 min)
  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('walletSession') : null;
      if (!raw) return;
      const sess = JSON.parse(raw || '{}');
      if (sess?.savedAt && (Date.now() - Number(sess.savedAt) < WALLET_TTL_MS)) {
        if (sess.accountId) setConnectedWallet(sess.accountId);
        if (sess.evm) setConnectedEvm(sess.evm);
      } else {
        localStorage.removeItem('walletSession');
      }
    } catch {}
  }, []);

  // Refresh balance on mount/when wallet or token changes
  useEffect(() => {
    if (tokenInfo && (connectedWallet || connectedEvm)) {
      refreshUserTokenBalance();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedWallet, connectedEvm, tokenInfo?.token_id]);
  const [walletBalance, setWalletBalance] = useState<string>('0');
  
  // Real-time updates
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now());
  // HashConnect
  const { isAvailable: hcAvailable, isPaired: hcPaired, accountId: hcAccountId, connecting: hcConnecting, associating: hcAssociating, connect: hcConnect, associateToken } = useHashConnect();

  // Prefer HashConnect account if paired
  useEffect(() => {
    if (hcPaired && hcAccountId) {
      if (connectedWallet !== hcAccountId) {
        setConnectedWallet(hcAccountId);
        setUserWallet(hcAccountId);
      }
    }
  }, [hcPaired, hcAccountId]);

  
  // Track if user was trying to trade before wallet connection
  const [pendingTrade, setPendingTrade] = useState<boolean>(false);

  useEffect(() => {
    loadTokenInfo();
    checkUserAuth();
  }, [token_name]);

  // Load market data when tokenInfo is available
  useEffect(() => {
    if (tokenInfo?.token_id) {
      loadMarketData();
      refreshInteractionCounts();
      refreshLastBurn();
      refreshBurnHistory();
      loadCandlesFromAnalytics();
      refreshRecentActivity();
      refreshFeeFeed();
    }
  }, [tokenInfo]);

  // Refresh analytics every 10 minutes in addition to initial load
  useEffect(() => {
    if (!tokenInfo?.token_id) return;
    const intervalId = setInterval(() => {
      loadCandlesFromAnalytics();
    }, 10 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [tokenInfo?.token_id]);

  // When trades arrive later than initial activity fetch, backfill last buy time and add to list if needed
  useEffect(() => {
    try {
      if (!tradeData || tradeData.length === 0) return;
      const latestBuy = [...tradeData].reverse().find(t => t.side === 'buy');
      if (latestBuy) {
        const iso = new Date(latestBuy.time).toISOString();
        setLastEventTimes(prev => ({ ...prev, buy: prev.buy || iso }));
      }
      // If activity list is empty, seed with a few recent trades for visibility
      if (recentActivity.length === 0) {
        const items = [...tradeData]
          .slice(-5)
          .reverse()
          .map(t => ({ type: (t.side === 'buy' || t.side === 'sell') ? t.side : 'buy', timestamp: new Date(t.time).toISOString() } as any));
        if (items.length) setRecentActivity(items);
      }
    } catch {}
  }, [tradeData]);
  // Build candles from analytics endpoint (no separate candles endpoint needed)
  const loadCandlesFromAnalytics = async () => {
    try {
      if (!tokenInfo?.token_id) return;
      const tokenNum = parseInt(tokenInfo.token_id.split('.')[2]);
      const tokenAddress = `0x${tokenNum.toString(16).padStart(40, '0')}`;
      const base = process.env.NEXT_PUBLIC_HEDERA_API_URL || 'http://localhost:3003';
      const url = `${base}/token-analytics/${tokenAddress}`;
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) return;
      const json = await res.json();
      // Persist analytics metrics/trading to unify display with chart
      if (json?.analytics?.currentMetrics) setAnalyticsMetrics(json.analytics.currentMetrics);
      if (json?.analytics?.trading) setAnalyticsTrading({
        volume24h: Number(json.analytics.trading.volume24h || 0),
        trades24h: Number(json.analytics.trading.trades24h || 0),
        holders: Number(json.analytics.trading.holders || 0)
      });
      const candles = Array.isArray(json?.analytics?.charts?.candles) ? json.analytics.charts.candles : [];
      // Map, validate, and sort candles. Invalid OHLC values often cause the chart to look "stuck".
      const mapped = candles
        .map((k: any) => ({
          timestamp: Number(k.t ?? k.time ?? Date.now()),
          open: Number(k.o ?? k.open),
          high: Number(k.h ?? k.high),
          low: Number(k.l ?? k.low),
          close: Number(k.c ?? k.close),
          volume: Number(k.v ?? k.volume)
        }))
        .filter((c: any) => {
          const vals = [c.open, c.high, c.low, c.close];
          return vals.every((v) => Number.isFinite(v) && v > 0) && c.high >= c.low;
        })
        .sort((a: any, b: any) => (a.timestamp || 0) - (b.timestamp || 0));
      if (mapped.length) setChartData(mapped);

      // Extract real trade points for area chart (no simulation)
      const trades = Array.isArray(json?.analytics?.trades) ? json.analytics.trades : [];
      const mappedTrades = trades
        .map((t: any) => ({
          time: Number(t.time || t.tsMs || Date.now()),
          price: Number(t.price || 0),
          hbar: Number(t.hbar || 0),
          token: Number(t.token || 0),
          side: (t.side === 'buy' || t.side === 'sell') ? t.side : null,
          mc: Number(t.mc || 0)
        }))
        .filter((p: any) => Number.isFinite(p.price) && p.price > 0)
        .sort((a: any, b: any) => a.time - b.time);
      if (mappedTrades.length) setTradeData(mappedTrades);
    } catch (e) {
      // ignore chart fetch errors; UI will show placeholder
    }
  };

  // Load logo when tokenInfo is available
  useEffect(() => {
    if (tokenInfo?.extension_id) {
      loadTokenLogo(tokenInfo.extension_id);
    }
  }, [tokenInfo]);

  // Check creator status when tokenInfo is loaded
  useEffect(() => {
    if (tokenInfo && isLoggedIn) {
      checkCreatorStatus();
    }
  }, [tokenInfo, isLoggedIn]);

  // Add debug logging to help troubleshoot (dev only)
  useEffect(() => {
    devLog('Token Page State:', {
      loading,
      error,
      isLoggedIn,
      isCreator,
      tokenInfo: tokenInfo?.token_name,
      tokenId: tokenInfo?.token_id
    });
  }, [loading, error, isLoggedIn, isCreator, tokenInfo]);

  const loadTokenInfo = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/middleware/hedera/public/tokenization/${encodeURIComponent(token_name)}`
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          setTokenInfo(null);
          setPageError({ code: 'NOT_FOUND', message: 'The requested token could not be found.' });
          return;
        }
        setTokenInfo(null);
        setPageError({ code: 'GENERAL', message: 'We could not load this token right now.' });
        return;
      }
      
      const data = await response.json();
      
      if (!data.success) {
        setTokenInfo(null);
        setPageError({ code: 'GENERAL', message: 'We could not load this token right now.' });
        return;
      }
      
      setTokenInfo(data.tokenization);
      
      if (data.tokenization.extension_id) {
        try {
          const backendUrl = process.env.NEXT_PUBLIC_EXTENSION_API_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/middleware', '');
          const extResponse = await fetch(
            `${backendUrl}/middleware/hedera/extension-info/${data.tokenization.extension_id}`
          );
          
          if (extResponse.ok) {
            const extData = await extResponse.json();
            if (extData.success) {
              setExtensionInfo(extData);
            }
          }
        } catch (_) {
          // Optional info; ignore failures
        }
      }
      
    } catch (err) {
      setPageError(prev => prev || { code: 'GENERAL', message: 'We could not load this token right now.' });
    } finally {
      setLoading(false);
    }
  };

  const loadMarketData = async () => {
    if (!tokenInfo?.token_id) {
      setMarketData(getMockMarketData());
      return;
    }
    
    try {
      devLog('Loading market data for token:', tokenInfo.token_id);
      // Try HeliSwap first, fallback to custom AMM or mock data
      const data = await fetchHeliSwapData(tokenInfo.token_id);
      setMarketData(data);
    } catch (error) {
      setMarketData(getMockMarketData());
    }
  };

  const loadTokenLogo = async (extensionId: string) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/middleware/hedera/get-logo/${extensionId}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.logo_url) {
          setLogoUrl(data.logo_url);
        }
      }
    } catch (_) {
      // Missing logo is fine
    }
  };

  const refreshInteractionCounts = async () => {
    try {
      if (!tokenInfo?.token_id) return;
      const tokenId = tokenInfo.token_id;
      const resp = await fetch(`${process.env.NEXT_PUBLIC_HEDERA_API_URL || 'http://localhost:3003'}/token-interactions/${encodeURIComponent(tokenId)}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data?.success && data?.counts) {
          setInteractionCounts({ tests: Number(data.counts.tests || 0), downloads: Number(data.counts.downloads || 0) });
          // If API returns recent activity inline, capture it
          if (Array.isArray(data.recent)) {
            setRecentActivity(
              data.recent.map((r: any) => ({
                type: (r.type === 'test' || r.type === 'download' || r.type === 'buy') ? r.type : 'test',
                user: r.user,
                timestamp: r.timestamp || r.time || '',
                amount: r.amount
              }))
            );
          }
        }
      }
    } catch (e) {
      // ignore
    }
  };

  // Try to fetch recent interactions if provided by API
  const refreshRecentActivity = async (limit: number = 10) => {
    try {
      if (!tokenInfo?.token_id) return;
      const tokenId = tokenInfo.token_id;
      const base = process.env.NEXT_PUBLIC_HEDERA_API_URL || 'http://localhost:3003';

      const items: Array<{ type: 'test' | 'download' | 'buy'; user?: string; timestamp: string; amount?: number }> = [];

      // 1) From token-interactions: use lastTestAt/lastDownloadAt timestamps
      try {
        const r = await fetch(`${base}/token-interactions/${encodeURIComponent(tokenId)}`);
        if (r.ok) {
          const j = await r.json();
          const lastTestAt = j?.counts?.lastTestAt;
          const lastDownloadAt = j?.counts?.lastDownloadAt;
          if (lastTestAt) items.push({ type: 'test', timestamp: String(lastTestAt), user: undefined });
          if (lastDownloadAt) items.push({ type: 'download', timestamp: String(lastDownloadAt), user: undefined });
        }
      } catch (_) {}

      // 2) From analytics trades mapped earlier into tradeData
      try {
        const recentTrades = [...tradeData].slice(-limit).reverse();
        for (const t of recentTrades) {
          items.push({
            type: (t.side === 'buy' || t.side === 'sell') ? t.side : 'buy',
            timestamp: new Date(t.time).toISOString(),
            user: undefined,
            amount: t.hbar || t.token
          } as any);
          if (items.length >= limit) break;
        }
      } catch (_) {}

      // Sort by timestamp desc and trim to limit
      const sorted = items
        .filter(i => !!i.timestamp)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limit);
      setRecentActivity(sorted);
    } catch (_) {}
  };

  const recordInteraction = async (action: 'test' | 'download') => {
    if (!tokenInfo?.token_id) return;
    try {
      const tokenId = tokenInfo.token_id;
      const resp = await fetch(`${process.env.NEXT_PUBLIC_HEDERA_API_URL || 'http://localhost:3003'}/token-interactions/${encodeURIComponent(tokenId)}/${action}`, {
        method: 'POST'
      });
      if (resp.ok) {
        const data = await resp.json();
        if (data?.success) {
          // Update local counts
          if (action === 'test') setInteractionCounts(prev => ({ ...prev, tests: data.count || prev.tests + 1 }));
          else setInteractionCounts(prev => ({ ...prev, downloads: data.count || prev.downloads + 1 }));
          if (data.burned && data.burn?.amount) {
            toast.success(`🔥 Burned ${data.burn.amount} tokens (0.1% of supply) due to ${action} #${data.count}`);
            await refreshLastBurn();
            await refreshBurnHistory();
          }
        }
      } else {
        const text = await resp.text();
        toast.error(`Failed to record ${action}: ${resp.status} ${text || ''}`);
      }
    } catch (e) {
      toast.error(`Failed to record ${action}. Check network/API.`);
    }
  };

  const refreshLastBurn = async () => {
    try {
      if (!tokenInfo?.token_id) return;
      const tokenId = tokenInfo.token_id;
      const resp = await fetch(`${process.env.NEXT_PUBLIC_HEDERA_API_URL || 'http://localhost:3003'}/token-burns/${encodeURIComponent(tokenId)}?limit=1`);
      if (resp.ok) {
        const data = await resp.json();
        if (data?.success && Array.isArray(data.burns) && data.burns.length > 0) {
          const b = data.burns[0];
          setLastBurn({ time: b.createdAt, reason: `${b.reasonAction} #${b.interactionCountAt}`, status: b.status, txId: b.txId, consensusTimestamp: b.consensusTimestamp });
        } else {
          setLastBurn(null);
        }
      }
    } catch (e) {
      // ignore
    }
  };

  const refreshBurnHistory = async (limit: number = 50) => {
    try {
      if (!tokenInfo?.token_id) return;
      setBurnHistoryLoading(true);
      const tokenId = tokenInfo.token_id;
      const resp = await fetch(`${process.env.NEXT_PUBLIC_HEDERA_API_URL || 'http://localhost:3003'}/token-burns/${encodeURIComponent(tokenId)}?limit=${Math.max(1, Math.min(50, limit))}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data?.success && Array.isArray(data.burns)) {
          setBurnHistory(data.burns);
        } else {
          setBurnHistory([]);
        }
      } else {
        setBurnHistory([]);
      }
    } catch (_) {
      setBurnHistory([]);
    } finally {
      setBurnHistoryLoading(false);
    }
  };

  const checkUserAuth = async () => {
    try {
      // Get user info from cookie using the same method as other pages
      const { getUserFromCookie } = await import('@/lib/cookie-utils');
      const { getStoredToken } = await import('@/lib/auth-utils');
      const userData = getUserFromCookie();
      
      if (!userData) {
        setIsLoggedIn(false);
        setIsCreator(false);
        return;
      }

      // Check for valid ID token
      const idToken = userData.idToken || getStoredToken();
      if (!idToken) {
        setIsLoggedIn(false);
        setIsCreator(false);
        return;
      }

      setIsLoggedIn(true);
      setUserWallet(userData.uid || '0.0.1234567'); // Use real user ID
      
      // Get user's token balance (mock for now)
      setUserBalance(5420.5);
      
    } catch (_) {
      setIsLoggedIn(false);
      setIsCreator(false);
    }
  };

  const checkCreatorStatus = async () => {
    try {
      if (!tokenInfo || !isLoggedIn) {
        setIsCreator(false);
        return;
      }

      // Use the proper backend endpoint to check if user is creator
      const { authenticatedFetch } = await import('@/lib/api-utils');
      
      const response = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/middleware/hedera/check-token-creator/${tokenInfo.token_id}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const isUserCreator = data.success && data.is_creator === true;
        
        setIsCreator(isUserCreator);
        devLog('Creator check result:', { isUserCreator });
      } else {
        setIsCreator(false);
        devLog('Creator check failed');
      }
      
    } catch (_) {
      setIsCreator(false);
    }
  };

  // If creator, auto-use stored creator wallet and show balance without prompting connect
  useEffect(() => {
    try {
      if (isCreator && tokenInfo?.creator_wallet) {
        if (connectedWallet !== tokenInfo.creator_wallet) {
          setConnectedWallet(tokenInfo.creator_wallet);
        }
        setUserWallet(tokenInfo.creator_wallet);
        refreshUserTokenBalance(tokenInfo.creator_wallet);
        setShowWalletModal(false);
      }
    } catch {}
  }, [isCreator, tokenInfo?.creator_wallet]);

  const copyToClipboard = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedStates(prev => ({ ...prev, [key]: true }));
      toast.success('Copied to clipboard!');
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [key]: false }));
      }, 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown';
    }
  };

    const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Token amount formatting helpers (convert base units → human display)
  const getTokenDecimals = () => {
    const d = (marketData as any)?.heliswap?.tokenInfo?.decimals;
    return Number.isFinite(Number(d)) ? Number(d) : 8;
  };
  const formatTokenAmountUnits = (baseUnits?: number | string, minFrac: number = 2, maxFrac: number = 6) => {
    if (baseUnits === undefined || baseUnits === null) return '—';
    const n = Number(baseUnits);
    if (!Number.isFinite(n)) return '—';
    const decimals = getTokenDecimals();
    const value = n / Math.pow(10, decimals);
    return value.toLocaleString(undefined, { minimumFractionDigits: minFrac, maximumFractionDigits: maxFrac });
  };

  // Enhanced trading functions with HeliSwap integration
  const estimateTradePrice = async (amount: string, direction: 'buy' | 'sell' = 'buy') => {
    if (!tokenInfo?.token_id || !amount || parseFloat(amount) <= 0) {
      setEstimatedPrice('0');
      return;
    }

    try {
      const tokenNum = parseInt(tokenInfo.token_id.split('.')[2]);
      const tokenAddress = `0x${tokenNum.toString(16).padStart(40, '0')}`;
      
      // Try HeliSwap quote first for better pricing
      if (marketData?.heliswap) {
        devLog('Getting HeliSwap quote');
        
        // Convert amount based on direction
        const amountInWei = direction === 'buy' 
          ? ethers.parseUnits(amount, 8).toString() // HBAR amount
          : ethers.parseUnits(amount, marketData.heliswap.tokenInfo?.decimals || 8).toString(); // Token amount
        
        const quoteResponse = await fetch(
          `${process.env.NEXT_PUBLIC_HEDERA_API_URL || 'http://localhost:3003'}/heliswap-quote/${tokenAddress}/${amountInWei}/${direction}?slippage=5`
        );
        
        if (quoteResponse.ok) {
          const quoteData = await quoteResponse.json();
          
          if (quoteData.success) {
            const quote = quoteData.quote;
            if (direction === 'buy') {
              // Buying tokens with HBAR - show token amount we'll get
              const tokensOut = ethers.formatUnits(quote.amountOut, marketData.heliswap.tokenInfo?.decimals || 8);
              setEstimatedPrice(tokensOut);
            } else {
              // Selling tokens for HBAR - show HBAR amount we'll get
              const hbarOut = ethers.formatUnits(quote.amountOut, 8);
              setEstimatedPrice(hbarOut);
            }
            return;
          }
        }
      }
      
      // Fallback to custom AMM pricing
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HEDERA_API_URL || 'http://localhost:3003'}/custom-price/${tokenAddress}/${amount}`
      );
      const data = await response.json();
      
      if (data.success) {
        setEstimatedPrice(data.priceInHbar);
      } else {
        setEstimatedPrice('0');
      }
    } catch (_) {
      setEstimatedPrice('0');
    }
  };

  const handleTrade = async (direction: 'buy' | 'sell' = 'buy') => {
    setTradeError('');
    if (!tradeAmount || parseFloat(tradeAmount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!tokenInfo?.token_id) {
      toast.error('Token information not available');
      return;
    }

    setTradeLoading(true);
    try {
      const tokenNum = parseInt(tokenInfo.token_id.split('.')[2]);
      const tokenAddress = `0x${tokenNum.toString(16).padStart(40, '0')}`;
      
      // Pre-check association for buy direction (only when a valid Hedera ID is connected)
      const isValidHederaId = (id: string) => /^\d+\.\d+\.\d+$/.test(id);
      const activeAccountId = hcAccountId && isValidHederaId(hcAccountId) ? hcAccountId : connectedWallet;
      if (direction === 'buy' && activeAccountId && isValidHederaId(activeAccountId)) {
        try {
          const accountId = activeAccountId;
          const checkResp = await fetch(`${process.env.NEXT_PUBLIC_HEDERA_API_URL || 'http://localhost:3003'}/check-association/${tokenAddress}/${encodeURIComponent(accountId)}`);
          if (checkResp.ok) {
            const checkData = await checkResp.json();
            if (checkData.success && checkData.associated === false) {
              setTradeError('Your account is not associated with this token. Please associate in your wallet, then retry.');
              setNeedsAssociation(true);
              setTradeLoading(false);
              return;
            }
            setNeedsAssociation(false);
          }
        } catch (e) {
          // Non-fatal; proceed
          setNeedsAssociation(false);
        }
      }
      
      // Execute real HeliSwap trading 
      devLog('Executing trade');
      
      // Show wallet connection prompt if not connected
      if (!(hcAccountId || connectedWallet) || connectedWallet === '0.0.1234567') {
        devLog('No wallet connected, prompting');
        setPendingTrade(true); // Remember that user was trying to trade
        setShowTradeModal(false); // Close trade modal first to avoid layering issues
        setShowWalletModal(true);
        setTradeLoading(false); // Reset loading state
        return;
      }
      
      // Execute trade via HeliSwap
      const success = await executeHeliSwapTrade(direction, tradeAmount, tokenAddress);
      
      // Only close modal if trade was successful
      if (success) {
        setShowTradeModal(false);
        setTradeAmount('');
        setTradeError('');
      }
    } catch (error) {
      setTradeError('Transaction failed. Please try again.');
      toast.error('Failed to prepare trade');
    } finally {
      setTradeLoading(false);
    }
  };

  // Enhanced price estimation with direction support
  useEffect(() => {
    if (tradeAmount) {
      const timeoutId = setTimeout(() => {
        estimateTradePrice(tradeAmount, tradeDirection);
      }, 500); // Debounce for 500ms
      
      return () => clearTimeout(timeoutId);
    } else {
      setEstimatedPrice('0');
    }
  }, [tradeAmount, tradeDirection, tokenInfo, marketData]);

  // Real-time updates for token page
  useEffect(() => {
    if (!tokenInfo?.token_id) return;
    
    const interval = setInterval(() => {
      devLog('Refreshing market data');
      loadMarketData();
      setLastUpdate(Date.now());
    }, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [tokenInfo]);

  // Real HeliSwap trading function
  const executeHeliSwapTrade = async (direction: 'buy' | 'sell', amount: string, tokenAddress: string): Promise<boolean> => {
    try {
      devLog('Submitting trade request');
      
      // Resolve recipient AccountId and EVM address for robust server-side checks
      const MIRROR_URL = process.env.NEXT_PUBLIC_HEDERA_MIRROR_URL || 'https://testnet.mirrornode.hedera.com';
      const isHederaId = (id: string) => /^\d+\.\d+\.\d+$/.test(id);
      const normalizeEvm = (addr: string) => {
        try { return ethers.getAddress(addr); } catch { return undefined; }
      };
      const resolveEvmFromAccountId = async (accountId?: string): Promise<string | undefined> => {
        if (!accountId) return undefined;
        try {
          const r = await fetch(`${MIRROR_URL}/api/v1/accounts/${encodeURIComponent(accountId)}`);
          if (!r.ok) return undefined;
          const data = await r.json();
          return data?.evm_address ? normalizeEvm(data.evm_address) : undefined;
        } catch {
          return undefined;
        }
      };
      const resolveAccountIdFromEvm = async (evm?: string): Promise<string | undefined> => {
        if (!evm) return undefined;
        try {
          const r = await fetch(`${MIRROR_URL}/api/v1/accounts?evm_address=${encodeURIComponent(evm)}`);
          if (!r.ok) return undefined;
          const data = await r.json();
          return data?.accounts?.[0]?.account;
        } catch {
          return undefined;
        }
      };
      const inputAddr = (hcAccountId || connectedWallet || userWallet) || '';
      let recipientAccountId: string | undefined;
      let recipientEvmAddress: string | undefined;
      if (inputAddr.startsWith('0x')) {
        recipientEvmAddress = normalizeEvm(inputAddr);
        recipientAccountId = await resolveAccountIdFromEvm(recipientEvmAddress);
      } else if (isHederaId(inputAddr)) {
        recipientAccountId = inputAddr;
        recipientEvmAddress = await resolveEvmFromAccountId(inputAddr);
      }

      const endpoint = direction === 'buy' ? '/custom-buy' : '/custom-sell';
      const payload = direction === 'buy' 
        ? {
            tokenAddress,
            hbarAmount: amount,
            // Let backend compute minTokens from slippage unless user overrides
            slippage,
            userAddress: (hcAccountId || connectedWallet || userWallet),
            recipientAccountId,
            recipientEvmAddress
          }
        : {
            tokenAddress,
            tokenAmount: amount,
            slippage,
            userAddress: (hcAccountId || connectedWallet || userWallet),
            recipientAccountId,
            recipientEvmAddress
          };

      devLog('Sending trade request');

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_HEDERA_API_URL || 'http://localhost:3003'}${endpoint}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        }
      );

      const result = await response.json();
      
      if (result.success) {
        toast.success(
          `✅ ${direction === 'buy' ? 'Purchase' : 'Sale'} successful!\\n\\nTx: ${result.transaction.hash.substring(0, 10)}...`,
          { duration: 6000 }
        );
        
        // Refresh market data immediately
        setTimeout(() => {
          loadMarketData();
          setLastUpdate(Date.now());
        }, 2000);
        
        return true; // Success
      } else {
        setTradeError(result.message || result.error || 'Transaction failed. Please try again.');
        toast.error(`❌ Trade failed: ${result.error || result.message || 'Unknown error'}`);
        return false; // Failure
      }
    } catch (error) {
      setTradeError('Transaction failed. Please try again.');
      toast.error('❌ Trade execution failed. Please try again.');
      return false; // Failure
    }
  };

  const handleAssociateAndAutoBuy = async () => {
    try {
      if (!connectedWallet || !tokenInfo?.token_id || !tradeAmount || parseFloat(tradeAmount) <= 0) return;
      setAutoAssociating(true);
      setTradeError('');
      const tokenNum = parseInt(tokenInfo.token_id.split('.')[2]);
      const tokenAddress = `0x${tokenNum.toString(16).padStart(40, '0')}`;
      // Open HashPack association page
      const url = `https://hashpack.app/dapp?network=${process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet'}&action=associate&tokenId=${encodeURIComponent(tokenInfo.token_id)}&accountId=${encodeURIComponent(connectedWallet)}`;
      window.open(url, '_blank');
      // Poll association status
      const maxAttempts = 60; // ~2 minutes
      const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
      for (let i = 0; i < maxAttempts; i++) {
        try {
          const resp = await fetch(`${process.env.NEXT_PUBLIC_HEDERA_API_URL || 'http://localhost:3003'}/check-association/${tokenAddress}/${encodeURIComponent(connectedWallet)}`);
          if (resp.ok) {
            const data = await resp.json();
            if (data?.success && data?.associated) {
              setNeedsAssociation(false);
              // Auto-continue buy
              const success = await executeHeliSwapTrade('buy', tradeAmount, tokenAddress);
              setAutoAssociating(false);
              return success;
            }
          }
        } catch (_) {}
        await delay(2000);
      }
      setTradeError('Association not detected yet. Please complete it in your wallet and try again.');
    } finally {
      setAutoAssociating(false);
    }
  };

  const handleAssociateViaHashConnect = async () => {
    try {
      setTradeError('');
      if (!tokenInfo?.token_id) return;
      if (!hcAvailable) {
        // Fallback: open HashPack association tab and rely on polling flow
        const url = `https://hashpack.app/dapp?network=${process.env.NEXT_PUBLIC_HEDERA_NETWORK || 'testnet'}&action=associate&tokenId=${encodeURIComponent(tokenInfo.token_id)}&accountId=${encodeURIComponent(connectedWallet || '')}`;
        window.open(url, '_blank');
        setTradeError('Opened HashPack to associate. Return here; we will auto-run the buy once detected.');
        await handleAssociateAndAutoBuy();
        return;
      }
      if (!hcPaired) {
        await hcConnect();
      }
      await associateToken(tokenInfo.token_id);
      const tokenNum = parseInt(tokenInfo.token_id.split('.')[2]);
      const tokenAddress = `0x${tokenNum.toString(16).padStart(40, '0')}`;
      const success = await executeHeliSwapTrade('buy', tradeAmount, tokenAddress);
      if (!success) {
        setTradeError('Buy failed after association. Please try again.');
      }
    } catch (e: any) {
      setTradeError(e?.message || 'Association failed. Please try again.');
    }
  };

  // Wallet connection functions
  const connectWallet = async (walletAddress: string) => {
    try {
      devLog('Connecting wallet');
      setConnectedWallet(walletAddress);
      setUserWallet(walletAddress);
      // If user provided an EVM address, store it; if Hedera ID, try to resolve EVM for downstream payloads
      const MIRROR_URL = process.env.NEXT_PUBLIC_HEDERA_MIRROR_URL || 'https://testnet.mirrornode.hedera.com';
      const isHederaId = (id: string) => /^\d+\.\d+\.\d+$/.test(id);
      const normalizeEvm = (addr: string) => { try { return ethers.getAddress(addr); } catch { return ''; } };
      if (walletAddress?.startsWith('0x')) {
        setConnectedEvm(normalizeEvm(walletAddress));
      } else if (isHederaId(walletAddress)) {
        try {
          const r = await fetch(`${MIRROR_URL}/api/v1/accounts/${encodeURIComponent(walletAddress)}`);
          if (r.ok) {
            const data = await r.json();
            if (data?.evm_address) setConnectedEvm(normalizeEvm(data.evm_address));
          }
        } catch {}
      }

      // Persist short-lived session (60 min)
      try {
        const session = { accountId: walletAddress, evm: (walletAddress?.startsWith('0x') ? normalizeEvm(walletAddress) : connectedEvm), savedAt: Date.now() };
        localStorage.setItem('walletSession', JSON.stringify(session));
      } catch {}
      
      // Get wallet balance (mock for now - would use HashConnect in production)
      await refreshUserTokenBalance(walletAddress);
      
      toast.success(`🔗 Wallet connected: ${walletAddress}`);
      setShowWalletModal(false);
      
      // Reopen trade modal if user was trying to trade
      if (pendingTrade) {
        devLog('Reopening trade modal after wallet connection');
        setPendingTrade(false); // Reset the flag
        setTimeout(() => {
          setShowTradeModal(true);
        }, 500); // Small delay for smooth UX
      }
      
      devLog('Wallet connected successfully');
    } catch (_) {
      toast.error('Failed to connect wallet');
    }
  };

  const disconnectWallet = () => {
    setConnectedWallet('');
    setWalletBalance('0');
    toast.success('Wallet disconnected');
    try { localStorage.removeItem('walletSession'); } catch {}
  };

  const handleRunExtension = async () => {
    await recordInteraction('test');
    toast.success('Opening extension in playground...');
  };

  const handleDownload = async () => {
    if (!isLoggedIn) {
      toast.error('Please login to download');
      return;
    }
    await recordInteraction('download');
    window.open(tokenInfo?.extension_link, '_blank');
  };

  // Share current token page URL
  const handleShareLink = async () => {
    try {
      const baseUrl = (process.env.NEXT_PUBLIC_FRONTEND_URL && process.env.NEXT_PUBLIC_FRONTEND_URL.trim().length > 0)
        ? process.env.NEXT_PUBLIC_FRONTEND_URL
        : 'https://www.codease.pro';
      const url = `${baseUrl}/token/${encodeURIComponent(token_name)}`;
      await navigator.clipboard.writeText(url);
      toast.success('Share link copied');
    } catch (_) {
      toast.error('Failed to copy link');
    }
  };

  // Notification Center: fee transfers to creator (reads HCS feed exposed by server)
  const refreshFeeFeed = async (limit: number = 20) => {
    try {
      if (!tokenInfo?.token_id) return;
      setFeeFeedLoading(true);
      const tokenNum = parseInt(tokenInfo.token_id.split('.')[2]);
      const tokenAddress = `0x${tokenNum.toString(16).padStart(40, '0')}`;
      const base = process.env.NEXT_PUBLIC_HEDERA_API_URL || 'http://localhost:3003';
      const r = await fetch(`${base}/token-fees/${tokenAddress}?limit=${limit}`);
      if (r.ok) {
        const j = await r.json();
        const list = Array.isArray(j?.recent) ? j.recent : [];
        setFeeFeed(list);
      } else {
        setFeeFeed([]);
      }
    } catch (_) {
      setFeeFeed([]);
    } finally {
      setFeeFeedLoading(false);
    }
  };

  // Save creator socials to middleware
  const handleSaveSocials = async () => {
    if (!tokenInfo?.token_id) return;
    try {
      setSavingSocials(true);
      const { authenticatedFetch } = await import('@/lib/api-utils');
      const resp = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/middleware/hedera/update-socials/${encodeURIComponent(tokenInfo.token_id)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            twitter: socialInputs.twitter,
            telegram: socialInputs.telegram,
            discord: socialInputs.discord
          })
        }
      );
      const data = await resp.json();
      if (resp.ok && data?.success) {
        toast.success('Social links updated');
        setTokenInfo({ ...(tokenInfo as any), social_links: data.social_links });
      } else {
        toast.error(data?.message || 'Failed to update socials');
      }
    } catch (e) {
      toast.error('Failed to update socials');
    } finally {
      setSavingSocials(false);
    }
  };

  // Helper: refresh user's balance for this token from API
  const refreshUserTokenBalance = async (accountOrEvm?: string) => {
    try {
      const acct = accountOrEvm || connectedWallet || connectedEvm;
      if (!acct || !tokenInfo?.token_id) return;
      const tokenNum = parseInt(tokenInfo.token_id.split('.')[2]);
      const tokenAddress = `0x${tokenNum.toString(16).padStart(40, '0')}`;
      const resp = await fetch(`${process.env.NEXT_PUBLIC_HEDERA_API_URL || 'http://localhost:3003'}/token-balance/${tokenAddress}/${encodeURIComponent(acct)}`);
      if (resp.ok) {
        const data = await resp.json();
        if (data?.success) {
          const bal = Number(data.balance) / Math.pow(10, data.decimals || 8);
          setUserBalance(bal);
        }
      }
    } catch {}
  };

  const handleBuy = () => {
    if (!isLoggedIn) {
      toast.error('Please login to buy tokens');
      return;
    }
    setShowTradeModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
          <p className="text-gray-300">Loading token information...</p>
        </div>
      </div>
    );
  }

  if (pageError?.code === 'NOT_FOUND' || (!tokenInfo && (pageError || error))) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Token Not Found</h1>
          <p className="text-gray-400 mb-6">{pageError?.message || 'The requested token could not be found.'}</p>
          <Link 
            href="/"
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Globe className="w-4 h-4 mr-2" />
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  if (pageError?.code === 'GENERAL') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <AlertCircle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">We’re having trouble</h1>
          <p className="text-gray-400 mb-6">{pageError.message || 'Please try again in a moment.'}</p>
          <button
            onClick={() => {
              setPageError(null);
              setLoading(true);
              loadTokenInfo().finally(() => setLoading(false));
            }}
            className="inline-flex items-center px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      {tokenInfo && (
        <TokenHeader
          tokenName={tokenInfo.token_name}
          tokenSymbol={tokenInfo.token_symbol}
          status={tokenInfo.status}
          logoUrl={logoUrl}
          onBuyClick={handleBuy}
          isLoggedIn={isLoggedIn}
          connectedWallet={connectedWallet}
          userBalance={userBalance}
          tokenDisplaySymbol={tokenInfo.token_symbol || tokenInfo.token_name}
          onDisconnect={disconnectWallet}
          onOpenWallet={() => setShowWalletModal(true)}
        />
      )}

      {/* Main Content */}
      <div className="max-w-full px-6 py-6">
        {/* Share button (visible in both creator and non-creator views) */}
        <div className="flex justify-end mb-2">
          <button
            onClick={handleShareLink}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-800/60 hover:bg-gray-700/70 border border-gray-700/60 text-gray-200 text-sm"
            title="Copy share link"
          >
            <Copy className="w-4 h-4" />
            Share
          </button>
        </div>
        {isCreator && isLoggedIn ? (
          // Creator Dashboard
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Stats Overview */}
            <div className="xl:col-span-1">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  Creator Analytics
                </h2>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-white">{interactionCounts.tests}</div>
                    <div className="text-sm text-gray-400 flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      Total Tests
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-white">{interactionCounts.downloads}</div>
                    <div className="text-sm text-gray-400 flex items-center gap-1">
                      <Download className="w-4 h-4" />
                      Downloads
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">{marketData?.holders}</div>
                    <div className="text-sm text-gray-400">Token Holders</div>
                  </div>

                  {/* Creator wallet and balance */}
                  {connectedWallet && (
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="text-sm text-gray-400">Creator Wallet</div>
                      <div className="text-white font-mono text-sm break-all">{connectedWallet}</div>
                      <div className="text-sm text-gray-400 mt-2">Your Balance</div>
                      <div className="text-emerald-300 font-semibold">
                        {userBalance.toLocaleString(undefined, { maximumFractionDigits: 4 })} {tokenInfo?.token_symbol}
                      </div>
                    </div>
                  )}
                </div>


                <button className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
                  <Settings className="w-4 h-4" />
                  Manage Token
                </button>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
                {/* Last event summary */}
                <div className="mb-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-gray-300">
                  <div className="bg-gray-800/40 border border-gray-700/40 rounded p-2">
                    <div className="text-gray-400">Last Tested</div>
                    <div>{lastEventTimes.test ? new Date(lastEventTimes.test).toLocaleString() : '—'}</div>
                  </div>
                  <div className="bg-gray-800/40 border border-gray-700/40 rounded p-2">
                    <div className="text-gray-400">Last Download</div>
                    <div>{lastEventTimes.download ? new Date(lastEventTimes.download).toLocaleString() : '—'}</div>
                  </div>
                  <div className="bg-gray-800/40 border border-gray-700/40 rounded p-2">
                    <div className="text-gray-400">Last Buy</div>
                    <div>{lastEventTimes.buy ? new Date(lastEventTimes.buy).toLocaleString() : '—'}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  {recentActivity.length === 0 && (
                    <div className="text-gray-400 text-sm">No recent activity</div>
                  )}
                  {recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        {activity.type === 'test' && <Eye className="w-4 h-4 text-blue-400" />}
                        {activity.type === 'download' && <Download className="w-4 h-4 text-green-400" />}
                        {activity.type === 'buy' && <ShoppingCart className="w-4 h-4 text-purple-400" />}
                        <span className="text-gray-300">
                          {activity.type === 'test' ? 'Tested' : activity.type === 'download' ? 'Downloaded' : 'Bought'}
                        </span>
                      </div>
                      <span className="text-gray-400">{activity.timestamp ? new Date(activity.timestamp).toLocaleString() : '—'}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Prompt to add socials if missing – moved below Recent Activity */}
              {isCreator && tokenInfo && (!tokenInfo.social_links || (!tokenInfo.social_links.twitter && !tokenInfo.social_links.telegram && !tokenInfo.social_links.discord)) && (
                <div className="bg-blue-900/10 border border-blue-800/30 rounded-xl p-4 mt-6">
                  <div className="text-sm text-blue-200 mb-3">Add your community links so users can follow and verify you:</div>
                  <div className="grid grid-cols-1 gap-3">
                    <input
                      placeholder="X (Twitter) URL"
                      className="px-3 py-2 rounded bg-gray-800/60 border border-gray-700/60 text-sm text-gray-200"
                      value={socialInputs.twitter || ''}
                      onChange={(e) => setSocialInputs(prev => ({ ...prev, twitter: e.target.value }))}
                    />
                    <input
                      placeholder="Telegram URL"
                      className="px-3 py-2 rounded bg-gray-800/60 border border-gray-700/60 text-sm text-gray-200"
                      value={socialInputs.telegram || ''}
                      onChange={(e) => setSocialInputs(prev => ({ ...prev, telegram: e.target.value }))}
                    />
                    <input
                      placeholder="Discord URL"
                      className="px-3 py-2 rounded bg-gray-800/60 border border-gray-700/60 text-sm text-gray-200"
                      value={socialInputs.discord || ''}
                      onChange={(e) => setSocialInputs(prev => ({ ...prev, discord: e.target.value }))}
                    />
                    <button
                      onClick={handleSaveSocials}
                      disabled={savingSocials}
                      className="mt-1 inline-flex items-center justify-center px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm disabled:opacity-50"
                    >
                      {savingSocials ? 'Saving…' : 'Save Links'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Chart and Market Data */}
            <div className="xl:col-span-3">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Price Chart (same as public view) */}
                <div className="lg:col-span-2 bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <LineChart className="w-5 h-5 text-green-400" />
                      Price Chart
                    </h2>
                    <div className="flex items-center gap-2 text-lg font-bold">
                      <span className="text-white">
                        {(() => {
                          const p = analyticsMetrics?.price;
                          if (Number.isFinite(p)) return `${Number(p).toFixed(6)} HBAR`;
                          if (marketData?.heliswap) return `${parseFloat(marketData.heliswap.pricing.currentPrice).toFixed(6)} HBAR`;
                          if (marketData?.customAmm?.priceInfo?.currentPrice) return `${marketData.customAmm.priceInfo.currentPrice} HBAR`;
                          return marketData?.price ? `$${marketData.price.toFixed(4)}` : '—';
                        })()}
                      </span>
                      <span className={`flex items-center gap-1 text-sm ${marketData && marketData.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {marketData && marketData.priceChange24h >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {Math.abs(marketData?.priceChange24h || 0)}%
                      </span>
                    </div>
                  </div>
                  <div className="h-64 bg-gray-800/30 rounded-lg border border-gray-700/50 overflow-hidden">
                    <AreaChart
                      points={(tradeData.length ? tradeData : chartData.map(d => ({ time: d.timestamp, price: d.close })))}
                      symbol={tokenInfo?.token_symbol || ''}
                      marketCapLatest={(analyticsMetrics?.marketCap as number) || marketData?.marketCap}
                    />
                  </div>
                </div>
              </div>

              {/* Market Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                  <div className="text-lg font-bold text-white">${formatNumber(marketData?.marketCap || 0)}</div>
                  <div className="text-sm text-gray-400">Market Cap</div>
                </div>
                
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                  <div className="text-lg font-bold text-white">${formatNumber(marketData?.volume24h || 0)}</div>
                  <div className="text-sm text-gray-400 flex items-center gap-1">
                    <Volume2 className="w-3 h-3" />
                    24h Volume
                  </div>
                </div>
                
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                  <div className="text-lg font-bold text-white">${formatNumber(marketData?.liquidity || 0)}</div>
                  <div className="text-sm text-gray-400 flex items-center gap-1">
                    <Droplets className="w-3 h-3" />
                    Liquidity
                  </div>
                </div>
                
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-4">
                  <div className="text-lg font-bold text-white">{formatNumber(marketData?.totalTrades || 0)}</div>
                  <div className="text-sm text-gray-400 flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Total Trades
                  </div>
                </div>
              </div>

              {/* Notification Center: Creator Fee Transfers */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mt-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-white">Notification Center</h3>
                  <button
                    onClick={() => refreshFeeFeed()}
                    className="text-xs px-2 py-1 rounded bg-gray-800 hover:bg-gray-700 text-gray-200"
                    disabled={feeFeedLoading}
                  >
                    {feeFeedLoading ? 'Refreshing…' : 'Refresh'}
                  </button>
                </div>
                <div className="text-sm text-gray-300">Fee transfers credited to your account. Payouts, if any, occur hourly.</div>
                <div className="mt-3 max-h-60 overflow-y-auto divide-y divide-gray-800/70">
                  {feeFeed.length === 0 && (
                    <div className="text-gray-400 text-sm">No fee transfers yet</div>
                  )}
                  {feeFeed.map((e, idx) => {
                    const t = e.timestamp ? new Date(e.timestamp).toLocaleString() : 'Unknown';
                    const tokensBase = typeof e.creatorTokens === 'number' ? e.creatorTokens : e.tokenDelta;
                    return (
                      <div key={idx} className="py-2 flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                          <span className="text-gray-200">You received {formatTokenAmountUnits(tokensBase)} {tokenInfo?.token_symbol}</span>
                          <span className="text-xs text-gray-400">{t}</span>
                        </div>
                        {e.tx?.distributionTxId && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-gray-700/60 text-gray-200">{e.tx.distributionTxId}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Regular User/Public View
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Left Sidebar - Market Stats */}
            <div className="xl:col-span-1 order-2 xl:order-1">
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  Market Stats
                </h2>
                
                {/* Mobile: Grid layout for stats, Desktop: Stacked */}
                <div className="grid grid-cols-2 xl:grid-cols-1 gap-3 xl:gap-4">
                  <div className="p-3 xl:p-4 bg-gray-800/50 rounded-lg col-span-2 xl:col-span-1">
                    <div className="text-lg xl:text-xl font-bold text-white">
                      {(() => {
                        const p = analyticsMetrics?.price;
                        if (Number.isFinite(p)) return `${Number(p).toFixed(6)} HBAR`;
                        if (marketData?.heliswap) return `${parseFloat(marketData.heliswap.pricing.currentPrice).toFixed(6)} HBAR`;
                        if (marketData?.customAmm?.priceInfo?.currentPrice) return `${marketData.customAmm.priceInfo.currentPrice} HBAR`;
                        return marketData?.price ? `$${marketData.price.toFixed(4)}` : '—';
                      })()}
                    </div>
                    <div className="text-sm text-gray-400">Price per Token</div>
                    <div className="text-sm text-gray-500 mt-1">
                      {(() => {
                        const usd = (analyticsMetrics as any)?.priceInUsd;
                        if (Number.isFinite(usd)) return `$${Number(usd).toFixed(6)} USD`;
                        if (marketData?.heliswap?.pricing?.priceInUsd) return `$${parseFloat(marketData.heliswap.pricing.priceInUsd).toFixed(6)} USD`;
                        return marketData?.customAmm?.priceInfo?.currentPrice ? 'Current Rate' : 'Market Price';
                      })()}
                    </div>
                    <div className={`text-sm flex items-center gap-1 mt-1 ${marketData && marketData.priceChange24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {marketData && marketData.priceChange24h >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {Math.abs(marketData?.priceChange24h || 0)}% (24h)
                    </div>
                  </div>
                  
                  <div className="p-3 xl:p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-lg xl:text-xl font-bold text-white">${formatNumber(((analyticsMetrics?.marketCap as number) || marketData?.marketCap || 0))}</div>
                    <div className="text-sm text-gray-400">Market Cap</div>
                  </div>
                  
                  <div className="p-3 xl:p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-lg xl:text-xl font-bold text-white">${formatNumber(((analyticsTrading?.volume24h as number) || marketData?.volume24h || 0))}</div>
                    <div className="text-sm text-gray-400">24h Volume</div>
                  </div>
                  
                  <div className="p-3 xl:p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-lg xl:text-xl font-bold text-white">${formatNumber(((analyticsMetrics?.liquidity as number) || marketData?.liquidity || 0))}</div>
                    <div className="text-sm text-gray-400">Liquidity</div>
                  </div>
                  
                  <div className="p-3 xl:p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-lg xl:text-xl font-bold text-white">{formatNumber(((analyticsTrading?.holders as number) || marketData?.holders || 0))}</div>
                    <div className="text-sm text-gray-400">Holders</div>
                  </div>
                </div>
              </div>

              {/* Custom DEX Pool Info */}
              {marketData?.heliswap && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-blue-400" />
                    Custom DEX Pool
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

                    {/* Current Price removed to avoid duplication with top stats */}

                    {/* Pool Reserves */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <div className="text-lg font-bold text-white break-words">
                          {formatNumber(parseFloat(marketData.heliswap.reserves.tokenReserve))}
                        </div>
                        <div className="text-sm text-gray-400">Token Reserve</div>
                      </div>
                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <div className="text-lg font-bold text-white break-words">
                          {parseFloat(marketData.heliswap.reserves.whbarReserve).toFixed(2)} HBAR
                        </div>
                        <div className="text-sm text-gray-400">HBAR Reserve</div>
                      </div>
                    </div>

                    {/* Pool Details */}
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="text-sm font-medium text-white mb-2">Pool Details</div>
                      <div className="space-y-3 text-sm">
                        <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                          <span className="text-gray-400">Pair Address:</span>
                          <span className="text-white font-mono text-xs break-all sm:text-right">
                            {marketData.heliswap.pairAddress.length > 20 
                              ? `${marketData.heliswap.pairAddress.slice(0, 10)}...${marketData.heliswap.pairAddress.slice(-10)}`
                              : marketData.heliswap.pairAddress
                            }
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">LP Supply:</span>
                          <span className="text-white">{formatNumber(parseFloat(marketData.heliswap.reserves.totalSupply))}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Trading Fee:</span>
                          <span className="text-white">0.3%</span>
                        </div>
                      </div>
                    </div>

                    {/* Custom Pool Info (kept, but without external CTA) */}
                    <div className="p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg">
                      <div className="text-sm font-medium text-blue-400">Custom Bonding Curve Enabled</div>
                      <div className="text-xs text-gray-400">On maturity (10K MC) migration to all public DEX's</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Custom AMM / Bonding Curve Info */}
              {marketData?.customAmm && (
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mt-6">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-orange-400" />
                    Bonding Curve AMM
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Pool Status */}
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Status</span>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${marketData.customAmm.status.tradingActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                          <span className="text-white">
                            {marketData.customAmm.status.isGraduated ? 'Graduated' : 
                             marketData.customAmm.status.tradingActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Current Price */}
                    {marketData.customAmm.priceInfo && (
                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        {/* Remove duplicated price per token; keep only extra detail */}
                        <div className="text-sm text-gray-500 mt-1">
                          1000 tokens = {marketData.customAmm.priceInfo.priceFor1000Tokens} HBAR
                        </div>
                      </div>
                    )}

                    {/* Pool Reserves */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <div className="text-lg font-bold text-white break-words">
                          {formatNumber(parseFloat(marketData.customAmm.reserves.tokenReserve || '0'))}
                        </div>
                        <div className="text-sm text-gray-400">Token Reserve</div>
                      </div>
                      <div className="p-4 bg-gray-800/50 rounded-lg">
                        <div className="text-lg font-bold text-white break-words">
                          {parseFloat(marketData.customAmm.reserves.hbarReserve || '0').toFixed(2)} HBAR
                        </div>
                        <div className="text-sm text-gray-400">HBAR Reserve</div>
                      </div>
                    </div>

                    {/* Bonding Curve Parameters */}
                    <div className="p-4 bg-gray-800/50 rounded-lg">
                      <div className="text-sm font-medium text-white mb-2">Bonding Curve Details</div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <span className="text-gray-400">Start Price:</span>
                          <span className="text-white break-words">{parseFloat(marketData.customAmm.poolInfo.startPrice || '0') / 1e18} HBAR</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <span className="text-gray-400">Price Slope:</span>
                          <span className="text-white break-words">{parseFloat(marketData.customAmm.poolInfo.slope || '0') / 1e18} HBAR</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <span className="text-gray-400">Tokens Sold:</span>
                          <span className="text-white break-words">{formatNumber(parseFloat(marketData.customAmm.poolInfo.sold || '0'))}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:justify-between">
                          <span className="text-gray-400">Total Fee:</span>
                          <span className="text-white break-words">{parseFloat(marketData.customAmm.poolInfo.feeBps || '0') / 100}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Creator Earnings */}
                    <div className="p-4 bg-green-900/20 border border-green-800/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-green-400">Creator Earnings</div>
                          <div className="text-xs text-gray-400">Accumulated from trading fees</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-400">
                            {parseFloat(marketData.customAmm.poolInfo.creatorFeeAcc || '0') / 1e18} HBAR
                          </div>
                          <div className="text-xs text-gray-400">
                            {parseFloat(marketData.customAmm.poolInfo.creatorFeeBps || '0') / 100}% per trade
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Trade on Custom AMM */}
                    <div className="p-4 bg-blue-900/20 border border-blue-800/30 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium text-blue-400">Trade on Bonding Curve</div>
                          <div className="text-xs text-gray-400">Direct AMM trading with automatic pricing</div>
                        </div>
                        <button 
                          onClick={() => setShowTradeModal(true)}
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Trade Now
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Trading Links removed per request */}
            </div>

            {/* Main Content - Chart and Extension Info */}
            <div className="xl:col-span-3 order-1 xl:order-2">
              {/* Price Chart */}
              <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                    <LineChart className="w-5 h-5 text-green-400" />
                    <span className="hidden sm:inline">{tokenInfo?.token_symbol}/HBAR Price Chart</span>
                    <span className="sm:hidden">{tokenInfo?.token_symbol} Chart</span>
                  </h2>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm">
                    <div className="text-gray-400">
                      24h Volume: <span className="text-white">${formatNumber(marketData?.volume24h || 0)}</span>
                    </div>
                    <div className="text-gray-400">
                      Trades: <span className="text-white">{formatNumber(marketData?.totalTrades || 0)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Real-time Area Chart (component) */}
                <div className="h-64 sm:h-80 bg-gray-800/30 rounded-lg border border-gray-700/50 overflow-hidden">
                  <AreaChart
                    points={(tradeData.length ? tradeData : chartData.map(d => ({ time: d.timestamp, price: d.close })))}
                    symbol={tokenInfo?.token_symbol || ''}
                    marketCapLatest={marketData?.marketCap}
                  />
                </div>
              </div>

              {/* Extension Actions + Token Information */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Replaced Extension Details with CTA buttons */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-green-400" />
                    Try the Extension
                    <span className="relative group inline-flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-amber-300 ml-1">
                        <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-.75 6.75a.75.75 0 111.5 0 .75.75 0 01-1.5 0zM12 10.5a.75.75 0 00-.75.75v4.5a.75.75 0 001.5 0v-4.5A.75.75 0 0012 10.5z" clipRule="evenodd" />
                      </svg>
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 z-50 rounded-md border border-amber-800/30 bg-amber-900/20 p-3 text-xs text-amber-300 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity">
                        For every 5th test and every 5th download, 0.1% of the supply will be burned.
                      </div>
                    </span>
                  </h2>
                  {(tokenInfo?.social_links?.twitter || tokenInfo?.social_links?.telegram || tokenInfo?.social_links?.discord) && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-400 mr-1">Community</span>
                      {tokenInfo?.social_links?.twitter && (
                        <a
                          href={tokenInfo?.social_links?.twitter}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Twitter"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-700/60 bg-gray-800/40 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                          title="Follow on X"
                        >
                          <FaXTwitter className="w-4 h-4" />
                        </a>
                      )}
                      {tokenInfo?.social_links?.telegram && (
                        <a
                          href={tokenInfo?.social_links?.telegram}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Telegram"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-700/60 bg-gray-800/40 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                          title="Join Telegram"
                        >
                          <FaTelegramPlane className="w-4 h-4" />
                        </a>
                      )}
                      {tokenInfo?.social_links?.discord && (
                        <a
                          href={tokenInfo?.social_links?.discord}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label="Discord"
                          className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-gray-700/60 bg-gray-800/40 text-gray-300 hover:text-white hover:bg-gray-800 transition-colors"
                          title="Join Discord"
                        >
                          <FaDiscord className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  )}
                  {/* Login prompt removed per request; auth handled in header */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <button
                      title={`Tested ${interactionCounts.tests} time${interactionCounts.tests === 1 ? '' : 's'}`}
                      onClick={handleRunExtension}
                      disabled={!isLoggedIn}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-green-600/20 hover:bg-green-600/30 text-green-300 border border-green-600/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Play className="w-4 h-4" />
                      Test it live
                    </button>
                    <button
                      title={`Downloaded ${interactionCounts.downloads} time${interactionCounts.downloads === 1 ? '' : 's'}`}
                      onClick={handleDownload}
                      disabled={!isLoggedIn}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-600/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                  <div className="mt-2">
                    <div className="text-xs text-gray-300 bg-gray-800/40 border border-gray-700/30 rounded p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">Burn history</span>
                        <button
                          onClick={() => refreshBurnHistory()}
                          className="text-[11px] px-2 py-0.5 rounded bg-gray-700/60 text-gray-200 hover:bg-gray-700/80"
                          disabled={burnHistoryLoading}
                        >
                          {burnHistoryLoading ? 'Refreshing…' : 'Refresh'}
                        </button>
                      </div>
                      {burnHistory.length === 0 && !burnHistoryLoading && (
                        <div className="text-gray-400">No burns yet</div>
                      )}
                      {burnHistory.length > 0 && (
                        <div className="max-h-48 overflow-y-auto divide-y divide-gray-700/40">
                          {burnHistory.map((b, idx) => {
                            const timeStr = b.createdAt ? new Date(b.createdAt).toLocaleString() : 'Unknown';
                            const reasonStr = b.reasonAction ? `${b.reasonAction} ${b.interactionCountAt ? `#${b.interactionCountAt}` : ''}` : 'N/A';
                            return (
                              <div key={`${b.txId || idx}`} className="py-2 flex flex-col gap-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-gray-200">{timeStr}</span>
                                  <span className="text-gray-400">-</span>
                                  <span className="text-gray-300">
                                    Burned {formatTokenAmountUnits(b.amount)} {tokenInfo?.token_symbol} due to {reasonStr}
                                  </span>
                                  {b.status && (
                                    <span className="text-[10px] px-2 py-0.5 rounded bg-gray-700/60 text-gray-200">{b.status}</span>
                                  )}
                                </div>
                                {b.txId && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-400">txId:</span>
                                    <span className="text-gray-300 font-mono text-[11px] break-all">{b.txId}</span>
                                    <button
                                      onClick={() => copyToClipboard(b.txId || '', `burn_txid_${idx}`)}
                                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                                      title="Copy txId"
                                    >
                                      {copiedStates[`burn_txid_${idx}`] ? (
                                        <Check className="w-3 h-3 text-green-400" />
                                      ) : (
                                        <Copy className="w-3 h-3 text-gray-400" />
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Token Information */}
                <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                    <Coins className="w-5 h-5 text-blue-400" />
                    Token Information
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2">{tokenInfo?.token_name}</h3>
                      <p className="text-gray-300 mb-4">{tokenInfo?.description}</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Supply:</span>
                        <span className="text-white font-mono">{tokenInfo?.total_supply.toLocaleString('en-US')}</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Initial Price:</span>
                        <span className="text-white font-mono">{tokenInfo?.initial_price} HBAR</span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Token ID:</span>
                        <div className="flex items-center gap-2">
                          <span className="text-white font-mono text-sm">{tokenInfo?.token_id}</span>
                          <button 
                            onClick={() => copyToClipboard(tokenInfo?.token_id || '', 'token_id')}
                            className="p-1 hover:bg-gray-700 rounded transition-colors"
                          >
                            {copiedStates.token_id ? (
                              <Check className="w-3 h-3 text-green-400" />
                            ) : (
                              <Copy className="w-3 h-3 text-gray-400" />
                            )}
                          </button>
                        </div>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-400">Created:</span>
                        <span className="text-white text-sm">{formatDate(tokenInfo?.created_at || '')}</span>
                      </div>
                    </div>

                    {/* Features */}
                    {tokenInfo?.features && Object.values(tokenInfo.features).some(feature => feature) && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-300 mb-3">Features:</h4>
                        <div className="space-y-2">
                          {tokenInfo?.features?.bundle_opt_in && (
                            <div className="flex items-center gap-2 text-sm text-blue-300">
                              <Users className="w-4 h-4" />
                              Bundle Eligible
                            </div>
                          )}
                          {tokenInfo?.features?.early_buyer_airdrop && (
                            <div className="flex items-center gap-2 text-sm text-green-300">
                              <DollarSign className="w-4 h-4" />
                              Early Buyer Bonus
                            </div>
                          )}
                          {tokenInfo?.features?.enable_dao_voting && (
                            <div className="flex items-center gap-2 text-sm text-purple-300">
                              <Shield className="w-4 h-4" />
                              DAO Governance
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Wallet Connection Modal */}
      <WalletModal
        open={showWalletModal}
        tokenSymbol={tokenInfo?.token_symbol}
        connectedWallet={connectedWallet}
        connectedEvm={connectedEvm}
        onClose={() => {
          setShowWalletModal(false);
          if (pendingTrade) {
            toast.success('Click "Buy/Sell Tokens" again to continue trading');
            setPendingTrade(false);
          }
        }}
        onDisconnect={disconnectWallet}
        onChangeAccountId={setConnectedWallet}
        onChangeEvm={setConnectedEvm}
        onConnect={(addr) => connectWallet(addr)}
      />

      {/* Trading Modal */}
      <TradeModal
        open={showTradeModal}
        tokenSymbol={tokenInfo?.token_symbol}
        connectedWallet={connectedWallet}
        tradeDirection={tradeDirection}
        tradeAmount={tradeAmount}
        estimatedPrice={estimatedPrice}
        tradeLoading={tradeLoading}
        tradeError={tradeError}
        needsAssociation={needsAssociation}
        tokenId={tokenInfo?.token_id}
        marketRateText={marketData?.heliswap ? `Rate: 1 ${tokenInfo?.token_symbol} = ${parseFloat(marketData.heliswap.pricing.currentPrice).toFixed(6)} HBAR` : undefined}
        onClose={() => setShowTradeModal(false)}
        onSwitchWallet={connectedWallet ? () => { setShowTradeModal(false); setPendingTrade(true); setShowWalletModal(true); } : undefined}
        onChangeDirection={setTradeDirection}
        onChangeAmount={setTradeAmount}
        onSubmit={() => handleTrade(tradeDirection)}
      />
    </div>
  );
} 