# Complete User Journey & Implementation Guide

## 📋 **FINAL SYSTEM OVERVIEW**

### **Token Distribution**
- ✅ **90% → Liquidity Pool** (for trading)
- ✅ **10% → Creator** (immediate tokens)
- ✅ **0% → Platform** (we earn from swap fees only)

### **Fee Structure** 
- ✅ **5% HBAR fee** ONLY on HBAR→token swaps via custom router
- ✅ **60% (3% total) → Creator wallet** in HBAR
- ✅ **40% (2% total) → Platform wallet** in HBAR  
- ✅ **NO fees** on regular token transfers or DEX trades

---

## 🚀 **IMPLEMENTATION STEPS**

### **Step 1: Environment Setup**
```bash
# Clone and setup
cd Hedera-smart-contract
npm install

# Setup .env file
cp .env.example .env
```

Required environment variables:
```env
OPERATOR_ID=0.0.YOUR_ACCOUNT
OPERATOR_KEY=YOUR_PRIVATE_KEY
OPERATOR_EVM_KEY=YOUR_EVM_PRIVATE_KEY
SAUCERSWAP_ROUTER=0xCf5B8Cc7bC79cfA1465e93d74B740a3fC3d06cB9
LIQUIDITY_LOCKER_ADDRESS=YOUR_LIQUIDITY_LOCKER
PLATFORM_WALLET_ADDRESS=YOUR_PLATFORM_WALLET  # For receiving 2% HBAR fees
HASHIO_RPC_URL=https://testnet.hashio.io/api
HEDERA_NETWORK=testnet
```

### **Step 2: Deploy Smart Contracts**
```bash
# Compile contracts
npx hardhat compile

# Deploy CustomSwapRouter
node scripts/deployCustomSwapRouter.js

# Add the deployed address to .env
echo "CUSTOM_SWAP_ROUTER=0x..." >> .env
```

### **Step 3: Start the Platform**
```bash
# Start the meme coin launcher
npm start
# Server runs on http://localhost:3003
```

---

## 👤 **USER JOURNEY FLOWS**

### **🎨 Flow 1: Creator Journey**

#### **1. Create Meme Coin**
```bash
POST /create-meme-coin
```

**What happens:**
1. Creator uploads image + details
2. Token created with NO fractional fees
3. **10% tokens** sent to creator wallet
4. **90% tokens** sent to liquidity pool
5. Token registered with custom swap router
6. Creator can start earning HBAR from swaps immediately

**Creator receives:**
- ✅ 10% of total token supply
- ✅ 3% HBAR from every swap via custom router
- ✅ Token immediately live on all DEXs

#### **2. Creator Promotes Token**
- Share DEX links on social media
- Direct people to custom router for swaps (to earn HBAR fees)
- Build community around the meme

#### **3. Creator Earns Revenue**
- **Option A**: Regular DEX trading (creator earns nothing extra)
- **Option B**: Custom router swaps (creator earns 3% HBAR per swap)

---

### **🛍️ Flow 2: Buyer Journey**

#### **ONLY OPTION: Custom AMM (GUARANTEED Fees)**
```javascript
// User MUST swap via custom AMM (no other way)
await customAMM.swapHBARForTokens(
  tokenAddress,
  minTokenAmount,
  { value: ethers.parseUnits("100", 18) } // 100 HBAR
);

// What happens AUTOMATICALLY:
// 1. 5 HBAR (5%) deducted as fee
// 2. 3 HBAR → Creator wallet instantly
// 3. 2 HBAR → Platform wallet instantly
// 4. 95 HBAR used for AMM swap
// 5. User receives tokens from AMM
// 6. NO WAY TO AVOID THIS PROCESS
```

**Key Points:**
- ❌ NO SaucerSwap liquidity
- ❌ NO HeliSwap liquidity  
- ❌ NO external DEX access
- ✅ ONLY our AMM works
- ✅ EVERY trade has fees

---

### **💰 Flow 3: Platform Revenue**

**Platform earns 2% HBAR** from every custom router swap:
- ✅ Direct HBAR payments to platform wallet
- ✅ Instant settlement (no token conversion needed)
- ✅ Scales with swap volume

---

## 🔧 **TECHNICAL IMPLEMENTATION**

### **Frontend Integration**

#### **1. Connect to Custom Router**
```javascript
import { ethers } from 'ethers';

const CUSTOM_ROUTER = "0x..."; // From deployment
const provider = new ethers.JsonRpcProvider("https://testnet.hashio.io/api");
const wallet = new ethers.Wallet(privateKey, provider);

const customRouter = new ethers.Contract(CUSTOM_ROUTER, [
  "function swapHBARForTokens(address token, uint256 amountOutMin, uint256 deadline) external payable",
  "function getAmountOut(address token, uint256 hbarAmountIn) external view returns (uint256 tokenAmountOut, uint256 feeAmount)"
], wallet);
```

#### **2. Create Swap Interface**
```javascript
// Get quote with fees
const [tokenAmount, feeAmount] = await customRouter.getAmountOut(
  tokenAddress, 
  ethers.parseUnits("100", 18)
);

console.log(`You pay: 100 HBAR`);
console.log(`Fee: ${ethers.formatUnits(feeAmount, 18)} HBAR`);
console.log(`You get: ${ethers.formatUnits(tokenAmount, 6)} tokens`);

// Execute swap
await customRouter.swapHBARForTokens(
  tokenAddress,
  tokenAmount.mul(95).div(100), // 5% slippage
  Math.floor(Date.now()/1000) + 3600, // 1 hour deadline
  { value: ethers.parseUnits("100", 18) }
);
```

### **Backend Token Creation**
```bash
curl -X POST "http://localhost:3003/create-meme-coin" \
  -F "image=@meme.png" \
  -F "name=DOGE MOON" \
  -F "symbol=MOON" \
  -F "supply=1000000" \
  -F "decimals=6" \
  -F "creatorWallet=0.0.123456" \
  -F "description=To the moon!"
```

---

## 📊 **REVENUE BREAKDOWN EXAMPLE**

**Token Launch: 1M tokens**
- Creator gets: 100,000 tokens (10%)
- Liquidity: 900,000 tokens (90%)

**User swaps 1000 HBAR via custom router:**
- Fee collected: 50 HBAR (5%)
- Creator receives: 30 HBAR (3% of total)
- Platform receives: 20 HBAR (2% of total)  
- Actual swap: 950 HBAR → tokens

**Revenue scaling:**
- More swap volume = More HBAR revenue
- Direct HBAR payments (no token conversion)
- Instant settlement on every swap

---

## 🎯 **KEY BENEFITS**

### **For Creators:**
1. **Immediate tokens**: 10% upfront
2. **HBAR revenue**: 3% from swaps
3. **No complexity**: Just promote and earn
4. **Better liquidity**: 90% in pool

### **For Platform:**
1. **Clean revenue**: 2% HBAR per swap
2. **No token handling**: Direct HBAR payments
3. **Scalable**: Revenue grows with usage
4. **Simple**: One contract handles everything

### **For Users:**
1. **Choice**: Use DEXs (no fees) or router (support creator)
2. **Better trading**: 90% liquidity = less slippage
3. **Fair fees**: Only pay if choosing to support creator

This system perfectly implements your vision: **90% liquidity, 5% HBAR fees, direct wallet payments!** 🚀 