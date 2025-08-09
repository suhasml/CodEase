// const { ethers } = require('ethers');
// const {
//     Client,
//     AccountBalanceQuery,
//     TransferTransaction,
//     AccountId,
//     PrivateKey
// } = require('@hashgraph/sdk');

// class FeeConversionService {
//     constructor() {
//         this.tokens = new Map(); // tokenId -> { creator, tokenAddress }
//         this.conversionInterval = 60 * 60 * 1000; // 1 hour
//         this.isRunning = false;
        
//         // Configuration
//         this.CREATOR_SHARE = 0.6; // 60%
//         this.PLATFORM_SHARE = 0.4; // 40%
//         this.OPERATOR_ID = AccountId.fromString(process.env.OPERATOR_ID);
//         this.OPERATOR_KEY = PrivateKey.fromString(process.env.OPERATOR_KEY);
//         this.PLATFORM_WALLET = process.env.PLATFORM_WALLET_ADDRESS || this.OPERATOR_ID.toString();
        
//         // Hedera client
//         this.client = process.env.HEDERA_NETWORK === "mainnet" 
//             ? Client.forMainnet() 
//             : Client.forTestnet();
//         this.client.setOperator(this.OPERATOR_ID, this.OPERATOR_KEY);
        
//         // Ethereum setup for DEX interactions
//         this.provider = new ethers.JsonRpcProvider(process.env.HASHIO_RPC_URL);
//         this.wallet = new ethers.Wallet(process.env.OPERATOR_EVM_KEY, this.provider);
        
//         // SaucerSwap router for conversions
//         this.saucerRouter = new ethers.Contract(
//             process.env.SAUCERSWAP_ROUTER,
//             [
//                 "function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts)",
//                 "function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts)",
//                 "function WETH() external pure returns (address)"
//             ],
//             this.wallet
//         );
//     }
    
//     /**
//      * Register a token for fee conversion
//      */
//     registerToken(tokenId, creator, tokenEVMAddress) {
//         this.tokens.set(tokenId, {
//             creator,
//             tokenAddress: tokenEVMAddress,
//             lastConversion: Date.now()
//         });
        
//         console.log(`✅ Registered token ${tokenId} for fee conversion`);
//         console.log(`👤 Creator: ${creator}`);
//         console.log(`📍 EVM Address: ${tokenEVMAddress}`);
//     }
    
//     /**
//      * Start the fee conversion service
//      */
//     start() {
//         if (this.isRunning) return;
        
//         this.isRunning = true;
//         console.log('\n🔄 Starting Fee Conversion Service...');
//         console.log(`⏰ Conversion interval: ${this.conversionInterval / 1000 / 60} minutes`);
//         console.log(`💱 Will convert collected tokens → HBAR → distribute`);
        
//         // Run immediately, then on interval
//         this.runConversionCycle();
//         this.intervalId = setInterval(() => {
//             this.runConversionCycle();
//         }, this.conversionInterval);
//     }
    
//     /**
//      * Stop the service
//      */
//     stop() {
//         if (this.intervalId) {
//             clearInterval(this.intervalId);
//         }
//         this.isRunning = false;
//         console.log('⏹️ Fee Conversion Service stopped');
//     }
    
//     /**
//      * Run a complete conversion cycle for all tokens
//      */
//     async runConversionCycle() {
//         console.log('\n🔄 Running fee conversion cycle...');
//         console.log(`📊 Processing ${this.tokens.size} tokens`);
        
//         for (const [tokenId, tokenData] of this.tokens) {
//             try {
//                 await this.convertFeesForToken(tokenId, tokenData);
//                 await this.sleep(5000); // 5 second delay between tokens
//             } catch (error) {
//                 console.error(`❌ Conversion failed for token ${tokenId}:`, error.message);
//             }
//         }
        
//         console.log('✅ Fee conversion cycle completed');
//     }
    
//     /**
//      * Convert fees for a specific token
//      */
//     async convertFeesForToken(tokenId, tokenData) {
//         console.log(`\n💱 Converting fees for token: ${tokenId}`);
        
//         // 1. Check collected token balance
//         const balance = await this.getTokenBalance(tokenId);
        
//         if (balance === 0) {
//             console.log(`💰 No fees collected for ${tokenId}`);
//             return;
//         }
        
//         console.log(`💰 Collected fees: ${balance} tokens`);
        
//         // 2. Convert tokens to HBAR via SaucerSwap
//         const hbarReceived = await this.swapTokensForHBAR(
//             tokenData.tokenAddress,
//             balance
//         );
        
//         if (hbarReceived === 0) {
//             console.log(`⚠️ No HBAR received from swap for ${tokenId}`);
//             return;
//         }
        
//         console.log(`💰 Received: ${hbarReceived} HBAR from conversion`);
        
//         // 3. Distribute HBAR
//         await this.distributeHBAR(hbarReceived, tokenData.creator);
        
//         console.log(`✅ Fee conversion completed for ${tokenId}`);
//     }
    
//     /**
//      * Get token balance for the platform account
//      */
//     async getTokenBalance(tokenId) {
//         try {
//             const balanceQuery = new AccountBalanceQuery()
//                 .setAccountId(this.OPERATOR_ID);
            
//             const balance = await balanceQuery.execute(this.client);
//             const tokenBalance = balance.tokens.get(tokenId);
            
//             return tokenBalance ? parseInt(tokenBalance.toString()) : 0;
//         } catch (error) {
//             console.error(`Error getting balance for ${tokenId}:`, error.message);
//             return 0;
//         }
//     }
    
//     /**
//      * Swap collected tokens for HBAR
//      */
//     async swapTokensForHBAR(tokenAddress, amount) {
//         try {
//             console.log(`🔄 Swapping ${amount} tokens for HBAR...`);
            
//             // Approve router to spend tokens
//             const tokenContract = new ethers.Contract(
//                 tokenAddress,
//                 ["function approve(address spender, uint256 amount) external returns (bool)"],
//                 this.wallet
//             );
            
//             const approveTx = await tokenContract.approve(
//                 process.env.SAUCERSWAP_ROUTER,
//                 amount.toString()
//             );
//             await approveTx.wait();
            
//             // Get WETH address
//             const weth = await this.saucerRouter.WETH();
            
//             // Set up swap path: Token → WETH (HBAR)
//             const path = [tokenAddress, weth];
            
//             // Get expected output
//             const amountsOut = await this.saucerRouter.getAmountsOut(amount, path);
//             const expectedHBAR = amountsOut[1];
//             const minHBAR = expectedHBAR * 95n / 100n; // 5% slippage
            
//             // Execute swap
//             const deadline = Math.floor(Date.now() / 1000) + 3600; // 1 hour
            
//             const swapTx = await this.saucerRouter.swapExactTokensForETH(
//                 amount,
//                 minHBAR,
//                 path,
//                 this.wallet.address,
//                 deadline
//             );
            
//             const receipt = await swapTx.wait();
//             console.log(`✅ Swap completed: ${receipt.transactionHash}`);
            
//             return parseInt(expectedHBAR.toString());
            
//         } catch (error) {
//             console.error('Swap failed:', error.message);
//             return 0;
//         }
//     }
    
//     /**
//      * Distribute HBAR to creator and platform
//      */
//     async distributeHBAR(totalHBAR, creatorAccount) {
//         try {
//             const creatorAmount = Math.floor(totalHBAR * this.CREATOR_SHARE);
//             const platformAmount = totalHBAR - creatorAmount;
            
//             console.log(`💰 Distributing HBAR:`);
//             console.log(`👤 Creator: ${creatorAmount} HBAR (${this.CREATOR_SHARE * 100}%)`);
//             console.log(`🏢 Platform: ${platformAmount} HBAR (${this.PLATFORM_SHARE * 100}%)`);
            
//             // Create transfer transaction
//             const transferTx = new TransferTransaction()
//                 .addHbarTransfer(this.OPERATOR_ID, -totalHBAR)
//                 .addHbarTransfer(AccountId.fromString(creatorAccount), creatorAmount)
//                 .addHbarTransfer(AccountId.fromString(this.PLATFORM_WALLET), platformAmount)
//                 .freezeWith(this.client);
            
//             // Sign and execute
//             const signedTx = await transferTx.sign(this.OPERATOR_KEY);
//             const txResponse = await signedTx.execute(this.client);
//             const receipt = await txResponse.getReceipt(this.client);
            
//             console.log(`✅ HBAR distribution completed: ${txResponse.transactionId}`);
            
//         } catch (error) {
//             console.error('HBAR distribution failed:', error.message);
//         }
//     }
    
//     /**
//      * Utility function to sleep
//      */
//     sleep(ms) {
//         return new Promise(resolve => setTimeout(resolve, ms));
//     }
    
//     /**
//      * Get service status
//      */
//     getStatus() {
//         return {
//             isRunning: this.isRunning,
//             tokensRegistered: this.tokens.size,
//             conversionInterval: this.conversionInterval,
//             lastCycle: this.lastCycle || 'Not run yet'
//         };
//     }
// }

// module.exports = FeeConversionService; 

const {
    Client,
    AccountBalanceQuery,
    TransferTransaction,
    AccountId,
    PrivateKey,
    ContractExecuteTransaction,
    ContractFunctionParameters,
    AccountAllowanceApproveTransaction,
    TopicId,
    TopicMessageSubmitTransaction,
    TopicCreateTransaction,
} = require('@hashgraph/sdk');
const https = require('https');
const { getCollection } = require('./mongo');
const { HELISWAP_CONFIG, heliswapRouter, ERC20_ABI, provider, wallet } = require('../config');

class FeeConversionService {
    constructor() {
        this.tokens = new Map(); // tokenId -> { creator, tokenAddress }
        this.lastProcessedBalances = new Map(); // tokenId -> last processed token balance (smallest units)
        this.conversionInterval = 60 * 60 * 1000; // 1 hour
        this.isRunning = false;
        
        // Configuration
        this.CREATOR_SHARE = 0.6; // 60%
        this.PLATFORM_SHARE = 0.4; // 40%
        this.OPERATOR_ID = AccountId.fromString(process.env.OPERATOR_ID);
        this.OPERATOR_KEY = PrivateKey.fromString(process.env.OPERATOR_KEY);
        this.PLATFORM_WALLET = process.env.PLATFORM_WALLET_ADDRESS || this.OPERATOR_ID.toString();
        
        // Hedera client
        this.client = process.env.HEDERA_NETWORK === "mainnet" 
            ? Client.forMainnet() 
            : Client.forTestnet();
        this.client.setOperator(this.OPERATOR_ID, this.OPERATOR_KEY);
        
        // Use deployed HeliSwap Router (Hedera format)
        this.HELISWAP_ROUTER_ID = AccountId.fromString(HELISWAP_CONFIG.ROUTER.hedera_id);

        // HCS topic configuration
        this.HCS_TOPIC_ID = process.env.HCS_TOPIC_ID ? TopicId.fromString(process.env.HCS_TOPIC_ID) : null;
        this.AUTO_CREATE_HCS_TOPIC = (process.env.AUTO_CREATE_HCS_TOPIC || 'true').toLowerCase() === 'true';
        
        // Mirror node REST API (for HCS persistence replay)
        this.MIRROR_API_URL = process.env.MIRROR_API_URL || 'https://testnet.mirrornode.hedera.com/api/v1';

        // Gas settings
        this.DEFAULT_GAS = 5_000_000;
        
        console.log(`✅ FeeConversionService initialized`);
        console.log(`🎯 HeliSwap Router: ${this.HELISWAP_ROUTER_ID.toString()}`);
        if (this.HCS_TOPIC_ID) {
            console.log(`🧾 HCS Topic: ${this.HCS_TOPIC_ID.toString()}`);
        } else if (this.AUTO_CREATE_HCS_TOPIC) {
            console.log(`🧾 HCS Topic: not set → will auto-create on first log`);
        } else {
            console.log(`⚠️ HCS Topic: not set and auto-create disabled. Logs will be skipped.`);
        }
    }
    
    /**
     * Register a token for fee conversion
     */
    registerToken(tokenId, creator, tokenEVMAddress) {
        this.tokens.set(tokenId, {
            creator,
            tokenAddress: tokenEVMAddress,
            lastConversion: Date.now()
        });

        // Initialize baseline so we only process newly received tokens from now on
        this.lastProcessedBalances.set(tokenId, 0);
        
        console.log(`✅ Registered token ${tokenId} for fee conversion`);
        console.log(`👤 Creator: ${creator}`);
        console.log(`📍 EVM Address: ${tokenEVMAddress}`);

        // Persist registration to HCS for durability
        this.logToHcs({
            type: 'register_token',
            tokenId,
            tokenAddress: tokenEVMAddress,
            creator,
            timestamps: { registeredAt: new Date().toISOString() }
        });

        // Persist to MongoDB for durability
        this.persistRegistration({ tokenId, creator, tokenAddress: tokenEVMAddress }).catch(() => {});
    }
    
    /**
     * Start the fee conversion service
     */
    async start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        console.log('\n🔄 Starting Fee Conversion Service...');
        console.log(`⏰ Conversion interval: ${this.conversionInterval / 1000 / 60} minutes`);
        console.log(`💱 Will convert newly received fees → HBAR → distribute (60/40)`);
        console.log(`🎯 Router: ${this.HELISWAP_ROUTER_ID.toString()}`);
        
        // Hydrate registrations from HCS before the first run (persistence)
        await this.hydrateFromMongo();
        await this.hydrateFromHcs();

        // Run immediately, then on interval
        console.log(`⏱️ First conversion cycle starting at: ${new Date().toISOString()}`);
        this.runConversionCycle();
        const nextRun = new Date(Date.now() + this.conversionInterval).toISOString();
        console.log(`🗓️ Next conversion cycle scheduled at: ${nextRun}`);
        this.intervalId = setInterval(() => {
            console.log(`\n⏰ Interval tick: starting conversion cycle at ${new Date().toISOString()}`);
            this.runConversionCycle();
            const next = new Date(Date.now() + this.conversionInterval).toISOString();
            console.log(`🗓️ Next conversion cycle scheduled at: ${next}`);
        }, this.conversionInterval);
    }
    
    /**
     * Stop the service
     */
    stop() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
        this.isRunning = false;
        console.log('⏹️ Fee Conversion Service stopped');
    }
    
    /**
     * Run a complete conversion cycle for all tokens
     */
    async runConversionCycle() {
        console.log('\n🔄 Running fee conversion cycle...');
        this.lastCycle = new Date().toISOString();
        console.log(`📊 Processing ${this.tokens.size} tokens`);
        
        for (const [tokenId, tokenData] of this.tokens) {
            try {
                await this.convertFeesForToken(tokenId, tokenData);
                await this.sleep(5000); // 5 second delay between tokens
            } catch (error) {
                console.error(`❌ Conversion failed for token ${tokenId}:`, error.message);
            }
        }
        
        console.log('✅ Fee conversion cycle completed');
    }
    
    /**
     * Convert fees for a specific token
     */
    async convertFeesForToken(tokenId, tokenData) {
        console.log(`\n💱 Converting fees for token: ${tokenId}`);
        
        // 1. Check collected token balance and compute delta since last run
        const currentBalance = await this.getTokenBalance(tokenId);
        const lastProcessed = this.lastProcessedBalances.get(tokenId) ?? currentBalance; // baseline to current on first run
        if (!this.lastProcessedBalances.has(tokenId)) {
            this.lastProcessedBalances.set(tokenId, lastProcessed);
        }
        let delta = currentBalance - lastProcessed;
        if (delta <= 0) {
            // If external movement reduced balance, reset baseline
            if (currentBalance < lastProcessed) {
                this.lastProcessedBalances.set(tokenId, currentBalance);
            }
            console.log(`💰 No new fees since last run for ${tokenId}`);
            return;
        }
        
        console.log(`💰 New fees since last run: ${delta} tokens (current: ${currentBalance})`);

        // 2. Distribute tokens directly (no swap): 60% to creator from middleware DB, 40% retained
        const creatorAmount = Math.floor(delta * this.CREATOR_SHARE);
        const platformAmount = delta - creatorAmount;
        if (creatorAmount <= 0) {
            console.log(`ℹ️ Delta too small to distribute for ${tokenId}`);
            return;
        }

        try {
            const creatorAccountId = await this.resolveCreatorWalletFromDb(tokenId, tokenData.creator);
            if (!creatorAccountId) {
                console.error(`❌ Unable to resolve creator wallet for ${tokenId}`);
                return;
            }
            console.log(`🔁 Token payout: FROM ${this.OPERATOR_ID.toString()} TO ${creatorAccountId} | tokenId=${tokenId} | send=${creatorAmount} | retain=${platformAmount}`);
            const transferTx = new TransferTransaction()
                .addTokenTransfer(tokenId, this.OPERATOR_ID, (-creatorAmount).toString())
                .addTokenTransfer(tokenId, AccountId.fromString(creatorAccountId), creatorAmount.toString())
                .freezeWith(this.client);
            const signed = await transferTx.sign(this.OPERATOR_KEY);
            const resp = await signed.execute(this.client);
            const receipt = await resp.getReceipt(this.client);
            if (receipt.status.toString() !== 'SUCCESS') {
                console.error(`❌ Token distribution failed: ${receipt.status.toString()}`);
                return;
            }
            console.log(`✅ Token distribution tx: ${resp.transactionId.toString()} | creator(${creatorAccountId}): ${creatorAmount} | platform(retained): ${platformAmount}`);
        } catch (err) {
            console.error(`❌ Token distribution error for ${tokenId}: ${err.message}`);
            // Likely recipient not associated; we cannot auto-associate without their key
            return;
        }

        console.log(`✅ Fee token distribution completed for ${tokenId}`);

        // 4. Update baseline to current token balance after swap
        const postBalance = await this.getTokenBalance(tokenId);
        this.lastProcessedBalances.set(tokenId, postBalance);

        // 5. Log to HCS for transparency (actual message submission)
        await this.logToHcs({
            type: 'fee_token_distribution',
            tokenId,
            tokenAddress: tokenData.tokenAddress,
            creator: await this.resolveCreatorWalletFromDb(tokenId, tokenData.creator),
            router: {
                hedera_id: HELISWAP_CONFIG.ROUTER.hedera_id,
                evm_address: HELISWAP_CONFIG.ROUTER.evm_address,
            },
            amounts: {
                tokenDelta: delta,
                creatorTokens: creatorAmount,
                platformTokens: platformAmount,
            },
            tx: {
                swapTxId: null,
                distributionTxId: null,
            },
            timestamps: {
                executedAt: new Date().toISOString(),
            },
        });
    }
    
    /**
     * Get token balance for the platform account
     */
    async getTokenBalance(tokenId) {
        try {
            const balanceQuery = new AccountBalanceQuery()
                .setAccountId(this.OPERATOR_ID);
            
            const balance = await balanceQuery.execute(this.client);
            const tokenBalance = balance.tokens.get(tokenId);
            
            return tokenBalance ? parseInt(tokenBalance.toString()) : 0;
        } catch (error) {
            console.error(`Error getting balance for ${tokenId}:`, error.message);
            return 0;
        }
    }
    
    /**
     * Simulate token to HBAR swap (for testnet demonstration)
     * In production, this would be a real SaucerSwap transaction
     */
    async getOperatorHbarBalanceTiny() {
        const accountBalance = await new AccountBalanceQuery()
            .setAccountId(this.OPERATOR_ID)
            .execute(this.client);
        return accountBalance.hbars.toTinybars().toNumber();
    }

    async realHeliSwapConversion(tokenId, tokenEvmAddress, amount) {
        try {
            console.log(`🔄 HeliSwap conversion: ${amount} tokens → HBAR (via ethers router)`);

            if (!wallet || !heliswapRouter) {
                console.error('❌ EVM wallet/router not configured');
                return { receivedTinybar: 0, swapTxId: null };
            }

            // ERC20 approve to router (EVM path)
            const tokenCtr = new (require('ethers').Contract)(tokenEvmAddress, ERC20_ABI, wallet);
            const approveTx = await tokenCtr.approve(HELISWAP_CONFIG.ROUTER.evm_address, amount.toString());
            await approveTx.wait();
            console.log(`✅ ERC20 approved router to spend ${amount}`);

            // Prepare router swap
            const path = [tokenEvmAddress, HELISWAP_CONFIG.WHBAR.evm_address];
            const minOut = 0n;
            const deadlineSec = Math.floor(Date.now() / 1000) + 600; // 10 minutes

            // Capture HBAR balance in wei-like units (18 decimals on EVM RPC)
            const before = await provider.getBalance(await wallet.getAddress());

            const tx = await heliswapRouter.swapExactTokensForHBARSupportingFeeOnTransferTokens(
                amount.toString(),
                minOut.toString(),
                path,
                await wallet.getAddress(),
                deadlineSec,
                { gasLimit: 1_000_000 }
            );
            const rec = await tx.wait();
            console.log(`✅ Ethers swap tx: ${rec.hash}`);

            const after = await provider.getBalance(await wallet.getAddress());
            const deltaWei = after - before;

            // Convert EVM wei to tinybar: 1 HBAR = 10^8 tinybar, EVM shows 18 decimals
            // tinybar = wei / 10^(18-8) = wei / 10^10
            const receivedTinybar = Number((deltaWei / 10_000_000_000n));
            return { receivedTinybar, swapTxId: rec.hash };
        } catch (error) {
            console.error('❌ HeliSwap conversion failed:', error.message);
            return { receivedTinybar: 0, swapTxId: null };
        }
    }
    
    /**
     * Real SaucerSwap conversion (for when you have actual liquidity)
     */
    // Deprecated: kept for reference only
    async realSaucerSwapConversion() { return 0; }
    
    /**
     * Distribute HBAR to creator and platform
     */
    async distributeHBAR(totalHbarTinybar, creatorAccount) {
        try {
            const creatorAmount = Math.floor(totalHbarTinybar * this.CREATOR_SHARE);
            const platformAmount = totalHbarTinybar - creatorAmount;
            
            console.log(`💰 Distributing HBAR:`);
            console.log(`👤 Creator: ${creatorAmount} tinybar (${this.CREATOR_SHARE * 100}%)`);
            console.log(`🏢 Platform: ${platformAmount} tinybar (${this.PLATFORM_SHARE * 100}%)`);
            
            // Create transfer transaction
            const transferTx = new TransferTransaction()
                .addHbarTransfer(this.OPERATOR_ID, -totalHbarTinybar)
                .addHbarTransfer(AccountId.fromString(creatorAccount), creatorAmount)
                .addHbarTransfer(AccountId.fromString(this.PLATFORM_WALLET), platformAmount)
                .freezeWith(this.client);
            
            // Sign and execute
            const signedTx = await transferTx.sign(this.OPERATOR_KEY);
            const txResponse = await signedTx.execute(this.client);
            const receipt = await txResponse.getReceipt(this.client);
            
            console.log(`✅ HBAR distribution completed: ${txResponse.transactionId}`);
            return txResponse.transactionId.toString();
        } catch (error) {
            console.error('HBAR distribution failed:', error.message);
            return null;
        }
    }

    async ensureHcsTopic() {
        if (this.HCS_TOPIC_ID) return this.HCS_TOPIC_ID;
        if (!this.AUTO_CREATE_HCS_TOPIC) return null;
        try {
            const createTx = await new TopicCreateTransaction()
                .setTopicMemo('CodEase Fee Conversion Logs')
                .freezeWith(this.client)
                .sign(this.OPERATOR_KEY);
            const response = await createTx.execute(this.client);
            const receipt = await response.getReceipt(this.client);
            this.HCS_TOPIC_ID = receipt.topicId;
            console.log(`🧾 Created HCS Topic: ${this.HCS_TOPIC_ID.toString()}`);
            // Save topic id to Mongo for reuse across restarts
            try {
                const settings = await getCollection('fee_settings');
                await settings.updateOne(
                    { _id: 'hcs' },
                    { $set: { topicId: this.HCS_TOPIC_ID.toString(), updatedAt: new Date() } },
                    { upsert: true }
                );
            } catch (_) {}
            return this.HCS_TOPIC_ID;
        } catch (err) {
            console.error('❌ Failed to create HCS topic:', err.message);
            return null;
        }
    }

    async logToHcs(payload) {
        try {
            const topic = await this.ensureHcsTopic();
            if (!topic) {
                console.log('⚠️ HCS logging skipped (no topic)');
                return;
            }
            const message = Buffer.from(JSON.stringify(payload));
            const submitTx = await new TopicMessageSubmitTransaction()
                .setTopicId(topic)
                .setMessage(message)
                .freezeWith(this.client)
                .sign(this.OPERATOR_KEY);
            const resp = await submitTx.execute(this.client);
            const rec = await resp.getReceipt(this.client);
            console.log(`🧾 HCS log submitted: ${resp.transactionId.toString()} status=${rec.status.toString()}`);
        } catch (err) {
            console.error('❌ HCS log failed:', err.message);
        }
    }

    async hydrateFromHcs() {
        try {
            if (!this.HCS_TOPIC_ID) {
                // Try load topic id from Mongo if absent
                try {
                    const settings = await getCollection('fee_settings');
                    const hcs = await settings.findOne({ _id: 'hcs' });
                    if (hcs?.topicId) {
                        this.HCS_TOPIC_ID = TopicId.fromString(hcs.topicId);
                        console.log(`🧾 Loaded HCS Topic from Mongo: ${this.HCS_TOPIC_ID.toString()}`);
                    }
                } catch (_) {}
            }
            if (!this.HCS_TOPIC_ID) {
                console.log('ℹ️ Skipping HCS hydration: no topic id');
                return;
            }
            const topic = this.HCS_TOPIC_ID.toString();
            let url = `${this.MIRROR_API_URL}/topics/${topic}/messages?limit=100`; // paginate if needed
            let hydrated = 0;
            const seen = new Set();

            while (url) {
                const page = await this.fetchJson(url);
                if (!page || !Array.isArray(page.messages)) break;
                for (const m of page.messages) {
                    if (!m.message) continue;
                    try {
                        const decoded = Buffer.from(m.message, 'base64').toString('utf8');
                        const payload = JSON.parse(decoded);
                        if (payload && payload.type === 'register_token') {
                            const tokenId = payload.tokenId;
                            const creator = payload.creator;
                            const tokenAddress = payload.tokenAddress;
                            if (tokenId && creator && tokenAddress && !this.tokens.has(tokenId)) {
                                // Set registration
                                this.tokens.set(tokenId, { creator, tokenAddress, lastConversion: Date.now() });
                                // Set baseline to current balance to avoid double-processing old fees
                                const current = await this.getTokenBalance(tokenId);
                                this.lastProcessedBalances.set(tokenId, current);
                                hydrated++;
                            }
                        }
                    } catch (_) { /* ignore */ }
                }
                url = page.links && page.links.next ? `${this.MIRROR_API_URL}${page.links.next}` : null;
            }
            console.log(`🧾 HCS hydration complete. Restored ${hydrated} registrations.`);
        } catch (err) {
            console.error('❌ HCS hydration failed:', err.message);
        }
    }

    async hydrateFromMongo() {
        try {
            const col = await getCollection('fee_registrations');
            const cursor = col.find({});
            let count = 0;
            while (await cursor.hasNext()) {
                const doc = await cursor.next();
                if (!doc) break;
                const { tokenId, creator, tokenAddress } = doc;
                if (tokenId && creator && tokenAddress && !this.tokens.has(tokenId)) {
                    this.tokens.set(tokenId, { creator, tokenAddress, lastConversion: Date.now() });
                    const current = await this.getTokenBalance(tokenId);
                    this.lastProcessedBalances.set(tokenId, current);
                    count++;
                }
            }
            console.log(`🗄️ Mongo hydration complete. Restored ${count} registrations.`);
        } catch (err) {
            console.error('❌ Mongo hydration failed:', err.message);
        }
    }

    async persistRegistration({ tokenId, creator, tokenAddress }) {
        try {
            const col = await getCollection('fee_registrations');
            await col.updateOne(
                { tokenId },
                { $set: { tokenId, creator, tokenAddress, updatedAt: new Date() } },
                { upsert: true }
            );
            console.log(`🗄️ Registration persisted in Mongo: ${tokenId}`);
        } catch (err) {
            console.error('❌ Persist registration failed:', err.message);
        }
    }

    async resolveCreatorWalletFromDb(tokenId, fallbackCreator) {
        try {
            const col = await getCollection('hedera_tokenizations');
            const rec = await col.findOne({ token_id: tokenId, status: 'success' });
            if (rec && rec.creator_wallet) return rec.creator_wallet;
        } catch (err) {
            console.error('❌ Lookup creator wallet failed:', err.message);
        }
        return fallbackCreator;
    }
    fetchJson(url) {
        return new Promise((resolve, reject) => {
            https.get(url, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        reject(e);
                    }
                });
            }).on('error', reject);
        });
    }
    
    /**
     * Utility function to sleep
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * Get service status
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            tokensRegistered: this.tokens.size,
            conversionInterval: this.conversionInterval,
            routerContractId: this.HELISWAP_ROUTER_ID.toString(),
            network: 'testnet',
            whbarNeeded: false,
            hcsTopicId: this.HCS_TOPIC_ID ? this.HCS_TOPIC_ID.toString() : null,
            lastCycle: this.lastCycle || 'Not run yet'
        };
    }
    
    /**
     * Manual trigger for conversion (useful for testing)
     */
    async triggerConversion(tokenId) {
        const tokenData = this.tokens.get(tokenId);
        if (!tokenData) {
            throw new Error(`Token ${tokenId} not registered`);
        }
        
        console.log(`🔧 Manual conversion triggered for ${tokenId}`);
        await this.convertFeesForToken(tokenId, tokenData);
    }
}

module.exports = FeeConversionService;