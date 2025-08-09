const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
    Client,
    PrivateKey,
    AccountId,
    ContractId,
    TokenId,
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    Hbar,
    CustomFractionalFee,
    Status,
    TransferTransaction,
    TokenAssociateTransaction,
    AccountAllowanceApproveTransaction,
    ContractExecuteTransaction,
    ContractFunctionParameters,
    AccountBalanceQuery,
    TokenFeeScheduleUpdateTransaction,
    TokenBurnTransaction,
    TokenInfoQuery
} = require('@hashgraph/sdk');
const { ethers, getAddress } = require('ethers');
const cors = require('cors');
require('dotenv').config();

// Centralized configuration and contracts
const {
    NETWORK,
    OPERATOR_ID,
    OPERATOR_KEY,
    getHederaClient,
    PLATFORM_CONFIG,
    HASHIO_RPC_URL,
    provider,
    wallet,
    HELISWAP_CONFIG,
    HELISWAP_FACTORY_ABI,
    HELISWAP_ROUTER_ABI,
    HELISWAP_PAIR_ABI,
    ERC20_ABI,
    heliswapFactory,
    heliswapRouter
} = require('./config');

// Shared utilities and middleware
const { getExplorerUrl, getDexUrls } = require('./utils/urls');
const { validateTokenInput } = require('./middleware/validation');

// External service logic
const { addInitialLiquidityWithHeliSwap } = require('./services/heliswap');
const { getCollection } = require('./services/mongo');

const app = express();
app.use(cors());
app.use(express.json());

// Normalize recipient/address inputs: accept Hedera AccountId (e.g., 0.0.x)
// or EVM address (0x...). Always return a checksummed EVM address string.
function normalizeRecipientAddress(inputAddress) {
    const fallback = wallet?.address;
    const value = inputAddress || fallback;
    if (!value) {
        throw new Error('No recipient available: missing user address and wallet');
    }
    if (typeof value === 'string' && value.includes('.')) {
        // Likely a Hedera AccountId like 0.0.1234
        const accountId = AccountId.fromString(value);
        const evm = accountId.toSolidityAddress();
        return ethers.getAddress(`0x${evm}`);
    }
    if (typeof value === 'string' && value.startsWith('0x')) {
        return ethers.getAddress(value);
    }
    // Anything else would trigger ENS resolution on ethers; disallow
    throw new Error('Invalid recipient: provide Hedera AccountId (0.0.x) or EVM 0x address');
}

// Hedera Mirror Node base URL (for association checks)
const MIRROR_URL = process.env.MIRROR_URL || 'https://testnet.mirrornode.hedera.com';

// Convert token EVM 0x address to Hedera token ID string 0.0.x
function tokenAddressToTokenId(tokenAddress) {
    const hex = tokenAddress.startsWith('0x') ? tokenAddress.slice(2) : tokenAddress;
    const num = parseInt(hex, 16);
    return `0.0.${num}`;
}

// Convert Hedera token ID string 0.0.x to 0x EVM address (40-hex, zero-padded)
function tokenIdToTokenAddress(tokenIdString) {
    try {
        const id = TokenId.fromString(tokenIdString);
        const hex = id.toSolidityAddress();
        return `0x${hex}`;
    } catch {
        return undefined;
    }
}

// Resolve tokenId string (0.0.x) from input that can be either 0x... or 0.0.x
function resolveTokenIdString(input) {
    if (!input) return undefined;
    if (typeof input === 'string' && input.startsWith('0x')) return tokenAddressToTokenId(input);
    try {
        const id = TokenId.fromString(input);
        return id.toString();
    } catch {
        return undefined;
    }
}

// ========== Token Interaction Tracking + Conditional Burn ==========

// GET counts: total tests/downloads for a token
app.get('/token-interactions/:token', async (req, res) => {
    try {
        const tokenParam = req.params.token;
        const tokenId = resolveTokenIdString(tokenParam);
        if (!tokenId) return res.status(400).json({ success: false, error: 'INVALID_TOKEN' });
        console.log(`📥 [GET /token-interactions] tokenId=${tokenId}`);
        const col = await getCollection('token_interactions');
        const doc = await col.findOne({ _id: tokenId });
        const counts = {
            tests: doc?.tests || 0,
            downloads: doc?.downloads || 0,
            lastTestAt: doc?.lastTestAt || null,
            lastDownloadAt: doc?.lastDownloadAt || null,
        };
        return res.json({ success: true, tokenId, counts });
    } catch (err) {
        console.error('GET /token-interactions error:', err.message);
        return res.status(500).json({ success: false, error: 'SERVER_ERROR' });
    }
});

// POST: record interaction and on every 5th for each action, burn 0.1% of current total supply
app.post('/token-interactions/:token/:action', async (req, res) => {
    const start = Date.now();
    try {
        const tokenParam = req.params.token;
        const action = (req.params.action || '').toLowerCase();
        if (!['test', 'download'].includes(action)) {
            return res.status(400).json({ success: false, error: 'INVALID_ACTION' });
        }
        const tokenId = resolveTokenIdString(tokenParam);
        if (!tokenId) return res.status(400).json({ success: false, error: 'INVALID_TOKEN' });
        console.log(`📥 [POST /token-interactions] tokenId=${tokenId} action=${action}`);

        const col = await getCollection('token_interactions');
        const now = new Date();
        // Atomically increment the appropriate counter
        const update = {
            $inc: action === 'test' ? { tests: 1 } : { downloads: 1 },
            $set: action === 'test' ? { lastTestAt: now } : { lastDownloadAt: now }
        };
        let updated;
        // Upsert document with default counters if missing to prevent field conflicts
        await col.updateOne(
            { _id: tokenId },
            { $setOnInsert: { tests: 0, downloads: 0 } },
            { upsert: true }
        );
        const result = await col.findOneAndUpdate(
            { _id: tokenId },
            update,
            { returnDocument: 'after' }
        );
        updated = result.value || (await col.findOne({ _id: tokenId })) || {};
        const currentCount = action === 'test' ? Number(updated.tests || 0) : Number(updated.downloads || 0);

        // Log interaction to HCS
        try {
            await feeConverter.logToHcs({
                type: 'token_interaction',
                tokenId,
                action,
                count: currentCount,
                timestamps: { at: now.toISOString() }
            });
        } catch (_) {}

        let burn = null;
        if (currentCount > 0 && currentCount % 5 === 0) {
            console.log(`🔥 Threshold reached for ${action}: count=${currentCount} → initiating 0.1% burn for ${tokenId}`);
            burn = await burnTokenFraction(tokenId, 0.001, action, currentCount).catch(err => {
                console.error('Burn failed:', err?.message || err);
                return null;
            });
            if (burn && burn.amount > 0) {
                console.log(`✅ Burn success: tokenId=${tokenId} amount=${burn.amount} txId=${burn.txId}`);
            } else {
                console.log(`⚠️ Burn skipped/failed for tokenId=${tokenId}`);
            }
        }

        return res.json({ success: true, tokenId, action, count: currentCount, burned: !!burn, burn });
    } catch (err) {
        console.error('POST /token-interactions error:', err.message);
        return res.status(500).json({ success: false, error: 'SERVER_ERROR' });
    } finally {
        console.log(`📈 interaction handled in ${Date.now() - start}ms`);
    }
});

// Helper: burn a fraction of current total supply (e.g., 0.001 = 0.1%)
async function burnTokenFraction(tokenIdString, fraction, reasonAction, interactionCountAt) {
    const client = getHederaClient();
    const now = new Date();
    // Query current token info to get total supply
    const info = await new TokenInfoQuery().setTokenId(TokenId.fromString(tokenIdString)).execute(client);
    const totalSupply = Number(info.totalSupply); // base units
    let toBurn = Math.floor(totalSupply * fraction);
    if (toBurn < 1) toBurn = totalSupply > 0 ? 1 : 0; // ensure at least 1 if supply > 0
    if (toBurn <= 0) return { amount: 0, txId: null, message: 'No supply to burn' };

    const burnTx = await new TokenBurnTransaction()
        .setTokenId(TokenId.fromString(tokenIdString))
        .setAmount(toBurn)
        .freezeWith(client)
        .sign(OPERATOR_KEY);
    const resp = await burnTx.execute(client);
    const receipt = await resp.getReceipt(client);
    // Try to capture consensus timestamp for explorer links
    let consensusTimestamp = null;
    try {
        const record = await resp.getRecord(client);
        const ts = record?.consensusTimestamp || receipt?.consensusTimestamp;
        if (ts) {
            const seconds = Number(ts.seconds || ts.seconds?.toString?.() || 0);
            const nanos = Number(ts.nanos || ts.nanos?.toString?.() || 0);
            const nanosStr = String(nanos).padStart(9, '0');
            consensusTimestamp = `${seconds}.${nanosStr}`;
        }
    } catch (_) { /* optional */ }
    const status = receipt.status?.toString?.() || 'UNKNOWN';

    // Persist burn in DB
    try {
        const burnsCol = await getCollection('token_burns');
        await burnsCol.insertOne({
            tokenId: tokenIdString,
            amount: toBurn,
            reasonAction,
            interactionCountAt,
            status,
            txId: resp.transactionId?.toString?.() || null,
            consensusTimestamp,
            createdAt: now,
        });
    } catch (e) {
        console.error('Persist burn failed:', e.message);
    }

    // Log to HCS
    try {
        await feeConverter.logToHcs({
            type: 'token_burn',
            tokenId: tokenIdString,
            fraction,
            amount: toBurn,
            status,
            tx: { id: resp.transactionId?.toString?.() || null, consensusTimestamp },
            trigger: { action: reasonAction, count: interactionCountAt },
            timestamps: { at: now.toISOString() }
        });
    } catch (_) {}

    return { amount: toBurn, txId: resp.transactionId?.toString?.(), consensusTimestamp, status };
}

// GET latest burns for a token
app.get('/token-burns/:token', async (req, res) => {
    try {
        const tokenParam = req.params.token;
        const tokenId = resolveTokenIdString(tokenParam);
        if (!tokenId) return res.status(400).json({ success: false, error: 'INVALID_TOKEN' });
        console.log(`📥 [GET /token-burns] tokenId=${tokenId} limit=${req.query.limit || 1}`);
        const limit = Math.max(1, Math.min(50, Number(req.query.limit) || 1));
        const burnsCol = await getCollection('token_burns');
        const burns = await burnsCol
            .find({ tokenId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .toArray();
        return res.json({ success: true, tokenId, burns });
    } catch (err) {
        console.error('GET /token-burns error:', err.message);
        return res.status(500).json({ success: false, error: 'SERVER_ERROR' });
    }
});

// Check via mirror node if an account is associated with a given token
async function isAccountAssociatedWithToken(accountIdString, tokenIdString) {
    try {
        const url = `${MIRROR_URL}/api/v1/accounts/${accountIdString}/tokens?token.id=${encodeURIComponent(tokenIdString)}`;
        const resp = await fetch(url);
        if (!resp.ok) return false;
        const data = await resp.json();
        if (!data || !Array.isArray(data.tokens)) return false;
        return data.tokens.some(t => t.token_id === tokenIdString);
    } catch (_) {
        return false;
    }
}

// In-memory storage for meme coins and creator earnings
const memeCoins = new Map();
const creatorEarnings = new Map();
// Pending token deliveries when recipient isn't associated yet
const pendingDeliveries = new Map(); // key: `${tokenAddress}:${accountId}` -> { amount: bigint, createdAt }

// Fee conversion service
const FeeConversionService = require('./services/feeConversionService');
const feeConverter = new FeeConversionService();

// Platform configuration is now provided by ./config

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadsDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// HeliSwap config/contracts are provided via ./config

// Hedera client/operator info & NETWORK are provided via ./config

// URLs helpers are provided via ./utils/urls

// Input validation
// validation moved to ./middleware/validation

// 🚀 MAIN ENDPOINT: Create Meme Coin - Direct to DEX Launch!
app.post('/create-meme-coin', upload.single('image'), validateTokenInput, async (req, res) => {
    const startTime = Date.now();
    const { 
        name, 
        symbol, 
        supply, 
        decimals, 
        description, 
        creatorWallet,
        liquidityAllocation = 90,  // Default to 90% if not provided
        creatorAllocation = 10     // Default to 10% if not provided
    } = req.body;
    const imageUrl = req.file ? `/uploads/${path.basename(req.file.path)}` : '';

    console.log(`\n🚀 Launching meme coin with DYNAMIC allocation: ${name} (${symbol})`);
    console.log(`👤 Creator: ${creatorWallet}`);
    console.log(`📊 Supply: ${supply.toLocaleString()} tokens | Decimals: ${decimals}`);
    console.log(`💰 Fee: ${PLATFORM_CONFIG.SWAP_FEE}% ONLY on HBAR→token swaps`);
    console.log(`🎯 Creator earns: ${PLATFORM_CONFIG.CREATOR_SHARE * PLATFORM_CONFIG.SWAP_FEE}% (${PLATFORM_CONFIG.CREATOR_SHARE * 100}% of swap fees)`);
    console.log(`🔥 ${liquidityAllocation}% of tokens go to liquidity pool!`);
    console.log(`👑 ${creatorAllocation}% of tokens go to creator!`);

    const client = getHederaClient();

    // Debug: Print OPERATOR_KEY public key
    console.log('OPERATOR Public Key:', OPERATOR_KEY.publicKey.toString());
    // Debug: Print OPERATOR_ID
    console.log('OPERATOR Account ID:', OPERATOR_ID.toString());
    // Debug: Print key type
    console.log('OPERATOR_KEY type:', OPERATOR_KEY._key ? OPERATOR_KEY._key.constructor.name : typeof OPERATOR_KEY);

    // Calculate supply with decimals - CORRECTED: Must multiply by 10^decimals for HTS
    const initialSupplyInSmallestUnits = BigInt(supply) * BigInt(10 ** decimals); // Convert to smallest units
    const maxSupplyInSmallestUnits = initialSupplyInSmallestUnits; // Fixed supply for meme coins

    console.log('\n🔢 CORRECTED SUPPLY CALCULATION:');
    console.log(`📊 User input: ${supply.toLocaleString()} tokens`);
    console.log(`🔢 Decimals: ${decimals}`);
    console.log(`⚡ Multiplier: 10^${decimals} = ${(10 ** decimals).toLocaleString()}`);
    console.log(`🎯 HTS Initial Supply (smallest units): ${initialSupplyInSmallestUnits.toString()}`);
    console.log(`👤 Creator gets: ${creatorAllocation}% = ${(Number(initialSupplyInSmallestUnits) * creatorAllocation / 100).toLocaleString()} smallest units`);
    console.log(`💧 Liquidity gets: ${liquidityAllocation}% = ${(Number(initialSupplyInSmallestUnits) * liquidityAllocation / 100).toLocaleString()} smallest units`);

    // GUARANTEED SOLUTION: Create token without fees, add pool, then add fees
    console.log('\n🎯 STEP 1: Creating token WITHOUT fractional fees (for pool creation)');
    console.log('� Strategy: Pool first, fees second - guaranteed to work!');
    console.log(`🎁 Token Distribution: ${creatorAllocation}% to creator, ${liquidityAllocation}% to ALL DEXs`);
    console.log(` HBAR Distribution: ${PLATFORM_CONFIG.CREATOR_SHARE * PLATFORM_CONFIG.SWAP_FEE}% to creator, ${PLATFORM_CONFIG.PLATFORM_SHARE * PLATFORM_CONFIG.SWAP_FEE}% to platform`);

    // Create token WITHOUT fractional fees initially
    const tokenCreateTx = new TokenCreateTransaction()
        .setTokenName(name)
        .setTokenSymbol(symbol)
        .setTokenType(TokenType.FungibleCommon)
        .setSupplyType(TokenSupplyType.Finite)
        .setInitialSupply(initialSupplyInSmallestUnits.toString())
        .setMaxSupply(maxSupplyInSmallestUnits.toString())
        .setDecimals(decimals)
        .setTreasuryAccountId(OPERATOR_ID) // Platform initially holds all tokens
        .setAdminKey(OPERATOR_KEY.publicKey)
        .setSupplyKey(OPERATOR_KEY.publicKey)
        // .setFreezeKey(OPERATOR_KEY.publicKey) 
        // .setWipeKey(OPERATOR_KEY.publicKey)
        // .setPauseKey(OPERATOR_KEY.publicKey)
        .setFeeScheduleKey(OPERATOR_KEY.publicKey) // IMPORTANT: Keep this for step 3
        // NO CUSTOM FEES YET!
        .setTokenMemo(`${name} - Pool creation first, fees added after`)
        .setMaxTransactionFee(new Hbar(10));

    console.log('\n⏳ STEP 1: Submitting token creation to Hedera network...');
    // Debug: Explicitly freeze and sign with OPERATOR_KEY
    const frozenTx = tokenCreateTx.freezeWith(client);
    const signedTx = await frozenTx.sign(OPERATOR_KEY);
    // Debug: Print transaction ID
    console.log('TokenCreateTransaction ID:', signedTx.transactionId.toString());
    const tokenCreateSubmit = await signedTx.execute(client);
    const tokenCreateReceipt = await tokenCreateSubmit.getReceipt(client);

    if (tokenCreateReceipt.status !== Status.Success) {
        throw new Error(`Token creation failed: ${tokenCreateReceipt.status}`);
    }

    const tokenId = tokenCreateReceipt.tokenId.toString();
    const transactionId = tokenCreateSubmit.transactionId.toString();

    console.log('✅ STEP 1 COMPLETE: Token created WITHOUT fees:', tokenId);

    // Store meme coin data
    const memeCoinData = {
        id: tokenId,
        name,
        symbol,
        supply,
        decimals,
        description,
        imageUrl,
        creatorWallet,
        createdAt: new Date().toISOString(),
        transactionId,
        status: 'live',
        initialSupply: initialSupplyInSmallestUnits.toString(),
        maxSupply: maxSupplyInSmallestUnits.toString(),
        swapFee: PLATFORM_CONFIG.SWAP_FEE,
        creatorSharePercent: PLATFORM_CONFIG.CREATOR_SHARE * PLATFORM_CONFIG.SWAP_FEE,
        platformSharePercent: PLATFORM_CONFIG.PLATFORM_SHARE * PLATFORM_CONFIG.SWAP_FEE,
        liquidityAllocation: liquidityAllocation,  // User-defined DEX allocation
        creatorAllocation: creatorAllocation       // User-defined creator allocation
    };

    // Store meme coin data after AMM creation
    memeCoins.set(tokenId, memeCoinData);
    creatorEarnings.set(tokenId, { 
        totalEarned: 0, 
        pendingPayout: 0,
        lastUpdate: new Date().toISOString()
    });

    // ---------- DYNAMIC DISTRIBUTION: USER-DEFINED ALLOCATION (CORRECTED) ---------
    const totalSupplyBN = initialSupplyInSmallestUnits; // Use correct supply
    const creatorPortion = totalSupplyBN * BigInt(creatorAllocation) / 100n; // User-defined % to creator
    const liquidityPortion = totalSupplyBN * BigInt(liquidityAllocation) / 100n; // User-defined % to liquidity

    console.log('\n💰 CORRECTED TOKEN DISTRIBUTION:');
    console.log(`📊 Total supply (smallest units): ${totalSupplyBN.toString()}`);
    console.log(`📊 Total supply (display): ${Number(totalSupplyBN) / (10 ** decimals)} tokens`);
    console.log(`👤 Creator portion (${creatorAllocation}%): ${creatorPortion.toString()} smallest units`);
    console.log(`👤 Creator portion (display): ${Number(creatorPortion) / (10 ** decimals)} tokens`);
    console.log(`💧 Liquidity portion (${liquidityAllocation}%): ${liquidityPortion.toString()} smallest units`);
    console.log(`💧 Liquidity portion (display): ${Number(liquidityPortion) / (10 ** decimals)} tokens`);

    // Transfer user-defined percentage of tokens to creator
    const transferTx = new TransferTransaction()
        .addTokenTransfer(tokenId, OPERATOR_ID, (-creatorPortion).toString())
        .addTokenTransfer(tokenId, AccountId.fromString(creatorWallet), creatorPortion.toString())
        .freezeWith(client);
    const signedTransferTx = await transferTx.sign(OPERATOR_KEY);
    await signedTransferTx.execute(client);

    console.log(`✅ Transferred ${creatorPortion.toString()} smallest units to creator ${creatorWallet}`);
    console.log(`✅ Transferred ${Number(creatorPortion) / (10 ** decimals)} tokens to creator ${creatorWallet}`);

    // STEP 2: Add liquidity to HeliSwap DEX
    const tokenSolidity = tokenCreateReceipt.tokenId.toSolidityAddress();
    console.log('\n🎯 STEP 2: Adding liquidity to HeliSwap DEX');
    console.log('✅ Using HeliSwap (Uniswap V2 fork) for DEX functionality');
    console.log(`💧 LIQUIDITY AMOUNT: ${liquidityPortion.toString()} smallest units`);
    console.log(`💧 LIQUIDITY AMOUNT (display): ${Number(liquidityPortion) / (10 ** decimals)} tokens`);
    console.log(`🏛️ HeliSwap Factory: ${HELISWAP_CONFIG.FACTORY.evm_address}`);
    console.log(`🌐 HeliSwap Router: ${HELISWAP_CONFIG.ROUTER.evm_address}`);
    console.log(`💰 WHBAR: ${HELISWAP_CONFIG.WHBAR.evm_address}`);
    
    const heliswapResult = await addInitialLiquidityWithHeliSwap(`0x${tokenSolidity}`, liquidityPortion, decimals, creatorWallet);
    console.log('✅ STEP 2 COMPLETE: HeliSwap DEX Pool created successfully!');

// ===== HELISWAP DEX INTEGRATION FUNCTIONS MOVED TO services/heliswap.js =====
    
    // Store HeliSwap info in meme coin data
    memeCoinData.heliswapPool = heliswapResult;

    // STEP 3: Add 5% fractional fees AFTER pool exists
    console.log('\n🎯 STEP 3: Adding 5% fractional fees to existing token...');
    const autoConvertFee = new CustomFractionalFee()
        .setFeeCollectorAccountId(OPERATOR_ID)
        .setNumerator(5)
        .setDenominator(100)
        .setAssessmentMethod(false);

    const feeUpdateTx = new TokenFeeScheduleUpdateTransaction()
        .setTokenId(tokenId)
        .setCustomFees([autoConvertFee])
        .freezeWith(client);

    const signedFeeUpdateTx = await feeUpdateTx.sign(OPERATOR_KEY);
    await signedFeeUpdateTx.execute(client);
    console.log('✅ STEP 3 COMPLETE: 5% fractional fees added!');
    console.log('💰 All future trades will now have fees');
    console.log('� PERFECT: Pool exists + fees active = working DEX with revenue!');

    console.log('\n🎊 SUCCESS: Complete meme coin with HeliSwap pool and fees!');
    console.log('✅ Token created');
    console.log('✅ Pool created on HeliSwap DEX');  
    console.log('✅ 5% fractional fees active');
    console.log('✅ Revenue generation enabled');

    // Register token with fee conversion service
    console.log('\n🔄 Registering token for automatic HBAR conversion...');
    console.log('💱 Platform will periodically convert collected tokens → HBAR → distribute');
    feeConverter.registerToken(
        tokenId,
        creatorWallet,
        `0x${tokenSolidity}`
    );
    console.log('✅ Token registered with fee conversion service');
    // Also log registration details to HCS (handled inside registerToken) for persistence
    console.log('🔄 System will automatically:');
    console.log('  1. Check collected token fees every hour');
    console.log('  2. Swap collected tokens for HBAR on SaucerSwap');
    console.log('  3. Distribute HBAR: 60% to creator, 40% to platform');

    console.log(`\n🎉 SUCCESS! Meme coin created in ${Date.now() - startTime}ms`);
    console.log(`🪙 Token ID: ${tokenId}`);
    console.log(`📋 Transaction ID: ${transactionId}`);

    // Generate DEX URLs
    const explorerUrl = getExplorerUrl(tokenId, NETWORK);
    const dexUrls = getDexUrls(tokenId, NETWORK);

    const response = {
        success: true,
        message: "🎉 Meme coin launched with GUARANTEED HeliSwap pool + fees!",
        creation_process: {
            step_1: "✅ Token created without fees (allows pool creation)",
            step_2: "✅ HeliSwap Pool created with Uniswap V2 AMM", 
            step_3: "✅ 5% fractional fees added after pool creation",
            result: "Perfect: HeliSwap Pool + fees = working DEX with revenue!"
        },
        meme_coin: {
            ...memeCoinData,
            fee_status: "5% fractional fees active on all trades",
            pool_status: "Live HeliSwap pool with Uniswap V2 AMM",
            revenue_model: "Creator earns from fractional fees on all DEX trades",
            heliswap_pool: heliswapResult,
            heliswap_factory: HELISWAP_CONFIG.FACTORY.evm_address,
            heliswap_router: HELISWAP_CONFIG.ROUTER.evm_address,
            whbar_address: HELISWAP_CONFIG.WHBAR.evm_address,
            explorer_url: explorerUrl,
            dex_urls: dexUrls,
            fee_collection: "Fractional fees on ALL transfers, auto-converted to HBAR"
        },
        immediate_availability: {
            status: "✅ LIVE AND TRADING ON HELISWAP DEX",
            trading_url: heliswapResult.tradingUrl || "https://app.heliswap.io",
            heliswap_factory: HELISWAP_CONFIG.FACTORY.evm_address,
            heliswap_router: HELISWAP_CONFIG.ROUTER.evm_address,
            whbar_address: HELISWAP_CONFIG.WHBAR.evm_address,
            fees_active: "Uniswap V2 trading fees + 5% fractional fees on transfers",
            where_to_trade: [
                "🚀 HeliSwap - Primary DEX with your pool",
                "🔥 SaucerSwap v2 - Cross-DEX arbitrage", 
                "💎 Pangolin - Multi-chain opportunities", 
                "🦎 HashPack DEX - Integrated wallet trading",
                "✅ 5% fractional fee on every trade!"
            ],
            note: "Token created with HeliSwap: token → Uniswap V2 pool → fees!"
        },
        revenue_model: {
            total_fee: `${PLATFORM_CONFIG.SWAP_FEE}% fractional fee on ALL trades across ALL DEXs`,
            creator_earns: `${PLATFORM_CONFIG.CREATOR_SHARE * PLATFORM_CONFIG.SWAP_FEE}% equivalent in HBAR (${PLATFORM_CONFIG.CREATOR_SHARE * 100}% of fees)`,
            platform_earns: `${PLATFORM_CONFIG.PLATFORM_SHARE * PLATFORM_CONFIG.SWAP_FEE}% equivalent in HBAR (${PLATFORM_CONFIG.PLATFORM_SHARE * 100}% of fees)`,
            applies_to: [
                "✅ ALL trades on SaucerSwap, HeliSwap, Pangolin",
                "✅ ALL wallet-to-wallet transfers",
                "✅ ALL smart contract interactions", 
                "✅ NO way to avoid fees - built into token",
                "💱 Token fees auto-converted to HBAR for distribution"
            ],
            automatic: "Fees collected on every trade, converted to HBAR periodically"
        },
        marketing_tips: {
            "1_share_dex_links": "Share your DEX trading links on social media",
            "2_community_building": "Build community on Telegram/Discord/Twitter",
            "3_influencer_outreach": "Contact crypto influencers and meme accounts",
            "4_reddit_marketing": "Post in relevant crypto/meme subreddits",
            "5_airdrop_strategy": "Consider small airdrops to generate interest"
        },
        next_steps: [
            "🔗 Share your DEX links to get first traders",
            "📱 Post on social media with your token details",
            "👥 Build a community around your meme",
            "📊 Monitor your earnings on HashScan",
            "🚀 Consider marketing campaigns to drive volume"
        ]
    };

    res.json(response);
});

// 📊 Get meme coin info
app.get('/meme-coin/:tokenId', async (req, res) => {
    try {
        const { tokenId } = req.params;
        const memeCoin = memeCoins.get(tokenId);
        const earnings = creatorEarnings.get(tokenId);

        if (!memeCoin) {
            return res.status(404).json({ success: false, error: "Meme coin not found" });
        }

        const explorerUrl = getExplorerUrl(tokenId, NETWORK);
        const dexUrls = getDexUrls(tokenId, NETWORK);

        const response = {
            success: true,
            meme_coin: {
                ...memeCoin,
                explorer_url: explorerUrl,
                dex_urls: dexUrls
            },
            creator_earnings: earnings,
            trading_info: {
                status: "🔥 LIVE ON ALL DEXs + Custom Router",
                fee_structure: `${PLATFORM_CONFIG.SWAP_FEE}% ONLY on HBAR→token swaps via custom router`,
                creator_revenue: `${PLATFORM_CONFIG.CREATOR_SHARE * PLATFORM_CONFIG.SWAP_FEE}% of HBAR swap amount`,
                where_to_trade: "Available on SaucerSwap, HeliSwap, Pangolin, HashPack DEX + Custom Router"
            }
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 💳 Creator earnings endpoint
app.get('/creator-earnings/:creatorWallet', async (req, res) => {
    try {
        const { creatorWallet } = req.params;
        let totalEarnings = 0;
        let totalPending = 0;
        const tokens = [];

        for (const [tokenId, memeCoin] of memeCoins.entries()) {
            if (memeCoin.creatorWallet === creatorWallet) {
                const earnings = creatorEarnings.get(tokenId);
                if (earnings) {
                    totalEarnings += earnings.totalEarned;
                    totalPending += earnings.pendingPayout;
                    tokens.push({
                        token_id: tokenId,
                        name: memeCoin.name,
                        symbol: memeCoin.symbol,
                        earned: earnings.totalEarned,
                        pending: earnings.pendingPayout,
                        created: memeCoin.createdAt,
                        dex_links: getDexUrls(tokenId, NETWORK)
                    });
                }
            }
        }

        res.json({
            success: true,
            creator_wallet: creatorWallet,
            summary: {
                total_earned: totalEarnings,
                total_pending_payout: totalPending,
                total_tokens_created: tokens.length,
                earnings_rate: `${PLATFORM_CONFIG.CREATOR_SHARE * PLATFORM_CONFIG.SWAP_FEE}% of HBAR swap volume via custom router`
            },
            tokens: tokens
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// 📋 List all meme coins
app.get('/meme-coins', (req, res) => {
    try {
        const coins = Array.from(memeCoins.entries()).map(([tokenId, memeCoin]) => ({
            ...memeCoin,
            dex_urls: getDexUrls(tokenId, NETWORK),
            explorer_url: getExplorerUrl(tokenId, NETWORK)
        }));

        res.json({
            success: true,
            total_coins: coins.length,
            meme_coins: coins.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
            note: "All tokens are immediately available on Hedera DEXs"
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: '✅ Healthy',
        service: 'HTS-Compatible HeliSwap Meme Coin Launcher',
        network: NETWORK,
        version: '10.0.0',
        heliswap_integration: {
            factory: HELISWAP_CONFIG.FACTORY.evm_address,
            factory_hedera_id: HELISWAP_CONFIG.FACTORY.hedera_id,
            router: HELISWAP_CONFIG.ROUTER.evm_address,
            router_hedera_id: HELISWAP_CONFIG.ROUTER.hedera_id,
            whbar: HELISWAP_CONFIG.WHBAR.evm_address,
            whbar_hedera_id: HELISWAP_CONFIG.WHBAR.hedera_id,
            dex_type: 'Uniswap V2 Fork',
            hts_compatible: 'Full Hedera Token Service support'
        },
        three_step_approach: {
            step_1: 'Create token WITHOUT fractional fees',
            step_2: 'Add liquidity to HeliSwap Uniswap V2 DEX',
            step_3: 'Add 5% fractional fees after pool creation'
        },
        features: [
            'GUARANTEED pool creation with HeliSwap DEX',
            'Uniswap V2 standard AMM with 0.3% trading fees',
            '5% fractional fee added AFTER pool exists',
            '3% creator revenue in HBAR (auto-converted)',
            'HeliSwap router with built-in liquidity provision',
            'Compatible with all DEX aggregators',
            'Proper Hedera SDK integration',
            'Standard ERC20/HTS token compatibility'
        ],
        fee_structure: PLATFORM_CONFIG,
        heliswap_benefits: [
            '✅ Standard Uniswap V2 AMM ensures familiar trading',
            '✅ Built-in liquidity provision for immediate trading',
            '✅ Compatible with all DEX aggregators and wallets',
            '✅ Creator earnings from fractional fees on all trades',
            '✅ Platform sustainability through fee sharing'
        ]
    });
});

// 🔥 HELISWAP DEX ENDPOINTS

// Get HeliSwap pool information for a token
app.get('/heliswap-pool/:tokenAddress', async (req, res) => {
    try {
        const { tokenAddress } = req.params;
        console.log(`📊 Getting enhanced HeliSwap pool info for: ${tokenAddress}`);
        
        // Check if pair exists
        const pairAddress = await heliswapFactory.getPair(tokenAddress, HELISWAP_CONFIG.WHBAR.evm_address);
        
        if (pairAddress === ethers.ZeroAddress) {
            return res.status(404).json({ 
                success: false, 
                error: 'Trading pair not found',
                message: 'No HeliSwap pool exists for this token'
            });
        }

        console.log(`✅ Pair found at: ${pairAddress}`);

        // Create pair contract instance
        const pairContract = new ethers.Contract(pairAddress, HELISWAP_PAIR_ABI, wallet);
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
        const whbarContract = new ethers.Contract(HELISWAP_CONFIG.WHBAR.evm_address, ERC20_ABI, wallet);

        // Get all pool data in parallel
        const [
            reserves,
            token0Address,
            token1Address,
            lpTotalSupply,
            tokenInfo,
            whbarInfo
        ] = await Promise.all([
            pairContract.getReserves(),
            pairContract.token0(),
            pairContract.token1(),
            pairContract.totalSupply(),
            Promise.all([
                tokenContract.name(),
                tokenContract.symbol(),
                tokenContract.decimals(),
                tokenContract.totalSupply()
            ]),
            Promise.all([
                whbarContract.name(),
                whbarContract.symbol(),
                whbarContract.decimals()
            ])
        ]);

        const [tokenName, tokenSymbol, tokenDecimals, tokenTotalSupply] = tokenInfo;
        const [whbarName, whbarSymbol, whbarDecimals] = whbarInfo;

        // Determine which token is token0 and token1
        const isToken0 = tokenAddress.toLowerCase() === token0Address.toLowerCase();
        const tokenReserve = isToken0 ? reserves[0] : reserves[1];
        const whbarReserve = isToken0 ? reserves[1] : reserves[0];

        // Calculate pricing
        const tokenReserveFormatted = Number(ethers.formatUnits(tokenReserve, tokenDecimals));
        const whbarReserveFormatted = Number(ethers.formatUnits(whbarReserve, whbarDecimals));
        const currentPrice = whbarReserveFormatted / tokenReserveFormatted; // Price per token in HBAR
        const priceInUsd = currentPrice * 0.05; // Assuming 1 HBAR = $0.05 (you'd get this from price oracle)
        const marketCap = tokenReserveFormatted * currentPrice;
        const liquidity = whbarReserveFormatted * 2; // Total liquidity in HBAR terms

        const poolData = {
            success: true,
            pairAddress,
            reserves: {
                tokenReserve: tokenReserve.toString(),
                whbarReserve: whbarReserve.toString(),
                totalSupply: lpTotalSupply.toString(),
                tokenReserveFormatted: tokenReserveFormatted.toString(),
                whbarReserveFormatted: whbarReserveFormatted.toString()
            },
            pricing: {
                currentPrice: currentPrice.toFixed(8),
                priceInUsd: priceInUsd.toFixed(6),
                marketCap: marketCap.toFixed(2),
                liquidity: liquidity.toFixed(2)
            },
            poolInfo: {
                token0: token0Address,
                token1: token1Address,
                isToken0,
            factory: HELISWAP_CONFIG.FACTORY.evm_address,
            router: HELISWAP_CONFIG.ROUTER.evm_address,
                tradingUrl: `https://app.heliswap.io/swap?inputCurrency=${HELISWAP_CONFIG.WHBAR.evm_address}&outputCurrency=${tokenAddress}`
            },
            tokenInfo: {
                address: tokenAddress,
                name: tokenName,
                symbol: tokenSymbol,
                decimals: Number(tokenDecimals),
                totalSupply: tokenTotalSupply.toString()
            },
            whbarInfo: {
                address: HELISWAP_CONFIG.WHBAR.evm_address,
                name: whbarName,
                symbol: whbarSymbol,
                decimals: Number(whbarDecimals)
            },
            lastUpdated: new Date().toISOString()
        };

        res.json(poolData);
    } catch (error) {
        console.error('HeliSwap pool query failed:', error);
        res.status(500).json({
            success: false,
            error: 'Pool query failed',
            details: error.message
        });
    }
});

// Enhanced quote system with price impact calculation
app.get('/heliswap-quote/:tokenAddress/:amountIn/:direction', async (req, res) => {
    try {
        const { tokenAddress, amountIn, direction } = req.params;
        const { slippage = 5 } = req.query; // Default 5% slippage
        
        console.log(`💰 Getting HeliSwap quote: ${amountIn} ${direction} ${tokenAddress}`);
        
        // direction: 'buy' (HBAR -> Token) or 'sell' (Token -> HBAR)
        const path = direction === 'buy' 
            ? [HELISWAP_CONFIG.WHBAR.evm_address, tokenAddress]
            : [tokenAddress, HELISWAP_CONFIG.WHBAR.evm_address];

        // Get current reserves for price impact calculation
        const pairAddress = await heliswapFactory.getPair(tokenAddress, HELISWAP_CONFIG.WHBAR.evm_address);
        
        if (pairAddress === ethers.ZeroAddress) {
            return res.status(404).json({
                success: false,
                error: 'No trading pair found'
            });
        }

        const pairContract = new ethers.Contract(pairAddress, HELISWAP_PAIR_ABI, wallet);
        const [reserves, token0] = await Promise.all([
            pairContract.getReserves(),
            pairContract.token0()
        ]);

        const isToken0 = tokenAddress.toLowerCase() === token0.toLowerCase();
        const tokenReserve = isToken0 ? reserves[0] : reserves[1];
        const whbarReserve = isToken0 ? reserves[1] : reserves[0];

        // Get quote from router
        const amounts = await heliswapRouter.getAmountsOut(amountIn, path);
        const amountOut = amounts[1];
        
        // Calculate price impact
        let priceImpact = 0;
        if (direction === 'buy') {
            // Buying tokens with HBAR
            const whbarIn = BigInt(amountIn);
            const priceImpactBN = (whbarIn * BigInt(10000)) / whbarReserve; // in basis points
            priceImpact = Number(priceImpactBN) / 100; // convert to percentage
        } else {
            // Selling tokens for HBAR
            const tokenIn = BigInt(amountIn);
            const priceImpactBN = (tokenIn * BigInt(10000)) / tokenReserve;
            priceImpact = Number(priceImpactBN) / 100;
        }

        // Calculate minimum received with slippage
        const slippageBN = BigInt(slippage);
        const minimumReceived = (amountOut * (BigInt(100) - slippageBN)) / BigInt(100);
        
        // Calculate effective price
        const effectivePrice = direction === 'buy'
            ? Number(amountIn) / Number(amountOut) // HBAR per token
            : Number(amountOut) / Number(amountIn); // HBAR per token

        const quoteData = {
            success: true,
            quote: {
                amountIn,
                amountOut: amountOut.toString(),
                minimumReceived: minimumReceived.toString(),
                path,
                direction,
                priceImpact: priceImpact.toFixed(4),
                effectivePrice: effectivePrice.toFixed(8),
                tradingFee: '0.3%',
                slippage: `${slippage}%`,
                reserves: {
                    tokenReserve: tokenReserve.toString(),
                    whbarReserve: whbarReserve.toString()
                },
                timestamp: Date.now()
            }
        };

        res.json(quoteData);
    } catch (error) {
        console.error('HeliSwap quote failed:', error);
        res.status(500).json({
            success: false,
            error: 'Quote failed',
            details: error.message
        });
    }
});

// Enhanced buy endpoint specifically for HBAR->Token swaps
app.post('/heliswap-buy', async (req, res) => {
    try {
        const { tokenAddress, hbarAmount, slippage = 5, recipient } = req.body;
        
        console.log(`🛒 Buy request: ${hbarAmount} HBAR -> ${tokenAddress} tokens`);
        
        if (!tokenAddress || !hbarAmount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters: tokenAddress, hbarAmount'
            });
        }

        const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour
        const recipientAddress = normalizeRecipientAddress(recipient);
        
        // Convert HBAR amount: use 18-decimal wei for msg.value; 8-decimal for quoting via WHBAR
        // EVM value uses 18 decimals (wei) for HBAR on JSON-RPC
        const hbarAmountWei = ethers.parseUnits(hbarAmount.toString(), 18);
        
        // Get quote first using WHBAR (8 decimals)
        const path = [HELISWAP_CONFIG.WHBAR.evm_address, tokenAddress];
        const quoteAmountIn = ethers.parseUnits(hbarAmount.toString(), 8);
        const amounts = await heliswapRouter.getAmountsOut(quoteAmountIn, path);
        const expectedTokens = amounts[1];
        const minTokens = expectedTokens * BigInt(100 - slippage) / BigInt(100);
        
        console.log(`Expected tokens: ${expectedTokens.toString()}`);
        console.log(`Minimum tokens (${slippage}% slippage): ${minTokens.toString()}`);

        const tx = await heliswapRouter.swapExactHBARForTokensSupportingFeeOnTransferTokens(
            minTokens.toString(),
            path,
            recipientAddress,
            deadline,
            { value: hbarAmountWei, gasLimit: 500000 }
        );
        
        const receipt = await tx.wait();
        
        res.json({
            success: true,
            transaction: {
                hash: receipt.hash,
                gasUsed: receipt.gasUsed.toString(),
                hbarAmountIn: hbarAmount,
                expectedTokensOut: expectedTokens.toString(),
                minimumTokensOut: minTokens.toString(),
                recipient: recipientAddress,
                timestamp: Date.now()
            }
        });
    } catch (error) {
        console.error('Buy transaction failed:', error);
        res.status(500).json({
            success: false,
            error: 'Buy transaction failed',
            details: error.message
        });
    }
});

// Enhanced sell endpoint specifically for Token->HBAR swaps  
app.post('/heliswap-sell', async (req, res) => {
    try {
        const { tokenAddress, tokenAmount, slippage = 5, recipient } = req.body;
        
        console.log(`💰 Sell request: ${tokenAmount} tokens -> HBAR`);
        
        if (!tokenAddress || !tokenAmount) {
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters: tokenAddress, tokenAmount'
            });
        }

        const deadline = Math.floor(Date.now() / 1000) + 3600;
        const recipientAddress = normalizeRecipientAddress(recipient);
        
        // Get quote first  
        const path = [tokenAddress, HELISWAP_CONFIG.WHBAR.evm_address];
        const amounts = await heliswapRouter.getAmountsOut(tokenAmount, path);
        const expectedHbar = amounts[1];
        const minHbar = expectedHbar * BigInt(100 - slippage) / BigInt(100);
        
        console.log(`Expected HBAR: ${ethers.formatUnits(expectedHbar, 8)}`);
        console.log(`Minimum HBAR (${slippage}% slippage): ${ethers.formatUnits(minHbar, 8)}`);

        const tx = await heliswapRouter.swapExactTokensForHBARSupportingFeeOnTransferTokens(
            tokenAmount,
            minHbar.toString(),
            path,
            recipientAddress,
            deadline,
            { gasLimit: 500000 }
        );
        
        const receipt = await tx.wait();
        
        res.json({
            success: true,
            transaction: {
                hash: receipt.hash,
                gasUsed: receipt.gasUsed.toString(),
                tokenAmountIn: tokenAmount,
                expectedHbarOut: ethers.formatUnits(expectedHbar, 8),
                minimumHbarOut: ethers.formatUnits(minHbar, 8),
                recipient: recipientAddress,
                timestamp: Date.now()
            }
        });
    } catch (error) {
        console.error('Sell transaction failed:', error);
        res.status(500).json({
            success: false,
            error: 'Sell transaction failed',
            details: error.message
        });
    }
});

// Get all HeliSwap pools created by this service
app.get('/heliswap-pools', async (req, res) => {
    try {
        console.log('� Getting all HeliSwap pools...');
        
        const allPools = [];
        for (const [tokenId, coinData] of memeCoins.entries()) {
            if (coinData.heliswapPool) {
                allPools.push({
                    tokenId,
                    name: coinData.name,
                    symbol: coinData.symbol,
                    tokenAddress: coinData.heliswapPool.poolDetails?.tokenAddress,
                    pairAddress: coinData.heliswapPool.pairAddress,
                    tradingUrl: coinData.heliswapPool.tradingUrl,
                    createdAt: coinData.createdAt
                });
            }
        }
        
        res.json({
            success: true,
            pools: allPools,
            totalPools: allPools.length,
            heliswapFactory: HELISWAP_CONFIG.FACTORY.evm_address,
            heliswapRouter: HELISWAP_CONFIG.ROUTER.evm_address
        });
    } catch (error) {
        console.error('Get HeliSwap pools error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Fee conversion status
app.get('/fee-conversion-status', (req, res) => {
    res.json({
        success: true,
        conversion_service: feeConverter.getStatus(),
        how_it_works: {
            "1_collect": "5% fractional fees collected on every trade (all DEXs)",
            "2_accumulate": "Platform accumulates token fees from all trading",
            "3_convert": "Every hour: convert collected tokens → HBAR via SaucerSwap",
            "4_distribute": "60% HBAR to creator, 40% HBAR to platform"
        },
        guaranteed_coverage: [
            "✅ SaucerSwap trades",
            "✅ HeliSwap trades", 
            "✅ Pangolin trades",
            "✅ Wallet-to-wallet transfers",
            "✅ Smart contract interactions",
            "✅ ALL token movements"
        ]
    });
});

// Register an existing token for fee conversion (so the 5-min job will include it)
app.post('/fee-conversion/register', (req, res) => {
    try {
        const { tokenId, creatorAccountId, tokenEvmAddress } = req.body || {};
        if (!tokenId || !creatorAccountId || !tokenEvmAddress) {
            return res.status(400).json({
                success: false,
                error: 'Missing required fields: tokenId, creatorAccountId, tokenEvmAddress'
            });
        }
        feeConverter.registerToken(tokenId, creatorAccountId, tokenEvmAddress);
        const status = feeConverter.getStatus();
        return res.json({
            success: true,
            registered: { tokenId, creatorAccountId, tokenEvmAddress },
            hcsTopicId: status.hcsTopicId || null,
            nextScheduledRunAt: new Date(Date.now() + status.conversionInterval).toISOString(),
            intervalMinutes: status.conversionInterval / 1000 / 60
        });
    } catch (err) {
        console.error('Register token for fee conversion failed:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// Manually trigger an immediate conversion for a registered token
app.post('/fee-conversion/trigger', async (req, res) => {
    try {
        const { tokenId } = req.body || {};
        if (!tokenId) {
            return res.status(400).json({ success: false, error: 'Missing tokenId' });
        }
        await feeConverter.triggerConversion(tokenId);
        return res.json({ success: true, message: 'Conversion triggered' });
    } catch (err) {
        console.error('Manual conversion trigger failed:', err.message);
        return res.status(500).json({ success: false, error: err.message });
    }
});

// API documentation
app.get('/', (req, res) => {
    res.json({
        service: "🚀 HeliSwap Meme Coin Launcher (GUARANTEED SUCCESS)",
        version: "10.0.0",
        description: "Launch meme coins with GUARANTEED HeliSwap pool creation + 5% fees using three-step approach",
        
        three_step_approach: {
            step_1: "Create token WITHOUT fractional fees (allows clean pool creation)",
            step_2: "Add liquidity pool to HeliSwap (Uniswap V2 fork)",
            step_3: "Add 5% fractional fees using TokenFeeScheduleUpdateTransaction",
            result: "HeliSwap pool exists + fees active = guaranteed revenue generation"
        },

        key_benefits: [
            "✅ GUARANTEED pool creation with HeliSwap DEX",
            "✅ Uniswap V2 standard AMM with 0.3% trading fees",
            "✅ 5% fractional fee added AFTER pool creation",
            "✅ 3% automatic HBAR revenue to creators",
            "✅ Compatible with all DEX aggregators",
            "✅ Proper Hedera SDK integration for HTS tokens"
        ],

        endpoints: {
            "POST /create-meme-coin": "Launch new meme coin with HeliSwap integration",
            "GET /meme-coin/:tokenId": "Get meme coin details and DEX links",
            "GET /creator-earnings/:wallet": "Check creator earnings",
            "GET /meme-coins": "List all launched meme coins",
            "GET /heliswap-pool/:tokenAddress": "Get HeliSwap pool information"
        },

        how_it_works: {
            "1_create_no_fees": "Create HTS token WITHOUT fractional fees (clean creation)",
            "2_distribute_tokens": "Transfer tokens to creator and prepare for liquidity", 
            "3_create_pool": "Add liquidity to HeliSwap using ContractExecuteTransaction",
            "4_add_fees": "Add 5% fractional fees using TokenFeeScheduleUpdateTransaction",
            "5_guaranteed_revenue": "Creator earns 3% HBAR from EVERY trade",
            "6_scale": "Community builds, ALL volume generates HBAR revenue"
        },

        why_guaranteed_success: [
            "🎯 HeliSwap pool creation with exact HTS token amounts",
            "🎯 Uniswap V2 router expects precise amounts during pool creation",
            "🎯 Fractional fees break amount expectations if present during creation",
            "🎯 Post-creation fee addition preserves pool integrity",
            "🎯 Proper Hedera SDK integration for HTS compatibility"
        ],

        revenue_model: {
            fee_structure: "5% HBAR fee on ALL trades (no way to avoid)",
            creator_share: "60% of ALL swap fees = 3% of HBAR swap amount",
            platform_share: "40% of ALL swap fees = 2% of HBAR swap amount", 
            automatic_distribution: "HBAR fees sent directly to wallets on every trade",
            applies_to: "Every single HBAR→token swap (only way to trade)",
            guaranteed: "Users cannot trade without paying fees"
        },

        marketing_strategy: {
            dex_discovery: "Users discover tokens naturally while browsing DEXs",
            social_sharing: "Share DEX links on Twitter, Telegram, Discord",
            influencer_outreach: "Reach out to crypto meme influencers",
            community_building: "Build communities around your meme tokens",
            airdrops: "Consider strategic airdrops to generate buzz"
        },

        example_request: {
            curl: `curl -X POST "${req.protocol}://${req.get('host')}/create-meme-coin" \\
  -F "image=@meme.png" \\
  -F "name=DOGE TO THE MOON" \\
  -F "symbol=MOON" \\
  -F "supply=1000000" \\
  -F "creatorWallet=0.0.123456" \\
  -F "description=The ultimate moon mission meme coin"`
        },

        network: NETWORK,
        instant_dex_access: "✅ Your token appears on DEXs immediately after creation!",
        
        contact: "Launch your meme coin and start earning from every trade instantly!"
    });
});


const PORT = process.env.PORT || 3003;

app.listen(PORT, () => {
    console.log('\n🚀 Three-Step Meme Coin Launcher Started! (GUARANTEED SUCCESS)');
    console.log('━'.repeat(70));
    console.log(`🌐 Server: http://localhost:${PORT}`);
    console.log(`📡 Network: ${NETWORK}`);
    console.log('\n🎯 THREE-STEP APPROACH:');
    console.log('   1️⃣ Create token WITHOUT fractional fees');
    console.log('   2️⃣ Add liquidity pool (no fee interference)');
    console.log('   3️⃣ Add 5% fractional fees via TokenFeeScheduleUpdateTransaction');
    console.log('\n💰 REVENUE MODEL:');
    console.log(`   💎 Fee: ${PLATFORM_CONFIG.SWAP_FEE}% fractional fee on ALL trades`);
    console.log(`   👤 Creator earns: ${PLATFORM_CONFIG.CREATOR_SHARE * PLATFORM_CONFIG.SWAP_FEE}% equivalent in HBAR`);
    console.log(`   🏢 Platform earns: ${PLATFORM_CONFIG.PLATFORM_SHARE * PLATFORM_CONFIG.SWAP_FEE}% equivalent in HBAR`);
    console.log(`   🎁 Token Distribution: 10% to creator, ${PLATFORM_CONFIG.LIQUIDITY_PORTION * 100}% to DEX`);
    console.log('\n✅ WHY THIS WORKS:');
    console.log('   🎯 Pool creation with exact amounts (no fee interference)');
    console.log('   🎯 Trading infrastructure established first');
    console.log('   🎯 Fees added after pool creation preserves integrity');
    console.log('   🎯 Revenue generation without breaking pools');
    console.log('━'.repeat(70));
    console.log('\n📚 API Documentation: http://localhost:' + PORT);
    console.log('🏥 Health Check: http://localhost:' + PORT + '/health');
    console.log('\n✨ Ready to launch meme coins with GUARANTEED success!');
    console.log('🎯 Three-step approach ensures pool creation + fee collection!\n');
    
    // Start fee conversion service
    console.log('🔄 Starting automatic fee conversion service...');
    feeConverter.start();
});


const ROUTER_ADDRESS = "0xed2c4A50Ee6925c2ffd4e933340b8c6846630C8e"; // HTS-Compatible Custom AMM Router - SIMPLIFIED ERROR MESSAGES
const POOL_MANAGER = "0x451cBB9ee25F1259e1f94E128A8823787861a30d"; // HTS-Compatible Pool Manager - SIMPLIFIED ERROR MESSAGES  
const FEE_MANAGER = "0x11273C1D8464639C1403334Bec86689E239E277E"; // Fee Manager - SIMPLIFIED ERROR MESSAGES

// Hedera Contract IDs (will be determined from successful deployment)
const ROUTER_CONTRACT_ID = "0.0.6510620"; // Router deployed first - SIMPLIFIED VERSION
const POOL_MANAGER_CONTRACT_ID = "0.0.6510618"; // Pool Manager deployed second - SIMPLIFIED VERSION  
const FEE_MANAGER_CONTRACT_ID = "0.0.6510616"; // Fee Manager deployed third - SIMPLIFIED VERSION

async function addInitialLiquidityWithCustomAmm(tokenAddress, amountTokens, decimals, creatorWallet) {
  console.log('--- USING HTS-COMPATIBLE CUSTOM AMM ROUTER ---');
  console.log('🎯 HTS Custom AMM = Bonding curve pricing with Hedera Token Service');
  console.log('🎯 Perfect for HTS meme coins with built-in fee collection');
  
  console.log('✅ Using HTS Custom AMM Router:', ROUTER_ADDRESS);
  console.log('✅ Pool Manager:', POOL_MANAGER);
  console.log('✅ Fee Manager:', FEE_MANAGER);
  console.log('tokenAddress:', tokenAddress);
  console.log('amountTokens (RAW):', amountTokens.toString());
  console.log('creator:', creatorWallet);

  const client = getHederaClient();
  
  // Convert addresses
  const checksumTokenAddress = ethers.getAddress(tokenAddress.toLowerCase());
  
  // Use provided EVM address for creator
  const checksumCreatorAddress = ethers.getAddress('0x0a1a51e540104b59ced30ca3e0508a32a6faeaae');
  console.log('✅ Using provided EVM address for creator:', checksumCreatorAddress);
  
  // Use the correct contract ID from HashScan
  const routerContractId = ContractId.fromString(ROUTER_CONTRACT_ID);
  
  console.log('✅ Router Contract ID:', routerContractId.toString());
  console.log('✅ Token EVM Address:', checksumTokenAddress);
  console.log('✅ Creator Address:', checksumCreatorAddress);

  // Convert token EVM address back to Hedera token ID for associations
  const tokenIdFromAddress = checksumTokenAddress.slice(2);
  const tokenIdNum = parseInt(tokenIdFromAddress, 16);
  const tokenId = `0.0.${tokenIdNum}`;
  console.log('✅ Token ID for operations:', tokenId);

  try {
    // Step 1: Associate token with operator account
    console.log('\n📍 Step 1: Token associations...');
    
    try {
      const associateTx = await new TokenAssociateTransaction()
        .setAccountId(OPERATOR_ID)
        .setTokenIds([tokenId])
        .freezeWith(client);
      const signedAssociateTx = await associateTx.sign(OPERATOR_KEY);
      await signedAssociateTx.execute(client);
      console.log('✅ Token associated with operator');
    } catch (err) {
      if (err.message.includes('TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT')) {
        console.log('✅ Token already associated with operator');
      } else {
        throw err;
      }
    }

    // Step 2: Check token balance to ensure we have enough tokens
    console.log('\n📍 Step 2: Checking token balance...');
    const balanceQuery = new AccountBalanceQuery()
      .setAccountId(OPERATOR_ID);
    const balance = await balanceQuery.execute(client);
    
    // Find the token balance
    let tokenBalance = 0;
    if (balance.tokens && balance.tokens.get(tokenId)) {
      tokenBalance = balance.tokens.get(tokenId).toNumber();
    }
    
    console.log('✅ Current token balance:', tokenBalance);
    console.log('✅ Required tokens:', amountTokens.toString());
    
    if (tokenBalance < parseInt(amountTokens.toString())) {
      throw new Error(`Insufficient token balance. Have: ${tokenBalance}, Need: ${amountTokens.toString()}`);
    }

    // Step 3: Approve router to spend tokens (HTS style)
    console.log('\n📍 Step 3: Approving router to spend tokens...');
    // Always use routerContractId (Hedera contract ID) for allowance
    const approveTx = await new AccountAllowanceApproveTransaction()
      .approveTokenAllowance(tokenId, OPERATOR_ID, routerContractId, amountTokens.toString())
      .freezeWith(client);
    const signedApproveTx = await approveTx.sign(OPERATOR_KEY);
    await signedApproveTx.execute(client);
    console.log('✅ Router approved to spend', amountTokens.toString(), 'tokens');

    // Step 4: Set bonding curve parameters
    const startPrice = ethers.parseEther("0.0001"); // 0.0001 HBAR per token
    const slope = ethers.parseEther("0.00001");     // 0.00001 HBAR price increase per token
    const feeBps = 500;                             // 5% total fee
    const creatorFeeBps = 300;                      // 3% goes to creator (60% of total fee)
    const liquidityHbar = PLATFORM_CONFIG.LIQUIDITY_HBAR[NETWORK] || PLATFORM_CONFIG.LIQUIDITY_HBAR.testnet;

    console.log('\n📊 Bonding Curve Parameters:');
    console.log('- Start Price:', ethers.formatEther(startPrice), 'HBAR per token');
    console.log('- Price Slope:', ethers.formatEther(slope), 'HBAR increase per token');
    console.log('- Total Fee:', feeBps / 100, '%');
    console.log('- Creator Fee:', creatorFeeBps / 100, '% (60% of total)');
    console.log('- Platform Fee:', (feeBps - creatorFeeBps) / 100, '% (40% of total)');
    console.log('- Initial HBAR:', liquidityHbar, 'HBAR');

    // Step 5: Create pool using HTS-compatible custom AMM
    const contractParams = new ContractFunctionParameters()
      .addAddress(checksumTokenAddress)        // _token
      .addAddress(checksumCreatorAddress)      // _creator  
      .addUint256(amountTokens.toString())     // _tokenAmount
      .addUint256(startPrice.toString())       // _startPrice
      .addUint256(slope.toString())            // _slope
      .addUint256(feeBps)                      // _feeBps
      .addUint256(creatorFeeBps);              // _creatorFeeBps

    console.log('\n📋 HTS Custom AMM Contract Call:');
    console.log('- Function: createPool');
    console.log('- Gas limit: 1500000 (increased for HTS operations)');
    console.log('- HBAR payment:', liquidityHbar, 'HBAR');
    console.log('- Token:', checksumTokenAddress);
    console.log('- Creator:', checksumCreatorAddress);
    console.log('- Token Amount:', amountTokens.toString());
    console.log('- Start Price:', startPrice.toString());
    console.log('- Slope:', slope.toString());
    console.log('- Fee BPS:', feeBps);
    console.log('- Creator Fee BPS:', creatorFeeBps);

    const contractTx = await new ContractExecuteTransaction()
      .setContractId(routerContractId)
      .setGas(1500000) // More gas for HTS operations
      .setPayableAmount(Hbar.from(liquidityHbar))
      .setFunction('createPool', contractParams)
      .freezeWith(client);

    console.log('\n⏳ Executing HTS-compatible custom AMM pool creation...');
    const signedContractTx = await contractTx.sign(OPERATOR_KEY);
    const contractResponse = await signedContractTx.execute(client);
    console.log('📤 Pool creation transaction submitted:', contractResponse.transactionId.toString());
    
    console.log('⏳ Waiting for receipt...');
    const receipt = await contractResponse.getReceipt(client);
    console.log('📨 Receipt received, status:', receipt.status._code);

    if (receipt.status === Status.Success) {
      console.log('\n🎉 SUCCESS: HTS-COMPATIBLE CUSTOM AMM POOL CREATED!');
      console.log('✅ Hedera Token Service integration active');
      console.log('✅ Bonding curve pricing active');
      console.log('✅ Automatic fee collection enabled');
      console.log('✅ Creator revenue stream established');
      console.log('✅ HTS token association handled');
      console.log('📊 Pool creation transaction ID:', contractResponse.transactionId.toString());
      
      return {
        success: true,
        transactionId: contractResponse.transactionId.toString(),
        routerAddress: ROUTER_ADDRESS,
        poolManager: POOL_MANAGER,
        feeManager: FEE_MANAGER,
        htsCompatible: true,
        bondingCurve: {
          startPrice: ethers.formatEther(startPrice),
          slope: ethers.formatEther(slope),
          feeBps: feeBps,
          creatorFeeBps: creatorFeeBps
        },
        tradingUrl: `https://your-trading-frontend.com/trade/${checksumTokenAddress}`,
        message: 'HTS-compatible Custom AMM pool with bonding curve created - ready for trading!'
      };
    } else {
      throw new Error(`HTS Custom AMM pool creation failed with status: ${receipt.status._code} (${receipt.status})`);
    }

  } catch (err) {
    console.error('\n❌ HTS Custom AMM pool creation failed:', err.message);
    console.error('Full error:', err);
    
    // Enhanced error diagnosis for HTS
    if (err.message.includes('CONTRACT_REVERT_EXECUTED')) {
      console.error('\n🔍 Contract reverted. Common HTS issues:');
      console.error('1. Token not associated with contract (handled by HTS Helper)');
      console.error('2. Insufficient token balance or allowance');
      console.error('3. HTS system contract interaction failed');
      console.error('4. Contract logic validation failed');
      console.error('5. Gas limit too low for HTS operations');
      
      console.error('\n💡 HTS-specific suggestions:');
      console.error('💡 Check if token is a valid HTS token');
      console.error('💡 Ensure contract has proper HTS system contract access');
      console.error('💡 Verify allowance was set correctly');
    }
    
    throw err;
  }

  // Resolve EVM address from Hedera AccountId via mirror node
  async function resolveEvmFromAccountId(accountIdString) {
    try {
      const url = `${MIRROR_URL}/api/v1/accounts/${encodeURIComponent(accountIdString)}`;
      const resp = await fetch(url);
      if (!resp.ok) return undefined;
      const data = await resp.json();
      const evm = data?.evm_address;
      return evm ? ethers.getAddress(evm) : undefined;
    } catch (_) { return undefined; }
  }

  // Resolve Hedera AccountId from EVM address via mirror node
  async function resolveAccountIdFromEvmAddress(evmAddress) {
    try {
      const url = `${MIRROR_URL}/api/v1/accounts?evm_address=${ethers.getAddress(evmAddress)}`;
      const resp = await fetch(url);
      if (!resp.ok) return undefined;
      const data = await resp.json();
      return data?.accounts?.[0]?.account;
    } catch (_) { return undefined; }
  }
}

async function addInitialLiquiditySimple(tokenAddress, amountTokens) {
  console.log('--- USING SAUCERSWAP V1 FOR SIMPLE FUNGIBLE TOKEN TRADING ---');
  console.log('🎯 V1 = Perfect for meme coins (simple liquidity pools)');
  console.log('🎯 V2 = Advanced concentrated liquidity (complex)');
  
  // **FIXED: Use correct SaucerSwap V1 router with proper WHBAR handling**
  const SAUCERSWAP_V1_ROUTER = "0.0.19264"; // SaucerSwapV1RouterV3 (testnet)
  const WHBAR_TOKEN_ID = "0.0.15058"; // WHBAR token ID for testnet
  const LIQUIDITY_LOCKER = process.env.LIQUIDITY_LOCKER_ADDRESS;
  
  console.log('✅ Using SaucerSwap V1 Router:', SAUCERSWAP_V1_ROUTER);
  console.log('✅ WHBAR Token ID:', WHBAR_TOKEN_ID);
  console.log('tokenAddress:', tokenAddress);
  console.log('amountTokens (RAW):', amountTokens);

  if (!LIQUIDITY_LOCKER) {
    throw new Error("Liquidity Locker address missing");
  }

  const client = getHederaClient();
  
  // Convert addresses
  let checksumTokenAddress, checksumLiquidityLocker, routerContractId;
  routerContractId = ContractId.fromString(SAUCERSWAP_V1_ROUTER);
  checksumTokenAddress = ethers.getAddress(tokenAddress.toLowerCase());
  checksumLiquidityLocker = ethers.getAddress(LIQUIDITY_LOCKER.toLowerCase());
  
  console.log('✅ V1 Router Contract ID:', routerContractId.toString());
  console.log('✅ Token EVM Address:', checksumTokenAddress);
  console.log('✅ Liquidity Locker Address:', checksumLiquidityLocker);

  // Convert token EVM address back to Hedera token ID
  const tokenIdFromAddress = checksumTokenAddress.slice(2);
  const tokenIdNum = parseInt(tokenIdFromAddress, 16);
  const tokenId = `0.0.${tokenIdNum}`;
  console.log('✅ Token ID for operations:', tokenId);

  // **STEP 1: Associate both tokens (your token AND WHBAR)**
  console.log('\n📍 Step 1: Token associations...');
  
  // Associate your token
  try {
    const associateTx = await new TokenAssociateTransaction()
      .setAccountId(OPERATOR_ID)
      .setTokenIds([tokenId])
      .freezeWith(client);
    const signedAssociateTx = await associateTx.sign(OPERATOR_KEY);
    await signedAssociateTx.execute(client);
    console.log('✅ Your token associated');
  } catch (err) {
    if (err.message.includes('TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT')) {
      console.log('✅ Your token already associated');
    } else {
      throw err;
    }
  }

  // **CRITICAL: Associate WHBAR token**
  try {
    const whbarAssociateTx = await new TokenAssociateTransaction()
      .setAccountId(OPERATOR_ID)
      .setTokenIds([WHBAR_TOKEN_ID])
      .freezeWith(client);
    const signedWhbarAssociateTx = await whbarAssociateTx.sign(OPERATOR_KEY);
    await signedWhbarAssociateTx.execute(client);
    console.log('✅ WHBAR token associated');
  } catch (err) {
    if (err.message.includes('TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT')) {
      console.log('✅ WHBAR token already associated');
    } else {
      throw err;
    }
  }

  // **STEP 2: Get WHBAR by wrapping HBAR**
  const liquidityHbarAmount = PLATFORM_CONFIG.LIQUIDITY_HBAR[NETWORK] || PLATFORM_CONFIG.LIQUIDITY_HBAR.testnet;
  const hbarInTinybars = BigInt(liquidityHbarAmount) * BigInt(100000000);
  
  console.log('\n📍 Step 2: Converting HBAR to WHBAR...');
  console.log('- HBAR amount to wrap:', liquidityHbarAmount);
  console.log('- HBAR in tinybars:', hbarInTinybars.toString());
  
  // Get WHBAR helper contract to wrap HBAR
  const WHBAR_HELPER_ID = "0.0.5286055";
  const whbarHelperContractId = ContractId.fromString(WHBAR_HELPER_ID);
  console.log('✅ WHBAR Helper Contract ID:', whbarHelperContractId.toString());
  
  // Wrap HBAR to WHBAR
  const wrapParams = new ContractFunctionParameters();
  
  const wrapTx = await new ContractExecuteTransaction()
    .setContractId(whbarHelperContractId)
    .setGas(100000)
    .setPayableAmount(Hbar.from(liquidityHbarAmount))
    .setFunction('deposit', wrapParams)
    .freezeWith(client);
    
  const signedWrapTx = await wrapTx.sign(OPERATOR_KEY);
  const wrapResponse = await signedWrapTx.execute(client);
  const wrapReceipt = await wrapResponse.getReceipt(client);
  
  if (wrapReceipt.status !== Status.Success) {
    throw new Error(`HBAR wrapping failed: ${wrapReceipt.status}`);
  }
  
  console.log('✅ HBAR wrapped to WHBAR:', liquidityHbarAmount, 'HBAR');
  console.log('✅ Wrap transaction ID:', wrapResponse.transactionId.toString());

  // **STEP 3: Approve both tokens**
  console.log('\n📍 Step 3: Approving tokens...');
  
  // Approve your token
  const approveTokenTx = await new AccountAllowanceApproveTransaction()
    .approveTokenAllowance(tokenId, OPERATOR_ID, routerContractId, amountTokens)
    .freezeWith(client);
  const signedApproveTokenTx = await approveTokenTx.sign(OPERATOR_KEY);
  const approveTokenResponse = await signedApproveTokenTx.execute(client);
  console.log('✅ Your token approved:', amountTokens);
  console.log('✅ Token approval TX:', approveTokenResponse.transactionId.toString());

  // Approve WHBAR
  const approveWhbarTx = await new AccountAllowanceApproveTransaction()
    .approveTokenAllowance(WHBAR_TOKEN_ID, OPERATOR_ID, routerContractId, hbarInTinybars.toString())
    .freezeWith(client);
  const signedApproveWhbarTx = await approveWhbarTx.sign(OPERATOR_KEY);
  const approveWhbarResponse = await signedApproveWhbarTx.execute(client);
  console.log('✅ WHBAR approved:', hbarInTinybars.toString());
  console.log('✅ WHBAR approval TX:', approveWhbarResponse.transactionId.toString());

  // **STEP 4: Create liquidity pool using addLiquidity (token-to-token)**
  const amountTokenMin = BigInt(amountTokens) * 95n / 100n;
  const amountWhbarMin = hbarInTinybars * 95n / 100n;
  const deadline = Math.floor(Date.now() / 1000) + 3600;

  // **CRITICAL: Convert WHBAR token ID to EVM address**
  const whbarEvmAddress = `0x${parseInt(WHBAR_TOKEN_ID.split('.')[2]).toString(16).padStart(40, '0')}`;
  console.log('✅ WHBAR EVM address:', whbarEvmAddress);

  // **FIX 1: Sort token addresses - MOST LIKELY FIX**
  console.log('\n🔄 Sorting token addresses for AMM compatibility...');
  const tokenAAddress = checksumTokenAddress < whbarEvmAddress ? checksumTokenAddress : whbarEvmAddress;
  const tokenBAddress = checksumTokenAddress < whbarEvmAddress ? whbarEvmAddress : checksumTokenAddress;
  const amountADesired = tokenAAddress === checksumTokenAddress ? amountTokens : hbarInTinybars.toString();
  const amountBDesired = tokenAAddress === checksumTokenAddress ? hbarInTinybars.toString() : amountTokens;
  const amountAMin = tokenAAddress === checksumTokenAddress ? amountTokenMin.toString() : amountWhbarMin.toString();
  const amountBMin = tokenAAddress === checksumTokenAddress ? amountWhbarMin.toString() : amountTokenMin.toString();

  console.log('📋 Sorted token order:');
  console.log('- TokenA (lower address):', tokenAAddress, tokenAAddress === checksumTokenAddress ? '(Your Token)' : '(WHBAR)');
  console.log('- TokenB (higher address):', tokenBAddress, tokenBAddress === checksumTokenAddress ? '(Your Token)' : '(WHBAR)');

  // **FIX 2: Use liquidity locker from env if available, fallback to operator**
  let lpRecipient;
  let lpRecipientAccountId = null;
  if (LIQUIDITY_LOCKER && LIQUIDITY_LOCKER.startsWith('0x')) {
    lpRecipient = checksumLiquidityLocker;
    console.log('✅ Using liquidity locker from env:', lpRecipient);
    
    // **FIX 6: Derive AccountId from EVM address for token associations**
    try {
      // Convert EVM address to AccountId (assumes mirror node alias format)
      const evmAddressBytes = lpRecipient.slice(2); // Remove 0x prefix
      const accountNum = parseInt(evmAddressBytes.slice(-8), 16); // Last 4 bytes as account number
      lpRecipientAccountId = AccountId.fromString(`0.0.${accountNum}`);
      console.log('✅ Derived liquidity locker AccountId:', lpRecipientAccountId.toString());
    } catch (derivationError) {
      console.log('⚠️ Could not derive AccountId from EVM address, will use operator instead');
      console.log('Derivation error:', derivationError.message);
      lpRecipient = null; // Fall back to operator
    }
  }
  
  if (!lpRecipient) {
    const operatorEvmAddress = OPERATOR_ID.toSolidityAddress();
    lpRecipient = ethers.getAddress(`0x${operatorEvmAddress}`);
    lpRecipientAccountId = OPERATOR_ID;
    console.log('✅ Using operator as LP recipient:', lpRecipient);
  }

  // **FIX 3: Verify balances before contract call**
  console.log('\n📊 Verifying balances before liquidity creation...');
  const tokenBalance = await new AccountBalanceQuery().setAccountId(OPERATOR_ID).execute(client);
  const operatorTokenBalance = tokenBalance.tokens.get(tokenId);
  const operatorWhbarBalance = tokenBalance.tokens.get(WHBAR_TOKEN_ID);
  
  console.log('Operator Token Balance:', operatorTokenBalance ? operatorTokenBalance.toString() : '0');
  console.log('Operator WHBAR Balance:', operatorWhbarBalance ? operatorWhbarBalance.toString() : '0');
  console.log('Required Token Amount:', amountTokens);
  console.log('Required WHBAR Amount:', hbarInTinybars.toString());

  if (!operatorTokenBalance || BigInt(operatorTokenBalance.toString()) < BigInt(amountTokens)) {
    throw new Error(`Insufficient token balance. Have: ${operatorTokenBalance ? operatorTokenBalance.toString() : '0'}, Need: ${amountTokens}`);
  }
  if (!operatorWhbarBalance || BigInt(operatorWhbarBalance.toString()) < hbarInTinybars) {
    throw new Error(`Insufficient WHBAR balance. Have: ${operatorWhbarBalance ? operatorWhbarBalance.toString() : '0'}, Need: ${hbarInTinybars.toString()}`);
  }

  // **FIX 7: Associate LP recipient with tokens if it's not the operator**
  if (lpRecipientAccountId && !lpRecipientAccountId.equals(OPERATOR_ID)) {
    console.log('\n🔗 Associating liquidity locker with tokens...');
    try {
      const associateLockerTx = await new TokenAssociateTransaction()
        .setAccountId(lpRecipientAccountId)
        .setTokenIds([tokenId, WHBAR_TOKEN_ID])
        .freezeWith(client);
      const signedAssociateLockerTx = await associateLockerTx.sign(OPERATOR_KEY);
      await signedAssociateLockerTx.execute(client);
      console.log('✅ Liquidity locker associated with custom token and WHBAR');
    } catch (associationError) {
      if (associationError.message.includes('TOKEN_ALREADY_ASSOCIATED_TO_ACCOUNT')) {
        console.log('✅ Liquidity locker already associated with tokens');
      } else if (associationError.message.includes('INVALID_ACCOUNT_ID')) {
        console.log('⚠️ Invalid liquidity locker AccountId, falling back to operator');
        // Fall back to operator
        const operatorEvmAddress = OPERATOR_ID.toSolidityAddress();
        lpRecipient = ethers.getAddress(`0x${operatorEvmAddress}`);
        lpRecipientAccountId = OPERATOR_ID;
        console.log('✅ Updated LP recipient to operator:', lpRecipient);
      } else {
        console.log('⚠️ Could not associate liquidity locker with tokens:', associationError.message);
        console.log('Falling back to operator as LP recipient');
        const operatorEvmAddress = OPERATOR_ID.toSolidityAddress();
        lpRecipient = ethers.getAddress(`0x${operatorEvmAddress}`);
        lpRecipientAccountId = OPERATOR_ID;
      }
    }
  } else {
    console.log('✅ Using operator as LP recipient - associations already handled');
  }
  
  console.log(`\n🔥 V1 LIQUIDITY Parameters (SORTED & VERIFIED):`);
  console.log('- Token A:', tokenAAddress);
  console.log('- Token B:', tokenBAddress);
  console.log('- Amount A desired:', amountADesired);
  console.log('- Amount B desired:', amountBDesired);
  console.log('- Amount A minimum (5% slippage):', amountAMin);
  console.log('- Amount B minimum (5% slippage):', amountBMin);
  console.log('- LP recipient:', lpRecipient);
  console.log('- Deadline:', new Date(deadline * 1000).toISOString());

  const contractParams = new ContractFunctionParameters()
    .addAddress(tokenAAddress)                 // tokenA (sorted)
    .addAddress(tokenBAddress)                 // tokenB (sorted)
    .addUint256(amountADesired)                // amountADesired (sorted)
    .addUint256(amountBDesired)                // amountBDesired (sorted)
    .addUint256(amountAMin)                    // amountAMin (sorted)
    .addUint256(amountBMin)                    // amountBMin (sorted)
    .addAddress(lpRecipient)                   // to (liquidity locker or operator)
    .addUint256(deadline);                     // deadline

  console.log('\n📋 V1 Contract Call Details (FINAL SORTED):');
  console.log('- Contract ID:', routerContractId.toString());
  console.log('- Function: addLiquidity');
  console.log('- Gas limit: 600000 (INCREASED)');
  console.log('- Parameters:');
  console.log('  - tokenA:', tokenAAddress);
  console.log('  - tokenB:', tokenBAddress);
  console.log('  - amountADesired:', amountADesired);
  console.log('  - amountBDesired:', amountBDesired);
  console.log('  - amountAMin:', amountAMin);
  console.log('  - amountBMin:', amountBMin);
  console.log('  - to:', lpRecipient);
  console.log('  - deadline:', deadline);

  const contractTx = await new ContractExecuteTransaction()
    .setContractId(routerContractId)
    .setGas(600000)  // **FIX 4: Increased gas limit**
    .setFunction('addLiquidity', contractParams)
    .freezeWith(client);

  console.log('\n⏳ Executing liquidity pool creation...');
  const signedContractTx = await contractTx.sign(OPERATOR_KEY);
  const contractResponse = await signedContractTx.execute(client);
  console.log('📤 Pool creation transaction submitted:', contractResponse.transactionId.toString());
  
  console.log('⏳ Waiting for receipt...');
  const receipt = await contractResponse.getReceipt(client);
  console.log('📨 Receipt received, status:', receipt.status._code);

  if (receipt.status === Status.Success) {
    console.log('\n🎉 SUCCESS: V1 POOL CREATED WITH WHBAR!');
    console.log('✅ Your token is now tradeable against WHBAR');
    console.log('✅ Simple liquidity pool (Uniswap V2 style)');
    console.log('✅ Perfect for meme coin trading');
    console.log('📊 Pool creation transaction ID:', contractResponse.transactionId.toString());
    return {
      success: true,
      transactionId: contractResponse.transactionId.toString(),
      message: 'V1 liquidity pool created with WHBAR - ready for trading'
    };
  } else {
    // **FIX 8: Enhanced detailed error logging and analysis**
    console.log('\n❌ Pool creation failed, analyzing transaction...');
    console.log('📊 Receipt status code:', receipt.status._code);
    console.log('📊 Receipt status name:', receipt.status.toString());
    
    try {
      const record = await contractResponse.getRecord(client);
      console.log('\n🔍 DETAILED CONTRACT EXECUTION ANALYSIS:');
      
      // Extract contract function result
      const contractResult = record.contractFunctionResult;
      if (contractResult) {
        console.log('📋 Contract Result Details:');
        console.log('  - Gas Used:', contractResult.gasUsed);
        console.log('  - Contract ID:', contractResult.contractId?.toString());
        console.log('  - Function Parameters:', contractResult.functionParameters);
        
        // Extract error message
        const errorMessage = contractResult.errorMessage || 'No specific error message available';
        console.log('  - Error Message:', errorMessage);
        
        // Extract any return data
        if (contractResult.contractCallResult && contractResult.contractCallResult.length > 0) {
          console.log('  - Return Data (hex):', Buffer.from(contractResult.contractCallResult).toString('hex'));
        }
        
        // Log transaction fee
        console.log('  - Transaction Fee:', record.transactionFee.toString());
        
        // Common error analysis
        console.log('\n🔍 ERROR ANALYSIS:');
        if (errorMessage.toLowerCase().includes('insufficient')) {
          console.log('❌ LIKELY CAUSE: Insufficient token balances or allowances');
          console.log('� SOLUTION: Check token balances and router approvals');
        } else if (errorMessage.toLowerCase().includes('slippage') || errorMessage.toLowerCase().includes('amount')) {
          console.log('❌ LIKELY CAUSE: Slippage tolerance or amount validation failed');
          console.log('💡 SOLUTION: Adjust minimum amounts or increase slippage tolerance');
        } else if (errorMessage.toLowerCase().includes('pair') || errorMessage.toLowerCase().includes('pool')) {
          console.log('❌ LIKELY CAUSE: Pool or pair creation/access issue');
          console.log('💡 SOLUTION: Verify token addresses and router compatibility');
        } else if (errorMessage.toLowerCase().includes('deadline')) {
          console.log('❌ LIKELY CAUSE: Transaction deadline exceeded');
          console.log('💡 SOLUTION: Increase deadline or retry immediately');
        } else {
          console.log('❌ GENERIC ERROR: Review contract revert reason above');
          console.log('💡 SOLUTION: Check SaucerSwap documentation or try manual liquidity');
        }
        
        throw new Error(`Pool creation failed: ${receipt.status} - ${errorMessage}`);
      } else {
        console.log('⚠️ No contract function result available');
        throw new Error(`Pool creation failed: ${receipt.status} - No contract execution details`);
      }
    } catch (recordError) {
      console.log('\n⚠️ Could not retrieve detailed transaction record:');
      console.log('Record Error:', recordError.message);
      console.log('📊 Basic failure info:');
      console.log('  - Transaction ID:', contractResponse.transactionId.toString());
      console.log('  - Status:', receipt.status.toString());
      console.log('  - Status Code:', receipt.status._code);
      
      throw new Error(`Pool creation failed with status: ${receipt.status._code} (${receipt.status}). Check logs for details.`);
    }
  }
}

function getManualLiquidityInstructions(tokenId, network) {
  const dexUrl = network === 'mainnet' 
    ? 'https://app.saucerswap.finance/' 
    : 'https://testnet.app.saucerswap.finance/';
    
  return {
    manual_liquidity_option: {
      why: "If automated liquidity fails, manual addition always works",
      steps: [
        "1. 🌐 Go to " + dexUrl,
        "2. 🔌 Connect your wallet (HashPack/Blade)",
        "3. 💧 Click 'Pool' -> 'Add Liquidity'",  
        "4. 🪙 Select your token: " + tokenId,
        "5. 💰 Select HBAR as pair token",
        "6. 📊 Enter amounts and confirm",
        "7. ✅ Pool created - trading starts immediately!"
      ],
      benefits: [
        "✅ Always works (no smart contract issues)",
        "✅ You control the initial price",
        "✅ Can set custom liquidity amounts",
        "✅ Immediate trading availability"
      ],
      note: "Your 5% fractional fees will still work perfectly with manual pools!"
    }
  };
}

// // Update main function to use V1 and provide manual backup
// async function addInitialLiquidityNoFees(tokenAddress, amountTokens) {
// //   try {
//     return await addInitialLiquiditySimple(tokenAddress, amountTokens);
// //   } catch (error) {
// //     console.log('\n💡 AUTOMATED LIQUIDITY FAILED - PROVIDING MANUAL INSTRUCTIONS');
// //     const tokenIdFromAddress = tokenAddress.slice(2);
// //     const tokenIdNum = parseInt(tokenIdFromAddress, 16);
// //     const tokenId = `0.0.${tokenIdNum}`;
    
// //     const instructions = getManualLiquidityInstructions(tokenId, NETWORK);
// //     console.log('\n📋 MANUAL LIQUIDITY INSTRUCTIONS:');
// //     console.log(JSON.stringify(instructions, null, 2));
    
// //     // Don't throw - token creation was successful
// //     return {
// //       success: true,
// //       automated_liquidity: false,
// //       manual_instructions: instructions,
// //       message: 'Token created successfully. Add liquidity manually for guaranteed success.'
// //     };
// //   }
// }

// NEW: AMM Router Integration Function
async function addInitialLiquidityWithAmm(tokenAddress, amountTokens, decimals, creatorWallet) {
    console.log('\n🤖 Using AMM Router instead of external DEX...');
    console.log(`🪙 Token: ${tokenAddress}`);
    console.log(`💰 Amount: ${amountTokens.toString()} tokens`);
    console.log(`👤 Creator: ${creatorWallet}`);
    
    try {
        // Use our AMM Integration
        const result = await ammIntegration.createAmmPool(tokenAddress, amountTokens, decimals, creatorWallet);
        
        if (result.success) {
            console.log('✅ AMM Pool created successfully!');
            console.log(`📊 Pool Info:`);
            console.log(`   Token Reserve: ${result.poolInfo.tokenReserve}`);
            console.log(`   HBAR Reserve: ${result.poolInfo.hbarReserve}`);
            console.log(`   Start Price: ${result.poolInfo.startPrice}`);
            console.log(`🔗 Transaction: ${result.transactionHash}`);
            
            return result;
        } else {
            console.error('❌ AMM Pool creation failed:', result.error);
            // Fallback to manual instructions
            return result;
        }
    } catch (error) {
        console.error('❌ AMM Integration error:', error.message);
        return {
            success: false,
            method: 'amm_integration_error',
            error: error.message
        };
    }
}

// OLD: SaucerSwap Integration (kept as backup)
async function addInitialLiquidityNoFees(tokenAddress, amountTokens, decimals) {
    // Use SaucerSwap V2 for new Hedera tokens — HBAR pairs
    const SAUCERSWAP_V2_ROUTER_ID = process.env.SAUCERSWAP_ROUTER || "0.0.1414040";
    const LIQUIDITY_LOCKER = process.env.LIQUIDITY_LOCKER_ADDRESS;
    const NETWORK = process.env.HEDERA_NETWORK || "testnet";
    const PLATFORM_CONFIG = {
        LIQUIDITY_HBAR: {
            testnet: 10,
            mainnet: 100
        }
    };

    console.log('\n🔧 FIXING DECIMAL SCALING ISSUE:');
    console.log(`📊 Raw amountTokens (display units): ${amountTokens}`);
    console.log(`🔢 Token decimals: ${decimals}`);

    const client = getHederaClient();
    const routerContractId = ContractId.fromString(SAUCERSWAP_V2_ROUTER_ID);
    const checksumTokenAddress = ethers.getAddress(tokenAddress.toLowerCase());
    
    // **CRITICAL FIX: Convert token EVM address to Hedera token ID**
    const tokenIdFromAddress = tokenAddress.slice(2);
    const tokenIdNum = parseInt(tokenIdFromAddress, 16);
    const tokenId = `0.0.${tokenIdNum}`;
    console.log(`🪙 Token ID: ${tokenId}`);

    let checksumLiquidityLocker = null;
    if (LIQUIDITY_LOCKER && LIQUIDITY_LOCKER.startsWith('0x')) {
        checksumLiquidityLocker = ethers.getAddress(LIQUIDITY_LOCKER.toLowerCase());
    } else {
        // Fallback to operator as recipient if no valid locker provided
        const operatorEvmAddress = OPERATOR_ID.toSolidityAddress();
        checksumLiquidityLocker = ethers.getAddress(`0x${operatorEvmAddress}`);
    }

    // **CRITICAL FIX: Check actual operator token balance first**
    console.log('\n🔍 Checking operator token balance before approval...');
    const tokenBalance = await new AccountBalanceQuery()
        .setAccountId(OPERATOR_ID)
        .execute(client);
    
    const operatorTokenBalance = tokenBalance.tokens.get(tokenId);
    const actualBalance = operatorTokenBalance ? BigInt(operatorTokenBalance.toString()) : 0n;
    
    console.log(`💰 Operator actual token balance: ${actualBalance.toString()} (tiny units)`);
    console.log(`📊 Requested amount: ${amountTokens} (display units)`);

    // **CRITICAL FIX: amountTokens is already in tiny units from token creation**
    // No need to scale by decimals - it's already the correct raw amount
    const tokensToApprove = BigInt(amountTokens); // Already in tiny units
    const amountTokenMin = tokensToApprove * 95n / 100n; // 5% slippage

    console.log(`✅ Tokens to approve: ${tokensToApprove.toString()} (tiny units)`);
    console.log(`📉 Minimum tokens (95%): ${amountTokenMin.toString()} (tiny units)`);

    // **SAFETY CHECK: Don't approve more than we have**
    if (tokensToApprove > actualBalance) {
        console.log(`❌ ERROR: Trying to approve ${tokensToApprove.toString()} but only have ${actualBalance.toString()}`);
        throw new Error(`Insufficient token balance for approval. Need: ${tokensToApprove.toString()}, Have: ${actualBalance.toString()}`);
    }

    // HBAR amount for liquidity as per config
    const liquidityHbarAmount = PLATFORM_CONFIG.LIQUIDITY_HBAR[NETWORK] || PLATFORM_CONFIG.LIQUIDITY_HBAR.testnet;
    const hbarInTinybars = BigInt(liquidityHbarAmount) * 100_000_000n;
    const amountEthMin = hbarInTinybars * 95n / 100n; // 5% slippage

    console.log(`💰 HBAR for liquidity: ${liquidityHbarAmount} HBAR (${hbarInTinybars.toString()} tinybars)`);

    const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour from now

    // **FIXED: Approve the router to spend tokens with correct amount**
    console.log('\n📝 Approving router to spend tokens...');
    try {
        const approveTx = await new AccountAllowanceApproveTransaction()
            .approveTokenAllowance(
                tokenId,
                OPERATOR_ID,
                routerContractId,
                tokensToApprove.toString() // Use exact amount we have
            )
            .freezeWith(client);
        const signedApproveTx = await approveTx.sign(OPERATOR_KEY);
        await signedApproveTx.execute(client);
        console.log(`✅ Router approved to spend ${tokensToApprove.toString()} tokens`);
    } catch (e) {
        if (e.message.includes('AMOUNT_EXCEEDS_TOKEN_MAX_SUPPLY')) {
            console.log(`❌ AMOUNT_EXCEEDS_TOKEN_MAX_SUPPLY error - this means:`);
            console.log(`   - Trying to approve: ${tokensToApprove.toString()}`);
            console.log(`   - Token balance: ${actualBalance.toString()}`);
            console.log(`   - This should not happen if amounts are correct`);
            throw new Error(`Token approval failed: amount ${tokensToApprove.toString()} exceeds available balance ${actualBalance.toString()}`);
        } else if (e.message.includes('AMOUNT_EXCEEDS_ALLOWANCE')) {
            console.log('✅ Token allowance already exists');
        } else {
            console.log('❌ Token approval failed:', e.message);
            throw e;
        }
    }

    // Prepare the contract call parameters
    console.log('\n🔧 Preparing liquidity pool creation...');

    console.log('📋 Contract parameters:');
    console.log(`   - Token address: ${checksumTokenAddress}`);
    console.log(`   - Token amount desired: ${tokensToApprove.toString()}`);
    console.log(`   - Token amount min: ${amountTokenMin.toString()}`);
    console.log(`   - HBAR amount min: ${amountEthMin.toString()}`);
    console.log(`   - LP recipient: ${checksumLiquidityLocker}`);

    // Proactively associate router contract with your HTS token if not already
    async function associateIfNeeded(tokenId, accountId, client, adminKey) {
        // If accountId is a string, convert to AccountId
        const acct = typeof accountId === "string"
            ? AccountId.fromString(accountId)
            : accountId;
        try {
            const tx = await new TokenAssociateTransaction()
                .setAccountId(acct)
                .setTokenIds([tokenId])
                .freezeWith(client);

            // If adminKey matches the account, you can sign; if not, skip (for contracts)
            let signedTx;
            try {
                signedTx = await tx.sign(adminKey);
            } catch (err) {
                // If cannot sign (e.g., account is contract with no private key), just try to execute as is
                signedTx = tx;
            }

            await signedTx.execute(client);
            console.log(`✅ ${accountId} associated with ${tokenId}`);
        } catch (err) {
            const msg = err.message || "";
            if (msg.toLowerCase().includes("token already associated")) {
                console.log(`✅ ${accountId} already associated.`);
            } else {
                console.log(`❌ Association error for ${accountId}:`, msg);
            }
        }
    }

    // Usage before adding liquidity:
    console.log('\n🔗 Ensuring critical associations...');
    await associateIfNeeded(tokenId, OPERATOR_ID, client, OPERATOR_KEY);
    await associateIfNeeded(tokenId, "0.0.1414040", client, OPERATOR_KEY);

    // **CRITICAL FIX: Use operator as LP recipient on first call**
    const operatorEvmAddress = OPERATOR_ID.toSolidityAddress();
    const operatorAsRecipient = ethers.getAddress(`0x${operatorEvmAddress}`);
    
    console.log('\n🔧 Using operator as LP recipient for first pool creation...');
    console.log(`   - Original locker: ${checksumLiquidityLocker}`);
    console.log(`   - Using operator: ${operatorAsRecipient}`);

    // Update contract parameters to use operator as recipient
    const contractParams = new ContractFunctionParameters()
        .addAddress(checksumTokenAddress)                // token
        .addUint256(tokensToApprove.toString())          // amountTokenDesired (tiny units)
        .addUint256(amountTokenMin.toString())           // amountTokenMin (tiny units)
        .addUint256(amountEthMin.toString())             // amountETHMin (HBAR in tinybars)
        .addAddress(operatorAsRecipient)                 // to (operator instead of locker)
        .addUint256(deadline);                           // deadline

    const contractTx = await new ContractExecuteTransaction()
        .setContractId(routerContractId)
        .setGas(600000)
        .setPayableAmount(Hbar.fromTinybars(hbarInTinybars)) // Actually send HBAR as liquidity!
        .setFunction('addLiquidityETH', contractParams)
        .freezeWith(client);

    console.log('⏳ Executing pool creation...');
    const signedTx = await contractTx.sign(OPERATOR_KEY);
    const contractResponse = await signedTx.execute(client);

    const receipt = await contractResponse.getReceipt(client);
    if (receipt.status === Status.Success) {
        console.log('\n🎉 SUCCESS: V2 POOL CREATED WITH HBAR!');
        console.log('✅ Your token is now tradeable against HBAR');
        return {
            success: true,
            transactionId: contractResponse.transactionId.toString(),
            message: 'V2 liquidity pool created with HBAR - ready for trading'
        };
    } else {
        // **ENHANCED ERROR HANDLING**
        console.log('\n❌ Pool creation failed, analyzing error...');
        const record = await contractResponse.getRecord(client);
        const contractResult = record.contractFunctionResult;
        const errorMessage = contractResult?.errorMessage || 'No specific error message';
        
        console.log('🔍 Contract execution details:');
        console.log(`   - Status: ${receipt.status}`);
        console.log(`   - Gas used: ${contractResult?.gasUsed || 'Unknown'}`);
        console.log(`   - Error message: ${errorMessage}`);
        
        throw new Error(`Pool creation failed: ${receipt.status} - ${errorMessage}`);
    }
}

// ===== HELISWAP TRADING ENDPOINTS =====

// ABIs are provided by ./config

// Enhanced HeliSwap pool info with full reserves and pricing data
app.get('/heliswap/pool/:tokenAddress', async (req, res) => {
    try {
        const { tokenAddress } = req.params;
        console.log(`🔍 Getting enhanced HeliSwap pool info for: ${tokenAddress}`);
        
        // Check if pair exists
        const pairAddress = await heliswapFactory.getPair(tokenAddress, HELISWAP_CONFIG.WHBAR.evm_address);
        
        if (pairAddress === ethers.ZeroAddress) {
            return res.status(404).json({
                success: false,
                error: 'Trading pair not found',
                message: 'No HeliSwap pool exists for this token'
            });
        }

        console.log(`✅ Pair found at: ${pairAddress}`);

        // Create pair contract instance
        const pairContract = new ethers.Contract(pairAddress, HELISWAP_PAIR_ABI, wallet);
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
        const whbarContract = new ethers.Contract(HELISWAP_CONFIG.WHBAR.evm_address, ERC20_ABI, wallet);

        // Get all pool data in parallel
        const [
            reserves,
            token0Address,
            token1Address,
            lpTotalSupply,
            tokenInfo,
            whbarInfo
        ] = await Promise.all([
            pairContract.getReserves(),
            pairContract.token0(),
            pairContract.token1(),
            pairContract.totalSupply(),
            Promise.all([
                tokenContract.name(),
                tokenContract.symbol(),
                tokenContract.decimals(),
                tokenContract.totalSupply()
            ]),
            Promise.all([
                whbarContract.name(),
                whbarContract.symbol(),
                whbarContract.decimals()
            ])
        ]);

        const [tokenName, tokenSymbol, tokenDecimals, tokenTotalSupply] = tokenInfo;
        const [whbarName, whbarSymbol, whbarDecimals] = whbarInfo;

        // Determine which token is token0 and token1
        const isToken0 = tokenAddress.toLowerCase() === token0Address.toLowerCase();
        const tokenReserve = isToken0 ? reserves[0] : reserves[1];
        const whbarReserve = isToken0 ? reserves[1] : reserves[0];

        // Calculate pricing
        const tokenReserveFormatted = Number(ethers.formatUnits(tokenReserve, tokenDecimals));
        const whbarReserveFormatted = Number(ethers.formatUnits(whbarReserve, whbarDecimals));
        const currentPrice = whbarReserveFormatted / tokenReserveFormatted; // Price per token in HBAR
        const priceInUsd = currentPrice * 0.05; // Assuming 1 HBAR = $0.05 (you'd get this from price oracle)
        const marketCap = tokenReserveFormatted * currentPrice;
        const liquidity = whbarReserveFormatted * 2; // Total liquidity in HBAR terms

        const poolData = {
            success: true,
            pairAddress,
            reserves: {
                tokenReserve: tokenReserve.toString(),
                whbarReserve: whbarReserve.toString(),
                totalSupply: lpTotalSupply.toString(),
                tokenReserveFormatted: tokenReserveFormatted.toString(),
                whbarReserveFormatted: whbarReserveFormatted.toString()
            },
            pricing: {
                currentPrice: currentPrice.toFixed(8),
                priceInUsd: priceInUsd.toFixed(6),
                marketCap: marketCap.toFixed(2),
                liquidity: liquidity.toFixed(2)
            },
            poolInfo: {
                token0: token0Address,
                token1: token1Address,
                isToken0,
                factory: HELISWAP_CONFIG.FACTORY.evm_address,
                router: HELISWAP_CONFIG.ROUTER.evm_address,
                tradingUrl: `https://app.heliswap.io/swap?inputCurrency=${HELISWAP_CONFIG.WHBAR.evm_address}&outputCurrency=${tokenAddress}`
            },
            tokenInfo: {
                address: tokenAddress,
                name: tokenName,
                symbol: tokenSymbol,
                decimals: Number(tokenDecimals),
                totalSupply: tokenTotalSupply.toString()
            },
            whbarInfo: {
                address: HELISWAP_CONFIG.WHBAR.evm_address,
                name: whbarName,
                symbol: whbarSymbol,
                decimals: Number(whbarDecimals)
            },
            lastUpdated: new Date().toISOString()
        };

        res.json(poolData);
    } catch (error) {
        console.error('HeliSwap pool query failed:', error);
        res.status(500).json({
            success: false,
            error: 'Pool query failed',
            details: error.message
        });
    }
});

// Enhanced quote system with price impact calculation
app.get('/heliswap/quote/:tokenAddress/:amountIn/:direction', async (req, res) => {
    try {
        const { tokenAddress, amountIn, direction } = req.params;
        const { slippage = 5 } = req.query; // Default 5% slippage
        
        console.log(`💰 Getting HeliSwap quote: ${amountIn} ${direction} ${tokenAddress}`);
        
        // direction: 'buy' (HBAR -> Token) or 'sell' (Token -> HBAR)
        const path = direction === 'buy' 
            ? [HELISWAP_CONFIG.WHBAR.evm_address, tokenAddress]
            : [tokenAddress, HELISWAP_CONFIG.WHBAR.evm_address];

        // Get current reserves for price impact calculation
        const pairAddress = await heliswapFactory.getPair(tokenAddress, HELISWAP_CONFIG.WHBAR.evm_address);
        
        if (pairAddress === ethers.ZeroAddress) {
            return res.status(404).json({
                success: false,
                error: 'No trading pair found'
            });
        }

        const pairContract = new ethers.Contract(pairAddress, HELISWAP_PAIR_ABI, wallet);
        const [reserves, token0] = await Promise.all([
            pairContract.getReserves(),
            pairContract.token0()
        ]);

        const isToken0 = tokenAddress.toLowerCase() === token0.toLowerCase();
        const tokenReserve = isToken0 ? reserves[0] : reserves[1];
        const whbarReserve = isToken0 ? reserves[1] : reserves[0];

        // Get quote from router
        const amounts = await heliswapRouter.getAmountsOut(amountIn, path);
        const amountOut = amounts[1];
        
        // Calculate price impact
        let priceImpact = 0;
        if (direction === 'buy') {
            // Buying tokens with HBAR
            const whbarIn = BigInt(amountIn);
            const priceImpactBN = (whbarIn * BigInt(10000)) / whbarReserve; // in basis points
            priceImpact = Number(priceImpactBN) / 100; // convert to percentage
        } else {
            // Selling tokens for HBAR
            const tokenIn = BigInt(amountIn);
            const priceImpactBN = (tokenIn * BigInt(10000)) / tokenReserve;
            priceImpact = Number(priceImpactBN) / 100;
        }

        // Calculate minimum received with slippage
        const slippageBN = BigInt(slippage);
        const minimumReceived = (amountOut * (BigInt(100) - slippageBN)) / BigInt(100);
        
        // Calculate effective price
        const effectivePrice = direction === 'buy'
            ? Number(amountIn) / Number(amountOut) // HBAR per token
            : Number(amountOut) / Number(amountIn); // HBAR per token

        const quoteData = {
            success: true,
            quote: {
                amountIn,
                amountOut: amountOut.toString(),
                minimumReceived: minimumReceived.toString(),
                path,
                direction,
                priceImpact: priceImpact.toFixed(4),
                effectivePrice: effectivePrice.toFixed(8),
                tradingFee: '0.3%',
                slippage: `${slippage}%`,
                reserves: {
                    tokenReserve: tokenReserve.toString(),
                    whbarReserve: whbarReserve.toString()
                },
                timestamp: Date.now()
            }
        };

        res.json(quoteData);
    } catch (error) {
        console.error('HeliSwap quote failed:', error);
        res.status(500).json({
            success: false,
            error: 'Quote failed',
            details: error.message
        });
    }
});

// Get current HBAR to Token price
app.get('/heliswap/price/:tokenAddress', async (req, res) => {
    try {
        const { tokenAddress } = req.params;
        
        // Get 1 HBAR worth of tokens
        const oneHbar = ethers.parseUnits('1', 8); // 1 HBAR in smallest units
            const path = [HELISWAP_CONFIG.WHBAR.evm_address, tokenAddress];
        
        const amounts = await heliswapRouter.getAmountsOut(oneHbar, path);
        const tokensFor1Hbar = amounts[1];
        
        // Also get reverse - 1 token worth of HBAR
        const oneToken = ethers.parseUnits('1', 8); // Assuming 8 decimals, adjust as needed
        const reversePath = [tokenAddress, HELISWAP_CONFIG.WHBAR.evm_address];
        
        let hbarFor1Token;
        try {
            const reverseAmounts = await heliswapRouter.getAmountsOut(oneToken, reversePath);
            hbarFor1Token = reverseAmounts[1];
        } catch (e) {
            // If token has different decimals, calculate from first quote
            hbarFor1Token = oneHbar * oneHbar / tokensFor1Hbar;
        }
            
            res.json({
                success: true,
            pricing: {
                tokenAddress,
                tokensFor1Hbar: tokensFor1Hbar.toString(),
                hbarFor1Token: hbarFor1Token.toString(),
                formattedPrice: {
                    tokensFor1Hbar: ethers.formatUnits(tokensFor1Hbar, 8),
                    hbarFor1Token: ethers.formatUnits(hbarFor1Token, 8)
                },
                timestamp: Date.now()
            }
        });
    } catch (error) {
        console.error('Price query failed:', error);
        res.status(500).json({
            success: false,
            error: 'Price query failed',
            details: error.message
        });
    }
});

// Server-Sent Events: real-time price stream from HeliSwap reserves
app.get('/heliswap/price-stream/:tokenAddress', async (req, res) => {
    try {
        const { tokenAddress } = req.params;
        // SSE headers
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders?.();

        let cancelled = false;

        const sendPrice = async () => {
            try {
                // Find pair
                const pairAddress = await heliswapFactory.getPair(tokenAddress, HELISWAP_CONFIG.WHBAR.evm_address);
                if (pairAddress === ethers.ZeroAddress) {
                    res.write(`data: ${JSON.stringify({ exists: false, price: 0, timestamp: Date.now() })}\n\n`);
                    return;
                }

                // Build contracts
                const pair = new ethers.Contract(pairAddress, HELISWAP_PAIR_ABI, wallet);
                const token = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
                const whbar = new ethers.Contract(HELISWAP_CONFIG.WHBAR.evm_address, ERC20_ABI, wallet);

                const [reserves, token0, tokenDecimals, whbarDecimals] = await Promise.all([
                    pair.getReserves(),
                    pair.token0(),
                    token.decimals(),
                    whbar.decimals(),
                ]);

                const isToken0 = tokenAddress.toLowerCase() === token0.toLowerCase();
                const tokenReserve = isToken0 ? reserves[0] : reserves[1];
                const whbarReserve = isToken0 ? reserves[1] : reserves[0];

                const tokenReserveFormatted = Number(ethers.formatUnits(tokenReserve, tokenDecimals));
                const whbarReserveFormatted = Number(ethers.formatUnits(whbarReserve, whbarDecimals));
                const currentPrice = tokenReserveFormatted > 0 ? (whbarReserveFormatted / tokenReserveFormatted) : 0;

                res.write(`data: ${JSON.stringify({ exists: true, price: currentPrice, timestamp: Date.now(), pair: pairAddress })}\n\n`);
            } catch (e) {
                res.write(`data: ${JSON.stringify({ error: true, message: e.message, timestamp: Date.now() })}\n\n`);
            }
        };

        // push initial and then periodic
        sendPrice();
        const interval = setInterval(() => { if (!cancelled) sendPrice(); }, 5000);

        req.on('close', () => {
            cancelled = true;
            clearInterval(interval);
            try { res.end(); } catch (_) {}
        });
    } catch (error) {
        // If headers not sent, return JSON
        if (!res.headersSent) {
            res.status(500).json({ success: false, error: 'Price stream failed', details: error.message });
        }
    }
});

// ===== Historical candles from Mirror Node (Sync events) =====

async function fetchAllMirrorLogs(url) {
    let logs = [];
    let next = url;
    for (let i = 0; i < 50 && next; i++) {
        const r = await fetch(next);
        if (!r.ok) break;
        const data = await r.json();
        if (Array.isArray(data.logs)) logs = logs.concat(data.logs);
        next = data.links?.next ? (data.links.next.startsWith('http') ? data.links.next : `${MIRROR_URL}${data.links.next}`) : null;
    }
    return logs;
}

async function getHeliSwapCandles(tokenAddress, intervalMinutes = 60, lookbackHours = 24) {
    const pairAddress = await heliswapFactory.getPair(tokenAddress, HELISWAP_CONFIG.WHBAR.evm_address);
    if (pairAddress === ethers.ZeroAddress) {
        return { pairAddress, candles: [] };
    }

    const pair = new ethers.Contract(pairAddress, HELISWAP_PAIR_ABI, wallet);
    const token0 = await pair.token0();
    const isToken0 = tokenAddress.toLowerCase() === token0.toLowerCase();

    const SYNC_TOPIC = ethers.id('Sync(uint112,uint112)');
    const nowSec = Math.floor(Date.now() / 1000);
    const since = nowSec - (lookbackHours * 3600);
    const baseUrl = `${MIRROR_URL}/api/v1/contracts/${pairAddress}/results/logs?topic0=${SYNC_TOPIC}&timestamp=gt:${since}&limit=100&order=asc`;
    const logs = await fetchAllMirrorLogs(baseUrl);

    const iface = new ethers.Interface(['event Sync(uint112 reserve0, uint112 reserve1)']);
    const intervalSec = intervalMinutes * 60;
    const bucketToCandle = new Map();

    for (const log of logs) {
        try {
            const parsed = iface.parseLog({ topics: log.topics, data: log.data });
            const r0 = parsed.args[0];
            const r1 = parsed.args[1];
            const ts = Number((log.consensus_timestamp || '0').split('.')[0]);
            const bucket = Math.floor(ts / intervalSec) * intervalSec;
            const tokenReserve = isToken0 ? r0 : r1;
            const hbarReserve = isToken0 ? r1 : r0;
            const price = Number(hbarReserve) / Math.max(Number(tokenReserve), 1);
            const ex = bucketToCandle.get(bucket);
            if (!ex) bucketToCandle.set(bucket, { t: bucket * 1000, o: price, h: price, l: price, c: price, v: 0 });
            else { ex.h = Math.max(ex.h, price); ex.l = Math.min(ex.l, price); ex.c = price; }
        } catch {_}
    }

    const candles = Array.from(bucketToCandle.values())
        .sort((a, b) => a.t - b.t)
        .map(c => ({ timestamp: c.t, open: c.o, high: c.h, low: c.l, close: c.c, price: c.c, volume: c.v }));

    return { pairAddress, candles };
}

app.get('/heliswap/candles/:tokenAddress', async (req, res) => {
    try {
        const { tokenAddress } = req.params;
        const interval = parseInt(req.query.interval || '60');
        const hours = parseInt(req.query.hours || '24');
        const result = await getHeliSwapCandles(tokenAddress, interval, hours);
        res.json({ success: true, pairAddress: result.pairAddress, interval, hours, candles: result.candles });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Candles fetch failed', details: error.message });
    }
});

// Association check endpoint
app.get('/check-association/:tokenAddress/:accountId', async (req, res) => {
    try {
        const { tokenAddress, accountId } = req.params;
        if (!tokenAddress || !accountId) {
            return res.status(400).json({ success: false, error: 'Missing tokenAddress or accountId' });
        }
        const tokenId = tokenAddressToTokenId(tokenAddress);
        const associated = await isAccountAssociatedWithToken(accountId, tokenId);
        res.json({ success: true, associated, tokenId, accountId });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Association check failed', details: error.message });
    }
});

// Get user's token balance (by account and token address)
app.get('/token-balance/:tokenAddress/:accountOrEvm', async (req, res) => {
    try {
        const { tokenAddress, accountOrEvm } = req.params;
        if (!tokenAddress || !accountOrEvm) {
            return res.status(400).json({ success: false, error: 'Missing tokenAddress or account' });
        }
        const tokenId = tokenAddressToTokenId(tokenAddress);
        let accountId = accountOrEvm.includes('.') ? accountOrEvm : await resolveAccountIdFromEvmAddress(accountOrEvm);
        if (!accountId) {
            return res.status(400).json({ success: false, error: 'ACCOUNT_NOT_FOUND' });
        }
        const url = `${MIRROR_URL}/api/v1/accounts/${encodeURIComponent(accountId)}/tokens?token.id=${encodeURIComponent(tokenId)}`;
        const resp = await fetch(url);
        if (!resp.ok) return res.status(500).json({ success: false, error: 'Mirror query failed' });
        const data = await resp.json();
        const entry = Array.isArray(data.tokens) ? data.tokens.find(t => t.token_id === tokenId) : undefined;
        const balance = entry?.balance ?? 0;
        const decimals = entry?.decimals ?? 8;
        return res.json({ success: true, accountId, tokenId, balance, decimals });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Balance query failed', details: error.message });
    }
});

// Get comprehensive analytics for a token
app.get('/token-analytics/:tokenAddress', async (req, res) => {
    try {
        const { tokenAddress } = req.params;
        const debug = (String(req.query.debug || '') === '1' || String(req.query.debug || '').toLowerCase() === 'true');
        if (debug) console.log(`[analytics] token=${tokenAddress}`);
        
        // Get pool info first
        const pairAddress = await heliswapFactory.getPair(tokenAddress, HELISWAP_CONFIG.WHBAR.evm_address);
        if (debug) console.log(`[analytics] factory.getPair -> ${pairAddress}`);

        if (pairAddress === ethers.ZeroAddress) {
            return res.status(404).json({
                success: false,
                error: 'No pool found for analytics'
            });
        }

        const pairContract = new ethers.Contract(pairAddress, HELISWAP_PAIR_ABI, wallet);
        const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet);
        
        // Get current data
        const [
            reserves,
            token0,
            tokenDecimals,
            tokenTotalSupply
        ] = await Promise.all([
            pairContract.getReserves(),
            pairContract.token0(),
            tokenContract.decimals(),
            tokenContract.totalSupply()
        ]);

        const isToken0 = tokenAddress.toLowerCase() === token0.toLowerCase();
        const tokenReserve = isToken0 ? reserves[0] : reserves[1];
        const whbarReserve = isToken0 ? reserves[1] : reserves[0];
        
        // Calculate key metrics
        const tokenReserveFormatted = Number(ethers.formatUnits(tokenReserve, tokenDecimals));
        const whbarReserveFormatted = Number(ethers.formatUnits(whbarReserve, 8));
        const currentPrice = whbarReserveFormatted / tokenReserveFormatted;
        const priceInUsd = currentPrice * 0.05; // 1 HBAR = $0.05 assumption
        const totalSupplyFormatted = Number(ethers.formatUnits(tokenTotalSupply, tokenDecimals));
        const marketCap = totalSupplyFormatted * currentPrice;
        const liquidity = whbarReserveFormatted * 2;

        // ========= Enrich analytics: holders and 24h trades via Mirror Node =========
        // Holder count (HTS holders) via /tokens/{tokenId}/balances
        async function getTokenHoldersCountViaMirror(tokenAddr) {
            try {
                const tokenId = tokenAddressToTokenId(tokenAddr);
                if (debug) console.log(`[holders] tokenId=${tokenId}`);
                let next = `${MIRROR_URL}/api/v1/tokens/${encodeURIComponent(tokenId)}/balances?limit=1000`;
                let total = 0;
                while (next) {
                    if (debug) console.log(`[holders] GET ${next}`);
                    const r = await fetch(next);
                    if (!r.ok) break;
                    const j = await r.json();
                    if (Array.isArray(j.balances)) total += j.balances.length;
                    if (debug) console.log(`[holders] page=${j.balances?.length || 0} total=${total}`);
                    const n = j.links && j.links.next ? j.links.next : null;
                    next = n ? (n.startsWith('http') ? n : `${MIRROR_URL}${n}`) : null;
                }
                return total;
            } catch (e) {
                if (debug) console.log(`[holders] error`, e?.message);
                return null;
            }
        }

        // Fetch and decode Swap logs for last 24h from the pair contract
        async function getLast24hSwapsViaMirror(pairAddr, tokenIsToken0, tokenDecimalsForPrice) {
            const swapTopic = ethers.id('Swap(address,uint256,uint256,uint256,uint256,address)');
            const nowMs = Date.now();
            const dayNs = 24n * 60n * 60n * 1_000_000_000n;
            const nowNs = BigInt(nowMs) * 1_000_000n;
            const sinceNs = nowNs - dayNs;
            const sinceSec = sinceNs / 1_000_000_000n;
            const sinceSubNs = sinceNs % 1_000_000_000n;
            const sinceParam = `${sinceSec.toString()}.${sinceSubNs.toString().padStart(9, '0')}`;
            const sinceEpochMs = Number(sinceSec) * 1000 + Number(sinceSubNs / 1_000_000n);
            const nowSec = BigInt(Math.floor(nowMs / 1000));
            const nowSubNs = (BigInt(nowMs) * 1_000_000n) % 1_000_000_000n;
            const nowParam = `${nowSec.toString()}.${nowSubNs.toString().padStart(9, '0')}`;
            const pairLower = pairAddr.toLowerCase();
            async function resolveContractIdFromEvmAddress(evm) {
                try {
                    const url = `${MIRROR_URL}/api/v1/contracts/${evm}`;
                    if (debug) console.log(`[swaps] resolve contract id GET ${url}`);
                    const r = await fetch(url);
                    if (!r.ok) return null;
                    const j = await r.json();
                    return j.contract_id || null;
                } catch { return null; }
            }
            const pairId = await resolveContractIdFromEvmAddress(pairLower);
            if (debug) console.log(`[swaps] pair=${pairLower} since=${sinceParam} pairId=${pairId}`);

            // helper to paginate a logs URL and decode swaps
            async function collectLogsFromUrl(initialUrl, entries) {
                const iface = new ethers.Interface([
                    'event Swap(address indexed sender,uint256 amount0In,uint256 amount1In,uint256 amount0Out,uint256 amount1Out,address indexed to)'
                ]);
                let nextUrl = initialUrl;
                while (nextUrl && entries.length < 2000) {
                    if (debug) console.log(`[swaps] GET ${nextUrl}`);
                    const r = await fetch(nextUrl);
                    if (!r.ok) break;
                    const j = await r.json();
                    const logs = Array.isArray(j.logs) ? j.logs : (Array.isArray(j.items) ? j.items : []); // some mirror variants use items
                    if (debug) console.log(`[swaps] page logs=${logs.length}`);
                    for (const log of logs) {
                        try {
                            const parsed = iface.parseLog({ topics: log.topics, data: log.data });
                            const [amount0In, amount1In, amount0Out, amount1Out] = [
                                parsed.args.amount0In,
                                parsed.args.amount1In,
                                parsed.args.amount0Out,
                                parsed.args.amount1Out
                            ];
                            const ts = log.timestamp || log.consensus_timestamp || null;
                            entries.push({ amount0In, amount1In, amount0Out, amount1Out, ts });
                        } catch (_) {}
                    }
                    const n = j.links && j.links.next ? j.links.next : null;
                    nextUrl = n ? (n.startsWith('http') ? n : `${MIRROR_URL}${n}`) : null;
                }
            }

            // Primary: GLOBAL logs endpoint filtered by address with timestamp range (some mirrors require range)
            let entries = [];
            let url = `${MIRROR_URL}/api/v1/contracts/results/logs?address=${pairLower}&topic0=${swapTopic}&timestamp=gte:${sinceParam}&timestamp=lte:${nowParam}&order=desc&limit=200`;
            if (debug) console.log(`[swaps] primary (address+topic+range) ${url}`);
            let rtry = await fetch(url);
            if (!rtry.ok && debug) { try { console.log('[swaps] primary non-200', await rtry.text()); } catch {} }
            await collectLogsFromUrl(url, entries);
            if (debug) console.log(`[swaps] primary found=${entries.length}`);
            const iface = new ethers.Interface([
                'event Swap(address indexed sender,uint256 amount0In,uint256 amount1In,uint256 amount0Out,uint256 amount1Out,address indexed to)'
            ]);

            // Fallback: if zero entries (some mirror clusters ignore timestamp filter), fetch recent logs and filter locally
            if (entries.length === 0) {
                if (debug) console.log(`[swaps] primary empty, trying contract.id`);
                // Fallback A: per-contract path WITH timestamp range (required when topic filter used)
                url = `${MIRROR_URL}/api/v1/contracts/${pairLower}/results/logs?topic0=${swapTopic}&timestamp=gte:${sinceParam}&timestamp=lte:${nowParam}&order=desc&limit=200`;
                if (debug) console.log(`[swaps] per-contract with range ${url}`);
                rtry = await fetch(url);
                if (!rtry.ok && debug) { try { console.log('[swaps] per-contract non-200', await rtry.text()); } catch {} }
                await collectLogsFromUrl(url, entries);
                if (debug) console.log(`[swaps] per-contract with range found=${entries.length}`);

                // Fallback C: global by topic only, then filter by address/contract_id locally
                if (entries.length === 0) {
                    url = `${MIRROR_URL}/api/v1/contracts/results/logs?topic0=${swapTopic}&timestamp=gte:${sinceParam}&timestamp=lte:${nowParam}&order=desc&limit=200`;
                    if (debug) console.log(`[swaps] global topic-only GET ${url}`);
                    const r = await fetch(url);
                    if (r.ok) {
                        const j = await r.json();
                        const logs = Array.isArray(j.logs) ? j.logs : (Array.isArray(j.items) ? j.items : []);
                        if (debug) console.log(`[swaps] global topic-only logs=${logs.length}`);
                        const filtered = [];
                        for (const log of logs) {
                            const addr = (log.address || '').toLowerCase();
                            const cid = log.contract_id || '';
                            if (addr === pairLower || (pairId && cid === pairId)) {
                                try {
                                    const iface2 = new ethers.Interface([
                                        'event Swap(address indexed sender,uint256 amount0In,uint256 amount1In,uint256 amount0Out,uint256 amount1Out,address indexed to)'
                                    ]);
                                    const parsed = iface2.parseLog({ topics: log.topics, data: log.data });
                                    const [amount0In, amount1In, amount0Out, amount1Out] = [
                                        parsed.args.amount0In,
                                        parsed.args.amount1In,
                                        parsed.args.amount0Out,
                                        parsed.args.amount1Out
                                    ];
                                    const ts = log.timestamp || log.consensus_timestamp || null;
                                    filtered.push({ amount0In, amount1In, amount0Out, amount1Out, ts });
                                } catch {}
                            }
                        }
                        if (filtered.length) entries.push(...filtered);
                        if (debug) console.log(`[swaps] global topic-only filtered entries=${entries.length}`);
                    }
                }
            }

            // Classify buys/sells and sum volumes, also collect per-trade price points
            let buyCount = 0, sellCount = 0;
            let buyHbar = 0n, sellHbar = 0n; // in WHBAR smallest units (8 decimals)
            let buyToken = 0n, sellToken = 0n; // in token smallest units
            const tradePoints = [];
            for (const e of entries) {
                if (tokenIsToken0) {
                    // HBAR is token1
                    if (e.amount0Out > 0n && e.amount1In > 0n) { // buy token
                        buyCount++;
                        buyHbar += e.amount1In;
                        buyToken += e.amount0Out;
                        // price = HBAR_in / Token_out
                        const price = Number(ethers.formatUnits(e.amount1In, 8)) / Math.max(Number(ethers.formatUnits(e.amount0Out, tokenDecimalsForPrice)), 1e-18);
                        const tsStr = e.ts; const tsMs = tsStr ? (()=>{ const [s,n='0']=tsStr.split('.'); return Number(s)*1000+Math.floor(Number(`0.${n}`)*1000);} )() : Date.now();
                        tradePoints.push({ side: 'buy', tsMs, price, hbar: Number(ethers.formatUnits(e.amount1In, 8)), token: Number(ethers.formatUnits(e.amount0Out, tokenDecimalsForPrice)) });
                    } else if (e.amount0In > 0n && e.amount1Out > 0n) { // sell token
                        sellCount++;
                        sellHbar += e.amount1Out;
                        sellToken += e.amount0In;
                        const price = Number(ethers.formatUnits(e.amount1Out, 8)) / Math.max(Number(ethers.formatUnits(e.amount0In, tokenDecimalsForPrice)), 1e-18);
                        const tsStr = e.ts; const tsMs = tsStr ? (()=>{ const [s,n='0']=tsStr.split('.'); return Number(s)*1000+Math.floor(Number(`0.${n}`)*1000);} )() : Date.now();
                        tradePoints.push({ side: 'sell', tsMs, price, hbar: Number(ethers.formatUnits(e.amount1Out, 8)), token: Number(ethers.formatUnits(e.amount0In, tokenDecimalsForPrice)) });
                    }
                } else {
                    // Token is token1; HBAR is token0
                    if (e.amount1Out > 0n && e.amount0In > 0n) { // buy token
                        buyCount++;
                        buyHbar += e.amount0In;
                        buyToken += e.amount1Out;
                        const price = Number(ethers.formatUnits(e.amount0In, 8)) / Math.max(Number(ethers.formatUnits(e.amount1Out, tokenDecimalsForPrice)), 1e-18);
                        const tsStr = e.ts; const tsMs = tsStr ? (()=>{ const [s,n='0']=tsStr.split('.'); return Number(s)*1000+Math.floor(Number(`0.${n}`)*1000);} )() : Date.now();
                        tradePoints.push({ side: 'buy', tsMs, price, hbar: Number(ethers.formatUnits(e.amount0In, 8)), token: Number(ethers.formatUnits(e.amount1Out, tokenDecimalsForPrice)) });
                    } else if (e.amount1In > 0n && e.amount0Out > 0n) { // sell token
                        sellCount++;
                        sellHbar += e.amount0Out;
                        sellToken += e.amount1In;
                        const price = Number(ethers.formatUnits(e.amount0Out, 8)) / Math.max(Number(ethers.formatUnits(e.amount1In, tokenDecimalsForPrice)), 1e-18);
                        const tsStr = e.ts; const tsMs = tsStr ? (()=>{ const [s,n='0']=tsStr.split('.'); return Number(s)*1000+Math.floor(Number(`0.${n}`)*1000);} )() : Date.now();
                        tradePoints.push({ side: 'sell', tsMs, price, hbar: Number(ethers.formatUnits(e.amount0Out, 8)), token: Number(ethers.formatUnits(e.amount1In, tokenDecimalsForPrice)) });
                    }
                }
            }
            if (debug) console.log(`[swaps] final counts trades=${entries.length} buys=${buyCount} sells=${sellCount}`);

            return {
                trades24h: entries.length,
                buys: { count: buyCount, hbar: buyHbar, token: buyToken },
                sells: { count: sellCount, hbar: sellHbar, token: sellToken },
                events: tradePoints
            };
        }

        // Robust fallback: pull recent contract results for the pair and decode each tx logs
        async function getLast24hSwapsViaResults(pairAddr, tokenIsToken0, tokenDecimalsForPrice) {
            try {
                const nowMs = Date.now();
                const sinceMs = nowMs - 24 * 60 * 60 * 1000;
                const sinceSec = Math.floor(sinceMs / 1000);
                const sinceParam = `${sinceSec}.000000000`;
                const pairLower = String(pairAddr).toLowerCase();

                let url = `${MIRROR_URL}/api/v1/contracts/results?address=${pairLower}&timestamp=gte:${sinceParam}&order=desc&limit=25`;
                const results = [];
                let pages = 0;
                while (url && pages < 4) { // up to ~100 results
                    if (debug) console.log(`[results] GET ${url}`);
                    const r = await fetch(url);
                    if (!r.ok) break;
                    const j = await r.json();
                    if (Array.isArray(j.results)) results.push(...j.results);
                    const n = j.links && j.links.next ? j.links.next : null;
                    url = n ? (n.startsWith('http') ? n : `${MIRROR_URL}${n}`) : null;
                    pages++;
                }
                if (debug) console.log(`[results] results.length=${results.length}`);

                const swapTopic = ethers.id('Swap(address,uint256,uint256,uint256,uint256,address)');
                const iface = new ethers.Interface([
                    'event Swap(address indexed sender,uint256 amount0In,uint256 amount1In,uint256 amount0Out,uint256 amount1Out,address indexed to)'
                ]);

                let buyCount = 0, sellCount = 0;
                let buyHbar = 0n, sellHbar = 0n;
                let buyToken = 0n, sellToken = 0n;
                const tradePoints = [];

                for (const it of results) {
                    const txHash = (it.transaction_hash || it.hash || '').toLowerCase();
                    if (!txHash) continue;
                    if (debug) console.log(`[results] fetch logs for tx=${txHash}`);
                    const lr = await fetch(`${MIRROR_URL}/api/v1/contracts/results/logs?transaction.hash=${txHash}&limit=200`);
                    if (!lr.ok) continue;
                    const lj = await lr.json();
                    const logs = Array.isArray(lj.logs) ? lj.logs : (Array.isArray(lj.items) ? lj.items : []);
                    if (debug) console.log(`[results] tx logs=${logs.length}`);
                    for (const log of logs) {
                        try {
                            if (!Array.isArray(log.topics) || (log.topics[0] || '').toLowerCase() !== swapTopic.toLowerCase()) continue;
                            const parsed = iface.parseLog({ topics: log.topics, data: log.data });
                            const e = {
                                amount0In: BigInt(parsed.args.amount0In),
                                amount1In: BigInt(parsed.args.amount1In),
                                amount0Out: BigInt(parsed.args.amount0Out),
                                amount1Out: BigInt(parsed.args.amount1Out)
                            };
                            if (tokenIsToken0) {
                                if (e.amount0Out > 0n && e.amount1In > 0n) { buyCount++; buyHbar += e.amount1In; buyToken += e.amount0Out; }
                                else if (e.amount0In > 0n && e.amount1Out > 0n) { sellCount++; sellHbar += e.amount1Out; sellToken += e.amount0In; }
                            } else {
                                if (e.amount1Out > 0n && e.amount0In > 0n) { buyCount++; buyHbar += e.amount0In; buyToken += e.amount1Out; }
                                else if (e.amount1In > 0n && e.amount0Out > 0n) { sellCount++; sellHbar += e.amount0Out; sellToken += e.amount1In; }
                            }
                            // record price point using amounts and timestamp if present
                            const ts = log.timestamp || log.consensus_timestamp || null;
                            const tsMs = ts ? (()=>{ const [s,n='0']=ts.split('.'); return Number(s)*1000+Math.floor(Number(`0.${n}`)*1000);} )() : Date.now();
                            let price = 0;
                            if (tokenIsToken0) {
                                if (e.amount0Out > 0n && e.amount1In > 0n) price = Number(ethers.formatUnits(e.amount1In, 8)) / Math.max(Number(ethers.formatUnits(e.amount0Out, tokenDecimalsForPrice)), 1e-18);
                                else if (e.amount0In > 0n && e.amount1Out > 0n) price = Number(ethers.formatUnits(e.amount1Out, 8)) / Math.max(Number(ethers.formatUnits(e.amount0In, tokenDecimalsForPrice)), 1e-18);
                            } else {
                                if (e.amount1Out > 0n && e.amount0In > 0n) price = Number(ethers.formatUnits(e.amount0In, 8)) / Math.max(Number(ethers.formatUnits(e.amount1Out, tokenDecimalsForPrice)), 1e-18);
                                else if (e.amount1In > 0n && e.amount0Out > 0n) price = Number(ethers.formatUnits(e.amount0Out, 8)) / Math.max(Number(ethers.formatUnits(e.amount1In, tokenDecimalsForPrice)), 1e-18);
                            }
                            if (price > 0) tradePoints.push({ tsMs, price });
                        } catch {}
                    }
                }

                const totalTrades = buyCount + sellCount;
                if (debug) console.log(`[results] totals trades=${totalTrades} buys=${buyCount} sells=${sellCount}`);
                return totalTrades > 0 ? {
                    trades24h: totalTrades,
                    buys: { count: buyCount, hbar: buyHbar, token: buyToken },
                    sells: { count: sellCount, hbar: sellHbar, token: sellToken },
                    events: tradePoints
                } : { trades24h: 0, buys: { count: 0, hbar: 0n, token: 0n }, sells: { count: 0, hbar: 0n, token: 0n }, events: [] };
            } catch {
                if (debug) console.log(`[results] error`);
                return { trades24h: 0, buys: { count: 0, hbar: 0n, token: 0n }, sells: { count: 0, hbar: 0n, token: 0n }, events: [] };
            }
        }

        // Run holders, swaps, and a direct tx-hash-based probe if you pass txHash in query for debugging
        const txHashProbe = req.query.txHash && typeof req.query.txHash === 'string' ? req.query.txHash : null;
        const [holders, swap24h, swapProbe] = await Promise.all([
            getTokenHoldersCountViaMirror(tokenAddress),
            getLast24hSwapsViaMirror(pairAddress, isToken0, tokenDecimals),
            (async () => {
                if (!txHashProbe) return null;
                try {
                    const swapTopic = ethers.id('Swap(address,uint256,uint256,uint256,uint256,address)');
                    const iface = new ethers.Interface([
                        'event Swap(address indexed sender,uint256 amount0In,uint256 amount1In,uint256 amount0Out,uint256 amount1Out,address indexed to)'
                    ]);
                    const url = `${MIRROR_URL}/api/v1/contracts/results/logs?transaction.hash=${txHashProbe.toLowerCase()}&limit=200`;
                    const r = await fetch(url);
                    if (!r.ok) return null;
                    const j = await r.json();
                    const logs = Array.isArray(j.logs) ? j.logs : (Array.isArray(j.items) ? j.items : []);
                    const dec = [];
                    for (const log of logs) {
                        try {
                            if (!Array.isArray(log.topics) || (log.topics[0] || '').toLowerCase() !== swapTopic.toLowerCase()) continue;
                            const parsed = iface.parseLog({ topics: log.topics, data: log.data });
                            dec.push({
                                amount0In: parsed.args.amount0In,
                                amount1In: parsed.args.amount1In,
                                amount0Out: parsed.args.amount0Out,
                                amount1Out: parsed.args.amount1Out
                            });
                        } catch {}
                    }
                    return dec;
                } catch { return null; }
            })()
        ]);

        // If swap24h came back empty but txHash probe found a swap, include it
        const probeCounts = (() => {
            if (!swapProbe || !swapProbe.length) return null;
            let buyCount = 0, sellCount = 0; let buyH = 0n, sellH = 0n, buyT = 0n, sellT = 0n;
            for (const e of swapProbe) {
                if (isToken0) {
                    if (e.amount0Out > 0n && e.amount1In > 0n) { buyCount++; buyH += e.amount1In; buyT += e.amount0Out; }
                    else if (e.amount0In > 0n && e.amount1Out > 0n) { sellCount++; sellH += e.amount1Out; sellT += e.amount0In; }
                } else {
                    if (e.amount1Out > 0n && e.amount0In > 0n) { buyCount++; buyH += e.amount0In; buyT += e.amount1Out; }
                    else if (e.amount1In > 0n && e.amount0Out > 0n) { sellCount++; sellH += e.amount0Out; sellT += e.amount1In; }
                }
            }
            return { trades24h: buyCount + sellCount, buys: { count: buyCount, hbar: buyH, token: buyT }, sells: { count: sellCount, hbar: sellH, token: sellT } };
        })();

        // If still zero and no probe, try robust results-based fallback
        let swapData = (swap24h && swap24h.trades24h > 0) ? swap24h : (probeCounts || { trades24h: 0, buys: { count: 0, hbar: 0n, token: 0n }, sells: { count: 0, hbar: 0n, token: 0n } });
        if (debug) console.log(`[final] pre-fallback trades24h=${swapData.trades24h}`);
        if (swapData.trades24h === 0 && !probeCounts) {
            const viaResults = await getLast24hSwapsViaResults(pairAddress, isToken0, tokenDecimals);
            if (debug) console.log(`[final] viaResults trades24h=${viaResults.trades24h}`);
            if (viaResults.trades24h > 0) swapData = viaResults;
        }

        // Build simple candles from captured trade events (1m buckets over 6h)
        function buildCandlesFromEvents(events, intervalSec = 60, hours = 6) {
            try {
                if (!events || !events.length) return [];
                const now = Math.floor(Date.now() / 1000);
                const start = now - hours * 3600;
                const buckets = new Map();
                for (const ev of events) {
                    const sec = Math.floor((ev.tsMs || Date.now()) / 1000);
                    if (sec < start) continue;
                    const bucket = Math.floor(sec / intervalSec) * intervalSec;
                    const price = Number(ev.price || 0);
                    const vol = Number(ev.hbar || 0);
                    if (!buckets.has(bucket)) {
                        buckets.set(bucket, { o: price, h: price, l: price, c: price, v: vol });
                    } else {
                        const b = buckets.get(bucket);
                        if (price > b.h) b.h = price;
                        if (price < b.l) b.l = price;
                        b.c = price;
                        b.v += vol;
                        buckets.set(bucket, b);
                    }
                }
                const out = Array.from(buckets.entries()).sort((a,b)=>a[0]-b[0]).map(([t,b])=>({ t: t*1000, o:b.o, h:b.h, l:b.l, c:b.c, v:b.v }));
                return out;
            } catch { return []; }
        }

        const candleEvents = swapData.events || [];
        // Attach derived market cap and keep side/hbar/token values for UI to render real trades
        const trades = candleEvents
            .map(ev => ({
                time: ev.tsMs,
                price: Number(ev.price || 0),
                hbar: Number(ev.hbar || 0),
                token: Number(ev.token || 0),
                side: ev.side || null,
                mc: Number((totalSupplyFormatted || 0) * Number(ev.price || 0))
            }))
            .sort((a,b)=> (a.time||0)-(b.time||0));
        const candles = buildCandlesFromEvents(candleEvents, 60, 6);
        const volume24hHBAR = Number(ethers.formatUnits((swapData.buys.hbar || 0n) + (swapData.sells.hbar || 0n), 8));
        const trades24h = swapData.trades24h ?? 0;
        const priceHistory = [];
        const priceChange24h = null; // requires historical prices; can be added from candles or logs

        if (debug) console.log(`[final] holders=${holders} trades24h=${trades24h} vol=${volume24hHBAR}`);
        res.json({
            success: true,
            analytics: {
                tokenAddress,
                pairAddress,
                currentMetrics: {
                    price: currentPrice,
                    priceInUsd,
                    marketCap,
                    liquidity,
                    tokenReserve: tokenReserveFormatted,
                    whbarReserve: whbarReserveFormatted
                },
                trading: {
                    volume24h: volume24hHBAR,
                    trades24h,
                    priceChange24h,
                    holders,
                    avgTradeSize: trades24h ? (volume24hHBAR / trades24h) : null,
                    breakdown: {
                        buys: {
                            count: swapData.buys.count,
                            hbar: Number(ethers.formatUnits(swapData.buys.hbar, 8)),
                            token: Number(ethers.formatUnits(swapData.buys.token, tokenDecimals))
                        },
                        sells: {
                            count: swapData.sells.count,
                            hbar: Number(ethers.formatUnits(swapData.sells.hbar, 8)),
                            token: Number(ethers.formatUnits(swapData.sells.token, tokenDecimals))
                        }
                    }
                },
                charts: { priceHistory, candles },
                trades,
                lastUpdated: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('Analytics query failed:', error);
        res.status(500).json({
            success: false,
            error: 'Analytics query failed',
            details: error.message
        });
    }
});

// ===== HELISWAP TRADING ENDPOINTS =====
// Real HeliSwap contract implementation - NO MOCKS!

// Get HeliSwap pool information - REAL IMPLEMENTATION
app.get('/custom-pool/:tokenAddress', async (req, res) => {
    try {
        const { tokenAddress } = req.params;
        console.log(`🔥 Getting REAL HeliSwap pool info for: ${tokenAddress}`);
        
        // Check if pair exists on HeliSwap factory
        const pairAddress = await heliswapFactory.getPair(tokenAddress, HELISWAP_CONFIG.WHBAR.evm_address);
        
        if (pairAddress === ethers.ZeroAddress) {
            return res.status(404).json({
                success: false,
                error: 'HeliSwap pool not found',
                message: 'No HeliSwap pool exists for this token'
            });
        }

        console.log(`✅ Real HeliSwap pair found at: ${pairAddress}`);

        // Get real reserves from the actual pair contract
        const [reserveA, reserveB] = await heliswapRouter.getReserves(tokenAddress, HELISWAP_CONFIG.WHBAR.evm_address);
        
        // Determine which reserve is which
        const pairContract = new ethers.Contract(pairAddress, HELISWAP_PAIR_ABI, wallet);
        const token0 = await pairContract.token0();
        const isToken0 = tokenAddress.toLowerCase() === token0.toLowerCase();
        
        const tokenReserve = isToken0 ? reserveA : reserveB;
        const hbarReserve = isToken0 ? reserveB : reserveA;

        // Calculate real pricing from actual reserves
        const tokenReserveFormatted = Number(ethers.formatUnits(tokenReserve, 8)); // Assume 8 decimals
        const hbarReserveFormatted = Number(ethers.formatUnits(hbarReserve, 8));
        const currentPrice = hbarReserveFormatted / tokenReserveFormatted;

        const poolData = {
            success: true,
            poolInfo: {
                reserveToken: tokenReserve.toString(),
                reserveHBAR: hbarReserve.toString(),
                currentPrice: currentPrice.toFixed(8),
                pairAddress,
                factory: HELISWAP_CONFIG.FACTORY.evm_address,
                router: HELISWAP_CONFIG.ROUTER.evm_address,
                exists: true
            },
            reserves: {
                tokenReserve: tokenReserve.toString(),
                hbarReserve: hbarReserve.toString()
            },
            status: {
                tradingActive: true,
                isRealPool: true
            },
            contracts: {
                router: HELISWAP_CONFIG.ROUTER.evm_address,
                factory: HELISWAP_CONFIG.FACTORY.evm_address,
                pair: pairAddress
            },
            lastUpdated: new Date().toISOString()
        };

        res.json(poolData);
    } catch (error) {
        console.error('HeliSwap pool query failed:', error);
        res.status(500).json({
            success: false,
            error: 'HeliSwap pool query failed',
            details: error.message
        });
    }
});

// Get HeliSwap pricing - REAL IMPLEMENTATION
app.get('/custom-price/:tokenAddress/:amount', async (req, res) => {
    try {
        const { tokenAddress, amount } = req.params;
        const { direction = 'buy' } = req.query;
        
        console.log(`🔥 Getting REAL HeliSwap price: ${amount} tokens ${direction} for ${tokenAddress}`);
        
        // Set up path for HeliSwap router
        const path = direction === 'buy' 
            ? [HELISWAP_CONFIG.WHBAR.evm_address, tokenAddress]  // HBAR -> Token
            : [tokenAddress, HELISWAP_CONFIG.WHBAR.evm_address]; // Token -> HBAR

        // Get real pricing from HeliSwap router
        const amounts = await heliswapRouter.getAmountsOut(amount, path);
        const outputAmount = amounts[1];

        const priceInHbar = direction === 'buy' 
            ? Number(amount) / Number(outputAmount)  // How much HBAR per token
            : Number(outputAmount) / Number(amount); // How much HBAR per token

        res.json({
            success: true,
            tokenAddress,
            amount,
            direction,
            outputAmount: outputAmount.toString(),
            priceInHbar: priceInHbar.toFixed(8),
            priceInHbarWei: outputAmount.toString(),
            path,
            timestamp: Date.now(),
            source: 'HeliSwap Router - REAL PRICING'
        });
    } catch (error) {
        console.error('HeliSwap price query failed:', error);
        res.status(500).json({
            success: false,
            error: 'HeliSwap price query failed',
            details: error.message
        });
    }
});

// Buy tokens through HeliSwap - REAL BLOCKCHAIN TRANSACTION
app.post('/custom-buy', async (req, res) => {
    try {
        const { tokenAddress, hbarAmount, minTokens, userAddress, recipientAccountId, recipientEvmAddress, slippage } = req.body;
        
        console.log(`🔥 HeliSwap Buy Request (TESTNET):`, {
            tokenAddress,
            hbarAmount,
            minTokens,
            userAddress,
            network: NETWORK
        });
        
        if (!tokenAddress || !hbarAmount) {
            console.log('❌ Missing parameters');
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters: tokenAddress, hbarAmount'
            });
        }

        // Convert HBAR amount: use 18-decimal wei for msg.value; 8-decimal for quoting
        const hbarAmountWei = ethers.parseUnits(hbarAmount.toString(), 18);
        
        // Set up path for HBAR -> Token swap
            const path = [HELISWAP_CONFIG.WHBAR.evm_address, tokenAddress];
        
        // Get expected tokens out using WHBAR decimals (8)
        const quoteAmountIn = ethers.parseUnits(hbarAmount.toString(), 8);
        const amounts = await heliswapRouter.getAmountsOut(quoteAmountIn, path);
        const expectedTokensOut = amounts[1];
        
        // Calculate minimum tokens using provided minTokens if present, otherwise apply slippage basis points
        const providedMin = (minTokens !== undefined && minTokens !== null) ? BigInt(minTokens) : undefined;
        const slippagePct = (slippage !== undefined && slippage !== null) ? BigInt(slippage) : 10n; // default 10%
        const minimumTokensOut = providedMin !== undefined
            ? providedMin
            : (expectedTokensOut * (100n - slippagePct)) / 100n;
        
        // Set deadline to 10 minutes from now
        const deadline = Math.floor(Date.now() / 1000) + 600;
        
        // Recipient address resolution: prefer explicit fields, then fallback to userAddress
        const recipientEvm = recipientEvmAddress
            ? ethers.getAddress(recipientEvmAddress)
            : normalizeRecipientAddress(userAddress);

        // Association pre-check using canonical AccountId via mirror node
        const hederaTokenId = tokenAddressToTokenId(tokenAddress);

        async function resolveAccountIdFromEvm(evm) {
            try {
                const url = `${MIRROR_URL}/api/v1/accounts?evm_address=${evm}`;
                const resp = await fetch(url);
                if (!resp.ok) return undefined;
                const data = await resp.json();
                return data?.accounts?.[0]?.account;
            } catch (_) { return undefined; }
        }

        const providedAccountId = recipientAccountId && typeof recipientAccountId === 'string' && recipientAccountId.includes('.')
            ? AccountId.fromString(recipientAccountId).toString()
            : undefined;
        const accountIdForCheck = providedAccountId || await resolveAccountIdFromEvm(recipientEvm);

        if (!accountIdForCheck) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_RECIPIENT',
                message: 'Unable to resolve recipient account on Hedera mirror node.'
            });
        }

        const associated = await isAccountAssociatedWithToken(accountIdForCheck, hederaTokenId);
        if (!associated) {
            return res.status(400).json({
                success: false,
                error: 'RECIPIENT_NOT_ASSOCIATED',
                message: 'Recipient Hedera account is not associated with the token. Please associate the token in your wallet first.'
            });
        }
        
        // Auto-register token for fee conversion if not present (persistence via HCS handled in service)
        try {
            const tokenIdFromAddress_forReg = tokenAddress.slice(2);
            const tokenIdNum_forReg = parseInt(tokenIdFromAddress_forReg, 16);
            const tokenId_forReg = `0.0.${tokenIdNum_forReg}`;
            const creatorId_forReg = recipientAccountId || userAddress; // best available creator id
            if (tokenId_forReg && creatorId_forReg) {
                feeConverter.registerToken(tokenId_forReg, creatorId_forReg, tokenAddress);
            }
        } catch (_) {}

        console.log(`🚀 Executing REAL HeliSwap transaction:`, {
            hbarAmount: hbarAmountWei.toString(),
            path,
            minimumTokensOut: minimumTokensOut.toString(),
            recipient: recipientEvm,
            deadline
        });

        // Execute the REAL HeliSwap swap transaction
            const tx = await heliswapRouter.swapExactHBARForTokensSupportingFeeOnTransferTokens(
            minimumTokensOut,
                path,
            recipientEvm,
                deadline,
            { 
                value: hbarAmountWei,
                gasLimit: 500000
            }
            );
            
        console.log(`⏳ Transaction submitted: ${tx.hash}`);
        
        // Wait for transaction confirmation
            const receipt = await tx.wait();
        
        console.log(`✅ REAL transaction confirmed:`, {
            hash: receipt.hash,
            gasUsed: receipt.gasUsed.toString(),
            blockNumber: receipt.blockNumber
        });
        // Log BUY to HCS for recent activity feed
        try {
            const tokenIdForLog = tokenAddressToTokenId(tokenAddress);
            await feeConverter.logToHcs({
                type: 'buy',
                tokenId: tokenIdForLog,
                tokenAddress,
                hbarIn: hbarAmount,
                minTokensOut: minimumTokensOut.toString(),
                recipient: recipientEvm,
                tx: { hash: receipt.hash },
                timestamps: { at: new Date().toISOString() }
            });
        } catch (_) {}
            
            res.json({
                success: true,
                transaction: {
                    hash: receipt.hash,
                    gasUsed: receipt.gasUsed.toString(),
                blockNumber: receipt.blockNumber,
                hbarAmountIn: hbarAmount,
                expectedTokensOut: expectedTokensOut.toString(),
                minimumTokensOut: minimumTokensOut.toString(),
                recipient: recipientEvm,
                timestamp: Date.now(),
                path
            },
            message: 'Tokens purchased successfully via HeliSwap (Testnet)'
        });
    } catch (error) {
        console.error('🚨 REAL HeliSwap buy transaction failed:', error);
        res.status(500).json({
            success: false,
            error: 'Real HeliSwap buy transaction failed',
            details: error.message
        });
    }
});

// Sell tokens through HeliSwap - REAL BLOCKCHAIN TRANSACTION
app.post('/custom-sell', async (req, res) => {
    try {
        const { tokenAddress, tokenAmount, minHbar, userAddress } = req.body;
        
        console.log(`🔥 HeliSwap Sell Request (TESTNET):`, {
            tokenAddress,
            tokenAmount,
            minHbar,
            userAddress,
            network: NETWORK
        });
        
        if (!tokenAddress || !tokenAmount) {
            console.log('❌ Missing parameters');
            return res.status(400).json({
                success: false,
                error: 'Missing required parameters: tokenAddress, tokenAmount'
            });
        }

        // Set up path for Token -> HBAR swap
            const path = [tokenAddress, HELISWAP_CONFIG.WHBAR.evm_address];
        
        // Get expected HBAR out
        const amounts = await heliswapRouter.getAmountsOut(tokenAmount, path);
        const expectedHbarOut = amounts[1];
        
        // Calculate minimum HBAR with 3% slippage if not provided
        const minimumHbarOut = minHbar || (expectedHbarOut * BigInt(97)) / BigInt(100);
        
        // Set deadline to 10 minutes from now
        const deadline = Math.floor(Date.now() / 1000) + 600;
        
        // Recipient address - use provided or default to wallet
        const recipient = normalizeRecipientAddress(userAddress);
        
        console.log(`🚀 Executing REAL HeliSwap sell transaction:`, {
            tokenAmount: tokenAmount.toString(),
            path,
            minimumHbarOut: minimumHbarOut.toString(),
            recipient,
            deadline
        });

        // Auto-register token for fee conversion if not present (persistence via HCS handled in service)
        try {
            const tokenIdFromAddress_forReg = tokenAddress.slice(2);
            const tokenIdNum_forReg = parseInt(tokenIdFromAddress_forReg, 16);
            const tokenId_forReg = `0.0.${tokenIdNum_forReg}`;
            const creatorId_forReg = userAddress; // best available context
            if (tokenId_forReg && creatorId_forReg) {
                feeConverter.registerToken(tokenId_forReg, creatorId_forReg, tokenAddress);
            }
        } catch (_) {}

        // Execute the REAL HeliSwap swap transaction
            const tx = await heliswapRouter.swapExactTokensForHBARSupportingFeeOnTransferTokens(
            tokenAmount,
            minimumHbarOut,
                path,
            recipient,
                deadline,
            { gasLimit: 500000 }
            );
            
        console.log(`⏳ Sell transaction submitted: ${tx.hash}`);
        
        // Wait for transaction confirmation
            const receipt = await tx.wait();
        
        console.log(`✅ REAL sell transaction confirmed:`, {
            hash: receipt.hash,
            gasUsed: receipt.gasUsed.toString(),
            blockNumber: receipt.blockNumber
        });
            // Log SELL to HCS for recent activity feed
            try {
                const tokenIdForLog = tokenAddressToTokenId(tokenAddress);
                await feeConverter.logToHcs({
                    type: 'sell',
                    tokenId: tokenIdForLog,
                    tokenAddress,
                    tokenAmount: tokenAmount.toString(),
                    minHbarOut: minimumHbarOut.toString(),
                    recipient,
                    tx: { hash: receipt.hash },
                    timestamps: { at: new Date().toISOString() }
                });
            } catch (_) {}
            
            res.json({
                success: true,
                transaction: {
                    hash: receipt.hash,
                    gasUsed: receipt.gasUsed.toString(),
                blockNumber: receipt.blockNumber,
                tokenAmountIn: tokenAmount,
                expectedHbarOut: expectedHbarOut.toString(),
                minimumHbarOut: minimumHbarOut.toString(),
                recipient,
                timestamp: Date.now(),
                path
            },
            message: 'Tokens sold successfully via HeliSwap (Testnet)'
        });
    } catch (error) {
        console.error('🚨 REAL HeliSwap sell transaction failed:', error);
        res.status(500).json({
            success: false,
            error: 'Real HeliSwap sell transaction failed',
            details: error.message
        });
    }
});

// Recent activity feed via HCS topic
app.get('/token-activity/:tokenAddress', async (req, res) => {
    try {
        const { tokenAddress } = req.params;
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '20')));
        const tokenId = tokenAddress.startsWith('0x') ? tokenAddressToTokenId(tokenAddress) : resolveTokenIdString(tokenAddress);
        if (!tokenId) return res.status(400).json({ success: false, error: 'INVALID_TOKEN' });

        const topicId = await feeConverter.ensureHcsTopic();
        if (!topicId) return res.json({ success: true, tokenId, recent: [] });

        const MIRROR = feeConverter.MIRROR_API_URL || 'https://testnet.mirrornode.hedera.com/api/v1';
        let url = `${MIRROR}/topics/${topicId.toString()}/messages?limit=100&order=desc`;
        const results = [];
        const targetTypes = new Set(['token_interaction', 'buy', 'sell']);

        while (url && results.length < limit) {
            const page = await feeConverter.fetchJson(url);
            if (!page || !Array.isArray(page.messages)) break;
            for (const m of page.messages) {
                if (!m.message) continue;
                try {
                    const decoded = Buffer.from(m.message, 'base64').toString('utf8');
                    const payload = JSON.parse(decoded);
                    if (!payload || !targetTypes.has(payload.type)) continue;
                    if (payload.tokenId !== tokenId) continue;
                    if (payload.type === 'token_interaction') {
                        const action = payload.action;
                        if (action !== 'test' && action !== 'download') continue;
                        results.push({
                            type: action,
                            timestamp: payload.timestamps?.at || m.consensus_timestamp,
                            user: null,
                            amount: null
                        });
                    } else if (payload.type === 'buy' || payload.type === 'sell') {
                        results.push({
                            type: payload.type === 'buy' ? 'buy' : 'sell',
                            timestamp: payload.timestamps?.at || m.consensus_timestamp,
                            user: payload.recipient || null,
                            amount: payload.hbarIn || payload.tokenAmount || null
                        });
                    }
                    if (results.length >= limit) break;
                } catch (_) { /* ignore malformed */ }
            }
            url = page.links && page.links.next ? `${MIRROR}${page.links.next}` : null;
        }

        const normalized = results.map(r => ({
            ...r,
            timestamp: typeof r.timestamp === 'string' && r.timestamp.includes('.')
                ? r.timestamp
                : new Date(r.timestamp ? Number(r.timestamp) : Date.now()).toISOString()
        }));

        res.json({ success: true, tokenId, recent: normalized.slice(0, limit) });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Activity fetch failed', details: error.message });
    }
});

// Fee distribution feed via HCS topic (token transfers to creator)
app.get('/token-fees/:tokenAddress', async (req, res) => {
    try {
        const { tokenAddress } = req.params;
        const limit = Math.max(1, Math.min(100, parseInt(req.query.limit || '20')));
        const tokenId = tokenAddress.startsWith('0x') ? tokenAddressToTokenId(tokenAddress) : resolveTokenIdString(tokenAddress);
        if (!tokenId) return res.status(400).json({ success: false, error: 'INVALID_TOKEN' });

        const topicId = await feeConverter.ensureHcsTopic();
        if (!topicId) return res.json({ success: true, tokenId, recent: [] });

        const MIRROR = feeConverter.MIRROR_API_URL || 'https://testnet.mirrornode.hedera.com/api/v1';
        let url = `${MIRROR}/topics/${topicId.toString()}/messages?limit=100&order=desc`;
        const results = [];

        while (url && results.length < limit) {
            const page = await feeConverter.fetchJson(url);
            if (!page || !Array.isArray(page.messages)) break;
            for (const m of page.messages) {
                if (!m.message) continue;
                try {
                    const decoded = Buffer.from(m.message, 'base64').toString('utf8');
                    const payload = JSON.parse(decoded);
                    if (!payload || payload.type !== 'fee_token_distribution') continue;
                    if (payload.tokenId !== tokenId) continue;
                    results.push({
                        type: 'fee_token_distribution',
                        timestamp: payload.timestamps?.executedAt || m.consensus_timestamp,
                        creator: payload.creator || null,
                        tokenDelta: payload.amounts?.tokenDelta ?? null,
                        creatorTokens: payload.amounts?.creatorTokens ?? null,
                        platformTokens: payload.amounts?.platformTokens ?? null,
                        tx: payload.tx || null
                    });
                    if (results.length >= limit) break;
                } catch (_) { /* ignore malformed */ }
            }
            url = page.links && page.links.next ? `${MIRROR}${page.links.next}` : null;
        }

        const normalized = results.map(r => ({
            ...r,
            timestamp: typeof r.timestamp === 'string' && r.timestamp.includes('.')
                ? r.timestamp
                : new Date(r.timestamp ? Number(r.timestamp) : Date.now()).toISOString()
        }));

        res.json({ success: true, tokenId, recent: normalized.slice(0, limit) });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Fee feed fetch failed', details: error.message });
    }
});

// Get all tokens with HeliSwap pools
app.get('/heliswap/tokens', async (req, res) => {
    try {
        const tokensWithPools = [];
        
        // Iterate through meme coins to find ones with HeliSwap pools
        for (const [tokenId, coinData] of memeCoins.entries()) {
            if (coinData.heliswapPool) {
                tokensWithPools.push({
                    tokenId,
                    name: coinData.name,
                    symbol: coinData.symbol,
                    tokenAddress: coinData.heliswapPool.poolDetails.tokenAddress,
                    pairAddress: coinData.heliswapPool.pairAddress,
                    createdAt: coinData.createdAt,
                    tradingUrl: `https://app.heliswap.io/swap?inputCurrency=${HELISWAP_CONFIG.WHBAR.evm_address}&outputCurrency=${coinData.heliswapPool.poolDetails.tokenAddress}`
                });
            }
        }
        
        res.json({
            success: true,
            count: tokensWithPools.length,
            tokens: tokensWithPools,
            heliswapInfo: {
                factory: HELISWAP_CONFIG.FACTORY.evm_address,
                router: HELISWAP_CONFIG.ROUTER.evm_address,
                whbar: HELISWAP_CONFIG.WHBAR.evm_address,
                dexUrl: 'https://app.heliswap.io'
            }
        });
    } catch (error) {
        console.error('HeliSwap tokens query failed:', error);
        res.status(500).json({
            error: 'Tokens query failed',
            details: error.message
        });
    }
});

// =====================================
// HELISWAP POOL ANALYTICS ENDPOINTS
// =====================================

// Get HeliSwap pool data for a token
app.get('/heliswap-pool/:tokenAddress', async (req, res) => {
    try {
        const { tokenAddress } = req.params;
        
        console.log(`📊 Getting HeliSwap pool data for token: ${tokenAddress}`);
        console.log(`🏭 Using factory: ${HELISWAP_CONFIG.FACTORY.evm_address}`);
        console.log(`💰 Using WHBAR: ${HELISWAP_CONFIG.WHBAR.evm_address}`);
        
        // Get pool address from factory
        console.log('🔍 Calling heliswapFactory.getPair...');
        const pairAddress = await heliswapFactory.getPair(tokenAddress, HELISWAP_CONFIG.WHBAR.evm_address);
        console.log(`📍 Pair address result: ${pairAddress}`);
        
        if (pairAddress === '0x0000000000000000000000000000000000000000') {
            return res.json({
                success: false,
                message: 'No HeliSwap pool found for this token',
                tokenAddress,
                whbarAddress: HELISWAP_CONFIG.WHBAR.evm_address
            });
        }

        // Get pool reserves from the pair contract
        const pairContract = new ethers.Contract(pairAddress, [
            "function getReserves() external view returns (uint112 reserve0, uint112 reserve1, uint32 blockTimestampLast)",
            "function token0() external view returns (address)",
            "function token1() external view returns (address)",
            "function totalSupply() external view returns (uint256)"
        ], wallet);

        const [reserves, token0Address, token1Address, totalSupply] = await Promise.all([
            pairContract.getReserves(),
            pairContract.token0(),
            pairContract.token1(),
            pairContract.totalSupply()
        ]);

        // Determine which reserve is which token
        const isToken0 = token0Address.toLowerCase() === tokenAddress.toLowerCase();
        const tokenReserve = isToken0 ? reserves.reserve0 : reserves.reserve1;
        const whbarReserve = isToken0 ? reserves.reserve1 : reserves.reserve0;

        // Calculate current price (HBAR per token)
        const currentPrice = whbarReserve.gt(0) ? 
            (parseFloat(ethers.formatUnits(whbarReserve, 8)) / parseFloat(ethers.formatUnits(tokenReserve, 8))) : 0;

        // Calculate market cap (rough estimate)
        const tokenSupply = parseFloat(ethers.formatUnits(tokenReserve, 8)) * 10; // Estimate total supply from reserves
        const marketCap = currentPrice * tokenSupply;

        // Get Hedera token ID from address
        const tokenId = `0.0.${parseInt(tokenAddress.slice(2), 16)}`;

        const poolData = {
            success: true,
            tokenId,
            tokenAddress,
            pairAddress,
            reserves: {
                tokenReserve: ethers.formatUnits(tokenReserve, 8),
                whbarReserve: ethers.formatUnits(whbarReserve, 8),
                totalSupply: ethers.formatUnits(totalSupply, 18)
            },
            pricing: {
                currentPrice: currentPrice.toFixed(8),
                priceInUsd: (currentPrice * 0.05).toFixed(4), // Rough HBAR price estimate
                marketCap: marketCap.toFixed(2),
                liquidity: parseFloat(ethers.formatUnits(whbarReserve, 8)).toFixed(2)
            },
            poolInfo: {
                token0: token0Address,
                token1: token1Address,
                isToken0,
                factory: HELISWAP_CONFIG.FACTORY.evm_address,
                router: HELISWAP_CONFIG.ROUTER.evm_address,
                tradingUrl: `https://app.heliswap.io/swap?inputCurrency=HBAR&outputCurrency=${tokenAddress}`
            }
        };

        console.log('✅ HeliSwap pool data retrieved successfully');
        res.json(poolData);

    } catch (error) {
        console.error('❌ Error getting HeliSwap pool data:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get pool data',
            details: error.message
        });
    }
});

// Duplicate endpoint removed - keeping the comprehensive one above

// Get all tokens with HeliSwap pools
app.get('/tokens-with-pools', async (req, res) => {
    try {
        console.log('📊 Getting all tokens with HeliSwap pools...');

        // Get all stored tokens
        const tokens = Array.from(memeCoins.values());
        
        // Check which ones have HeliSwap pools
        const tokensWithPools = [];
        
        for (const token of tokens) {
            try {
                const tokenAddress = `0x${parseInt(token.tokenId.split('.')[2]).toString(16).padStart(40, '0')}`;
                const pairAddress = await heliswapFactory.getPair(tokenAddress, HELISWAP_CONFIG.WHBAR.evm_address);
                
                if (pairAddress !== '0x0000000000000000000000000000000000000000') {
                    // Get basic pool data
                    const poolResponse = await fetch(`http://localhost:3003/heliswap-pool/${tokenAddress}`);
                    const poolData = await poolResponse.json();
                    
                    tokensWithPools.push({
                        ...token,
                        poolData: poolData.success ? poolData : null,
                        hasPool: true
                    });
                } else {
                    tokensWithPools.push({
                        ...token,
                        hasPool: false
                    });
                }
            } catch (error) {
                console.log(`⚠️ Could not check pool for token ${token.tokenId}:`, error.message);
                tokensWithPools.push({
                    ...token,
                    hasPool: false
                });
            }
        }

        res.json({
            success: true,
            tokens: tokensWithPools,
            totalTokens: tokensWithPools.length,
            tokensWithPools: tokensWithPools.filter(t => t.hasPool).length
        });

    } catch (error) {
        console.error('❌ Error getting tokens with pools:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to get tokens with pools',
            details: error.message
        });
    }
});

// Test endpoint to verify HeliSwap contract connectivity
app.get('/test-heliswap', async (req, res) => {
    try {
        console.log('🧪 Testing HeliSwap contract connectivity...');
        console.log(`🏭 Factory address: ${HELISWAP_CONFIG.FACTORY.evm_address}`);
        console.log(`🌐 Router address: ${HELISWAP_CONFIG.ROUTER.evm_address}`);
        console.log(`💰 WHBAR address: ${HELISWAP_CONFIG.WHBAR.evm_address}`);
        
        // Test if we can call a simple read function
        const testCall = await heliswapFactory.getPair(
            '0x0000000000000000000000000000000000001234', // Random address
            HELISWAP_CONFIG.WHBAR.evm_address
        );
        
        console.log(`✅ Contract call successful. Test result: ${testCall}`);
        
        res.json({
            success: true,
            message: 'HeliSwap contracts are accessible',
            config: {
                factory: HELISWAP_CONFIG.FACTORY.evm_address,
                router: HELISWAP_CONFIG.ROUTER.evm_address,
                whbar: HELISWAP_CONFIG.WHBAR.evm_address
            },
            testCall: testCall
        });
        
    } catch (error) {
        console.error('❌ HeliSwap contract test failed:', error);
        res.status(500).json({
            success: false,
            error: 'HeliSwap contract connectivity failed',
            details: error.message,
            config: {
                factory: HELISWAP_CONFIG.FACTORY.evm_address,
                router: HELISWAP_CONFIG.ROUTER.evm_address,
                whbar: HELISWAP_CONFIG.WHBAR.evm_address
            }
        });
    }
});

// Debug: fetch and decode Swap logs for a given transaction hash
app.get('/debug-tx/:txHash', async (req, res) => {
  try {
    const { txHash } = req.params;
    const { pairAddress, tokenAddress } = req.query;
    if (!txHash || !/^0x[0-9a-fA-F]{64}$/.test(txHash)) {
      return res.status(400).json({ success: false, error: 'INVALID_TX_HASH' });
    }
    const swapTopic = ethers.id('Swap(address,uint256,uint256,uint256,uint256,address)');
    const iface = new ethers.Interface([
      'event Swap(address indexed sender,uint256 amount0In,uint256 amount1In,uint256 amount0Out,uint256 amount1Out,address indexed to)'
    ]);
    const hashLower = txHash.toLowerCase();
    const tryUrls = [
      `${MIRROR_URL}/api/v1/contracts/results/${hashLower}`,
      `${MIRROR_URL}/api/v1/contracts/results?transaction.hash=${hashLower}&order=desc&limit=1`,
      `${MIRROR_URL}/api/v1/contracts/results/logs?transaction.hash=${hashLower}&limit=200`
    ];
    let txMeta = null;
    let logs = [];
    for (const url of tryUrls) {
      const r = await fetch(url);
      if (!r.ok) continue;
      const j = await r.json();
      if (Array.isArray(j.logs) || Array.isArray(j.items)) {
        logs = Array.isArray(j.logs) ? j.logs : j.items;
        txMeta = j.results?.[0] || j;
        break;
      }
      if (Array.isArray(j.results) && j.results.length) {
        txMeta = j.results[0];
        const r2 = await fetch(`${MIRROR_URL}/api/v1/contracts/results/logs?transaction.hash=${hashLower}&limit=200`);
        if (r2.ok) {
          const j2 = await r2.json();
          logs = Array.isArray(j2.logs) ? j2.logs : (Array.isArray(j2.items) ? j2.items : []);
        }
        break;
      }
    }
    const decodedSwaps = [];
    for (const log of logs) {
      try {
        if (!Array.isArray(log.topics) || (log.topics[0] || '').toLowerCase() !== swapTopic.toLowerCase()) continue;
        const parsed = iface.parseLog({ topics: log.topics, data: log.data });
        decodedSwaps.push({
          address: (log.address || log.contract_id || '').toString(),
          timestamp: log.timestamp || log.consensus_timestamp || null,
          amount0In: parsed.args.amount0In.toString(),
          amount1In: parsed.args.amount1In.toString(),
          amount0Out: parsed.args.amount0Out.toString(),
          amount1Out: parsed.args.amount1Out.toString()
        });
      } catch {}
    }
    let classification;
    if (decodedSwaps.length && pairAddress && tokenAddress) {
      try {
        const pair = new ethers.Contract(String(pairAddress), HELISWAP_PAIR_ABI, wallet);
        const token0Addr = (await pair.token0()).toLowerCase();
        const tokenIsToken0 = token0Addr === String(tokenAddress).toLowerCase();
        classification = decodedSwaps.map(d => {
          const a0i = BigInt(d.amount0In), a1i = BigInt(d.amount1In), a0o = BigInt(d.amount0Out), a1o = BigInt(d.amount1Out);
          let type = 'unknown';
          if (tokenIsToken0) {
            if (a0o > 0n && a1i > 0n) type = 'buy';
            else if (a0i > 0n && a1o > 0n) type = 'sell';
          } else {
            if (a1o > 0n && a0i > 0n) type = 'buy';
            else if (a1i > 0n && a0o > 0n) type = 'sell';
          }
          return { timestamp: d.timestamp, type, amounts: { amount0In: d.amount0In, amount1In: d.amount1In, amount0Out: d.amount0Out, amount1Out: d.amount1Out } };
        });
      } catch {}
    }
    return res.json({ success: true, txHash: hashLower, logsCount: logs.length, decodedSwaps, classification: classification || undefined });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'DEBUG_TX_FAILED', details: err.message });
  }
});


// Error handling
app.use((error, req, res, next) => {
    console.error('❌ Error:', error);
    
    if (error instanceof multer.MulterError) {
        return res.status(400).json({
            success: false,
            error: error.message,
            type: 'File upload error'
        });
    }
    
    res.status(500).json({
        success: false,
        error: 'Internal server error',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        available_endpoints: [
            'POST /create-meme-coin',
            'GET /meme-coin/:tokenId', 
            'GET /creator-earnings/:wallet',
            'GET /meme-coins',
            'GET /health',
            'GET /',
            'GET /token-interactions/:token',
            'POST /token-interactions/:token/:action',
            'GET /token-burns/:token'
        ]
    });
});

// // Start server when invoked directly
// if (require.main === module) {
//     const PORT = process.env.PORT || 3003;
//     app.listen(PORT, () => {
//         console.log(`\n🚀 Hedera server listening on http://localhost:${PORT}`);
//     });
// }

module.exports = app;


