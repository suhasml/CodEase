import { 
  Connection, PublicKey, Transaction 
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  createAssociatedTokenAccountInstruction,
  createBurnInstruction,
  TOKEN_PROGRAM_ID
} from '@solana/spl-token';

/**
 * Validates if a string is a valid Solana address (base58 encoded)
 * @param address The address to validate
 * @returns Boolean indicating if the address is valid
 */
export function isValidSolanaAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }
  
  // Trim any whitespace that might have been introduced
  const trimmed = address.trim();
  
  // Base58 character set validation (Solana addresses are base58 encoded)
  // They should be 32-44 characters and use only base58 character set
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed);
}

/**
 * Sanitizes and validates a Solana address, throwing specific errors for issues
 * @param address The address to sanitize and validate
 * @param addressType A description of the address type (for error messages)
 * @returns The sanitized address
 */
export function sanitizeAndValidateSolanaAddress(address: string, addressType: string): string {
  if (!address) {
    throw new Error(`${addressType} address is missing or empty`);
  }
  
  // Trim any whitespace that might have been introduced
  const trimmed = address.trim();
  
  // Remove any invisible characters that could be causing issues
  const sanitized = trimmed
    .replace(/\u200B/g, '') // zero-width space
    .replace(/\uFEFF/g, '') // zero-width no-break space
    .replace(/\u00A0/g, ''); // non-breaking space
  
  // Check if the address is valid
  if (!isValidSolanaAddress(sanitized)) {
    // Check for common issues
    if (sanitized.startsWith('0x')) {
      throw new Error(`Invalid ${addressType} address: ${sanitized.substring(0, 10)}... - Solana addresses do not start with 0x`);
    }
    
    if (sanitized.length < 32) {
      throw new Error(`Invalid ${addressType} address: ${sanitized} - Address is too short`);
    }
    
    if (sanitized.length > 44) {
      throw new Error(`Invalid ${addressType} address: ${sanitized.substring(0, 10)}... - Address is too long`);
    }
    
    // Check for non-base58 characters
    const nonBase58Chars = sanitized.match(/[^1-9A-HJ-NP-Za-km-z]/g);
    if (nonBase58Chars) {
      throw new Error(`Invalid ${addressType} address: Contains non-base58 characters: "${nonBase58Chars.join(', ')}"`);
    }
    
    // Default error if none of the specific cases match
    throw new Error(`Invalid ${addressType} address: ${sanitized.substring(0, 10)}... - Not a valid Solana address`);
  }
  
  return sanitized;
}

/**
 * Safely creates a PublicKey from an address with enhanced error handling
 * @param address The address to convert to PublicKey
 * @param addressType A description of the address type (for error messages)
 * @returns The created PublicKey
 */
export function safeCreatePublicKey(address: string, addressType: string): PublicKey {
  try {
    return new PublicKey(address);
  } catch (error: any) {
    let errorMessage = error?.message || 'Unknown error';
    
    // Enhance error message with more context
    if (errorMessage.includes('Non-base58')) {
      const match = errorMessage.match(/Non-base58 character: (.+)/);
      const badChar = match ? match[1] : 'unknown';
      errorMessage = `Invalid ${addressType} address: Contains non-base58 character: "${badChar}". Please check for invisible or special characters.`;
    } else {
      errorMessage = `Invalid ${addressType} address: ${errorMessage}`;
    }
    
    throw new Error(errorMessage);
  }
}

/**
 * Payment recipient structure
 */
export interface PaymentRecipient {
  recipient: string;
  amount: number;
  description?: string;
}

/**
 * Burn information structure
 */
export interface BurnInfo {
  amount: number;
  percentage: number;
}

/**
 * Transaction data for split payments
 */
export interface SplitTransactionData {
  payments: PaymentRecipient[];
  token_mint: string;
  token_decimals?: number;
  burn?: BurnInfo; // Information about tokens to burn
  memo?: string;
}

/**
 * Calculate the split payment amounts between seller and platform fee (burn)
 * @param totalAmount - The total amount of the transaction
 * @param sellerWallet - The wallet address of the seller to receive payment
 * @param platformFeePercentage - The platform fee percentage (default: 3%)
 * @returns The split payment details
 */
export function calculateSplitPayment(
  totalAmount: number,
  sellerWallet: string,
  platformFeePercentage: number = 3
): { 
  sellerAmount: number; 
  burnAmount: number; 
  payments: PaymentRecipient[];
  burn: BurnInfo;
}{
  // Input validation
  if (!sellerWallet) {
    throw new Error('Seller wallet address is required for split payment');
  }
  
  if (totalAmount <= 0) {
    throw new Error('Total amount must be greater than zero');
  }
    if (platformFeePercentage < 0 || platformFeePercentage >= 100) {
    platformFeePercentage = 3;
  }
  // Calculate amounts with proper rounding to avoid floating point issues
  const burnAmount = Number((totalAmount * platformFeePercentage / 100).toFixed(9));
  const sellerAmount = Number((totalAmount - burnAmount).toFixed(9));
  
  // Format percentages for description
  const sellerPercentage = (100 - platformFeePercentage).toFixed(0);
  const feePercentage = platformFeePercentage.toFixed(0);
  
  // Create payment recipients array - just the seller, burn will be handled separately
  const payments: PaymentRecipient[] = [
    {
      recipient: sellerWallet,
      amount: sellerAmount,
      description: `Seller payment (${sellerPercentage}%)`
    },
    // Note: We no longer add a burn "recipient" here because we'll use
    // Solana's native burn instruction instead of transferring to a burn address
  ];
  return {
    sellerAmount,
    burnAmount,
    payments,
    burn: {
      amount: burnAmount,
      percentage: platformFeePercentage
    }
  };
}

/**
 * Creates a split payment transaction for marketplace purchase
 * - Default 97% to seller
 * - Default 3% to burn address (configurable via NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE)
 */
export async function createSplitPaymentTransaction(
  fromWallet: string,
  transactionData: SplitTransactionData
): Promise<{ transaction: Transaction; connection: Connection; payments: PaymentRecipient[]; totalAmount: number }> {
  try {
    // Enhanced RPC endpoint selection with Helius primary and fallbacks (same as marketplace)
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
      return heliusRpc || fallbackEndpoints[0];
    };
    
    const rpcEndpoint = getRpcEndpoint();    // Set up connection to Solana network with enhanced configuration
    const connection = new Connection(rpcEndpoint, {
      commitment: 'confirmed',
      confirmTransactionInitialTimeout: 60000,
      disableRetryOnRateLimit: false,
    });    // Test the connection
    try {
      await connection.getLatestBlockhash();
    } catch (connectionError) {
      // If Helius fails, fall back to Ankr
      const fallbackConnection = new Connection('https://rpc.ankr.com/solana', {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000,
      });
      
      await fallbackConnection.getLatestBlockhash();
      
      // Continue with fallback connection
      return await createSplitPaymentTransactionWithConnection(
        fallbackConnection, fromWallet, transactionData
      );
    }

    // Continue with primary connection
    return await createSplitPaymentTransactionWithConnection(
      connection, fromWallet, transactionData
    );
  } catch (error) {
    throw error;
  }
}

/**
 * Extract the core transaction creation logic to a separate function
 */
async function createSplitPaymentTransactionWithConnection(
  connection: Connection,
  fromWallet: string,
  transactionData: SplitTransactionData
): Promise<{ transaction: Transaction; connection: Connection; payments: PaymentRecipient[]; totalAmount: number }> {
  // Input validation
  if (!fromWallet) {
    throw new Error('Buyer wallet address is required');
  }

  if (!transactionData.token_mint) {
    throw new Error('Token mint address is required');
  }

  if (!transactionData.payments || transactionData.payments.length === 0) {
    throw new Error('No payment recipients specified');
  }

  // Extract payment details
  const { payments, token_mint, token_decimals = 9, memo } = transactionData;
  
  // Sanitize and validate addresses before creating PublicKeys
  const sanitizedBuyerAddress = sanitizeAndValidateSolanaAddress(fromWallet, 'buyer');
  const sanitizedTokenMintAddress = sanitizeAndValidateSolanaAddress(token_mint, 'token mint');
  
  // Safely create PublicKeys with enhanced error handling
  const buyerPublicKey = safeCreatePublicKey(sanitizedBuyerAddress, 'buyer');
  const tokenMint = safeCreatePublicKey(sanitizedTokenMintAddress, 'token mint');

  // Create a new transaction
  const transaction = new Transaction();

  // Get buyer's token account
  const buyerTokenAccount = await getAssociatedTokenAddress(
    tokenMint,
    buyerPublicKey
  );

  // Track the total amount being transferred
  let totalAmount = 0;

  // Process each payment to recipients (typically seller)
  for (const payment of payments) {    if (!payment.recipient || !payment.amount) {
      continue;
    }
    
    // Sanitize and validate recipient address
    try {
      const sanitizedRecipientAddress = sanitizeAndValidateSolanaAddress(
        payment.recipient, 
        payment.description ? `recipient (${payment.description})` : 'recipient'
      );
      const recipientPublicKey = safeCreatePublicKey(
        sanitizedRecipientAddress,
        payment.description ? `recipient (${payment.description})` : 'recipient'
      );
      
      // Use Math.round to avoid floating point precision issues
      const amountRaw = Math.round(payment.amount * Math.pow(10, token_decimals));
      const amountBigInt = BigInt(amountRaw);
      
      totalAmount += payment.amount;
      
      // Get recipient's token account
      const recipientTokenAccount = await getAssociatedTokenAddress(
        tokenMint,
        recipientPublicKey
      );      // Check if recipient token account exists
      try {
        await connection.getAccountInfo(recipientTokenAccount);
      } catch (error) {
        // Create associated token account for recipient
        transaction.add(
          createAssociatedTokenAccountInstruction(
            buyerPublicKey,
            recipientTokenAccount,
            recipientPublicKey,
            tokenMint
          )
        );
      }      // Add transfer instruction
      transaction.add(
        createTransferInstruction(
          buyerTokenAccount,
          recipientTokenAccount,
          buyerPublicKey,
          amountBigInt
        )
      );
    } catch (error: any) {
      // Handle any errors in payment processing
      throw new Error(`Failed to process payment to ${payment.description || 'recipient'}: ${error.message || 'Unknown error'}`);
    }
  }
  
  // Process burn amount separately using proper SPL token burn instruction
  if (transactionData.burn && transactionData.burn.amount > 0) {
    try {      // Calculate burn amount with proper decimals
      const burnAmountRaw = Math.round(transactionData.burn.amount * Math.pow(10, token_decimals));
      const burnAmountBigInt = BigInt(burnAmountRaw);
      
      // Add burn instruction directly - this is the proper way to burn SPL tokens
      // The tokens will be burned from the buyer's token account
      transaction.add(
        createBurnInstruction(
          buyerTokenAccount, // Source account (from buyer's token account)
          tokenMint,        // Token mint
          buyerPublicKey,   // Owner of the source account
          burnAmountBigInt  // Amount to burn
        )
      );
        // Add this to the total amount being processed
      totalAmount += transactionData.burn.amount;
      
    } catch (error: any) {
      throw new Error(`Failed to set up token burn: ${error.message || 'Unknown error'}`);
    }
  }
  // Validate that the transaction contains the expected instructions
  if (transaction.instructions.length === 0) {
    throw new Error('Transaction creation failed: No instructions added');
  }

  // Set recent blockhash and fee payer
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = buyerPublicKey;

  return { transaction, connection, payments, totalAmount };
}

/**
 * Convert the original transaction data format to our split transaction format
 */
/**
 * Converts standard transaction data to split payment format with platform fee
 * @param originalData The original transaction data
 * @returns The formatted split transaction data
 */
export function convertToSplitTransactionData(originalData: any): SplitTransactionData {
  try {
    // Validate input data
    if (!originalData) {
      throw new Error('Cannot create split transaction: Missing transaction data');
    }

    // Get platform fee percentage from env with fallback to 3%
    const platformFeePercentage = Number(process.env.NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE || 3);
      if (!originalData.recipient) {
      throw new Error('Cannot create split transaction: Missing recipient address');
    }

    if (typeof originalData.amount !== 'number' || isNaN(originalData.amount) || originalData.amount <= 0) {
      throw new Error(`Cannot create split transaction: Invalid amount (${originalData.amount})`);
    }

    // Retrieve token mint address with validation
    const tokenMint = originalData.token_mint || process.env.NEXT_PUBLIC_CODON_MINT_ADDRESS;
    if (!tokenMint) {
      throw new Error('Cannot create split transaction: Missing token mint address');
    }
      // Calculate split payments (97% to seller, 3% to burn address)
    const { payments, sellerAmount, burnAmount, burn } = calculateSplitPayment(
      originalData.amount,
      originalData.recipient,
      platformFeePercentage
    );    return {
      payments,
      token_mint: tokenMint,
      token_decimals: originalData.token_decimals || 9,
      burn, // Include burn information for the createBurnInstruction
      memo: originalData.memo || `Purchase with ${platformFeePercentage}% platform fee burn`
    };} catch (error) {
    throw error;
  }
}
