# HBAR Fee System Deployment Guide

## Overview

The new system implements:
- **5% HBAR fee** only on HBAR→token swaps (not on all transfers)
- **90% liquidity allocation** (instead of 80%)
- **HBAR fees distributed**: 60% to creator (3%), 40% to platform (2%)
- **NO fees** on regular token transfers or DEX trades

## Step 1: Deploy CustomSwapRouter Contract

```bash
# First compile the Solidity contract
npx hardhat compile
# OR
solc --abi --bin contracts/CustomSwapRouter.sol -o build/

# Deploy using the script
node scripts/deployCustomSwapRouter.js
```

## Step 2: Update Environment Variables

Add to your `.env` file:
```env
CUSTOM_SWAP_ROUTER=0x...  # Address from deployment
PLATFORM_WALLET_ADDRESS=0x...  # Your platform wallet for receiving fees
```

## Step 3: Start the Server

```bash
npm start
```

## Key Changes Made

### 1. Token Creation
- **Removed**: 15% fractional fees on all transfers
- **Added**: Clean tokens with no transfer fees
- **Distribution**: 10% to creator, 90% to liquidity (0% to platform)

### 2. Fee Collection
- **Old**: 15% tokens collected on every transfer
- **New**: 5% HBAR collected only on swaps via custom router

### 3. Creator Revenue
- **Old**: 9% of all token volume as tokens  
- **New**: 10% of token supply + 3% of HBAR swap amount as HBAR (directly to wallet)

## Testing the System

### Create a Token
```bash
curl -X POST "http://localhost:3003/create-meme-coin" \
  -F "image=@test.png" \
  -F "name=Test Coin" \
  -F "symbol=TEST" \
  -F "supply=1000000" \
  -F "decimals=6" \
  -F "creatorWallet=0.0.123456" \
  -F "description=Test token"
```

### Test Custom Swap
After deployment, users can swap HBAR for tokens via:
```javascript
// Using the custom router contract
await customSwapRouter.swapHBARForTokens(
  tokenAddress,
  minTokenAmount,
  deadline,
  { value: hbarAmount }
);
```

## Benefits

1. **Higher Liquidity**: 90% vs 80% allocation
2. **Better Trading**: No fees on regular transfers
3. **Creator Revenue**: Direct HBAR payments, not tokens
4. **User Experience**: Normal DEX trading + optional fee-paying route

## Migration from Old System

Existing tokens with fractional fees will continue to work as before. New tokens created with this version will use the HBAR fee system. 