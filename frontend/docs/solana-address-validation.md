# Solana Address Validation Guide

## Overview

This guide explains how to prevent and fix the common "Non-base58 character" errors that occur when working with Solana addresses in web applications. These errors typically appear during transactions when the application tries to create a `PublicKey` from an invalid base58 string, such as when handling wallet addresses or token mint addresses.

## What is base58?

Base58 is an encoding used by Solana (and other blockchains like Bitcoin) for representing binary data in a way that is more compact than base64 and uses a more human-friendly character set (no ambiguous characters like 'O' and '0', 'l' and 'I').

The base58 character set includes:
- Numbers from 1-9 (excluding 0)
- Uppercase letters A-Z (excluding I, O)
- Lowercase letters a-z (excluding l)

## Common Causes of Non-base58 Errors

1. **Invisible Characters**: Copy-pasting addresses from certain sources can introduce zero-width spaces or other invisible characters
2. **Whitespace**: Leading or trailing spaces that are difficult to see
3. **0x Prefixes**: Attempting to use Ethereum-style addresses (starting with 0x) with Solana functions
4. **Special Characters**: Including quotes, hyphens, or other punctuation in the address
5. **Environment Variables**: Reading addresses from environment variables that contain formatting issues
6. **User Input**: Accepting user input without proper validation

## Validation and Sanitization Tools

We've implemented several utility functions in `lib/solana-utils.ts` to help handle these issues:

### 1. Basic Validation

```typescript
// Check if a string is a valid Solana address
import { isValidSolanaAddress } from '@/lib/solana-utils';

if (isValidSolanaAddress(address)) {
  console.log('Address is valid');
} else {
  console.log('Address is invalid');
}
```

### 2. Detailed Analysis

```typescript
// Get detailed information about an invalid address
import { analyzeAddress } from '@/lib/solana-utils';

const analysis = analyzeAddress(suspiciousAddress);
if (!analysis.valid) {
  console.error(`Invalid address: ${analysis.reason}`);
  if (analysis.invalidChars) {
    console.error(`Invalid characters: ${analysis.invalidChars.join(', ')}`);
  }
}
```

### 3. Safe PublicKey Creation

```typescript
// Safely create a PublicKey with better error handling
import { safeCreatePublicKey } from '@/lib/solana-utils';

try {
  const pubkey = safeCreatePublicKey(address, 'token mint');
  // Use the public key...
} catch (error) {
  console.error('Failed to create public key:', error.message);
}
```

## Validation Scripts

### Environment Variable Validation

Run the validation script to check your environment variables:

```bash
node scripts/validate-solana-address.js
```

Add the `--fix` flag to attempt automatic fixing (use with caution):

```bash
node scripts/validate-solana-address.js --fix
```

## Client-Side Validation

The `SolanaAddressValidator` component will automatically run on application startup (in development mode) and log warnings if any issues are found with Solana addresses in your environment variables:

```tsx
// This is already included in the app layout
import SolanaAddressValidator from '@/components/Wallet/SolanaAddressValidator';

// In your layout or page component:
<SolanaAddressValidator />
```

## Best Practices

1. **Always Validate Inputs**: Validate any address input before attempting to use it
2. **Trim Addresses**: Always trim addresses to remove whitespace
3. **Use the Utility Functions**: Leverage our utility functions for consistent validation
4. **Add Informative Error Messages**: Show users exactly what's wrong with their input
5. **Check Environment Variables**: Run the validation script on deployment to catch issues
6. **Regular Testing**: Test with various input patterns to ensure robustness

## Debugging Non-base58 Errors

If you encounter a "Non-base58 character" error:

1. Use `analyzeAddress` to identify the problematic characters
2. Check the address source (environment variables, user input, etc.)
3. Add logging to see the raw address string before PublicKey creation
4. Try to reproduce the issue with consistent test cases
5. Implement sanitization for that particular input source

## Advanced Topics

### Manual Address Fixing

In some cases, you may need to manually fix addresses:

```typescript
import { attemptAddressFix } from '@/lib/solana-utils';

const result = attemptAddressFix(problematicAddress);
if (result.fixed) {
  console.log(`Fixed address: ${result.fixedAddress}`);
  console.log(`Removed characters at positions: ${result.changes?.positions.join(', ')}`);
} else {
  console.error('Could not fix address');
}
```

### Client-Side Character Filtering

For input fields accepting Solana addresses, consider filtering non-base58 characters on input:

```tsx
<input
  value={address}
  onChange={(e) => {
    // Only allow base58 characters
    const filteredValue = e.target.value.replace(/[^1-9A-HJ-NP-Za-km-z]/g, '');
    setAddress(filteredValue);
  }}
/>
```

## Further Resources

- [Solana Web3.js Documentation](https://solana-labs.github.io/solana-web3.js/)
- [Base58 Encoding Explanation](https://en.wikipedia.org/wiki/Base58)
- [PublicKey Class Documentation](https://solana-labs.github.io/solana-web3.js/classes/PublicKey.html)
