// Script to verify CODON mint address and token details
const { Connection, clusterApiUrl, PublicKey } = require('@solana/web3.js');
const path = require('path');
const fs = require('fs');

// Manually load environment variables from .env.local
function loadEnvVariables() {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const content = fs.readFileSync(envPath, 'utf8');
    const lines = content.split('\n');
    
    lines.forEach(line => {
      // Skip comments and empty lines
      if (line.startsWith('#') || !line.trim()) return;
      
      // Parse VAR=VALUE format
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        
        // Remove quotes if present
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        
        process.env[key] = value;
      }
    });
    console.log('Environment variables loaded from .env.local');
  } catch (error) {
    console.error('Error loading .env.local file:', error.message);
  }
}

// Load environment variables
loadEnvVariables();

/**
 * Helper function to validate a Solana address
 * @param {string} address - The address to validate
 * @returns {boolean} - Whether the address is valid
 */
function isValidSolanaAddress(address) {
  if (!address) return false;
  
  // Trim whitespace
  const trimmed = address.trim();
  
  // Check basic pattern
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed)) {
    return false;
  }
  
  // Try to create PublicKey (this will throw if invalid)
  try {
    new PublicKey(trimmed);
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Verifies environment variables for Solana addresses
 */
function verifyEnvVariables() {
  console.log('Verifying Solana addresses in environment variables...');
  
  // Check CODON mint address
  const mintAddress = process.env.NEXT_PUBLIC_CODON_MINT_ADDRESS;
  console.log('\nCODON Mint Address:', mintAddress);
  
  if (!mintAddress) {
    console.error('❌ ERROR: NEXT_PUBLIC_CODON_MINT_ADDRESS is not defined in .env.local');
    return false;
  } else {
    if (isValidSolanaAddress(mintAddress)) {
      console.log('✅ Mint address is valid');
    } else {
      console.error('❌ ERROR: Mint address is invalid!');
      console.error(`   The value "${mintAddress}" is not a valid Solana address`);
      console.error('   Addresses should be 32-44 base58-encoded characters (letters & numbers, no 0OIl)');
      return false;
    }
  }
  
  // Note about CODON burning
  console.log('\nCODON Burning: Using native SPL token burning instructions');
  console.log('✅ No burn address needed - using Solana\'s native burn mechanism');
  
  // Legacy check - can be removed in future updates
  const burnAddress = process.env.NEXT_PUBLIC_CODON_BURN_ADDRESS;
  if (burnAddress) {
    console.log('ℹ️ Note: NEXT_PUBLIC_CODON_BURN_ADDRESS is defined but no longer needed');
    console.log('   The application now uses Solana\'s native SPL token burn instruction instead of a burn address');
  }
  
  return true;
}

async function verifyCodonMint() {
  try {
    // Check on mainnet first
    console.log('Checking on mainnet...');
    const mainnetConnection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
    const CODON_MINT = new PublicKey('FLsQ58bYWabZKZsHWF1tZ2WYdcZ2gMFBtPjCB2HvLxb8');

    console.log('Verifying CODON mint address:', CODON_MINT.toString());
    
    // Get mint info
    const mintInfo = await mainnetConnection.getParsedAccountInfo(CODON_MINT);
    
    if (mintInfo.value) {
      console.log('✅ Mint account found on mainnet!');
      console.log('Account data:', JSON.stringify(mintInfo.value.data, null, 2));
    } else {
      console.log('❌ Mint account not found on mainnet');
      
      // Also check devnet
      console.log('\nChecking on devnet...');
      const devnetConnection = new Connection(clusterApiUrl('devnet'), 'confirmed');
      const devnetMintInfo = await devnetConnection.getParsedAccountInfo(CODON_MINT);
      
      if (devnetMintInfo.value) {
        console.log('✅ Mint account found on devnet!');
        console.log('Account data:', JSON.stringify(devnetMintInfo.value.data, null, 2));
      } else {
        console.log('❌ Mint account not found on devnet either');
      }
    }

  } catch (error) {
    console.error('Error verifying CODON mint:', error.message);
  }
}

// First verify environment variables
const envVarsValid = verifyEnvVariables();
if (envVarsValid) {
  console.log('\nEnvironment variables look good. Now checking the mint address on chain...');
  // Then verify on-chain if env vars are valid
  verifyCodonMint();
} else {
  console.error('\nEnvironment variable check failed. Please fix the issues above before continuing.');
}
