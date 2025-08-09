# 🚀 MemeAmmRouter Deployment Guide

This guide will walk you through deploying and testing the MemeAmmRouter contract on Hedera testnet.

## 📋 Prerequisites

1. **Node.js** (v16 or higher)
2. **Testnet HBAR** - Get free testnet HBAR from [Hedera Portal](https://portal.hedera.com/register)
3. **EVM Wallet** - Generate an EVM private key for testnet

## 🛠️ Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Configuration

Copy the example environment file:
```bash
cp .env.example .env
```

Edit `.env` with your details:
```bash
# Required: Hedera testnet RPC
HEDERA_TESTNET_RPC_URL=https://testnet.hashio.io/api

# Required: Your testnet private key (NOT mainnet!)
PRIVATE_KEY=your_testnet_private_key_here

# Required: Platform fee wallet address
PLATFORM_FEE_WALLET=your_platform_fee_wallet_address_here
```

### 3. Generate EVM Key (if needed)

```bash
npm run generate-key
```

### 4. Get Testnet HBAR

1. Visit [Hedera Portal](https://portal.hedera.com/register)
2. Create testnet account
3. Get your EVM address and request testnet HBAR
4. You need at least 10 HBAR for deployment and testing

## 🚀 Deployment Steps

### Step 1: Deploy AMM Router

```bash
npm run deploy-amm
```

Expected output:
```
🚀 Deploying MemeAmmRouter to Hedera Testnet...
✅ Contract compiled successfully!
✅ MemeAmmRouter deployed successfully!
📍 Contract address: 0x...
```

### Step 2: Deploy Demo Token (Optional)

```bash
npm run deploy-demo-token
```

This creates a test ERC20 token for testing the AMM.

### Step 3: Test AMM Functionality

```bash
npm run test-amm
```

This comprehensive test will:
- Create a token pool (if none exists)
- Test price calculations
- Execute buy/sell transactions
- Verify fee accumulation

## 📊 Contract Features

### MemeAmmRouter Features

✅ **Multi-token support** - Single contract manages unlimited token pools  
✅ **Bonding curve pricing** - Linear price progression: `price = startPrice + slope * sold`  
✅ **Automatic fees** - Configurable fees split between creator and platform  
✅ **Graduation system** - Pools can be graduated to public DEXs  
✅ **Slippage protection** - Built-in minimum output requirements  
✅ **Reentrancy protection** - OpenZeppelin security standards  

### Pool Parameters

Each pool is configured with:
- **Token address** - ERC20 token contract
- **Creator** - Receives portion of trading fees  
- **Start price** - Initial token price in HBAR
- **Slope** - Price increase per token sold
- **Fee structure** - Total fee % and creator's share
- **Initial liquidity** - Starting token and HBAR reserves

## 🔧 Usage Examples

### Creating a Pool

```javascript
// From your application or script
await ammRouter.createPool(
    tokenAddress,           // Your ERC20 token
    creatorAddress,         // Fee recipient
    ethers.parseUnits("100000", 18), // 100k tokens
    ethers.parseEther("0.0001"),     // 0.0001 HBAR start price
    ethers.parseEther("0.000001"),   // 0.000001 HBAR slope
    500,                    // 5% total fee
    300,                    // 3% creator fee (60% of total)
    { value: ethers.parseEther("50") } // 50 HBAR initial liquidity
);
```

### Buying Tokens

```javascript
// User swaps 1 HBAR for tokens
await ammRouter.swapHBARForTokens(
    tokenAddress,
    1, // Minimum tokens out (slippage protection)
    { value: ethers.parseEther("1") }
);
```

### Selling Tokens

```javascript
// First approve the router to spend tokens
await token.approve(routerAddress, amount);

// Then sell tokens for HBAR
await ammRouter.swapTokensForHBAR(
    tokenAddress,
    amount,
    ethers.parseEther("0.9") // Minimum HBAR out
);
```

### Graduation

```javascript
// Only contract owner can graduate pools
await ammRouter.graduatePool(tokenAddress);
```

## 💰 Fee Structure

- **Trading fees** are taken on each swap
- **Creator fees** go to the pool creator
- **Platform fees** go to the platform wallet
- **Graduation** triggers final fee distribution

## 🔍 Monitoring

### View Pool Information

```javascript
const poolInfo = await ammRouter.getPoolInfo(tokenAddress);
console.log(`Token Reserve: ${poolInfo.reserveToken}`);
console.log(`HBAR Reserve: ${poolInfo.reserveHBAR}`);
console.log(`Graduated: ${poolInfo.graduated}`);
```

### Price Calculations

```javascript
// Get cost to buy tokens
const cost = await ammRouter.getBuyPrice(tokenAddress, amount);

// Get payout for selling tokens  
const payout = await ammRouter.getSellPayout(tokenAddress, amount);
```

## 🌐 Frontend Integration

### Web3 Setup

```javascript
import { ethers } from 'ethers';

// Connect to Hedera testnet
const provider = new ethers.JsonRpcProvider('https://testnet.hashio.io/api');

// Connect user wallet (MetaMask, etc.)
const signer = provider.getSigner();

// Load contract
const ammRouter = new ethers.Contract(routerAddress, abi, signer);
```

### Price Display

```javascript
// Update prices in real-time
async function updatePrice(tokenAddress, amount) {
    try {
        const cost = await ammRouter.getBuyPrice(tokenAddress, amount);
        document.getElementById('price').textContent = 
            `${ethers.formatEther(cost)} HBAR`;
    } catch (error) {
        console.error('Price calculation failed:', error);
    }
}
```

## 🛡️ Security Considerations

1. **Testnet Only** - Never use testnet keys on mainnet
2. **Slippage Protection** - Always set minimum output amounts
3. **Token Approval** - Only approve what you intend to trade
4. **Fee Verification** - Understand fee structure before trading

## 🚨 Troubleshooting

### Common Issues

**"Pool not available"** - Pool doesn't exist or is graduated  
**"Insufficient liquidity"** - Not enough tokens in pool  
**"Slippage too high"** - Price moved unfavorably, increase slippage tolerance  
**"Token transfer failed"** - Check token approval and balance  

### Getting Help

1. Check transaction on [HashScan](https://hashscan.io/testnet)
2. Verify contract addresses in `deployments/` folder
3. Ensure sufficient HBAR balance for gas fees
4. Check token approvals before trading

## 🎯 Next Steps

1. **Frontend Integration** - Build UI for your token launcher
2. **Graduation Logic** - Implement automatic graduation triggers
3. **Analytics** - Track pool performance and user activity
4. **Mainnet Deployment** - Deploy to production when ready

## 📞 Support

- Hedera Documentation: https://docs.hedera.com
- Community Discord: https://hedera.com/discord
- Developer Portal: https://portal.hedera.com

---

Happy building! 🎉