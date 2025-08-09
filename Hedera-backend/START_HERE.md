# 🚀 START HERE - Quick Launch Guide

## ⚡ **FASTEST SETUP** (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Generate EVM private key
npm run generate-key

# 3. Create .env file (copy one of the generated keys)
cp .env.example .env  # Then edit with your values

# 4. Check your setup
npm run setup

# 5. Start the server
npm start
```

---

## 🔑 **MINIMUM REQUIRED ENV VARIABLES**

Create `.env` file with these 7 variables:

```env
# Your Hedera account (get from https://portal.hedera.com/)
OPERATOR_ID=0.0.123456
OPERATOR_KEY=302e020100300506032b657004220420...

# EVM key (generate with: npm run generate-key)
OPERATOR_EVM_KEY=0x1234567890123456789012345678901234567890123456789012345678901234

# DEX router (use this for testnet)
SAUCERSWAP_ROUTER=0xCf5B8Cc7bC79cfA1465e93d74B740a3fC3d06cB9

# Where you want to receive 40% of fees in HBAR
PLATFORM_WALLET_ADDRESS=0.0.789012

# Network settings
HEDERA_NETWORK=testnet
HASHIO_RPC_URL=https://testnet.hashio.io/api
```

---

## ✅ **VALIDATION COMMANDS**

```bash
# Check if your .env is configured correctly
npm run check-env

# Generate new EVM private key if needed
npm run generate-key

# Test server health
curl http://localhost:3003/health

# Create test token
curl -X POST "http://localhost:3003/create-meme-coin" \
  -F "image=@test.png" \
  -F "name=Test Coin" \
  -F "symbol=TEST" \
  -F "supply=1000000" \
  -F "decimals=6" \
  -F "creatorWallet=0.0.123456" \
  -F "description=Test meme coin"
```

---

## 🎯 **WHAT YOU GET**

### **Perfect Solution:**
- ✅ **Tokens visible on ALL DEXs** (SaucerSwap, HeliSwap, Pangolin)
- ✅ **5% fee on EVERY trade** (no way to avoid)
- ✅ **Fees paid in HBAR** (auto-converted)
- ✅ **60% to creator, 40% to platform**

### **How It Works:**
1. **Token Creation**: 5% fractional fee built into token
2. **Distribution**: 10% to creator, 90% to ALL DEX liquidity
3. **Trading**: Users trade on any DEX normally
4. **Fee Collection**: 5% automatically collected on every trade
5. **Auto-Conversion**: Every hour, tokens → HBAR → distribute

---

## 🆘 **NEED HELP?**

| **Issue** | **Solution** |
|-----------|-------------|
| Missing env vars | Run `npm run check-env` |
| Need EVM key | Run `npm run generate-key` |
| Server won't start | Check `SETUP_GUIDE.md` |
| Need Hedera account | Visit [portal.hedera.com](https://portal.hedera.com/) |
| Want testnet HBAR | Use [Hedera faucet](https://portal.hedera.com/faucet) |

---

## 📚 **FULL DOCUMENTATION**

- 📖 **Detailed Setup**: `SETUP_GUIDE.md`
- 🎯 **User Journey**: `USER_JOURNEY_OVERVIEW.md`  
- ⚡ **Quick Start**: `QUICK_START.md`
- 🚀 **Deployment**: `DEPLOYMENT_INSTRUCTIONS.md`

---

**Ready to launch meme coins with guaranteed HBAR revenue? 🚀** 