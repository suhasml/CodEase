# Backend Verification for Split Payment Transactions

This document outlines the requirements for backend verification of marketplace transactions that use the split payment system.

## Overview

The frontend now implements a 3% platform fee burn mechanism for CODON token payments in the marketplace:
1. Each transaction consists of two instructions:
   - A transfer instruction sending 97% to the seller
   - A burn instruction removing 3% from circulation using Solana's native SPL token burn

## Backend Verification Requirements

The backend verification system needs to be updated to properly handle and verify these transactions:

1. When verifying a transaction, the backend should:
   - Look for both a transfer and a burn instruction in the transaction
   - Validate that the transfer goes to the correct seller address
   - Validate that the burn instruction is properly calling the SPL token program's burn instruction
   - Confirm that the total amount (seller + burn) matches the expected price
   - Check that the burn amount is the correct percentage (default 3%) of the total

2. Update transaction success criteria:
   - A transaction should be considered successful only if both the transfer and burn instructions are confirmed
   - Both the seller transfer and the token burn should be validated

3. Handling transaction history:
   - When recording the transaction in history, record it as a single purchase with the total amount
   - Optionally, you can include metadata about the split (how much went to seller vs how much was burned)

## Environment Variables

The backend should use the same environment variables as the frontend for consistency:

```
PLATFORM_FEE_PERCENTAGE=3
```

Note: `CODON_BURN_ADDRESS` is no longer needed since we're using Solana's native burn instruction.

## Testing

When testing transactions, ensure both parts of the split payment are properly verified:
1. Test that transactions with incorrect split ratios are rejected
2. Test that transactions without a proper burn instruction are rejected
3. Test that partial transactions (only transfer or only burn) are not considered complete

## Migration Considerations

For backward compatibility:
1. The system should still be able to verify old-style single-transfer transactions
2. Consider a grace period where both transaction types are accepted before requiring split payments
