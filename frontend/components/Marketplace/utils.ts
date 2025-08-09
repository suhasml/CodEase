'use client';

import { Connection, PublicKey, Transaction, clusterApiUrl } from '@solana/web3.js';
import { 
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  createBurnInstruction
} from '@solana/spl-token';
import { isValidSolanaAddress, analyzeAddress } from '@/lib/solana-utils';
import { toast } from 'react-hot-toast';

// Note: Phantom wallet types are declared elsewhere in the application

// Helper function to validate wallet addresses with detailed feedback
export const validateAddress = (address: string, addressType = 'wallet') => {
  if (!address || address.trim() === '') {
    return { valid: false, message: `${addressType} address is missing or empty` };
  }
  
  // Use our enhanced address analyzer
  const analysis = analyzeAddress(address);
  
  if (!analysis.valid) {
    let message = `Invalid ${addressType} address`;
    
    if (analysis.reason) {
      message += `: ${analysis.reason}`;
    }
    
    if (analysis.invalidChars && analysis.invalidChars.length > 0) {
      const invalidCharsDisplay = analysis.invalidChars.map(c => 
        c === ' ' ? 'space' : 
        c.charCodeAt(0) < 32 ? `control character (code ${c.charCodeAt(0)})` : 
        `'${c}'`
      ).join(', ');
      
      message += `. Found invalid characters: ${invalidCharsDisplay}`;
    }
    
    return { valid: false, message };
  }
  
  return { valid: true };
};

// Helper function to extract transaction data from the backend response
export const extractTransactionData = (responseData: any) => {
  const txData = responseData.transaction_data || {};
    // Get the token mint
  const tokenMintFromTxData = txData.token_mint;
  const tokenMintFromResponseData = responseData.token_mint;
  const tokenMint = tokenMintFromTxData || tokenMintFromResponseData || process.env.NEXT_PUBLIC_CODON_MINT_ADDRESS;
  
  return {
    // Extract key fields with robust fallbacks to ensure we get values from the correct location
    amount: txData.amount || responseData.amount || 0,
    recipient: txData.recipient || responseData.seller_wallet || responseData.receiver_wallet,
    token_mint: tokenMint,
    token_decimals: txData.token_decimals || responseData.token_decimals || 9, // Default to 9 decimals for CODON token
    memo: txData.memo || responseData.memo || '',
    blockchain: txData.blockchain || responseData.blockchain || 'solana',
    already_owned: responseData.already_owned || txData.already_owned || false,
    already_purchased: responseData.already_purchased || txData.already_purchased || false,
    no_transaction_needed: responseData.no_transaction_needed || txData.no_transaction_needed || false,
    listing_id: responseData.listing_id || txData.listing_id || '',
    extension_id: responseData.extension_id || txData.extension_id || responseData.id || '',
    timestamp: new Date().toISOString(), // Add timestamp for transaction tracing
    price: responseData.price || txData.price || responseData.price_codon || 0
  };
};

// Helper function to check if a transaction is needed or if the user already has access
export const checkIfTransactionNeeded = (
  transactionData: any, 
  setIsOwnershipInfo?: React.Dispatch<React.SetStateAction<boolean>>, 
  setErrorMessage?: React.Dispatch<React.SetStateAction<string | null>>
) => {  const { already_owned, already_purchased, no_transaction_needed, memo = '' } = transactionData;
  
  if (already_owned || already_purchased || no_transaction_needed) {
    // Handle the case where user is the creator of the extension or no transaction is needed
    if (no_transaction_needed) {
      const lowerMemo = String(memo).toLowerCase();
      
      if (lowerMemo.includes('creator') || lowerMemo.includes('owner') || lowerMemo.includes('you are the')) {
        if (setIsOwnershipInfo) setIsOwnershipInfo(true);
        if (setErrorMessage) setErrorMessage(`${memo}. You don't need to purchase your own extension.`);
        toast.success('You own this extension!');
        return true;
      }
    }
    
    // Handle the case where the user has already purchased this extension
    if (already_purchased) {
      if (setErrorMessage) setErrorMessage(`You have already purchased this extension.`);
      toast.success('You already own this extension!');
      return true;
    }
  }
  
  return false;
};

// Helper function to prepare a token transfer transaction
export const prepareTokenTransferTransaction = async (
  fromWallet: string,
  recipientWallet: string,
  amount: number,
  tokenMint: string,
  tokenDecimals: number = 9
) => {
  // Validate required parameters
  if (!isValidSolanaAddress(fromWallet)) {
    throw new Error('Invalid sender wallet address');
  }
  
  if (!isValidSolanaAddress(recipientWallet)) {
    throw new Error('Invalid recipient wallet address');
  }
  
  if (!isValidSolanaAddress(tokenMint)) {
    throw new Error('Invalid token mint address');
  }
    if (amount <= 0) {
    throw new Error('Amount must be greater than 0');
  }
  
  try {
    // Enhanced RPC endpoint selection with Helius primary and fallbacks (same as marketplace and checkout)
    const getRpcEndpoint = () => {
      const heliusRpc = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
      
      // If Helius RPC is configured, use it
      if (heliusRpc && heliusRpc.includes('helius')) {
        return heliusRpc;
      }
      
      // Fallback RPC endpoints if Helius is not configured
      const fallbackEndpoints = [
        'https://rpc.ankr.com/solana',
        'https://solana-api.projectserum.com',
        'https://api.mainnet-beta.solana.com',
      ];
      
      // Use environment RPC if available, otherwise use fallbacks
      return heliusRpc || fallbackEndpoints[0];    };
    
    let connection: Connection;
    const rpcEndpoint = getRpcEndpoint();
    
    // Set up connection to Solana network with enhanced configuration
    connection = new Connection(rpcEndpoint, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000,
      disableRetryOnRateLimit: false,
    });    // Test the connection
    try {
      await connection.getLatestBlockhash();
    } catch (connectionError) {
      // If Helius fails, fall back to Ankr
      connection = new Connection('https://rpc.ankr.com/solana', {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000,
      });
      
      await connection.getLatestBlockhash();
    }
    
    // Create transaction
    const transaction = new Transaction();
      // Convert the string addresses to PublicKey objects
    const fromPublicKey = new PublicKey(fromWallet);
    const toPublicKey = new PublicKey(recipientWallet);
    const tokenMintPublicKey = new PublicKey(tokenMint);
    
    // Calculate platform fee (default to 3% if not specified in env)
    const platformFeePercentage = Number(process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE || 3);
    const sellerPercentage = 100 - platformFeePercentage;
      // Calculate amounts for seller and platform fee (burn)
    const sellerAmount = amount * (sellerPercentage / 100);
    const burnAmount = amount - sellerAmount;
    
    // Calculate token amounts with decimals using BigInt to avoid precision issues
    const rawSellerAmount = sellerAmount * Math.pow(10, tokenDecimals);
    const adjustedSellerAmount = BigInt(Math.round(rawSellerAmount));
    
    const rawBurnAmount = burnAmount * Math.pow(10, tokenDecimals);
    const adjustedBurnAmount = BigInt(Math.round(rawBurnAmount));
    
    // Get associated token accounts
    const fromTokenAccount = await getAssociatedTokenAddress(
      tokenMintPublicKey,
      fromPublicKey
    );
    
    const toTokenAccount = await getAssociatedTokenAddress(
      tokenMintPublicKey,
      toPublicKey
    );
    
    // Check if recipient has an associated token account
    const receiverAccount = await connection.getAccountInfo(toTokenAccount);
      // If recipient doesn't have a token account, create one
    if (!receiverAccount) {
      transaction.add(
        createAssociatedTokenAccountInstruction(
          fromPublicKey,
          toTokenAccount,
          toPublicKey,
          tokenMintPublicKey
        )
      );
    }
      // Add transfer instruction for seller payment
    transaction.add(
      createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        fromPublicKey,
        adjustedSellerAmount
      )
    );
    
    // Add burn instruction for platform fee
    transaction.add(
      createBurnInstruction(
        fromTokenAccount,
        tokenMintPublicKey,
        fromPublicKey,
        adjustedBurnAmount
      )
    );
    
    // Get recent blockhash for transaction
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.feePayer = fromPublicKey;
    
    return { transaction, connection };  } catch (error: any) {
    throw new Error(`Failed to prepare transaction: ${error.message}`);
  }
};

// Execute transaction with Phantom wallet
export const executeTransferWithPhantom = async (
  preparedTransaction: Transaction,
  timeoutMs: number = 60000
): Promise<string> => {
  // Make sure phantom is available
  if (!('phantom' in window)) {
    throw new Error('Phantom wallet not detected. Please install the Phantom extension.');
  }
  
  // Timeout promise
  const timeout = new Promise<null>((_, reject) => {
    setTimeout(() => reject(new Error('Transaction signing timed out')), timeoutMs);
  });
    try {
    // Use type assertion for Phantom wallet
    const provider = window.phantom?.solana;
    
    if (!provider) {
      throw new Error('Phantom provider not found');
    }
    
    // Request signature from user - use type assertion since we know the API
    const signPromise = (provider as any).signAndSendTransaction(preparedTransaction);
    
    // Race the signing process against the timeout
    const result = await Promise.race([signPromise, timeout]) as { signature: string };
    const { signature } = result;
    
    return signature;  } catch (error: any) {
    // Enhance error message for common issues
    if (error.message?.includes('User rejected')) {
      throw new Error('Transaction was rejected by the user');
    }
    
    throw error;
  }
};

// Function to format date
export const formatDate = (dateString: string): string => {
  if (!dateString) return 'Unknown date';
  
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  } catch (error) {
    return 'Invalid date';
  }
};
