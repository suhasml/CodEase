/**
 * Validation script for Solana addresses
 * 
 * This script helps validate Solana addresses in environment variables,
 * preventing non-base58 character errors in production.
 * 
 * Usage:
 * node validate-solana-address.js [--env=.env.local] [--keys=ADDRESS1,ADDRESS2] [--fix]
 * 
 * Options:
 * --env     Path to the env file (default: .env.local)
 * --keys    Comma-separated list of environment variable keys to check (default: checks common Solana address keys)
 * --fix     Attempt to fix invalid addresses by removing non-base58 characters (use with caution)
 * --verbose Show detailed output
 */

// Try to load dotenv, but continue if not available
let dotenv;
try {
  dotenv = require('dotenv');
} catch (error) {
  console.log('dotenv package not found, working with process.env only');
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  env: '.env.local',
  keys: ['NEXT_PUBLIC_CODON_MINT_ADDRESS'], // Removed NEXT_PUBLIC_CODON_BURN_ADDRESS as it's no longer needed
  fix: false,
  verbose: false
};

// Parse command line arguments
args.forEach(arg => {
  if (arg.startsWith('--env=')) {
    options.env = arg.split('=')[1];
  } else if (arg.startsWith('--keys=')) {
    options.keys = arg.split('=')[1].split(',');
  } else if (arg === '--fix') {
    options.fix = true;
  } else if (arg === '--verbose') {
    options.verbose = true;
  } else if (arg === '--help' || arg === '-h') {
    console.log(`
Usage: node validate-solana-address.js [--env=.env.local] [--keys=ADDRESS1,ADDRESS2] [--fix] [--verbose]

Options:
  --env=FILE      Path to the env file (default: .env.local)
  --keys=KEYS     Comma-separated list of environment variable keys to check
                  (default: checks NEXT_PUBLIC_CODON_MINT_ADDRESS and NEXT_PUBLIC_CODON_BURN_ADDRESS)
  --fix           Attempt to fix invalid addresses by removing non-base58 characters (use with caution)
  --verbose       Show detailed output
  --help, -h      Show this help message
    `);
    process.exit(0);
  }
});

// Load environment variables from file if dotenv is available
if (dotenv) {
  try {
    const result = dotenv.config({ path: options.env });
    if (result.error) {
      console.error(`Error loading ${options.env}:`, result.error.message);
    } else if (options.verbose) {
      console.log(`Loaded environment from ${options.env}`);
    }
  } catch (error) {
    console.warn(`Warning: Could not load ${options.env} file:`, error.message);
  }
}

/**
 * Validate if a string is a valid Solana address (base58 encoded)
 * @param {string} address - The address to validate
 * @returns {boolean} - Whether the address is valid
 */
function isValidSolanaAddress(address) {
  if (!address || typeof address !== 'string') {
    return false;
  }
  
  // Trim any whitespace
  const trimmed = address.trim();
  
  // Base58 character set validation
  // Solana addresses are base58 encoded, typically 32-44 chars
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(trimmed);
}

/**
 * Find invalid characters in a supposed Solana address
 * @param {string} address - The address to check
 * @returns {object} - Object with validity and details about invalid characters
 */
function findInvalidChars(address) {
  if (!address || typeof address !== 'string') {
    return { valid: false, reason: 'Address is empty or not a string' };
  }
  
  const trimmed = address.trim();
  
  // Check length
  if (trimmed.length < 32) {
    return { valid: false, reason: 'Address is too short (less than 32 characters)' };
  }
  
  if (trimmed.length > 44) {
    return { valid: false, reason: 'Address is too long (more than 44 characters)' };
  }
  
  // Check for invalid characters
  const nonBase58Chars = trimmed.match(/[^1-9A-HJ-NP-Za-km-z]/g);
  if (nonBase58Chars) {
    return { 
      valid: false, 
      reason: 'Contains non-base58 characters', 
      invalidChars: nonBase58Chars,
      charPositions: nonBase58Chars.map(char => {
        return {
          char,
          positions: [...trimmed.matchAll(new RegExp(char, 'g'))].map(match => match.index)
        };
      })
    };
  }
  
  return { valid: true };
}

/**
 * Attempt to fix a Solana address by removing non-base58 characters
 * @param {string} address - The address to fix
 * @returns {object} - Object with fixed address and status
 */
function attemptToFixAddress(address) {
  if (!address || typeof address !== 'string') {
    return { fixed: false, fixedAddress: '', reason: 'Address is empty or not a string' };
  }
  
  // Trim whitespace
  const trimmed = address.trim();
  
  // Remove any invisible characters that could be causing issues
  const sanitized = trimmed
    .replace(/\u200B/g, '') // zero-width space
    .replace(/\uFEFF/g, '') // zero-width no-break space
    .replace(/\u00A0/g, ''); // non-breaking space
  
  // Remove all non-base58 characters
  const fixedAddress = sanitized.replace(/[^1-9A-HJ-NP-Za-km-z]/g, '');
  
  // Check if the fixed address is valid
  if (isValidSolanaAddress(fixedAddress)) {
    return {
      fixed: true,
      fixedAddress,
      changes: fixedAddress !== address,
      originalLength: address.length,
      fixedLength: fixedAddress.length
    };
  }
  
  return {
    fixed: false,
    fixedAddress,
    reason: 'Address could not be fixed by removing non-base58 characters'
  };
}

// Function to validate all specified environment variables
function validateAddresses() {
  console.log('Validating Solana addresses in environment variables...');
  
  let allValid = true;
  const results = [];
  
  options.keys.forEach(key => {
    const value = process.env[key];
    const result = { key, value: value ? `${value.substring(0, 6)}...` : undefined };
    
    if (!value) {
      result.status = 'missing';
      result.valid = false;
      console.error(`❌ ${key}: Not set in environment`);
      allValid = false;
    } else {
      const validation = findInvalidChars(value);
      result.valid = validation.valid;
      
      if (validation.valid) {
        if (options.verbose) {
          console.log(`✅ ${key}: Valid Solana address`);
        }
      } else {
        allValid = false;
        result.reason = validation.reason;
        result.invalidChars = validation.invalidChars;
        
        console.error(`❌ ${key}: Invalid Solana address - ${validation.reason}`);
        
        if (validation.invalidChars) {
          console.error(`   Invalid characters: ${validation.invalidChars.join(', ')}`);
          
          if (validation.charPositions) {
            validation.charPositions.forEach(item => {
              console.error(`   "${item.char}" at position(s): ${item.positions.join(', ')}`);
            });
          }
          
          // Try to fix if --fix flag is provided
          if (options.fix) {
            const fix = attemptToFixAddress(value);
            result.attemptedFix = true;
            result.fixResult = fix;
            
            if (fix.fixed) {
              console.log(`🔧 Fixed ${key}: ${fix.fixedAddress}`);
              console.log(`   Original length: ${fix.originalLength}, Fixed length: ${fix.fixedLength}`);
              console.log(`   You should update your environment variable to use this value instead`);
            } else {
              console.error(`⚠️ Could not fix ${key}: ${fix.reason}`);
            }
          }
        }
      }
    }
    
    results.push(result);
  });
  
  return { allValid, results };
}

// Main execution
const validationResult = validateAddresses();

if (validationResult.allValid) {
  console.log('✅ All checked Solana addresses are valid!');
  process.exit(0);
} else {
  console.error('⚠️ Some Solana addresses are invalid or missing. Check the output above for details.');
  if (!options.fix) {
    console.log('Tip: Run with --fix to attempt automatic fixing of invalid addresses');
  }
  process.exit(1);
}
