/**
 * Solana Utilities
 * 
 * This file contains utility functions for working with Solana addresses and transactions.
 * It helps prevent common errors like "non-base58 character" errors that can occur
 * when working with wallet addresses and token mints.
 */

import { PublicKey } from '@solana/web3.js';

/**
 * Validates if a string is a valid Solana address (base58 encoded)
 * 
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
 * Analyzes a Solana address for potential issues
 * Helps debug "non-base58 character" errors
 * 
 * @param address The address to analyze
 * @returns Object with analysis details
 */
export function analyzeAddress(address: string): {
  valid: boolean;
  sanitized: string;
  reason?: string;
  invalidChars?: string[];
  positions?: {char: string, indices: number[]}[];
} {
  if (!address || typeof address !== 'string') {
    return {
      valid: false,
      sanitized: '',
      reason: 'Address is empty or not a string'
    };
  }
  
  // Trim any whitespace
  const trimmed = address.trim();
  
  // Remove invisible characters
  const sanitized = trimmed
    .replace(/\u200B/g, '') // zero-width space
    .replace(/\uFEFF/g, '') // zero-width no-break space
    .replace(/\u00A0/g, ''); // non-breaking space
  
  // Check length
  if (sanitized.length < 32) {
    return {
      valid: false,
      sanitized,
      reason: 'Address is too short (less than 32 characters)'
    };
  }
  
  if (sanitized.length > 44) {
    return {
      valid: false,
      sanitized,
      reason: 'Address is too long (more than 44 characters)'
    };
  }
  
  // Check for common prefix errors
  if (sanitized.startsWith('0x')) {
    return {
      valid: false,
      sanitized,
      reason: 'Address starts with 0x (Ethereum format), but Solana addresses are base58 encoded'
    };
  }
  
  // Check for invalid characters
  const nonBase58Chars = sanitized.match(/[^1-9A-HJ-NP-Za-km-z]/g);
  if (nonBase58Chars) {
    // Find positions of each invalid character
    const uniqueInvalidChars = Array.from(new Set(nonBase58Chars));
    const positions = uniqueInvalidChars.map(char => {
      const indices: number[] = [];
      let idx = sanitized.indexOf(char);
      while (idx !== -1) {
        indices.push(idx);
        idx = sanitized.indexOf(char, idx + 1);
      }
      return { char, indices };
    });
    
    return {
      valid: false,
      sanitized,
      reason: 'Contains non-base58 characters',
      invalidChars: uniqueInvalidChars,
      positions
    };
  }
  
  // Try to create a PublicKey as a final validation
  try {
    new PublicKey(sanitized);
    return { valid: true, sanitized };
  } catch (error: any) {
    return {
      valid: false,
      sanitized,
      reason: `PublicKey validation failed: ${error.message}`
    };
  }
}

/**
 * Sanitizes and validates a Solana address, throwing specific errors for issues
 * 
 * @param address The address to sanitize and validate
 * @param addressType A description of the address type (for error messages)
 * @returns The sanitized address
 * @throws Error with detailed message if address is invalid
 */
export function sanitizeAndValidateSolanaAddress(address: string, addressType: string): string {
  if (!address) {
    throw new Error(`${addressType} address is missing or empty`);
  }
  
  // Analyze the address
  const analysis = analyzeAddress(address);
  
  // If the address is invalid, throw a detailed error
  if (!analysis.valid) {
    let errorMessage = `Invalid ${addressType} address`;
    
    if (analysis.reason) {
      errorMessage += `: ${analysis.reason}`;
    }
    
    if (analysis.invalidChars && analysis.invalidChars.length > 0) {
      const invalidCharsStr = analysis.invalidChars.map(c => 
        c === ' ' ? 'space' : 
        c.charCodeAt(0) < 32 ? `char code ${c.charCodeAt(0)}` : 
        `'${c}'`
      ).join(', ');
      
      errorMessage += `. Found invalid characters: ${invalidCharsStr}`;
      
      if (analysis.positions) {
        const positionsStr = analysis.positions
          .map(p => `'${p.char}' at position(s) ${p.indices.join(', ')}`)
          .join('; ');
        
        errorMessage += `. Positions: ${positionsStr}`;
      }
    }
    
    throw new Error(errorMessage);
  }
  
  return analysis.sanitized;
}

/**
 * Safely creates a PublicKey from an address with enhanced error handling
 * 
 * @param address The address to convert to PublicKey
 * @param addressType A description of the address type (for error messages)
 * @returns The created PublicKey
 * @throws Error with detailed message if PublicKey creation fails
 */
export function safeCreatePublicKey(address: string, addressType: string): PublicKey {
  try {
    // First sanitize and validate the address
    const sanitizedAddress = sanitizeAndValidateSolanaAddress(address, addressType);
    
    // Then attempt to create the PublicKey
    return new PublicKey(sanitizedAddress);
  } catch (error: any) {
    // If the error is from our sanitization, just rethrow it
    if (error.message.includes(`Invalid ${addressType} address`)) {
      throw error;
    }
    
    // Otherwise, enhance the error message
    let errorMessage = error?.message || 'Unknown error';
    
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
 * Attempts to fix a Solana address by removing non-base58 characters
 * Use with caution as this can create a valid but incorrect address!
 * 
 * @param address The address to attempt to fix
 * @returns Object with fixed address and status
 */
export function attemptAddressFix(address: string): { 
  fixed: boolean; 
  original: string; 
  fixedAddress: string; 
  changes?: { removed: string[]; positions: number[] };
} {
  if (!address) {
    return { fixed: false, original: address, fixedAddress: '' };
  }
  
  const original = address;
  const analysis = analyzeAddress(address);
  
  // If already valid, return early
  if (analysis.valid) {
    return { fixed: true, original, fixedAddress: analysis.sanitized, changes: undefined };
  }
  
  // Remove all non-base58 characters
  const fixedAddress = analysis.sanitized.replace(/[^1-9A-HJ-NP-Za-km-z]/g, '');
  
  // Check if the new address is valid
  try {
    new PublicKey(fixedAddress);
    
    // Extract information about what was changed
    const removedChars = analysis.invalidChars || [];
    const positions = analysis.positions?.flatMap(p => p.indices) || [];
    
    return {
      fixed: true,
      original,
      fixedAddress,
      changes: { removed: removedChars, positions }
    };
  } catch {
    return { fixed: false, original, fixedAddress };
  }
}
