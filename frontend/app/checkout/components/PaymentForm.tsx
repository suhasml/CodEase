'use client'

import { motion } from 'framer-motion';
import { CreditCard, Wallet, Lock, AlertTriangle, Shield, Check } from 'lucide-react';
import { PaymentFormProps } from '../types';
import WalletConnection from '@/components/Wallet/WalletConnection';
import WalletAddressDisplay from '@/components/Wallet/WalletAddressDisplay';

export default function PaymentForm({
  paymentAbandoned,
  processingPayment,
  loadingRazorpay,
  handleCreateOrder,
  currencyForDisplay,
  plan,
  creditPurchase,
  isYearly,
  formatPrice,
  formatCreditPrice,
  // CODON-specific props
  isConnected = false,
  walletAddress = '',
  isProcessingCodon = false,
  transactionStatus = 'idle',
  txHash = '',
  codonError = null,
  onWalletConnected,
  onWalletDisconnect,
  // Manual wallet entry props
  useManualEntry = false,
  setUseManualEntry,
  manualWalletAddress = '',
  setManualWalletAddress,
  devMode = false, // Development mode flag
  devModeValues // Development mode test values
}: PaymentFormProps) {
  const isCodonPurchase = creditPurchase?.paymentMethod === 'codon';

  return (
    <div className="space-y-5 sm:space-y-6">
      <motion.div
        className={`bg-gradient-to-b ${
          isCodonPurchase 
            ? 'from-purple-900/30 to-blue-900/30 border-purple-500/30' 
            : 'from-blue-900/30 to-purple-900/30 border-blue-500/30'
        } border ${devMode && isCodonPurchase ? 'border-amber-500/50 border-dashed' : ''} rounded-xl p-4 sm:p-6 backdrop-blur-sm shadow-xl`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Payment Header & Razorpay info */}
        <div className="flex items-center mb-5 sm:mb-6">
          <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${
            isCodonPurchase ? 'bg-purple-500/20' : 'bg-blue-500/20'
          } flex items-center justify-center mr-3 sm:mr-4`}>
            {isCodonPurchase ? (
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
            ) : creditPurchase ? (
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            ) : (
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white">
            {isCodonPurchase ? 'CODON Payment' : creditPurchase ? 'Credit Purchase' : 'Secure Payment'}
            
            {/* Development mode indicator */}
            {devMode && isCodonPurchase && (
              <span className="inline-block ml-2 text-xs font-normal bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">
                DEV MODE
              </span>
            )}
          </h2>
        </div>

        {/* Razorpay info - Only show for non-CODON payments */}
        {!isCodonPurchase && (
          <div className="flex items-center justify-center bg-gray-800/60 border border-gray-700 rounded-lg p-3 sm:p-4 mb-6 sm:mb-8">
            <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400 mr-2 sm:mr-3" />
            <span className="text-sm sm:text-base text-gray-300">
              Payment processed by Razorpay
            </span>
          </div>
        )}        {/* CODON payment info and wallet connection */}
        {isCodonPurchase && (
          <div className="space-y-4">
            {/* Development mode indicator */}
            {devMode && (
              <div className="bg-indigo-900/30 border border-indigo-600/40 rounded-lg p-3 mb-4">                <div className="flex items-center">
                  <div className="bg-indigo-500 text-white text-xs font-bold uppercase px-2 py-1 rounded mr-2">
                    DEV MODE
                  </div>
                  <p className="text-sm text-indigo-200">
                    Using reduced CODON amounts for testing: <span className="font-bold">{devModeValues?.total} CODON</span> ({devModeValues?.platformFee} platform + {devModeValues?.burn} burn)
                  </p>
                </div>
              </div>
            )}
            
            {!isConnected ? (
              <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">
                <div className="flex items-center justify-center mb-3">
                  <Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400 mr-2 sm:mr-3" />
                  <span className="text-sm sm:text-base text-gray-300">
                    Connect your wallet to continue with CODON payment
                  </span>
                </div>
                <WalletConnection onWalletConnected={onWalletConnected || (() => {})} />
              </div>
            ) : (
              <div className="bg-purple-900/20 border border-purple-700/30 rounded-lg p-4">                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-gray-300">Wallet connected</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setUseManualEntry && setUseManualEntry(!useManualEntry)}
                      className="text-xs text-purple-400 hover:text-purple-300 underline"
                    >
                      {useManualEntry ? 'Use connected wallet' : 'Enter address manually'}
                    </button>
                    {!useManualEntry && (
                      <button 
                        onClick={() => onWalletDisconnect && onWalletDisconnect()}
                        className="text-xs text-purple-400 hover:text-purple-300 underline"
                      >
                        Change wallet
                      </button>
                    )}
                  </div>
                </div>
                
                {useManualEntry ? (
                  <div className="space-y-2">
                    <div className="bg-black/50 border border-gray-800 rounded-lg p-3">
                      <div className="text-xs text-gray-400 mb-1">Enter Solana wallet address:</div>                      <div className="relative">
                        <input
                          type="text"
                          value={manualWalletAddress || ''}
                          onChange={(e) => setManualWalletAddress && setManualWalletAddress(e.target.value)}
                          placeholder="Enter Solana wallet address"
                          className={`w-full bg-black/30 border ${
                            manualWalletAddress 
                              ? ((/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(manualWalletAddress) && !manualWalletAddress.startsWith('0x'))
                                ? 'border-green-600' 
                                : 'border-red-600')
                              : 'border-gray-700'
                          } rounded-md py-2 px-3 text-white placeholder-gray-500 text-sm`}
                        />
                        {manualWalletAddress && /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(manualWalletAddress) && !manualWalletAddress.startsWith('0x') && (
                          <div className="absolute right-3 top-2.5 text-green-500">
                            <Check size={16} />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {manualWalletAddress && !(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(manualWalletAddress) && !manualWalletAddress.startsWith('0x'))
                          ? <span className="text-red-400">Invalid Solana address format</span>
                          : "Must be a valid Solana address"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-black/50 border border-gray-800 rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-1">Phantom wallet:</div>
                    <WalletAddressDisplay address={walletAddress} />
                  </div>
                )}
                
                {/* Transaction status */}
                {isProcessingCodon && (
                  <div className="mt-3 bg-black/50 border border-gray-800 rounded-lg p-3">
                    <div className="flex items-center mb-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-400 mr-2 flex-shrink-0"></div>
                      <p className="text-gray-300 text-sm">
                        {transactionStatus === 'creating' && 'Creating CODON transaction...'}
                        {transactionStatus === 'signing' && 'Waiting for wallet signature...'}
                        {transactionStatus === 'confirming' && 'Confirming transaction on Solana...'}
                        {transactionStatus === 'verifying' && 'Verifying credit purchase...'}
                      </p>
                    </div>
                      {txHash && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-400">Transaction successful:</p>
                        <p className="text-xs text-green-500">✓ Processing complete</p>
                      </div>
                    )}
                  </div>
                )}
                
                {/* CODON error message */}
                {codonError && (
                  <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-start">
                      <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 mr-2 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-red-200 font-medium">CODON Transaction Error</p>
                        <p className="text-xs text-gray-400 mt-1">{codonError}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Payment Abandoned Message */}
        {paymentAbandoned && (
          <div className="mb-4 p-2.5 sm:p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-start">
              <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 mt-0.5 mr-2" />
              <div>
                <p className="text-sm sm:text-base text-amber-200 font-medium">Payment not completed</p>
                <p className="text-xs sm:text-sm text-gray-400">Your previous payment attempt was abandoned. You can try again below.</p>
              </div>
            </div>
          </div>
        )}        {/* Payment Button */}        <button
          onClick={handleCreateOrder}
          disabled={(isCodonPurchase ? ((!isConnected && !useManualEntry) || (useManualEntry && !manualWalletAddress) || isProcessingCodon) : (processingPayment || loadingRazorpay))}
          className={`w-full py-3 sm:py-3.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center ${
            isCodonPurchase 
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg shadow-purple-500/10' 
              : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/10'
          } relative overflow-hidden group ${
            (isCodonPurchase ? ((!isConnected && !useManualEntry) || (useManualEntry && !manualWalletAddress) || isProcessingCodon) : (processingPayment || loadingRazorpay))
              ? 'opacity-50 cursor-not-allowed'
              : isCodonPurchase 
                ? 'hover:from-purple-600 hover:to-blue-600 hover:shadow-purple-500/20' 
                : 'hover:from-blue-600 hover:to-purple-600 hover:shadow-blue-500/20'
          }`}
        >
          {(isCodonPurchase ? isProcessingCodon : (processingPayment || loadingRazorpay)) ? (
            <span className="flex items-center text-sm sm:text-base">
              <span className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
              {isCodonPurchase ? 'Processing CODON...' : (loadingRazorpay ? 'Loading Payment...' : 'Processing...')}
            </span>
          ) : (
            <>
              <span className="text-sm sm:text-base">          {isCodonPurchase 
                  ? (!isConnected && !useManualEntry
                      ? 'Connect Wallet to Pay' 
                      : useManualEntry && !manualWalletAddress
                        ? 'Enter Wallet Address'
                        : `Pay ${devMode && devModeValues ? devModeValues.total : creditPurchase.totalCodon?.toLocaleString()} CODON`)
                  : `Pay ${creditPurchase
                      ? formatCreditPrice(Number(creditPurchase.totalPrice || '0') * 1.18, currencyForDisplay || 'USD')
                      : plan ? formatPrice((isYearly ? plan.amount * 12 * 0.8 : plan.amount) * 1.18, plan.currency, false) : ""
                    }`
                }
              </span>              {/* Lock icon - only show when ready to pay */}
              {(isCodonPurchase ? (isConnected || (useManualEntry && manualWalletAddress)) : true) && (
                <span className="ml-2 bg-white/20 rounded-full w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Lock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                </span>
              )}
            </>
          )}
          {/* Button hover effect */}
          <span className={`absolute inset-0 h-full w-0 ${
            isCodonPurchase 
              ? 'bg-gradient-to-r from-purple-600/30 to-blue-600/30' 
              : 'bg-gradient-to-r from-blue-600/30 to-purple-600/30'
          } transition-all duration-300 group-hover:w-full`}></span>
        </button>        {/* Secure info, Tax info */}
        <div className="flex items-center justify-center mt-3 sm:mt-4 text-xs sm:text-sm text-gray-400">
          <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 text-gray-500" />
          <span>{isCodonPurchase ? 'Your wallet connection is secure' : 'Your payment information is secure'}</span>
        </div>

        {!isCodonPurchase && (
          <div className="text-center mt-3 text-xs text-blue-300/70">
            All prices include applicable taxes (18%)
          </div>
        )}

        {isCodonPurchase && (
          <div className="text-center mt-3 text-xs text-purple-300/70">
            Transaction will be processed on the Solana blockchain
          </div>
        )}
        
        {/* Add dev mode explanation if active */}
        {devMode && isCodonPurchase && (
          <div className="mt-2 p-2 bg-amber-500/10 border border-amber-500/20 rounded text-xs text-amber-300 text-center">
            Development mode active: Using reduced amounts for testing ({devModeValues?.total || 12} CODON instead of {creditPurchase?.totalCodon?.toLocaleString() || '—'})
          </div>
        )}

        {/* Development mode indicator - only show in dev mode */}
        {devMode && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-center text-sm text-red-400">
            ⚠️ Development Mode: This is a test environment. Transactions are not real.
          </div>
        )}
      </motion.div>
    </div>
  );
}
