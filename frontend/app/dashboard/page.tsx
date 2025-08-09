'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Cookies from 'js-cookie';
import { 
  Check, 
  CreditCard, 
  Clock, 
  RefreshCcw, 
  Wallet, 
  Shield, 
  BarChart3,
  MessageCircle
} from 'lucide-react';
import Header from '@/components/Header/header';
import Footer from '@/components/Footer/footer';
import { generateUUID } from '@/lib/utils';
import ContactModal from '@/components/Modal/ContactModal';
import { getStoredToken } from '@/lib/auth-utils';
import { getUserFromCookie} from '@/lib/cookie-utils';
import HederaWalletManager from '@/components/Wallet/HederaWalletManager';

interface TransactionHistory {
  id: string;
  date?: string;
  created_at?: string;
  type?: string; // Make type optional to handle CODON transactions
  description?: string;
  amount: number;
  amount_paid?: number;
  status?: 'completed' | 'pending' | 'failed';
  credits?: number;
  credits_purchased?: number; // Added for CODON transactions
  currency?: string;
  order_id?: string;
  payment_id?: string;
  transaction_hash?: string; // For CODON transactions
  buyer_wallet?: string; // For CODON transactions
  is_codon_transaction?: boolean; // Flag to distinguish CODON transactions
  codon_amount?: number; // Added for CODON transactions
  burn_amount?: number; // Added for CODON transactions
  platform_amount?: number; // Added for CODON transactions
  usd_value?: number; // Added for CODON transactions
}

interface CreditSummary {
  total: number | string;
  used: number;
  remaining: number;
}

// Add this interface at the top of your file with other interfaces
interface User {
  uid?: string;
  email?: string;
  name?: string;
  currentSessionId?: string;
  idToken?: string;
  [key: string]: any; // For any other properties
}

// Helper function to format subscription plan name
const formatPlanName = (planName: string | null): string => {
  if (!planName) return 'Pro Plan';
  
  return planName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Loading component for Suspense fallback
const DashboardLoading = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
      <div className="animate-pulse flex flex-col items-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-400">Loading dashboard...</p>
      </div>
    </div>
  );
};

// Main dashboard component
const DashboardContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const status = searchParams?.get('status');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [creditSummary, setCreditSummary] = useState<CreditSummary>({
    total: 0,
    used: 0,
    remaining: 0
  });
  const [transactions, setTransactions] = useState<TransactionHistory[]>([]);
  const [hasSubscription, setHasSubscription] = useState(false);
  const [subscriptionType, setSubscriptionType] = useState<string | null>(null);
  const [hasUnlimitedCredits, setHasUnlimitedCredits] = useState(false);
  const [showContactModal, setShowContactModal] = useState<boolean>(false);

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };
  
  const handleGoToChat = () => {
    // const userData = JSON.parse(Cookies.get('user') || '{}');
    const userData = getUserFromCookie() as User;
    const sessionId = userData.currentSessionId || generateUUID();
    
    // Update the session ID in cookies if it doesn't exist
    if (!userData.currentSessionId) {
      Cookies.set(
        'user',
        JSON.stringify({
          ...userData,
          currentSessionId: sessionId
        }),
        { expires: 30 }
      );
    }
    
    router.push(`/chat/${sessionId}`);
  };

  // Process transaction data for display
  const processTransactions = (rawTransactions: TransactionHistory[], isCodonTransactions: boolean = false) => {
    return rawTransactions.map(txn => {
      // Use appropriate date field and format description
      const dateToUse = txn.created_at || txn.date || new Date().toISOString();
      
      // Generate appropriate description if missing
      let description = txn.description;
      if (!description) {
        if (isCodonTransactions || (txn.type && txn.type === 'codon_credit_purchase')) {
          description = `CODON credit purchase (${txn.credits_purchased || txn.credits || 0} credits)`;
        } else if (txn.type && txn.type === 'subscription_credit_addition') {
          description = `${txn.credits || 0} credits from subscription`;
        } else if (txn.type && txn.type.includes('purchase')) {
          description = `Credit purchase (${txn.credits || 0} credits)`;
        } else if (txn.type && txn.type.includes('usage')) {
          description = `API usage`;
        } else if (txn.type) {
          description = `${txn.type.replace(/_/g, ' ')}`;
        } else {
          description = `CODON credit purchase (${txn.credits_purchased || 0} credits)`;
        }
      }
      
      // Normalize transaction type
      let normalizedType: 'purchase' | 'usage' | 'codon_purchase' = 'purchase';
      if (txn.type && txn.type.includes('usage')) {
        normalizedType = 'usage';
      } else if (isCodonTransactions || (txn.type && txn.type === 'codon_credit_purchase')) {
        normalizedType = 'codon_purchase';
      }
      
      // Get the transaction amount from the appropriate field
      const amount = txn.amount_paid || txn.amount || txn.codon_amount || txn.usd_value || 0;

      return {
        ...txn,
        id: txn.id || txn.transaction_hash || txn.payment_id || txn.order_id || `txn-${Date.now()}`,
        date: dateToUse,
        description,
        type: normalizedType,
        status: txn.status || 'completed',
        amount: amount,
        currency: txn.currency || (isCodonTransactions ? 'CODON' : 'USD'),
        is_codon_transaction: isCodonTransactions
      };
    });
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const userData = getUserFromCookie() as User;
        
        if (!userData) {
          router.push('/signin');
          return;
        }
  
        setUser(userData);
        
        // Get the ID token from storage
        const idToken = userData.idToken || getStoredToken();
        
        if (!idToken) {
          router.push('/signin');
          return;
        }
        
        // Fetch credit details with ID token
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/middleware/user/credits`, {
          headers: {
            'Authorization': `Bearer ${idToken}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch credit data');
        }
        
        const data = await response.json();
        
        if (data.success) {
          // Update state based on the actual response format
          setHasUnlimitedCredits(data.unlimited_credits || false);
          setHasSubscription(data.has_subscription || false);
          setSubscriptionType(data.subscription_type || null);
          
          setCreditSummary({
            total: data.unlimited_credits ? "∞" : data.credits_remaining || 0,
            used: 0, // This isn't provided in the response
            remaining: data.credits_remaining || 0
          });
        }
        
        // Create an array to hold all transactions
        let allTransactions: TransactionHistory[] = [];
        
        // Fetch regular transaction history with ID token
        try {
          const historyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/credits-history`, {
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          });
          
          if (historyResponse.ok) {
            const historyData = await historyResponse.json();
            if (historyData.success && historyData.transactions) {
              // Process regular transactions
              const regularTransactions = processTransactions(historyData.transactions);
              allTransactions = [...allTransactions, ...regularTransactions];
            }
          }
        } catch (error) {
          // Continue even if this request fails
        }
        
        // Fetch CODON transaction history
        try {
          const codonHistoryResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/codon-credits-history`, {
            headers: {
              'Authorization': `Bearer ${idToken}`
            }
          });
          
          if (codonHistoryResponse.ok) {
            const codonHistoryData = await codonHistoryResponse.json();
            if (codonHistoryData.success && codonHistoryData.transactions) {
              // Process CODON transactions with isCodonTransactions flag set to true
              const codonTransactions = processTransactions(codonHistoryData.transactions, true);
              allTransactions = [...allTransactions, ...codonTransactions];
            }
          }
        } catch (error) {
          // Continue even if this request fails
        }
        
        // Sort all transactions by date, newest first
        allTransactions.sort((a, b) => {
          const dateA = new Date(a.date || 0).getTime();
          const dateB = new Date(b.date || 0).getTime();
          return dateB - dateA; // Sort in descending order (newest first)
        });
        
        // Update transaction state with combined results
        setTransactions(allTransactions);
        
      } catch (error) {
        // Error fetching user data
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, [router]);

  const formatCurrency = (amount: number, currency: string = 'USD'): string => {
    // Special case for CODON - display without currency symbol conversion
    if (currency === 'CODON') {
      return `${new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount)} CODON`;
    }
    
    // For regular currencies, use Intl formatter
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(amount);
  };
  

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <Header />
      
      {/* Background effects */}
      <div className="relative overflow-hidden">
        {/* Dynamic aurora effects */}
        <div className="absolute -top-[500px] -left-[400px] w-[1000px] h-[1000px] bg-[radial-gradient(ellipse_at_center,hsla(217,100%,50%,0.12)_0%,transparent_70%)]" 
             style={{ animation: 'aurora-x 25s ease-in-out infinite' }} />
        <div className="absolute -top-[300px] -right-[300px] w-[800px] h-[800px] bg-[radial-gradient(ellipse_at_center,hsla(265,89%,60%,0.12)_0%,transparent_70%)]" 
             style={{ animation: 'aurora-y 20s ease-in-out infinite' }} />
        <div className="absolute bottom-[20%] left-[10%] w-[600px] h-[600px] bg-[radial-gradient(ellipse_at_center,hsla(190,95%,50%,0.06)_0%,transparent_70%)]" 
             style={{ animation: 'aurora-pulse 30s ease infinite' }} />
        
        {/* Grid effect */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
      </div>
      
      <div className="container mx-auto px-4 py-24 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Success message if coming from payment */}
          {status === 'success' && (
            <motion.div 
              className="mb-8 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl p-5 backdrop-blur-sm"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center">
                <div className="bg-green-500/20 rounded-full p-2 mr-4">
                  <Check className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white mb-1">Payment Successful!</h3>
                  <p className="text-gray-300">Your credits have been added to your account successfully.</p>
                </div>
              </div>
            </motion.div>
          )}
          
          {/* Page header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <motion.h1 
              className="text-3xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 mb-4 md:mb-0"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Dashboard
            </motion.h1>
            
            <motion.div 
              className="flex space-x-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <button 
                onClick={handleGoToChat}
                className="py-2 px-4 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-600/30 transition-colors flex items-center"
              >
                <MessageCircle className="w-4 h-4 mr-2" /> Go to Chat
              </button>
              <button 
                onClick={() => router.push('/pricing')}
                className="py-2 px-4 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-600/30 transition-colors flex items-center"
              >
                <Wallet className="w-4 h-4 mr-2" /> Buy Credits
              </button>
            </motion.div>
          </div>
          
          {/* Dashboard content - now without tabs */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
          >
            {/* Credit cards section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Credit Balance Card */}
              <motion.div 
                variants={item}
                className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border border-blue-500/30 rounded-xl p-6 backdrop-blur-sm shadow-lg hover:shadow-blue-500/5 hover:border-blue-400/40 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-100">Credit Balance</h3>
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Wallet className="w-5 h-5 text-blue-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">
                  {hasUnlimitedCredits ? "∞" : creditSummary.remaining}
                </div>
                <p className="text-gray-400 text-sm">
                  {hasUnlimitedCredits ? "Unlimited credits" : "Available credits"}
                </p>
                
                {!hasUnlimitedCredits && (
                  <div className="mt-4 pt-4 border-t border-gray-700/50">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Credits remaining</span>
                      <span className="text-white font-medium">{creditSummary.remaining}</span>
                    </div>
                  </div>
                )}
                
                <div className="mt-4 pt-4 border-t border-gray-700/50">
                  <button 
                    onClick={() => router.push('/pricing')}
                    className="w-full py-2 px-4 bg-blue-600/20 hover:bg-blue-600/30 rounded-lg text-blue-300 border border-blue-600/30 transition-colors flex items-center justify-center"
                  >
                    <CreditCard className="w-4 h-4 mr-2" /> Buy More Credits
                  </button>
                </div>
              </motion.div>
              

              {/* Account Status */}
              <motion.div 
                variants={item}
                className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30 rounded-xl p-6 backdrop-blur-sm shadow-lg hover:shadow-purple-500/5 hover:border-purple-400/40 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-100">Account Status</h3>
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <BarChart3 className="w-5 h-5 text-purple-400" />
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex flex-col gap-2">
                    {/* Only show one status based on subscription */}
                    {hasSubscription ? (
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                        <span className="text-white font-medium">
                          {formatPlanName(subscriptionType)} Subscription
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-2 ${hasUnlimitedCredits ? 'bg-blue-500' : 'bg-green-500'}`}></div>
                        <span className="text-white font-medium">
                          {hasUnlimitedCredits ? 'Unlimited Credits' : 'Pay-as-you-go Credits'}
                        </span>
                      </div>
                    )}
                    
                    {/* Credits status indicator */}
                    <div className="flex items-center mt-1">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                      <span className="text-white font-medium">
                        {hasUnlimitedCredits ? 'Unlimited Usage' : `${creditSummary.remaining} Credits Available`}
                      </span>
                    </div>
                  </div>
                </div>
                
                {!hasUnlimitedCredits && !hasSubscription && (
                  <div className="p-3 bg-blue-500/10 rounded-lg mb-4">
                    <p className="text-sm text-blue-300">
                      Upgrade to a subscription plan for unlimited features and better value.
                    </p>
                  </div>
                )}
                
                <div className="mt-8 pt-4 border-t border-gray-700/50">
                  <div className="text-purple-300 text-sm flex items-center justify-between">
                    <span>Member Status</span>
                    <span className="bg-purple-500/20 px-2 py-1 rounded text-xs">Active</span>
                  </div>
                </div>
              </motion.div>

              
              {/* Subscription Status */}
              <motion.div 
                variants={item}
                className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/20 border border-emerald-500/30 rounded-xl p-6 backdrop-blur-sm shadow-lg hover:shadow-emerald-500/5 hover:border-emerald-400/40 transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg font-medium text-gray-100">Subscription</h3>
                  <div className="p-2 bg-emerald-500/20 rounded-lg">
                    <RefreshCcw className="w-5 h-5 text-emerald-400" />
                  </div>
                </div>
                
                {hasSubscription ? (
                  <>
                    <div className="flex items-center mb-4">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></div>
                      <span className="text-lg font-medium text-white">Active</span>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-4">
                      {formatPlanName(subscriptionType)}
                    </p>
                    
                    <div className="mt-8 pt-4 border-t border-gray-700/50 flex justify-between">
                      <div className="flex items-center text-sm text-gray-400">
                        <Clock className="w-4 h-4 mr-1 text-gray-500" /> 
                        <span>Active subscription</span>
                      </div>
                      <button 
                        onClick={() => {
                          // Don't set the isChangingPlan flag when just viewing subscription details
                          sessionStorage.removeItem('isChangingPlan');
                          router.push('/subscription');
                        }}
                        className="text-emerald-300 hover:text-emerald-200 text-sm flex items-center transition-colors"
                      >
                        Manage
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center mb-4">
                      <div className="w-3 h-3 bg-gray-500 rounded-full mr-2"></div>
                      <span className="text-lg font-medium text-white">No Active Subscription</span>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-4">
                      Upgrade to a subscription plan for more features
                    </p>
                    
                    <div className="mt-8 pt-4 border-t border-gray-700/50">
                      <button 
                        onClick={() => router.push('/pricing')}
                        className="w-full py-2 px-4 bg-emerald-600/20 hover:bg-emerald-600/30 rounded-lg text-emerald-300 border border-emerald-600/30 transition-colors flex items-center justify-center"
                      >
                        <CreditCard className="w-4 h-4 mr-2" /> View Plans
                      </button>
                    </div>
                  </>
                )}
              </motion.div>
            </div>
            
            {/* Hedera Wallet Section */}
            <motion.div variants={item} className="mt-8">
              <HederaWalletManager />
            </motion.div>
            
            {/* Transactions (Combined Activity and History) */}
            <motion.div variants={item} className="mt-8">
              <div className="bg-gray-900/70 border border-gray-800 rounded-xl overflow-hidden shadow-lg backdrop-blur-sm">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-white">Transaction History</h2>
                  {transactions.length > 5 && (
                    <button className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                      View All
                    </button>
                  )}
                </div>
                
                <div className="overflow-x-auto">
                  {transactions.length > 0 ? (
                    <table className="w-full">
                      <thead className="bg-gray-800/50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((transaction) => (
                          <tr key={transaction.id} className="border-b border-gray-800/50 last:border-0 hover:bg-gray-800/20 transition-colors">
                            <td className="px-6 py-4 text-sm text-gray-300">{new Date(transaction.date || '').toLocaleDateString()}</td>
                            <td className="px-6 py-4 text-sm text-white">{transaction.description}</td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                                ${transaction.type === 'purchase' 
                                  ? 'bg-green-500/10 text-green-400' 
                                  : transaction.type === 'codon_purchase'
                                  ? 'bg-purple-500/10 text-purple-400'
                                  : 'bg-blue-500/10 text-blue-400'}`}>
                                {transaction.type === 'purchase' 
                                  ? 'Purchase' 
                                  : transaction.type === 'codon_purchase'
                                  ? 'CODON'
                                  : 'Usage'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className={
                                transaction.type === 'purchase' 
                                  ? 'text-green-400' 
                                  : transaction.type === 'codon_purchase'
                                  ? 'text-purple-400'
                                  : 'text-blue-400'
                              }>
                                {transaction.type === 'usage' ? '-' : '+'}
                                {formatCurrency(transaction.amount, transaction.currency || 'USD')}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                                ${transaction.status === 'completed' 
                                  ? 'bg-green-500/10 text-green-400' 
                                  : transaction.status === 'pending'
                                    ? 'bg-yellow-500/10 text-yellow-400'
                                    : 'bg-red-500/10 text-red-400'}`}>
                                {transaction.status ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1) : 'Unknown'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div className="p-6 text-center text-gray-500">No transaction history available</div>
                  )}
                </div>
                
                {/* Mobile/Card view for smaller screens */}
                <div className="md:hidden p-6 space-y-4">
                  {transactions.length > 0 ? (
                    transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="bg-gray-800/20 rounded-lg p-4 border border-gray-700/30">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <div className={`p-2 rounded-md mr-3
                              ${transaction.type === 'purchase' 
                                ? 'bg-green-500/10' 
                                : 'bg-blue-500/10'}`}>
                              {transaction.type === 'purchase' 
                                ? <CreditCard className="w-4 h-4 text-green-400" />
                                : <RefreshCcw className="w-4 h-4 text-blue-400" />
                              }
                            </div>
                            <div>
                              <p className="font-medium text-white text-sm">{transaction.description}</p>
                            </div>
                          </div>
                          <span className={`font-medium text-sm
                            ${transaction.type === 'purchase' ? 'text-green-400' : 'text-blue-400'}`}>
                            {transaction.type === 'purchase' ? '+' : '-'}
                            {formatCurrency(transaction.amount, transaction.currency || 'USD')}
                            </span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
                          <span>{new Date(transaction.date || '').toLocaleDateString()}</span>
                          <span className={`px-2 py-0.5 rounded-full
                            ${transaction.status === 'completed' 
                              ? 'bg-green-500/10 text-green-400' 
                              : transaction.status === 'pending'
                                ? 'bg-yellow-500/10 text-yellow-400'
                                : 'bg-red-500/10 text-red-400'}`}>
                            {transaction.status ? transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1) : 'Unknown'}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">No transaction history available</div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
          
          {/* Help & Support */}
          <motion.div
            variants={item} 
            className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/20 rounded-xl p-6 backdrop-blur-sm mt-8 flex items-center justify-between"
          >
            <div>
              <h3 className="text-lg font-medium text-white mb-2">Need help with your account?</h3>
              <p className="text-gray-400">Our support team is here to assist you with any questions.</p>
            </div>
            <button 
              onClick={() => setShowContactModal(true)}
              className="py-2.5 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center whitespace-nowrap"
            >
            <Shield className="w-4 h-4 mr-2" /> Contact Support
            </button>
          </motion.div>
        </div>
      </div>
      
      {/* CSS animations */}
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
      `}</style>
      
      <ContactModal 
      isOpen={showContactModal}
      onClose={() => setShowContactModal(false)}
      />
      <Footer />
    </div>
  );
};

// Main page component with Suspense boundary
const DashboardPage = () => {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent />
    </Suspense>
  );
};

export default DashboardPage;