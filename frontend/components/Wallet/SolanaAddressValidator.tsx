'use client';

import { useEffect } from 'react';
import { isValidSolanaAddress, analyzeAddress } from '@/lib/solana-utils';

/**
 * This component validates critical Solana addresses in environment variables
 * on app startup to catch issues early.
 * 
 * It will log warnings in the browser console if any issues are found.
 */
export default function SolanaAddressValidator() {
  useEffect(() => {    // Don't run in production to avoid console noise for users
    if (process.env.NODE_ENV === 'production') {
      return;
    }
    
    // List of environment variables that should contain Solana addresses
    const addressVars = [
      {
        key: 'NEXT_PUBLIC_CODON_MINT_ADDRESS', 
        value: process.env.NEXT_PUBLIC_CODON_MINT_ADDRESS,
        description: 'CODON token mint'
      }
      // Add more as needed
      // Note: NEXT_PUBLIC_CODON_BURN_ADDRESS was removed as we now use Solana's native burn instruction
    ];
    
    // Check each address
    const issues: string[] = [];
    
    addressVars.forEach(({ key, value, description }) => {
      if (!value) {
        issues.push(`⚠️ ${key} is not defined in environment variables`);
        return;
      }
      
      // Analyze the address
      const analysis = analyzeAddress(value);
      
      if (!analysis.valid) {
        let message = `⚠️ Invalid ${description} address (${key}): ${analysis.reason}`;
        
        if (analysis.invalidChars && analysis.invalidChars.length > 0) {
          const invalidCharsStr = analysis.invalidChars.map(c => 
            c === ' ' ? 'space' : 
            c.charCodeAt(0) < 32 ? `char code ${c.charCodeAt(0)}` : 
            `'${c}'`
          ).join(', ');
          
          message += `. Found invalid characters: ${invalidCharsStr}`;
        }
        
        issues.push(message);
      }    });
    
    // Validation complete - issues are handled silently in production
  }, []);

  // This component doesn't render anything
  return null;
}
