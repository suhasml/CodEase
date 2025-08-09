# Solana Token Burning Implementation

## Overview

This document explains how token burning is implemented in the CodeASE platform for CODON tokens (FLsQ58bYWabZKZsHWF1tZ2WYdcZ2gMFBtPjCB2HvLxb8) on Solana blockchain.

## Token Burning and Platform Fee Mechanism

### Prior Implementation

In previous versions, we were implementing token "burning" by transferring tokens to a designated burn address (`1nc1nerator11111111111111111111111111111111`). While this approach effectively removes tokens from circulation, it doesn't use Solana's native token burning mechanism.

### Current Implementation

We now use Solana's native SPL token `createBurnInstruction` to properly burn tokens. This has several advantages:

1. Tokens are permanently removed from circulation, reducing the total supply
2. The burning operation is properly registered on-chain
3. No need to create or maintain a burn address token account
4. More gas efficient
5. Follows Solana's best practices

### Transaction Structure

Each transaction includes **both** payment and burn components:

1. **Platform Payments**: Direct transfers to service providers and platform (regular SPL token transfers)
2. **Token Burns**: Using Solana's native burn instruction to reduce token supply

When you see a transaction showing X tokens being sent, it represents the **complete transaction** including both payment and burn components.

## Implementation Details

### Platform Fee Calculation

Our marketplace transactions include a platform fee (default 3%), which is calculated as:

```typescript
// Amount going to the seller (97% of total)
const sellerAmount = Number((amount * (100 - platformFeePercentage) / 100).toFixed(9));
// Amount going to the burn address (3% of total)
const burnAmount = Number((amount - sellerAmount).toFixed(9));
```

### Burn Instruction

Instead of transferring the platform fee to a burn address, we now use:

```typescript
// Add burn instruction directly - this is the proper way to burn SPL tokens
transaction.add(
  createBurnInstruction(
    sourceAccount, // Source account (from buyer's token account)
    tokenMint,     // Token mint
    fromPubkey,    // Owner of the source account
    burnAmount     // Amount to burn
  )
);
```

## Configuration

The platform fee percentage can be configured through the environment variable:

```
NEXT_PUBLIC_PLATFORM_FEE_PERCENTAGE=3
```

## References

- [Solana SPL Token Program Documentation](https://spl.solana.com/token)
- [SPL Token GitHub Repository](https://github.com/solana-labs/solana-program-library/tree/master/token)
