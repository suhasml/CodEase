'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertCircle, Info } from 'lucide-react';
import { authenticatedFetch } from '@/lib/api-utils';
import { toast } from 'react-hot-toast';
import { getUserFromCookie, setCookie } from '@/lib/cookie-utils';
import WalletConnection from '@/components/Wallet/WalletConnection';
import WalletAddressDisplay from '@/components/Wallet/WalletAddressDisplay';
import { PurchaseModalProps } from './types';
import { 
  validateAddress, 
  extractTransactionData, 
  checkIfTransactionNeeded, 
  prepareTokenTransferTransaction, 
  executeTransferWithPhantom 
} from './utils';
import { useWalletConnection } from './hooks';

// Transaction timeout (60 seconds)
const TRANSACTION_TIMEOUT = 60000;

const PurchaseModal: React.FC<PurchaseModalProps> = ({ 
  listingId, 
  title, 
  price, 
  sellerEmail,
  onClose, 
  onPurchase 
}) => {
  const { 
    isConnected, 
    setIsConnected,
    walletAddress, 
    setWalletAddress, 
    handleWalletConnected 
  } = useWalletConnection();
  
  // State
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [txHash, setTxHash] = useState('');  
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'creating' | 'signing' | 'confirming' | 'verifying'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isOwnershipInfo, setIsOwnershipInfo] = useState(false);
  const [useManualEntry, setUseManualEntry] = useState(false);
  const [manualWalletAddress, setManualWalletAddress] = useState('');
  
  // Clear error message when modal is reopened
  useEffect(() => {
    setErrorMessage(null);
    setIsOwnershipInfo(false);
  }, [listingId]);

  // Purchase handler
  const handlePurchase = async () => {
    const purchaseStartTime = Date.now();
    setIsPurchasing(true);
    setTransactionStatus('creating');
    setErrorMessage(null);
    setIsOwnershipInfo(false);
    setTxHash('');
    
    // Determine which wallet address to use
    const addressToUse = useManualEntry ? manualWalletAddress : walletAddress;
    
    if (!addressToUse) {
      setErrorMessage('No wallet address provided. Please connect your wallet or enter an address manually.');
      setIsPurchasing(false);
      setTransactionStatus('idle');
      return;
    }
      // Validate wallet address
    const addressValidation = validateAddress(addressToUse);
    if (!addressValidation.valid) {
      setErrorMessage(addressValidation.message || 'Invalid wallet address');
      setIsPurchasing(false);
      setTransactionStatus('idle');
      return;
    }
    
    try {
      // Step 1: Create transaction data from the API
      const createTxResponse = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_API_URL}/marketplace/create-transaction/${listingId}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            buyer_wallet: addressToUse,
            client_timestamp: Date.now()
          })
        }
      );
      
      if (!createTxResponse.ok) {
        let errorMessage = `Failed to create transaction (${createTxResponse.status})`;        try {
          const errorData = await createTxResponse.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // Handle JSON parsing error gracefully - use default error message
        }
        throw new Error(errorMessage || 'Failed to create transaction');
      }
      
      // Extract transaction data with improved helper function
      const responseData = await createTxResponse.json();
      const txData = extractTransactionData(responseData);
      
      // Step 2: Check if transaction is needed (already owned, etc.) using helper function
      if (checkIfTransactionNeeded(txData, setIsOwnershipInfo, setErrorMessage)) {
        // If transaction is not needed, just return here - all UI state is handled in the helper
        setIsPurchasing(false);
        setTransactionStatus('idle');
        return;
      }
      
      // Track timings for performance monitoring
      const stepTimings: {
        createTransaction: number;
        prepareTransaction?: number;
        executeTransaction?: number;
        confirmTransaction?: number;
        verifyTransaction?: number;
        totalDuration?: number;
      } = {
        createTransaction: Date.now() - purchaseStartTime
      };
      
      // Step 3: Prepare transaction with Phantom
      setTransactionStatus('signing');
      
      if (!txData.recipient) {
        throw new Error('Missing recipient wallet address in transaction data');
      }
      
      // Validate seller wallet address for better error messages
      const sellerAddressValidation = validateAddress(txData.recipient, 'seller');
      if (!sellerAddressValidation.valid) {
        throw new Error(`${sellerAddressValidation.message}. Please report this issue.`);
      }
      
      let transactionSignature: string | undefined;
        try {
        // Prepare the transaction (prepare token transfer)
        const prepareStartTime = Date.now();
        
        const { transaction: preparedTransaction, connection } = await prepareTokenTransferTransaction(
          addressToUse,
          txData.recipient,
          txData.amount,
          txData.token_mint,
          txData.token_decimals
        );
        
        stepTimings.prepareTransaction = Date.now() - prepareStartTime;
        
        // Step 4: Execute the transaction with Phantom wallet using improved helper
        const executeStartTime = Date.now();
          transactionSignature = await executeTransferWithPhantom(preparedTransaction, TRANSACTION_TIMEOUT);
        
        stepTimings.executeTransaction = Date.now() - executeStartTime;
        
        // Update UI with transaction hash
        if (transactionSignature) {
          setTxHash(transactionSignature);
        }      } catch (transferError: any) {
        // Handle specific transfer errors with user-friendly messages
        if (transferError.message.includes('Insufficient')) {
          throw new Error(`${transferError.message} Please add more funds to your wallet and try again.`);
        } else if (transferError.message.includes('not detected')) {
          throw new Error('Phantom wallet not detected. Please install the Phantom browser extension.');
        } else if (transferError.message.includes('rejected')) {
          throw new Error('Transaction was canceled. You can try again when ready.');
        }
        
        throw transferError;
      }
      
      // Step 5: Wait for transaction confirmation and verify purchase
      setTransactionStatus('confirming');
      
      // Wait a moment for the transaction to propagate through the network
      await new Promise(resolve => setTimeout(resolve, 2000));
        // Step 6: Verify the purchase with the API
      const confirmStartTime = Date.now();
      setTransactionStatus('verifying');
      
      // Make sure we have a transaction signature before proceeding
      if (!transactionSignature) {
        throw new Error('Transaction signature is missing. The transaction may have failed.');
      }

      // Implement retry mechanism with exponential backoff
      let attempts = 0;
      const maxAttempts = 3;
      let verifyResponse: Response | null = null;
      let lastError: any = null;
        const requestPayload = {
        listing_id: listingId, // Backend requires this in both URL and payload
        transaction_hash: transactionSignature, // Backend expects this parameter name
        buyer_wallet: addressToUse,
        verification_timestamp: new Date().toISOString(),
        client_info: {
          client_timestamp: Date.now(),
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
      };
      
      // Retry loop with exponential backoff
      while (attempts < maxAttempts) {
        attempts++;
        
        try {
          const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/marketplace/verify-transaction/${listingId}`;
          
          verifyResponse = await authenticatedFetch(
            apiUrl,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'X-Verification-Attempt': String(attempts),
              },
              body: JSON.stringify(requestPayload),
            }
          );
          
          // If we get a response, break the retry loop
          break;
        } catch (attemptError) {
          lastError = attemptError;
          
          // If we still have attempts left, wait before retrying
          if (attempts < maxAttempts) {
            const backoffTime = Math.min(1000 * Math.pow(2, attempts), 8000); // Exponential backoff: 2s, 4s, 8s
            await new Promise(resolve => setTimeout(resolve, backoffTime));
          } else {
            // We've exhausted our attempts
            throw new Error('Failed to connect to the server after multiple attempts. Please try again later.');
          }
        }
      }
      
      // If all attempts failed (should not happen due to throw above)
      if (!verifyResponse) {
        throw new Error('Server unavailable. Please try again later.');
      }
      
      stepTimings.confirmTransaction = Date.now() - confirmStartTime;
      stepTimings.totalDuration = Date.now() - purchaseStartTime;
      
      // Log performance metrics (removed for production)
      
      if (!verifyResponse.ok) {
        let errorMessage = `Failed to verify transaction (${verifyResponse.status})`;
        try {
          const errorData = await verifyResponse.json();
          
          // Extract the most useful error information
          if (errorData.detail) {
            errorMessage = typeof errorData.detail === 'string' ? 
                          errorData.detail : JSON.stringify(errorData.detail);
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error) {
            errorMessage = typeof errorData.error === 'string' ? 
                          errorData.error : JSON.stringify(errorData.error);
          }
          
          // Special handling for common verification errors
          if (errorMessage.toLowerCase().includes('already purchased') || 
              errorMessage.toLowerCase().includes('already own')) {
            setIsOwnershipInfo(true);
            setErrorMessage('You already have access to this extension!');
            toast.success('You already have access to this extension!');
            setIsPurchasing(false);
            setTransactionStatus('idle');
            return;
          }        } catch (jsonError) {
          // Handle JSON parsing error gracefully - use default error message
        }
        
        throw new Error(errorMessage);
      }
      
      // Check verification result
      const verificationResult = await verifyResponse.json();
      
      // Double check if this was a duplicate purchase
      if (checkIfTransactionNeeded(verificationResult)) {
        setIsPurchasing(false);
        setTransactionStatus('idle');
        return;
      }
      
      // Success! Show success message and trigger parent component callback
      toast.success('Extension purchased successfully! You now have full access to this extension.');
      
      // Update any stored user data with this wallet address for future use
      try {
        const userData = getUserFromCookie();
        if (userData && !useManualEntry) {
          setCookie('user', JSON.stringify({
            ...userData, 
            walletAddress: walletAddress
          }));
        }
      } catch (cookieError) {
        // Non-critical error - wallet address update failed but purchase succeeded
      }
      
      onPurchase();
      onClose(); // Close modal on success
        } catch (error: any) {      // Special handling for verification errors
      
      // Create user-friendly error message
      let errorMsg = error.message || 'Something went wrong. Please try again in a while.';
      let detailedError = errorMsg;
      
      // Special handling for non-base58 character errors
      if (errorMsg.includes('non-base58') || errorMsg.includes('Non-base58')) {
        try {
          // Try to determine which address is causing the issue
          let problematicAddress = '';
          let addressType = 'unknown';
          
          if (errorMsg.includes('token mint')) {
            // Use env variable or fallback as we don't have access to txData here
            problematicAddress = process.env.NEXT_PUBLIC_CODON_MINT_ADDRESS || '';
            addressType = 'token mint';
          } else if (errorMsg.includes('recipient') || errorMsg.includes('seller')) {
            // We can't access txData here, so we'll use a placeholder
            problematicAddress = '';
            addressType = 'recipient';
          } else if (errorMsg.includes('buyer') || errorMsg.includes('from wallet')) {
            problematicAddress = addressToUse || '';
            addressType = 'buyer wallet';
          }
          
          // Get more detailed information about the address
          const analysis = validateAddress(problematicAddress, addressType);
            if (!analysis.valid) {
            errorMsg = analysis.message;
          }
        } catch (analysisError) {
          // If analysis fails, fall back to the original error
        }
      }
      
      // Set error message for UI
      setErrorMessage(errorMsg);
        // Show toast for visibility in case modal is dismissed
      toast.error(errorMsg.length > 100 ? errorMsg.substring(0, 100) + '...' : errorMsg);
    } finally {
      setIsPurchasing(false);
      setTransactionStatus('idle');
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#111] p-4 sm:p-6 rounded-xl shadow-2xl border border-gray-800 max-w-md w-full mx-auto max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-5">
          <div className="flex items-center gap-2">
            <h3 className="text-lg sm:text-xl font-bold text-white">Purchase Extension</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded-lg transition-colors"
            disabled={isPurchasing}
          >
            <X size={18} className="text-gray-400 sm:w-5 sm:h-5" />
          </button>
        </div>
        
        <div className="mb-4 sm:mb-5">
          <h4 className="font-medium text-base sm:text-lg text-white">{title}</h4>
          
          {/* Seller information for transparency */}
          {sellerEmail && (
            <div className="mt-2 p-2 bg-gray-900/50 border border-gray-700 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Seller:</div>
              <div className="text-sm text-gray-200">{sellerEmail}</div>
            </div>
          )}
          
          <div className="mt-2 bg-blue-900/30 text-blue-400 inline-block px-3 py-1 rounded-full text-sm font-medium">
            {price} CODON
          </div>
          
          {/* Fee breakdown explanation */}
          <div className="mt-3 text-xs text-gray-400">
            <p className="mb-1">Payment includes:</p>
            {(() => {
              // Get platform fee percentage from env with fallback to 3%
              const platformFeePercentage = Number(process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE || 3);
              const sellerPercentage = 100 - platformFeePercentage;
              
              // Calculate fee amounts
              const burnAmount = Number((price * platformFeePercentage / 100).toFixed(2));
              const sellerAmount = Number((price - burnAmount).toFixed(2));
              
              return (
                <>
                  <div className="flex justify-between items-center text-gray-300 mb-1">
                    <span>To seller ({sellerPercentage}%):</span>
                    <span>{sellerAmount} CODON</span>
                  </div>
                  <div className="flex justify-between items-center text-green-400">
                    <span>Platform fee - burn ({platformFeePercentage}%):</span>
                    <span>{burnAmount} CODON</span>
                  </div>
                  <p className="mt-2 text-gray-500 italic text-xs">
                    {platformFeePercentage}% of each transaction is burned, reducing the total CODON supply over time.
                  </p>
                </>
              );
            })()}
          </div>
        </div>
        
        {/* Error/Info message banner */}
        {errorMessage && (
          <div className={`mb-3 sm:mb-4 p-3 border rounded-lg ${
            isOwnershipInfo 
              ? 'bg-blue-900/20 border-blue-800' 
              : 'bg-red-900/20 border-red-800'
          }`}>
            <div className="flex items-start gap-2">
              <div className={`mt-0.5 flex-shrink-0 ${isOwnershipInfo ? 'text-blue-400' : 'text-red-400'}`}>
                {isOwnershipInfo ? <Info size={16} /> : <AlertCircle size={16} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm break-words ${isOwnershipInfo ? 'text-blue-400' : 'text-red-400'}`}>
                  {errorMessage}
                </p>
                <button 
                  onClick={() => {
                    setErrorMessage(null);
                    setIsOwnershipInfo(false);
                  }} 
                  className={`text-xs mt-2 underline ${
                    isOwnershipInfo 
                      ? 'text-blue-500 hover:text-blue-400' 
                      : 'text-red-500 hover:text-red-400'
                  }`}
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="mb-4 sm:mb-6">
          {!isConnected ? (
            <div>              
              <p className="text-gray-300 mb-3 text-sm sm:text-base">Connect your Phantom wallet to continue with the purchase</p>
              <WalletConnection onWalletConnected={handleWalletConnected} />
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-gray-300 text-sm sm:text-base">Ready to purchase with your wallet</p>
                <button 
                  onClick={() => {
                    setIsConnected(false);
                    setWalletAddress('');
                    // Clear from cookie if needed
                    const userData = getUserFromCookie();
                    if (userData) {
                      const { walletAddress, ...rest } = userData;
                      setCookie('user', JSON.stringify(rest));
                    }
                  }}
                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  Disconnect
                </button>
              </div>
              
              <div className="bg-black/50 border border-gray-800 rounded-lg p-3">
                <div className="text-xs text-gray-400 mb-1">Current Phantom wallet:</div>
                {walletAddress && (
                  <WalletAddressDisplay address={walletAddress} />
                )}
              </div>
              
              {isPurchasing && (
                <div className="bg-black/50 border border-gray-800 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center mb-2 sm:mb-3">
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-purple-400 mr-2 flex-shrink-0"></div>
                    <p className="text-gray-300 text-sm sm:text-base">
                      {transactionStatus === 'creating' && 'Creating transaction...'}
                      {transactionStatus === 'signing' && 'Waiting for wallet signature...'}
                      {transactionStatus === 'confirming' && 'Confirming transaction on Solana...'}
                      {transactionStatus === 'verifying' && 'Verifying purchase...'}
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
              
              <button
                onClick={handlePurchase}
                disabled={isPurchasing || (useManualEntry && !manualWalletAddress)}
                className={`w-full py-2.5 sm:py-3 px-4 rounded-lg font-medium text-white text-sm sm:text-base
                  ${(isPurchasing || (useManualEntry && !manualWalletAddress)) 
                    ? 'bg-purple-800/50 cursor-not-allowed' 
                    : 'bg-purple-600 hover:bg-purple-700'} 
                  transition-colors flex items-center justify-center gap-2`}
              >
                {isPurchasing ? 'Processing...' : `Pay ${price} CODON`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PurchaseModal;
