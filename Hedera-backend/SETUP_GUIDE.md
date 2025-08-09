# 🚀 Complete Setup Guide

## 📋 **Step 1: Install Dependencies**

```bash
cd Hedera-smart-contract
npm install
```

## 🔑 **Step 2: Get Environment Variables**

### **A. Create Hedera Account**

1. **Go to** [Hedera Portal](https://portal.hedera.com/)
2. **Create account** or use existing testnet account
3. **Get your values:**
   - `OPERATOR_ID`: Your account ID (format: `0.0.123456`)
   - `OPERATOR_KEY`: Your private key (long hex string)

### **B. Get EVM Private Key**

```bash
# Generate EVM key from your Hedera private key
# You can use online converters or:
# 1. Use HashPack wallet
# 2. Export private key 
# 3. Use the EVM-compatible format
```

**Alternative:** Create new EVM wallet:
```javascript
// Use ethers.js to generate
const wallet = ethers.Wallet.createRandom();
console.log('Private Key:', wallet.privateKey);
console.log('Address:', wallet.address);
```

### **C. DEX Router Addresses**

**SaucerSwap Router Addresses:**
- **Testnet**: `0xCf5B8Cc7bC79cfA1465e93d74B740a3fC3d06cB9`
- **Mainnet**: `0x014AEfF3849B0b9F2D5Dc8E2d9B2Cd9b6a3Fe4E0` (verify latest)

**Get from:**
- [SaucerSwap Docs](https://docs.saucerswap.finance/)
- [Hedera DeFi Documentation](https://docs.hedera.com/hedera/core-concepts/smart-contracts/defi)

### **D. Platform Wallet**

This is where you want to receive your 40% HBAR fees:
- Can be same as `OPERATOR_ID`
- Or separate wallet for accounting
- Format: `0.0.789012`

---

## 📝 **Step 3: Create .env File**

Create `.env` file in `Hedera-smart-contract/` directory:

```env
# ===== REQUIRED VARIABLES =====

# Your Hedera Account
OPERATOR_ID=0.0.123456
OPERATOR_KEY=302e020100300506032b65700422042012345...

# EVM Private Key (for DEX interactions)
OPERATOR_EVM_KEY=0x1234567890123456789012345678901234567890123456789012345678901234

# DEX Router
SAUCERSWAP_ROUTER=0xCf5B8Cc7bC79cfA1465e93d74B740a3fC3d06cB9

# Platform Revenue Wallet (gets 40% fees)
PLATFORM_WALLET_ADDRESS=0.0.789012

# Network
HEDERA_NETWORK=testnet
HASHIO_RPC_URL=https://testnet.hashio.io/api

# ===== OPTIONAL VARIABLES =====

# Liquidity Locker (if you have one)
LIQUIDITY_LOCKER_ADDRESS=0x1234567890123456789012345678901234567890

# Platform Treasury (if different from operator)
PLATFORM_TREASURY_ID=0.0.789012

# Server Port
PORT=3003
```

---

## 🚀 **Step 4: Start the Server**

```bash
npm start
```

**Expected Output:**
```
🚀 Universal HBAR-Fee Meme Coin Launcher Started!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌐 Server: http://localhost:3003
📡 Network: testnet
💰 Fee: 5% fractional fee on ALL trades
👤 Creator earns: 3% equivalent in HBAR
🏢 Platform earns: 2% equivalent in HBAR
🎁 Token Distribution: 10% to creator, 90% to ALL DEXs
🔥 Trading on ALL DEXs (SaucerSwap, HeliSwap, Pangolin)
💱 Auto-conversion: Token fees → HBAR → distribute
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔄 Starting automatic fee conversion service...
✨ Ready to launch meme coins with UNIVERSAL 5% fees!
🎯 Visible on ALL DEXs, fees collected EVERYWHERE!
```

---

## 🧪 **Step 5: Test the System**

### **A. Test Health Check**
```bash
curl http://localhost:3003/health
```

### **B. Create Test Token**
```bash
curl -X POST "http://localhost:3003/create-meme-coin" \
  -F "image=@test.png" \
  -F "name=Test Coin" \
  -F "symbol=TEST" \
  -F "supply=1000000" \
  -F "decimals=6" \
  -F "creatorWallet=0.0.123456" \
  -F "description=Test meme coin"
```

### **C. Check Fee Conversion Status**
```bash
curl http://localhost:3003/fee-conversion-status
```

---

## 🔧 **Where to Get Each Value**

| **Variable** | **Where to Get It** | **Example** |
|--------------|-------------------|-------------|
| `OPERATOR_ID` | Hedera Portal/Wallet | `0.0.123456` |
| `OPERATOR_KEY` | Hedera Portal/Wallet | `302e020100300506...` |
| `OPERATOR_EVM_KEY` | Convert from Hedera key or generate new | `0x1234567890...` |
| `SAUCERSWAP_ROUTER` | SaucerSwap docs | `0xCf5B8Cc7bC79cfA1465e93d74B740a3fC3d06cB9` |
| `PLATFORM_WALLET_ADDRESS` | Your choice (revenue wallet) | `0.0.789012` |
| `HASHIO_RPC_URL` | HashIO documentation | `https://testnet.hashio.io/api` |

---

## 🆘 **Troubleshooting**

### **Issue: "OPERATOR_KEY not set"**
```bash
# Check your .env file
cat .env | grep OPERATOR_KEY
# Should show your key
```

### **Issue: "Failed to connect to Hedera"**
```bash
# Check network and key match
# Testnet keys only work on testnet
```

### **Issue: "SaucerSwap router not found"**
```bash
# Verify router address for your network
# Testnet vs Mainnet have different addresses
```

### **Issue: "Permission denied"**
```bash
# Make sure your account has enough HBAR
# Need ~10 HBAR for token creation
```

---

## ✅ **Success Checklist**

- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created with all variables
- [ ] Hedera account has sufficient HBAR balance
- [ ] Server starts without errors
- [ ] Health check returns success
- [ ] Can create test token
- [ ] Fee conversion service is running

---

## 🎯 **Next Steps**

1. **Create your first token** via API
2. **Add liquidity** to DEXs (done automatically)
3. **Test trading** on SaucerSwap
4. **Monitor fee conversion** every hour
5. **Check HBAR distribution** to creator/platform wallets

**Your platform is ready to generate HBAR revenue from every trade! 🚀** 